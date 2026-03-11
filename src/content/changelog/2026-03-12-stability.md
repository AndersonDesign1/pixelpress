---
version: "v0.1.1"
date: "2026-03-12"
summary: "UX and reliability improvements"
---

- Added queue-wide and per-file progress bars with worker progress events.
- Fixed preview object URL memory leaks and terminated worker on unmount.
- Improved zip export to avoid filename collisions.
- Added clear queue action and safer localStorage validation.
- Sanitized generated output filenames and hardened worker error handling.

