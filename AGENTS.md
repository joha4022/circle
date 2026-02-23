# Project Agents

This file defines project-specific agents for Codex in this repository.

## Available agents

- `architect`: Designs features and technical approach before implementation.
- `builder`: Implements scoped code changes with tests.
- `reviewer`: Reviews diffs for correctness, regressions, and test gaps.
- `ops`: Handles scripts, CI, release, and deployment automation.

## Slash Commands

- `/feature <description>`: Run a feature workflow for Circle using the appropriate agent set below.

## `/feature` Workflow

1. `architect`
- Clarify scope, acceptance criteria, and rollout plan.

2. Domain agents (pick all that apply)
- `prisma_data` for schema/data changes.
- `auth_nextauth` for login/session/authorization changes.
- `api_routes` for server actions and route handlers.
- `frontend_ui` for App Router pages, forms, and UX.
- `devops_ci` for CI, deploy, env, and migration workflow changes.

3. Quality pass
- `qa_tests` adds/updates tests for changed behavior.
- `reviewer_security` checks auth, PII, and security risks.
- `reviewer` performs final code review for regressions and gaps.

## Agent Selection Rules

- Always include `architect` first.
- Include only agents impacted by the feature scope.
- Use `frontend_ui` + `api_routes` by default for user-facing feature work.
- If database fields/models change, include `prisma_data`.
- If sign-in/session/permissions change, include `auth_nextauth` and `reviewer_security`.
- If release/migrations/infra are touched, include `devops_ci`.
- Always finish with `qa_tests` and `reviewer`.

## Usage

- Ask explicitly for an agent by name in your prompt.
- Use one primary agent per task; bring in `reviewer` before merge.
- Keep agent outputs concise and action-oriented.

## Notes

- Agent files can be added under `.codex/agents/` as needed.
- Global Codex CLI config remains in `~/.codex/config.toml`.
