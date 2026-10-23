package com.slayerledger.sync;

import com.google.gson.Gson;
import com.google.inject.Provides;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;
import javax.swing.JLabel;
import javax.swing.SwingUtilities;
import net.runelite.api.Client;
import net.runelite.api.GameState;
import net.runelite.api.events.GameStateChanged;
import net.runelite.api.events.GameTick;
import net.runelite.api.gameval.VarPlayerID;
import net.runelite.api.gameval.VarbitID;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.events.ConfigChanged;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDependency;
import net.runelite.client.plugins.PluginDescriptor;
import net.runelite.client.plugins.slayer.SlayerPlugin;
import net.runelite.client.plugins.slayer.SlayerPluginService;
import net.runelite.client.ui.ClientToolbar;
import net.runelite.client.ui.NavigationButton;
import net.runelite.client.ui.PluginPanel;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@PluginDescriptor(name="Slayer Ledger Sync", description="Opt-in private export of your Slayer task and counters", tags={"slayer","tracker","export"}, enabledByDefault=false)
@PluginDependency(SlayerPlugin.class)
public class SlayerLedgerPlugin extends Plugin
{
 // Fixed destination: no configurable URL, no local HTTP server, no inbound game-control path.
 static final String ENDPOINT="https://slayer-companion.gritty-tetra-8569.chatgpt.site/api/slayer-sync";
 private static final Logger log=LoggerFactory.getLogger(SlayerLedgerPlugin.class);
 private static final MediaType JSON=MediaType.parse("application/json; charset=utf-8");
 @Inject private Client client;
 @Inject private SlayerLedgerConfig config;
 @Inject private SlayerPluginService slayer;
 @Inject private OkHttpClient http;
 @Inject private Gson gson;
 @Inject private ClientToolbar toolbar;
 private final AtomicLong generation=new AtomicLong();
 private volatile Call call;
 private OkHttpClient transport;
 private volatile boolean running,paused;
 private volatile long lastSentAt,nextAttemptAt;
 private volatile String lastFingerprint="",lastUsername="";
 private volatile int failures;
 private long nextCaptureAt;
 private NavigationButton navigation;
 private JLabel label;

 @Provides SlayerLedgerConfig provideConfig(ConfigManager manager) { return manager.getConfig(SlayerLedgerConfig.class); }
 @Override protected void startUp()
 {
  transport=http.newBuilder().followRedirects(false).followSslRedirects(false).callTimeout(15,TimeUnit.SECONDS).build();
  running=true; generation.incrementAndGet(); paused=false; nextCaptureAt=0; lastSentAt=0; nextAttemptAt=0;
  PluginPanel panel=new PluginPanel() { private static final long serialVersionUID=1L; };panel.setLayout(new BorderLayout());
  label=new JLabel("<html><b>Slayer Ledger Sync</b><br>Review candidate · not approved.<br>Sync is off until enabled in settings.</html>");panel.add(label,BorderLayout.NORTH);
  BufferedImage icon=new BufferedImage(20,20,BufferedImage.TYPE_INT_ARGB);java.awt.Graphics2D graphics=icon.createGraphics();graphics.setColor(new Color(215,179,89));graphics.fillRoundRect(1,1,18,18,4,4);graphics.setColor(Color.BLACK);graphics.drawString("S",6,15);graphics.dispose();
  navigation=NavigationButton.builder().tooltip("Slayer Ledger Sync").icon(icon).panel(panel).build();toolbar.addNavigation(navigation);
 }
 @Override protected void shutDown()
 {
  running=false;generation.incrementAndGet();Call old=call;call=null;if(old!=null)old.cancel();
  lastFingerprint="";lastUsername="";if(navigation!=null)toolbar.removeNavigation(navigation);navigation=null;
 }
 private void status(String message) { SwingUtilities.invokeLater(()->{if(label!=null)label.setText("<html><b>Slayer Ledger Sync</b><br>"+message+"</html>");}); }
 @Subscribe public void onConfigChanged(ConfigChanged event)
 {
  if(!SlayerLedgerConfig.GROUP.equals(event.getGroup()))return;
  generation.incrementAndGet();Call old=call;call=null;if(old!=null)old.cancel();paused=false;failures=0;nextAttemptAt=0;lastSentAt=0;lastFingerprint="";status(config.enabled()?"Waiting for the paired character…":"Sync disabled.");
 }
 @Subscribe public void onGameTick(GameTick event)
 {
  if(!running||!config.enabled()||paused||client.getGameState()!=GameState.LOGGED_IN)return;
  long now=System.currentTimeMillis();if(now<nextCaptureAt||now<nextAttemptAt||call!=null)return;nextCaptureAt=now+1000;
  if(!SlayerSnapshot.validKey(config.writeKey())) { status("Generate a write key on Slayer Ledger<br>and paste it into plugin settings.");return; }
  String username=client.getLocalPlayer()==null?null:client.getLocalPlayer().getName();
  if(!SlayerSnapshot.sameCharacter(username,config.character())) { status("Waiting for the paired character.<br>No data from this character is sent.");return; }
  int remaining=client.getVarpValue(VarPlayerID.SLAYER_COUNT);
  String task=remaining>0?slayer.getTask():"",location=remaining>0?slayer.getTaskLocation():"";
  // The Slayer service updates later on the client thread; wait instead of mixing a new count with an old task.
  if(remaining>0&&(task==null||task.isEmpty()||slayer.getRemainingAmount()!=remaining))return;
  SlayerSnapshot snapshot=new SlayerSnapshot(username,now,true,
   client.getVarbitValue(VarbitID.SLAYER_MASTER),client.getVarpValue(VarPlayerID.SLAYER_TARGET),remaining,
   client.getVarpValue(VarPlayerID.SLAYER_COUNT_ORIGINAL),client.getVarbitValue(VarbitID.SLAYER_POINTS),task,location==null?"":location,
   new SlayerSnapshot.Counters(client.getVarbitValue(VarbitID.SLAYER_TASKS_COMPLETED),client.getVarbitValue(VarbitID.SLAYER_WILDERNESS_TASKS_COMPLETED),client.getVarpValue(VarPlayerID.SLAYER_MORTIMER_TASKS_COMPLETED)),
   new SlayerSnapshot.Modifier(client.getVarbitValue(VarbitID.SLAYER_MODIFIER_ID),client.getVarbitValue(VarbitID.SLAYER_MODIFIER_VALUE),client.getVarbitValue(VarbitID.SLAYER_MODIFIER_NEGATIVE)==1));
  if(now-lastSentAt<5000)return;if(snapshot.fingerprint().equals(lastFingerprint)&&now-lastSentAt<60000)return;
  lastUsername=username;send(snapshot);
 }
 @Subscribe public void onGameStateChanged(GameStateChanged event)
 {
  if(event.getGameState()!=GameState.LOGIN_SCREEN||!running||!config.enabled()||paused||!SlayerSnapshot.validKey(config.writeKey())||!SlayerSnapshot.sameCharacter(lastUsername,config.character()))return;
  generation.incrementAndGet();Call old=call;call=null;if(old!=null)old.cancel();
  send(new SlayerSnapshot(lastUsername,System.currentTimeMillis(),false,0,0,0,0,0,"","",new SlayerSnapshot.Counters(0,0,0),new SlayerSnapshot.Modifier(0,0,false)));
 }
 private void send(SlayerSnapshot snapshot)
 {
  long current=generation.get();String key=config.writeKey().trim();
  Request request=new Request.Builder().url(ENDPOINT).header("Authorization","Bearer "+key).header("Accept","application/json").post(RequestBody.create(JSON,gson.toJson(snapshot))).build();
  Call pending=transport.newCall(request);call=pending;
  pending.enqueue(new Callback()
  {
   private boolean active() { return running&&generation.get()==current&&call==pending; }
   @Override public void onFailure(Call failed,IOException error)
   {
    if(!active())return;call=null;failures=Math.min(5,failures+1);nextAttemptAt=System.currentTimeMillis()+Math.min(60000,5000L*(1L<<failures));status("Connection failed; retrying automatically.");log.debug("Slayer Ledger connection failed (details omitted).");
   }
   @Override public void onResponse(Call completed,Response response)
   {
    try(Response closed=response)
    {
     if(!active())return;call=null;int code=response.code();
     // Never parse server data into game actions or follow a redirect with the pairing key.
     if(response.isRedirect()||response.request().url().toString().equals(ENDPOINT)==false) { paused=true;status("Sync paused: unexpected redirect.<br>Disable sync and check the endpoint.");return; }
     if(code==401||code==403){paused=true;status("Pairing rejected. Check character/key,<br>then toggle sync off and on.");return;}
     if(response.isSuccessful()||code==409){lastSentAt=System.currentTimeMillis();lastFingerprint=snapshot.fingerprint();failures=0;nextAttemptAt=lastSentAt+5000;status(snapshot.loggedIn?"Snapshot sent. Check Slayer Ledger<br>for the received values.":"Logged out. Planner keeps the last<br>snapshot with an offline status.");}
     else {failures=Math.min(5,failures+1);nextAttemptAt=System.currentTimeMillis()+Math.min(60000,5000L*(1L<<failures));status("Server unavailable; retrying automatically.");log.debug("Slayer Ledger rejected snapshot with HTTP {}",code);}
    }
   }
  });
 }
}
