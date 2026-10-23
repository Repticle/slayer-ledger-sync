# Slayer Ledger Sync · review candidate 0.1.0

An optional RuneLite companion that exports only your own Slayer task information to Slayer Ledger. **This candidate has not been approved by RuneLite or Jagex. No guarantee against account sanctions is made.** Submit the source for review before deciding whether to use it on an OSRS account.

The plugin is disabled by default and its network feature is separately disabled by default. Development and review do not require an OSRS login. Automated tests never launch or control the game.

## What it sends

Only the paired character's display name, capture time, logged-in state, Slayer master/task IDs, task name, assigned location, remaining/original counts, Slayer points, all three completion counters (normal/Wilderness/Mortimer), and current Mortimer modifier fields. It does not export other characters, bank, inventory, equipment, coordinates, world, chat, email, passwords or Jagex credentials. Game/account data are never written to plugin files.

It depends on RuneLite's core Slayer plugin and reads its public `SlayerPluginService`, plus named gameval varps/varbits. It never changes core plugin configuration. Game values are read on the client thread. Only already-read snapshot DTOs cross onto OkHttp's background pool.

## Build on Windows

1. Extract the ZIP to a normal folder, such as `Documents\slayer-ledger-sync`.
2. Open IntelliJ IDEA → Open → select this folder or `build.gradle` → open as a Gradle project.
3. Use a Java 11 JDK (Eclipse Temurin is RuneLite's recommendation). Allow Gradle to download its dependencies.
4. In IntelliJ's terminal run:

```powershell
.\gradlew.bat test
```

This compiles the project and runs the five non-game unit tests. It does not sign in or launch RuneLite. The project pins RuneLite 1.13.3 and targets Java 11.

## Pairing, after review

1. Open the existing [Slayer Ledger](https://kuradal-slayer-ledger.gritty-tetra-8569.chatgpt.site) and select Auto import. Keep the existing Group Ironmen connection for bank, equipment, stats, quests and diaries.
2. In **RuneLite · Slayer Ledger Sync**, enter the same OSRS name and choose **Generate private pairing keys**. The write key is shown only in that tab. Remembering the separate browser read key is optional and off by default.
3. Once you have reviewed the source and decided it is appropriate to run, start the template development client with:

```powershell
.\gradlew.bat run
```

4. If using a Jagex account, follow RuneLite's official [development-client Jagex account instructions](https://github.com/runelite/runelite/wiki/Using-Jagex-Accounts). Do not place Jagex credentials in this project or the website.
5. In the plugin's settings enter the **paired character name** and **Slayer Ledger write key**, then enable private sync. Check its sidebar status and the website's received values.

The normal production RuneLite client cannot install an arbitrary project ZIP through Plugin Hub. Normal Hub installation requires an accepted submission. Do not copy a development JAR into the client or modify the official launcher.

## Expected behaviour to verify manually, after review

- The correct character, task, remaining kills and point balance appear in Auto mode, without changing the Manual profile.
- Finish a task: remaining becomes zero and the actual point balance/counter update together. Skipping or blocking updates only after you do it yourself in game.
- Normal, Wilderness and Mortimer counters remain distinct. Konar's assigned location is retained. A supported boss assignment resolves to its exact boss.
- An unknown task/master is reported as unmapped; the planner never guesses an assignment.
- Log out, disable sync, switch to an unpaired character, revoke a key, and simulate network loss. No other character is uploaded. Stale/offline data is clearly marked after at most two minutes.
- Browser Manual mode pauses polling and application of the imported data. The plugin remains separately controlled by its own enable checkbox; disable that too to stop uploads.
- Returning to Auto preserves existing Group Ironmen bank/progression data and applies only matching-character Slayer data.

## Submission

Read `review/SUBMISSION.md`, `PRIVACY.md`, and `review/ARCHITECTURE.md`. `review/plugin-hub-entry.txt` and `review/PULL_REQUEST.md` are templates you must fill with your own public GitHub repository and full commit SHA. There is no submission, public GitHub repository, approval, or Plugin Hub installation associated with this ZIP yet.

Author attribution: prepared with OpenAI Codex at the site owner's request. RuneLite is an independent project and has not endorsed this candidate.
