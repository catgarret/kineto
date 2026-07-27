# Claude instructions for Kineto

Read and follow the repository-root `AGENTS.md` completely before taking any
action. Then read `docs/AI-HANDOFF.md` and the source-of-truth files listed in
`AGENTS.md`.

Important defaults:

- Finish implementation tasks through documentation, bilingual changelog,
  integrated QA, and a scoped Git commit.
- Preserve unrelated user changes in a dirty worktree.
- Do not publish or push unless the user explicitly asks for a release.
- When releasing, use `docs/RELEASING.md` and the repository scripts. GitHub
  Release notes must show English first and Korean second.

Do not rely on a previous Claude conversation being available. Reconstruct
history from the repository documents and Git history.
