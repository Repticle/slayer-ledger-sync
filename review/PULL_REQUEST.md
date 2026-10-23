Adds Slayer Ledger Sync, an opt-in exporter of the local player's Slayer assignment and point information to the external Slayer Ledger planner. The planner uses an existing Group Ironmen Tracker connection for bank and progression information; this companion supplies missing Slayer fields.

The upload feature is disabled by default. It requires an exact paired character name and a masked, write-only pairing key. It sends the character name, capture time, logged-in state, Slayer master/task IDs, task name, assigned location, remaining/original counts, Slayer points, normal/Wilderness/Mortimer completion counters, and current Mortimer modifier fields. The configuration and marker include the third-party server/IP warning.

Networking uses a fixed HTTPS destination with redirects disabled, a request timeout, change coalescing, failure backoff, and a heartbeat. The plugin does not expose a local HTTP server or a public player lookup. It reads the public core SlayerPluginService and named game variables. It does not automate inputs or change menus, prayers, equipment, or other plugins' configuration, and does not collect other players' data or accept external gameplay instructions.

Please explicitly review whether this private outbound export of the user's own Slayer information is permitted under the current restriction on plugins exposing player information over HTTP. Private HTTPS and user opt-in are design details, not a claim of policy approval. We do not claim prior RuneLite or Jagex approval.

The source includes the BSD-2-Clause licence, privacy details, payload/data-flow documentation, and server reference code for audit. The server reference is documentation and is not loaded into RuneLite.

Validation: the complete Gradle build and unit tests passed on GitHub Actions using Java 11 against RuneLite 1.13.3:
https://github.com/Repticle/slayer-ledger-sync/actions/runs/39918162222

The reviewed commit is 4de52ba1b2e8a1e983c7fbcf75056b853e0011a8. No OSRS account was used in the preparation environment; in-game behaviour remains unverified.

Source: https://github.com/Repticle/slayer-ledger-sync/tree/4de52ba1b2e8a1e983c7fbcf75056b853e0011a8

Generated-by: OpenAI Codex
