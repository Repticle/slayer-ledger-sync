# Submission checklist for the owner

1. Create your own GitHub repository for this plugin. For Plugin Hub submission, RuneLite's guide requires the repository to be public. This package has not published or submitted anything on your behalf. Inspect all files before making them public; do not include pairing keys, browser exports, `.runelite` files, account credentials, build outputs or logs.
2. Put the plugin project at that repository's root: `build.gradle`, `settings.gradle`, `runelite-plugin.properties`, `src`, Gradle wrapper, license, privacy and review documentation. `review/server-reference` is an audit reference, not code loaded by RuneLite.
3. Set the `author` property to the name you want displayed. Retain the license and the AI-assistance attribution.
4. Run `gradlew.bat test` on Windows (or `./gradlew test` on Linux/macOS). GitHub Actions also has a no-game unit-test workflow in this package.
5. Commit and push. Obtain the exact full 40-character commit SHA with `git rev-parse HEAD`.
6. Read the current official instructions at https://github.com/runelite/plugin-hub#creating-new-plugins. Fork `runelite/plugin-hub` in your own account, add `plugins/slayer-ledger-sync` using the marker template here, and fill in your public repository URL and full commit SHA.
7. Open a pull request using `review/PULL_REQUEST.md`. Explicitly request confirmation of whether this opt-in, private outbound HTTPS export fits the current data/privacy policy. Do not assert that read-only code is automatically approved. Reviewers may ask for changes or reject it.
8. Address reviewer feedback. Wait for the actual review outcome before treating the plugin as accepted. A successful compile/unit test is not an in-game verification or approval.

Official review: https://github.com/runelite/runelite/wiki/Plugin-Hub-Review
Official restrictions: https://github.com/runelite/runelite/wiki/Rejected-or-Rolled-Back-Features

## Validation supplied with the package

- Java source compiled against the actual RuneLite client and API 1.13.3 artifacts, targeting Java 11, with Eclipse ECJ on a Java 17 runtime.
- Five JUnit tests cover opt-in defaults, role-specific key shape, character isolation, update fingerprints and the payload allowlist.
- The site's Workers/D1 integration tests exercise real database pairing, hashed secrets, independent visitors, role separation, replay/clock rejection, revocation, and snapshot mapping.
- No OSRS account, game login, game input or in-game capture was used. In-game behaviour remains unverified.
- This environment's Gradle wrapper could not reach its distribution using Java networking, so the complete Gradle dependency-resolution/build path must also be confirmed on your PC or the supplied GitHub Actions workflow. The direct Java compilation used the real published API artifacts, not invented API stubs.
