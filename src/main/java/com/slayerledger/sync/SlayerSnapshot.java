package com.slayerledger.sync;

import java.util.Locale;
import java.util.regex.Pattern;

/** Explicit export allowlist; never serialize Client, Player, Config or profile objects. */
final class SlayerSnapshot
{
 static final String SCHEMA = "slayer-ledger-sync-v1";
 private static final Pattern WRITE_KEY = Pattern.compile("slw1_[a-f0-9]{32}\\.[a-f0-9]{64}");
 final String schema = SCHEMA;
 final String username;
 final long capturedAt;
 final boolean loggedIn;
 final int masterId, taskId, remaining, initial, points;
 final String task, location;
 final Counters streaks;
 final Modifier modifier;
 SlayerSnapshot(String username, long capturedAt, boolean loggedIn, int masterId, int taskId,
  int remaining, int initial, int points, String task, String location, Counters streaks, Modifier modifier)
 {
  this.username=username; this.capturedAt=capturedAt; this.loggedIn=loggedIn;
  this.masterId=masterId; this.taskId=taskId; this.remaining=remaining; this.initial=initial;
  this.points=points; this.task=task; this.location=location; this.streaks=streaks; this.modifier=modifier;
 }
 static boolean validKey(String key) { return key != null && WRITE_KEY.matcher(key.trim()).matches(); }
 static String normalize(String name) { return name == null ? "" : name.replace('_',' ').replace('\u00a0',' ').trim().toLowerCase(Locale.ROOT); }
 static boolean sameCharacter(String actual, String paired)
 {
  return paired != null && paired.trim().matches("[-a-zA-Z0-9 _]{1,12}") && !normalize(actual).isEmpty() && normalize(actual).equals(normalize(paired));
 }
 String fingerprint()
 {
  return username+"|"+loggedIn+"|"+masterId+"|"+taskId+"|"+remaining+"|"+initial+"|"+points+"|"+task+"|"+location+"|"+streaks.normal+"|"+streaks.wilderness+"|"+streaks.mortimer+"|"+modifier.id+"|"+modifier.value+"|"+modifier.negative;
 }
 static final class Counters
 {
  final int normal, wilderness, mortimer;
  Counters(int normal,int wilderness,int mortimer) { this.normal=normal;this.wilderness=wilderness;this.mortimer=mortimer; }
 }
 static final class Modifier
 {
  final int id,value; final boolean negative;
  Modifier(int id,int value,boolean negative) { this.id=id;this.value=value;this.negative=negative; }
 }
}
