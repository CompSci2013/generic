# /atomize - Task Atomization

Convert an implementation plan into a prd.json with atomic, testable user stories for autonomous execution.

## Arguments

- `$ARGUMENTS` - Path to implementation plan (e.g., `.agents/plans/feature-name.md`)

## Process

### Step 1: Load Implementation Plan

Read the implementation plan file. Extract:
- Feature name and goal
- Step-by-step tasks
- Validation commands
- File references
- Acceptance criteria from plan

### Step 2: Apply Atomicity Rules

Each user story must be:

| Rule | Requirement |
|------|-------------|
| **Files** | Touch max 2 files |
| **Criteria** | Max 3 acceptance criteria |
| **Title** | No "and" - single concept |
| **Verification** | Single shell command can verify |
| **Context Budget** | Completable in <50% context |

### Step 3: Split Large Tasks

If a task violates atomicity rules, split it:

**Pattern: "Create X that does A and B"**
Split into:
1. Create X skeleton/structure
2. Implement A in X
3. Implement B in X

**Pattern: "Modify component with multiple changes"**
Split into:
1. Add helper/utility (if needed)
2. Integrate helper into component
3. Update tests

**Pattern: "Add feature with UI and logic"**
Split into:
1. Add data model/types
2. Add business logic
3. Add UI component
4. Wire up integration

### Step 4: Create Acceptance Criteria

Transform validation commands into shell commands that exit 0:

| Task Description | Acceptance Criteria |
|-----------------|---------------------|
| Create file X | `test -f X` |
| Add export to file | `grep -q 'export' file` |
| Add function Y | `grep -q 'function Y' file` |
| Syntax valid (JS) | `node --check file.js` |
| Syntax valid (TS) | `npx tsc --noEmit file.ts` |
| Syntax valid (Python) | `python3 -m py_compile file.py` |
| Tests pass | `npm test -- --grep 'pattern'` |
| Build succeeds | `npm run build` |
| Lint passes | `npm run lint -- file` |
| HTTP response | `curl -s url \| grep -q 'expected'` |

### Step 5: Assign Priority and Dependencies

Order stories so dependencies come first:

| Priority Range | Category |
|---------------|----------|
| 1-10 | Infrastructure, config, setup |
| 11-30 | Core functionality, models |
| 31-50 | Business logic, services |
| 51-70 | Integration, wiring |
| 71-90 | UI components |
| 91-100 | Tests, documentation |

For each story, identify `dependsOn` - which story IDs must complete first.

### Step 6: Assign Waves (Parallel Execution Groups)

Group stories into waves based on dependencies:

```
Wave 1: All stories with no dependencies (can run in parallel)
Wave 2: Stories that depend ONLY on Wave 1 stories
Wave 3: Stories that depend on Wave 1 or Wave 2 stories
...
```

**Algorithm:**
```
for each story:
    if story.dependsOn is empty:
        story.wave = 1
    else:
        max_dep_wave = max(wave of each dependency)
        story.wave = max_dep_wave + 1
```

### Step 7: Assign Context Budgets

Estimate context usage for each story:

| Context Budget | Criteria |
|---------------|----------|
| **small** (<30%) | Simple file creation, single function, clear pattern |
| **medium** (30-50%) | Moderate complexity, 1-2 files, some logic |
| **large** (50-70%) | Complex logic, multiple patterns, significant code |

**Heuristics:**
- Creating a new file from scratch: `small`
- Adding to existing file with clear pattern: `small`
- Implementing business logic: `medium`
- Complex integrations or algorithms: `large`
- TDD tasks (test + implement): `large`

**If estimated >70%:** Split the story further.

### Step 8: Identify Checkpoints

Add checkpoints where human input may be needed:

**checkpoint:human-verify** - For visual/functional verification
```json
{
  "checkpoint": {
    "type": "human-verify",
    "prompt": "Verify the login form displays correctly"
  }
}
```

**checkpoint:decision** - For architectural choices
```json
{
  "checkpoint": {
    "type": "decision",
    "prompt": "Choose authentication strategy",
    "options": ["JWT tokens", "Session cookies", "OAuth only"]
  }
}
```

**When to add checkpoints:**
- UI components that need visual verification
- Integration points that need manual testing
- Architectural decisions that emerged during planning
- Security-sensitive implementations

### Step 9: Create Goal-Backward Verification

Define verification criteria for the entire PRD:

**Truths** - Observable user behaviors:
```json
{
  "truths": [
    {
      "description": "User can log in with valid credentials",
      "verifyCommand": "curl -X POST localhost:3000/auth/login -d '{...}' | jq -e '.token'"
    }
  ]
}
```

**Artifacts** - Files that must exist AND be substantive:
```json
{
  "artifacts": [
    {
      "file": "src/auth/login.service.ts",
      "mustContain": ["async login", "bcrypt.compare", "jwt.sign"],
      "mustNotContain": ["TODO", "PLACEHOLDER", "throw new Error('Not implemented')"]
    }
  ]
}
```

**Wiring** - Connections that must exist:
```json
{
  "wiring": [
    {
      "from": "src/routes/auth.routes.ts",
      "to": "LoginService",
      "via": "import",
      "verifyCommand": "grep -q 'LoginService' src/routes/auth.routes.ts"
    }
  ]
}
```

### Step 10: Generate prd.json

Create `.agents/prds/{kebab-name}.json`:

```json
{
  "name": "{Feature Name}",
  "version": "1.0.0",
  "branchName": "feat/{kebab-name}",
  "workingDirectory": "{absolute path to project}",
  "createdAt": "{ISO date}",
  "sourceFeature": ".agents/features/{kebab-name}.md",
  "sourcePlan": ".agents/plans/{kebab-name}.md",
  "goal": "{User-observable goal this PRD achieves}",
  "verification": {
    "truths": [...],
    "artifacts": [...],
    "wiring": [...]
  },
  "state": {
    "phase": "pending",
    "currentWave": 1,
    "currentStory": null
  },
  "userStories": [
    {
      "id": "US-001",
      "title": "{Imperative description - max 80 chars}",
      "acceptanceCriteria": ["{shell command}"],
      "priority": 1,
      "wave": 1,
      "dependsOn": [],
      "contextBudget": "small",
      "passes": false,
      "notes": "{Implementation hints}",
      "files": ["{file1}"],
      "contextFiles": []
    }
  ],
  "metadata": {
    "totalStories": 10,
    "totalWaves": 3
  }
}
```

### Step 11: Validate JSON

Ensure the generated JSON:
1. Is valid JSON syntax
2. Follows the schema in `schemas/prd.schema.json`
3. Has unique story IDs
4. Has valid wave assignments (dependencies satisfied)
5. Has no circular dependencies
6. All stories have context budget ≤ large
7. Verification criteria cover the goal

### Step 12: Report

Display summary:

```
PRD created: .agents/prds/{kebab-name}.json

Goal: {goal statement}

Waves:
  Wave 1 (parallel): US-001, US-002, US-003
  Wave 2 (parallel): US-004, US-005
  Wave 3 (parallel): US-006, US-007

Stories:
  US-001: {title} [wave:1, budget:small]
  US-002: {title} [wave:1, budget:small]
  US-003: {title} [wave:1, budget:medium]
  US-004: {title} [wave:2, budget:medium, depends:US-001]
  ...

Verification:
  Truths: {N} observable behaviors
  Artifacts: {N} substantive files
  Wiring: {N} connections

Summary:
- {N} user stories in {W} waves
- {N} checkpoints defined
- Estimated parallel speedup: {X}x

Next steps:
1. Review the PRD and verification criteria
2. Run /execute .agents/prds/{kebab-name}.json for autonomous implementation
```

---

## Output

- **File:** `.agents/prds/{kebab-name}.json`
- **Format:** JSON following prd.schema.json

---

## Wave Assignment Examples

### Example 1: Simple Linear Dependencies

```
US-001: Create types (no deps)         → Wave 1
US-002: Create service (deps: US-001)  → Wave 2
US-003: Create route (deps: US-002)    → Wave 3
US-004: Create tests (deps: US-003)    → Wave 4
```

### Example 2: Parallel Opportunities

```
US-001: Create user types (no deps)    → Wave 1
US-002: Create auth types (no deps)    → Wave 1  (parallel with US-001)
US-003: Create user service (deps: US-001) → Wave 2
US-004: Create auth service (deps: US-002) → Wave 2  (parallel with US-003)
US-005: Create routes (deps: US-003, US-004) → Wave 3
```

### Example 3: Complex Dependencies

```
US-001: Config (no deps)               → Wave 1
US-002: Database (deps: US-001)        → Wave 2
US-003: User model (deps: US-002)      → Wave 3
US-004: Auth model (deps: US-002)      → Wave 3  (parallel with US-003)
US-005: User service (deps: US-003)    → Wave 4
US-006: Auth service (deps: US-004)    → Wave 4  (parallel with US-005)
US-007: Integration (deps: US-005, US-006) → Wave 5
```

---

## Context Budget Heuristics

### Small (<30% context)
- Creating a config file
- Adding a single type/interface
- Simple utility function
- Adding an import statement
- Renaming/moving a file

### Medium (30-50% context)
- Implementing a service method
- Creating a component with template
- Adding validation logic
- Database query implementation
- API endpoint handler

### Large (50-70% context)
- Complex algorithm implementation
- TDD cycle (test + implementation)
- Multi-file refactoring
- Integration with external API
- State management setup

### Too Large (>70% - must split)
- "Implement entire feature"
- Multiple unrelated changes
- More than 2 files significantly modified

---

## Verification Criteria Guidelines

### Truths (Observable Behaviors)

Ask: "What must the user be able to DO when this is complete?"

Good truths:
- "User can log in with valid credentials"
- "Dashboard displays user's recent activity"
- "Form validates email format before submission"

Bad truths:
- "Code is clean" (subjective)
- "LoginService exists" (that's an artifact)
- "Tests pass" (that's verification, not behavior)

### Artifacts (Substantive Files)

Ask: "What files must exist AND contain real implementation?"

**mustContain patterns:**
- Function/class names that prove implementation
- Import statements showing integration
- Core logic keywords (async, await, try/catch for error handling)

**mustNotContain patterns:**
- `TODO`, `FIXME`, `PLACEHOLDER`
- `throw new Error('Not implemented')`
- `console.log('stub')`
- `return null // temporary`

### Wiring (Connections)

Ask: "How do the parts connect to form a working whole?"

Types of wiring:
- **Import** - File A imports from File B
- **Route** - Router connects to handler
- **Event** - Publisher connects to subscriber
- **Config** - Settings applied to component
- **Dependency** - Service injected into consumer

---

## Atomicity Examples

### Good: Atomic Stories

```json
{
  "id": "US-001",
  "title": "Create user model type definitions",
  "acceptanceCriteria": [
    "test -f src/models/user.ts",
    "grep -q 'interface User' src/models/user.ts"
  ],
  "priority": 1,
  "wave": 1,
  "contextBudget": "small",
  "files": ["src/models/user.ts"]
}
```

### Bad: Non-Atomic Stories

```json
{
  "title": "Create user model with validation and serialization",
  "files": ["src/models/user.ts", "src/utils/serializer.ts", "src/validators/user.ts"]
}
```
Problem: Touches 3 files, does multiple things ("and"), no wave/budget

---

## Notes

- Every acceptance criterion must be a shell command
- Stories should be completable without asking questions
- Include context files for stories that modify existing code
- Wave assignment enables parallel execution
- Context budget prevents quality degradation
- Verification criteria catch stub implementations
- Checkpoints enable graceful human handoff
