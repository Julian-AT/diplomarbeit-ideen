# Summary 02-03: Test command baseline established

Added focused unit and E2E command scripts. `pnpm test:unit` now targets only `tests/unit`, avoiding imported Playwright specs and template mock files. `pnpm test:e2e` uses `cross-env` so the command works on Windows.

Verification results:

- `pnpm test:unit`: 1 file, 4 tests passed.
- `pnpm typecheck`: passed.
- `pnpm check`: passed.
- `pnpm test:e2e --list`: listed 23 imported Playwright tests.
