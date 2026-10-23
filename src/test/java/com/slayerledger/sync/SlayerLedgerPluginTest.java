package com.slayerledger.sync;
import net.runelite.client.RuneLite;
import net.runelite.client.externalplugins.ExternalPluginManager;
/** Manual development launcher. Automated tests must never log in or drive the game. */
public class SlayerLedgerPluginTest
{
 public static void main(String[] args) throws Exception
 {
  ExternalPluginManager.loadBuiltin(SlayerLedgerPlugin.class);
  RuneLite.main(args);
 }
}
