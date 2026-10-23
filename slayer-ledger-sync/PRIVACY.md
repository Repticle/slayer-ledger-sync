# Privacy and network disclosure

Network sync is opt-in and disabled by default. The configuration's warning states that this feature sends the user's IP address to a third-party service not controlled or verified by RuneLite developers.

Destination is fixed in source:
`https://kuradal-slayer-ledger.gritty-tetra-8569.chatgpt.site/api/slayer-sync`

The plugin sends HTTPS POST requests using an injected RuneLite OkHttp client derived with redirects disabled and a 15-second call timeout. It never starts an HTTP server or exposes a listening port. It does not request data from game servers, scrape Jagex websites, or send data directly to Jagex. Changes are batched at a maximum of one update per five seconds; unchanged values have a 60-second heartbeat. Failed requests back off to a maximum of 60 seconds. Authorization failures pause uploads until settings change. Shutdown and configuration changes cancel the pending call.

Authentication uses a dedicated write-only key in the Authorization header. This is a service capability key, not a Jagex password or Group Ironmen token. Its config field is masked; RuneLite's own configuration storage is not an encrypted vault, so users must keep their RuneLite profile private. No key is included in payloads, URLs, plugin logs, source files, review packages or planner profile exports. The plugin has no read key and cannot retrieve server snapshots or game instructions.

The website creates a separate read/revoke key, kept in tab memory or optionally in this browser's local storage after the user checks Remember. The server stores SHA-256 hashes of both random 256-bit secrets. The keys are bound to the character selected at pairing; updates for a different name are rejected. Read keys cannot write; write keys cannot read or revoke. Every connection has an independent random ID and secrets. There is no public player lookup or username-only read endpoint.

Only the latest Slayer snapshot is stored in the site's D1 database. No bank/gear/progression data is added to that database. An accepted update extends expiry to 180 days; expired records are inaccessible and are removed on a later connection-creation request. Revoking deletes the connection and its snapshot immediately. Forgetting a local read key does not revoke the plugin's write key; use Revoke before Forget when deletion is intended. Hosting infrastructure receives the connecting IP as normal HTTPS transport metadata; the application code does not add IPs to its database or analytics. No analytics are installed by this plugin.

Anyone holding a read key can read/revoke that connection; anyone holding its write key can submit that connection's Slayer snapshots. These are bearer capabilities, not proof of OSRS account ownership, and the service must not be used as an anti-cheat, verified ranking, or authentication system.
