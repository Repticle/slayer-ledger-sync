# Validation record · 23 October 2026

- Production Java source and development launcher compiled to Java 11 class format against the actual RuneLite 1.13.3 client/API artifacts using Eclipse ECJ 3.39.0 on Java 17.
- JUnit 4.12: **5 tests passed**. No game was launched.
- Website Node/Workers suite: **126 tests passed**. The new pairing integration uses a real local D1 database.
- Production website build passed with the Slayer sync API route and D1 binding.
- Local browser QA used a synthetic character, `Fixture Iron`: the panel displayed Gargoyles, 123 remaining and 456 points; Manual retained its distinct values; revocation cleared the imported fields, keys and server snapshot. No actual RuneLite client or OSRS account was connected.
- Full Gradle wrapper build could not run in this preparation environment because Java networking could not download the Gradle distribution. Confirm `gradlew.bat test` on Windows or use the provided GitHub Actions workflow before submission.
- In-game correctness, main-account suitability, Jagex acceptance and Plugin Hub approval remain unverified. Those are not implied by these results.
