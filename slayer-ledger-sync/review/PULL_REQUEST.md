Add Slayer Ledger Sync, an opt-in exporter of the user's own Slayer task, remaining count, location, points, normal/Wilderness/Mortimer counters and current modifier. Its purpose is to fill missing Slayer fields in an external planner alongside an existing Group Ironmen Tracker import.

The feature is disabled by default, has the third-party IP/data warning, requires an exact paired character and a write-only capability key, uses a fixed HTTPS destination with redirects disabled, and has no listening HTTP server or public player lookup. It does not automate inputs, add combat overlays, change menus/prayers/equipment, read other players, or consume external game instructions. The production plugin has no reflection, native code, subprocesses or runtime code downloads.

Please review whether the private outbound HTTPS export complies with the current restrictions on exposing player information. We do not claim prior RuneLite/Jagex approval. Privacy, data flow, exact payload and the server reference implementation are included in the source.

Validation: Java 11-targeted compilation against RuneLite 1.13.3 and five non-game JUnit tests passed in the preparation environment. The complete Gradle build must be confirmed locally/CI. No OSRS account or game automation was used; in-game behaviour is unverified.

Repository: REPLACE_WITH_PUBLIC_REPOSITORY_URL
Commit: REPLACE_WITH_FULL_COMMIT_SHA

Generated-by: OpenAI Codex
