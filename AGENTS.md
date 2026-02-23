# Project Agents

This file defines project-specific agents for Codex in this repository.

## Available agents

- `architect`: Designs features and technical approach before implementation.
- `builder`: Implements scoped code changes with tests.
- `reviewer`: Reviews diffs for correctness, regressions, and test gaps.
- `ops`: Handles scripts, CI, release, and deployment automation.

## Usage

- Ask explicitly for an agent by name in your prompt.
- Use one primary agent per task; bring in `reviewer` before merge.
- Keep agent outputs concise and action-oriented.

## Notes

- Agent files can be added under `.codex/agents/` as needed.
- Global Codex CLI config remains in `~/.codex/config.toml`.
