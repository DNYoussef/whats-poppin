# Mobile dependency follow-up

On September 7, 2026, npm audit for the locked mobile package returned 10 moderate affected-package entries, all following the uuid advisory GHSA-w5hq-g745-h8pq (missing buffer bounds checking in v3/v5/v6 when a buffer is supplied). These are package-chain entries, not 10 distinct vulnerability disclosures. The raw result is mobile-dependency-audit.json; advisory: https://github.com/advisories/GHSA-w5hq-g745-h8pq.

Exposure through this app or its build tools has not been established. This is not a clean security audit. P09 must trace the affected call paths and validate a compatible dependency correction, then rerun native/web compatibility gates before release. The registry's proposed Expo 46 major-version change is not an accepted migration for this Expo 57 project. No source fix is claimed by this record.
