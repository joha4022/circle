# Project Agents

This file defines project-specific agents for Codex in this repository.

## Available agents

- `architect`: Designs features and technical approach before implementation.
- `designer`: Creates visual direction, design systems, and UI specs.
- `builder`: Implements scoped code changes with tests.
- `reviewer`: Reviews diffs for correctness, regressions, and test gaps.
- `ops`: Handles scripts, CI, release, and deployment automation.

## Slash Commands

- `/feature <description>`: Run a feature workflow for Circle using the appropriate agent set below.
- `/ui <description>`: Focus on UI/UX improvements and run the `frontend_ui` agent as primary.
- `/design <description>`: Run design-led workflow with `designer` as primary and supporting agents to apply the design across the app.

## `/feature` Workflow

1. `architect`
- Clarify scope, acceptance criteria, and rollout plan.

2. Domain agents (pick all that apply)
- `builder` for codes new features effectively like a senior engineer.
- `prisma_data` for schema/data changes.
- `auth_nextauth` for login/session/authorization changes.
- `api_routes` for server actions and route handlers.
- `frontend_ui` for App Router pages, forms, and UX.
- `devops_ci` for CI, deploy, env, and migration workflow changes.

3. Quality pass
- `qa_tests` adds/updates tests for changed behavior.
- `reviewer_security` checks auth, PII, and security risks.
- `reviewer` performs final code review for regressions and gaps.

## `/ui` Workflow

1. `frontend_ui` (primary)
- Improve visual design, layout, spacing, typography, interaction states, and responsiveness.
- Preserve existing app behavior unless explicitly asked to change functionality.

2. Optional supporting agents (only if needed)
- `api_routes` if UI changes require new server data/actions.
- `qa_tests` for UI behavior coverage where practical.
- `reviewer` for final regression review.

## `/design` Workflow

1. `designer` (primary)
- Define the visual direction, page/component specs, layout rules, spacing, typography, states, and responsive behavior.
- Produce implementation-ready guidance (tokens/classes/components) for consistent rollout.

2. Supporting implementation agents (pick as needed)
- `frontend_ui` applies the design across pages/components.
- `builder` helps implement reusable UI primitives and refactors needed for broad adoption.
- `api_routes` only if design changes require new data or server actions.

3. Quality pass
- `qa_tests` adds/updates coverage for affected UI behavior.
- `reviewer` validates regressions, consistency, and implementation gaps.

## `/ui` Rules

- Prioritize interface quality over backend changes.
- Keep edits design-consistent across pages/components touched.
- Ensure desktop + mobile rendering remains solid.
- Do not introduce major workflow changes unless requested.

## Agent Selection Rules

- Always include `architect` first.
- Include only agents impacted by the feature scope.
- Use `frontend_ui` + `api_routes` by default for user-facing feature work.
- For `/ui`, `frontend_ui` is mandatory and primary.
- For `/design`, `designer` is mandatory and primary.
- For `/design`, include `frontend_ui` (and optionally `builder`) to apply the design system consistently throughout touched routes/components.
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
