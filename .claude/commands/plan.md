# /plan - Implementation Planning

Transform a feature definition into a comprehensive implementation plan with all context needed for autonomous execution.

## Arguments

- `$ARGUMENTS` - Feature name (kebab-case) or path to feature definition

## Process

### Step 1: Load Feature Definition

Resolve the feature definition file:
- If argument is a path: use directly
- If argument is a name: look for `.agents/features/{name}.md`

Read the feature definition file. If it doesn't exist, prompt the user to run `/define` first.

### Step 2: Explore Codebase

Use the Explore agent to understand the codebase context:

1. **Find relevant patterns:**
   - Search for similar implementations
   - Identify coding conventions
   - Find reusable utilities

2. **Identify integration points:**
   - Where does this feature connect to existing code?
   - What files need modification?
   - What new files need creation?

3. **Check dependencies:**
   - What packages/libraries are needed?
   - What prerequisites must be in place?

### Step 3: Design Architecture

Based on exploration, make architectural decisions:

1. **File structure:**
   - What new files to create
   - What existing files to modify
   - Where files should be located

2. **Data flow:**
   - How data moves through the feature
   - What transformations occur
   - What state is managed

3. **Dependencies:**
   - Internal dependencies (other project code)
   - External dependencies (packages)

### Step 4: Create Implementation Phases

Break the work into logical phases:

**Phase 1: Foundation**
- Project setup, configuration
- Base files and structures
- Prerequisites

**Phase 2: Core Implementation**
- Main functionality
- Business logic
- Data handling

**Phase 3: Integration**
- Connect to existing systems
- Wire up routes/events
- Add to exports

**Phase 4: Verification**
- Tests
- Validation
- Documentation

### Step 5: Define Step-by-Step Tasks

For each phase, create specific tasks with:

```markdown
### Task N: {ACTION} `{target_file}`

**Implement:**
- {specific detail with line numbers if modifying}
- {specific detail}

**Pattern:** Follow `{reference_file:lines}`

**Validate:** `{shell command that exits 0 on success}`

**Context Budget:** {small|medium|large}
```

**Task naming conventions:**
- CREATE - new file
- MODIFY - existing file
- ADD - add to existing file
- UPDATE - change existing content
- CONFIGURE - setup/config changes

**Validation commands must be objective:**
```bash
# File exists
test -f path/to/file.ts

# Pattern in file
grep -q 'export class' path/to/file.ts

# Syntax valid
node --check path/to/file.js
python3 -m py_compile path/to/file.py

# Tests pass
npm test -- --grep 'feature'

# Build succeeds
npm run build
```

### Step 6: Define Goal-Backward Verification

Before writing the plan, define how we'll verify the GOAL was achieved (not just tasks completed):

**6a. Define the Goal**
Write a single sentence describing the user-observable outcome:
```
Goal: "User can authenticate with email/password and access protected resources"
```

**6b. Define Truths (Observable Behaviors)**
What must the user be able to DO when complete?

```markdown
## Verification: Truths

| Behavior | Verify Command |
|----------|---------------|
| User can register with email/password | `curl -X POST .../register -d '...' \| jq -e '.id'` |
| User can log in with valid credentials | `curl -X POST .../login -d '...' \| jq -e '.token'` |
| Invalid credentials are rejected | `curl -s -o /dev/null -w '%{http_code}' .../login -d '...' \| grep -q 401` |
| Protected routes require authentication | `curl -s -o /dev/null -w '%{http_code}' .../protected \| grep -q 401` |
```

**6c. Define Artifacts (Substantive Files)**
What files must exist AND contain real implementation (not stubs)?

```markdown
## Verification: Artifacts

| File | Must Contain | Must NOT Contain |
|------|-------------|------------------|
| `src/auth/auth.service.ts` | `async login`, `bcrypt.compare` | `TODO`, `PLACEHOLDER` |
| `src/auth/auth.controller.ts` | `@Post('login')`, `AuthService` | `throw new Error('Not implemented')` |
| `src/guards/auth.guard.ts` | `canActivate`, `JwtService` | `return true // stub` |
```

**6d. Define Wiring (Connections)**
How must components connect to form a working whole?

```markdown
## Verification: Wiring

| From | To | Via | Verify |
|------|-----|-----|--------|
| `auth.controller.ts` | `AuthService` | import | `grep -q 'AuthService' src/auth/auth.controller.ts` |
| `app.module.ts` | `AuthModule` | import | `grep -q 'AuthModule' src/app.module.ts` |
| `auth.routes.ts` | `login handler` | route | `grep -q "'/login'" src/auth/auth.routes.ts` |
```

### Step 7: Identify Potential Checkpoints

Flag tasks that may need human verification or decisions:

**Checkpoint: human-verify**
- UI components that need visual verification
- Integration with external services
- Security-sensitive implementations

**Checkpoint: decision**
- Architectural choices with multiple valid options
- Technology selection
- Trade-off decisions

```markdown
## Potential Checkpoints

| Task | Type | Reason |
|------|------|--------|
| Create login form UI | human-verify | Visual verification needed |
| Choose auth strategy | decision | JWT vs Session vs OAuth |
```

### Step 8: Write Implementation Plan

Create `.agents/plans/{kebab-name}.md` with:

```markdown
# Implementation Plan: {Feature Name}

**Created:** {YYYY-MM-DD}
**Feature Definition:** `.agents/features/{kebab-name}.md`
**Status:** Draft

---

## Goal

{Single sentence describing user-observable outcome}

---

## Feature Summary

{One paragraph from feature definition}

---

## Context References

### Relevant Files

| File | Lines | Purpose |
|------|-------|---------|
| `{path}` | {range} | {why relevant} |

### Patterns to Follow

| Pattern | Location | Apply To |
|---------|----------|----------|
| {name} | `{file:lines}` | {where} |

### New Files to Create

| File | Purpose |
|------|---------|
| `{path}` | {what it contains} |

---

## Architecture Decisions

### Decision 1: {Topic}

**Options:**
1. {Option A} - {tradeoff}
2. {Option B} - {tradeoff}

**Decision:** {choice}
**Rationale:** {why}

---

## Goal-Backward Verification

### Truths (Observable Behaviors)

| Behavior | Verify Command |
|----------|---------------|
| {behavior} | `{command}` |

### Artifacts (Substantive Files)

| File | Must Contain | Must NOT Contain |
|------|-------------|------------------|
| `{file}` | {patterns} | {anti-patterns} |

### Wiring (Connections)

| From | To | Via | Verify |
|------|-----|-----|--------|
| `{file}` | `{component}` | {type} | `{command}` |

---

## Implementation Phases

### Phase 1: Foundation
{tasks with validation}

### Phase 2: Core Implementation
{tasks with validation}

### Phase 3: Integration
{tasks with validation}

### Phase 4: Verification
{tasks with validation}

---

## Step-by-Step Tasks

{Detailed task list with IMPLEMENT, PATTERN, VALIDATE, CONTEXT BUDGET for each}

---

## Potential Checkpoints

| Task | Type | Reason |
|------|------|--------|
| {task} | {human-verify\|decision} | {why} |

---

## Final Validation Commands

```bash
{build command}
{test command}
{lint command}
{feature-specific check}
```

---

## Acceptance Criteria

- [ ] {criterion with shell command verification}
```

### Step 9: Confirm

Display completion message:

```
Implementation plan created: .agents/plans/{kebab-name}.md

Goal: {goal statement}

Summary:
- {N} phases
- {N} tasks total
- {N} files to create
- {N} files to modify

Verification:
- {N} truths defined
- {N} artifacts to verify
- {N} wiring connections

Checkpoints:
- {N} human-verify
- {N} decision

Next steps:
1. Review the implementation plan
2. Review verification criteria (truths/artifacts/wiring)
3. Run /atomize .agents/plans/{kebab-name}.md to create executable tasks
```

## Output

- **File:** `.agents/plans/{kebab-name}.md`
- **Format:** Comprehensive markdown plan with verification criteria

## Key Principles

### Context is King

The plan must contain ALL information needed for one-pass implementation success:
- Exact file paths
- Line number references
- Code patterns to follow
- Validation commands

### Goal-Backward Thinking

Start with the goal, work backward to tasks:
1. What must the user be able to DO? (truths)
2. What files must exist and be substantive? (artifacts)
3. How must parts connect? (wiring)
4. What tasks create those artifacts and wiring?

### Every Task Must Be Verifiable

No task without a shell command that exits 0 on success.

Bad:
- "Make sure it works"
- "Test the feature"

Good:
- `npm test -- --grep 'FeatureName'`
- `curl localhost:3000/api/feature | grep -q 'expected'`

### Reference, Don't Repeat

Point to existing patterns instead of duplicating code:
- "Follow pattern in `auth.service.ts:45-67`"
- "Use the same structure as `user.model.ts`"

### Catch Stubs Early

Verification artifacts with `mustNotContain` patterns catch:
- `TODO`, `FIXME`, `PLACEHOLDER`
- `throw new Error('Not implemented')`
- `console.log('stub')`
- `return null // temporary`

## Example

```
User: /plan user-authentication

Claude: Reading feature definition from .agents/features/user-authentication.md...

[Explores codebase]
[Defines goal and verification criteria]
[Makes architectural decisions]
[Creates task list]

Implementation plan created: .agents/plans/user-authentication.md

Goal: User can authenticate with email/password and access protected resources

Summary:
- 4 phases
- 12 tasks total
- 5 files to create
- 2 files to modify

Verification:
- 4 truths defined
- 5 artifacts to verify
- 6 wiring connections

Checkpoints:
- 1 human-verify (login form UI)
- 0 decision

Next steps:
1. Review the implementation plan
2. Review verification criteria (truths/artifacts/wiring)
3. Run /atomize .agents/plans/user-authentication.md to create executable tasks
```
