---
version: "v0.2.0"
date: "2026-03-17"
summary: "Stronger PNG options and clearer exports"
---

- Added a real split between lossless `Optimized PNG` and lossy `Compressed PNG`.
- Added top-level export controls so format changes do not require opening Fine tune first.
- Added a `Compressed PNG` preset, stronger PNG quantization defaults, and a recommendation to try WebP or AVIF when PNG savings stay small.
- Improved worker diagnostics and fallback notes so PNG failures are easier to understand.
- Switched the project license from MIT to GPL-3.0 and added third-party notices for the new PNG stack.
