package com.slayerledger.sync;
import com.google.gson.Gson;
import org.junit.Test;
import static org.junit.Assert.*;
public class SlayerSnapshotTest
{
 @Test public void exportIsOffByDefault() { assertFalse(new SlayerLedgerConfig(){}.enabled()); }
 @Test public void pairingKeysHaveDistinctRoleAndExactLength()
 {
  String key="slw1_"+"a".repeat(32)+"."+"b".repeat(64);assertTrue(SlayerSnapshot.validKey(key));assertFalse(SlayerSnapshot.validKey(key.replace("slw1_","slr1_")));assertFalse(SlayerSnapshot.validKey(key+"x"));assertFalse(SlayerSnapshot.validKey(null));
 }
 @Test public void onlyPairedCharacterIsEligible()
 {
  assertTrue(SlayerSnapshot.sameCharacter("Test_Name","test name"));assertFalse(SlayerSnapshot.sameCharacter("Other","test name"));assertFalse(SlayerSnapshot.sameCharacter("",""));assertFalse(SlayerSnapshot.sameCharacter(null,"test name"));
 }
 @Test public void timeDoesNotCauseDuplicateUpdatesButRemainingCountDoes()
 {
  SlayerSnapshot a=snapshot(1,150),b=snapshot(2,150),c=snapshot(2,149);assertEquals(a.fingerprint(),b.fingerprint());assertNotEquals(a.fingerprint(),c.fingerprint());
 }
 @Test public void exportContainsOnlySlayerAllowlist()
 {
  String json=new Gson().toJson(snapshot(1,150));assertTrue(json.contains("\"normal\":49"));assertTrue(json.contains("\"wilderness\":9"));assertTrue(json.contains("\"mortimer\":50"));for(String excluded:new String[]{"token","writeKey","email","password","bank","inventory","equipment","world","position","prayer","hitpoints"})assertFalse(excluded,json.contains("\""+excluded+"\""));
 }
 private SlayerSnapshot snapshot(long time,int remaining) { return new SlayerSnapshot("Test Name",time,true,5,40,remaining,200,100,"Gargoyles","Slayer Tower",new SlayerSnapshot.Counters(49,9,50),new SlayerSnapshot.Modifier(0,0,false)); }
}
