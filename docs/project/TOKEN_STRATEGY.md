# Token-efficient operating procedure

- Begin with `CURRENT_STATE.md` and the single `NEXT_ACTION.md` item.
- Search with `rg` before opening files; inspect only relevant ranges.
- Store durable external findings once in `docs/research/` with source and access date.
- Keep domain rules and fixtures compact, structured, and reusable across tests.
- Run the narrowest failing test, then the package validation, then the root quality gate.
- Prefer parallel independent tool calls only when results do not require ordering or shared writes.
- Keep coherent commits small enough to audit and update project state once per work unit.
- Use deeper reasoning for architecture, licensing, security, AI evaluation, and release audit; use mechanical tooling for formatting and repetitive checks.
- Never trade correctness, uncertainty handling, attribution, privacy, or accessibility for context savings.
