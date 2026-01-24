---
name: gsd:post-plan-mirror
description: "SHIM: Mirror GSD plans to feature-plans and PRDs after planning completes"
trigger: after /gsd:plan-phase completes successfully
internal: true
---

# Post-Plan Mirror Shim

**Purpose:** After GSD planning completes, automatically create mirrored copies in Core PIV and Ralph formats. This enables any execution path (GSD, PIV, Ralph) to work with GSD-planned work.

**Trigger:** Called automatically at the end of `/gsd:plan-phase` after "PHASE {X} PLANNED" banner.

**Principle:** GSD plans are authoritative. Mirrors are read-only copies for consumption by other tooling.

---

## Process

### Step 1: Identify Plans to Mirror

```bash
# Get phase directory from plan-phase context
PHASE_DIR=".planning/phases/${PHASE}-*"
PHASE_DIR=$(ls -d $PHASE_DIR 2>/dev/null | head -1)

# List all PLAN.md files
PLANS=$(ls ${PHASE_DIR}/*-PLAN.md 2>/dev/null)
```

### Step 2: For Each Plan, Create Feature-Plan Mirror

For each `{phase}-{NN}-PLAN.md`:

**Read and parse:**
- YAML frontmatter (phase, plan, wave, depends_on, type)
- `<objective>` section
- `<context>` section with @-references
- `<tasks>` section with all `<task>` blocks
- `<verification>` section with `<must_haves>`

**Transform to feature-plan format:**

```markdown
# Feature: {phase}-{plan-number}-{objective-slug}

> **Origin:** GSD Phase {phase}, Plan {plan}
> **Mirror of:** .planning/phases/{phase-dir}/{phase}-{NN}-PLAN.md
> **Do not edit:** Changes here will be overwritten on re-mirror

## Feature Description

{Content from <objective> section}

## User Story

As a developer
I want to {objective in action form}
So that {derived benefit from phase goal}

## Feature Metadata

**Feature Type**: {from frontmatter type: feature|refactor|bugfix}
**Estimated Complexity**: {derive from task count: 1-2=Low, 3-4=Medium, 5+=High}
**Origin**: GSD Phase {phase}
**Wave**: {from frontmatter}
**Depends On**: {from frontmatter depends_on array}

---

## CONTEXT REFERENCES

### Relevant Codebase Files (READ BEFORE IMPLEMENTING)

{Transform @-references from <context> section}
{Format: - `file.ts` (lines X-Y) - Why: {reason}}

### Files to Create/Modify

{Extract from <task> <files> elements}

---

## IMPLEMENTATION PLAN

### Phase 1: {First task objective}

{Task 1 details}

### Phase 2: {Second task objective}

{Task 2 details}

{Continue for all tasks}

---

## STEP-BY-STEP TASKS

{For each <task> in source:}

### {N}. {ACTION} {target_file}

- **IMPLEMENT**: {Content from task body}
- **PATTERN**: {Extract any pattern references}
- **VALIDATE**: `{Content from <verify> element}`

**Done when:** {Content from <done> element}

---

## VALIDATION COMMANDS

{Aggregate all <verify> commands from tasks}

```bash
{command 1}
{command 2}
```

---

## ACCEPTANCE CRITERIA

{Transform <must_haves> to checkboxes}

- [ ] {must_have truth 1}
- [ ] {must_have truth 2}
- [ ] {must_have artifact 1 exists and is wired}
```

**Write to:** `.agents/feature-plans/{phase}-{NN}-{slug}.md`

### Step 3: For Each Feature-Plan, Create PRD Mirror

Read the just-created feature-plan and atomize to PRD format:

```json
{
  "featureName": "{phase}-{NN}-{slug}",
  "origin": "gsd",
  "planSource": ".planning/phases/{phase-dir}/{phase}-{NN}-PLAN.md",
  "featurePlanSource": ".agents/feature-plans/{phase}-{NN}-{slug}.md",
  "version": 1,
  "phase": {phase},
  "plan": {NN},
  "wave": {wave},
  "dependsOn": [{depends_on}],
  "testCommand": "{derive from validation commands}",
  "userStories": [
    {
      "id": "US-{phase}{NN}-001",
      "title": "{task 1 title}",
      "acceptanceCriteria": [
        "{verify command 1 as shell command}",
        "{verify command 2 as shell command}"
      ],
      "priority": 1,
      "passes": false,
      "notes": "{task context/pattern notes}",
      "file": "{primary file from task}",
      "origin": "gsd-task-1"
    },
    {
      "id": "US-{phase}{NN}-002",
      "title": "{task 2 title}",
      ...
    }
  ]
}
```

**Atomicity rules:**
- One GSD `<task>` = One user story (unless task is clearly compound)
- If task contains "and" connecting distinct operations, split into multiple stories
- Acceptance criteria must be shell commands that exit 0 on success

**Write to:** `.agents/prds/{phase}-{NN}-{slug}.json`

### Step 4: Update STATE.md

Add/update the mirrored artifacts section:

```markdown
## Mirrored Artifacts

| GSD Plan | Feature Plan | PRD | Status |
|----------|--------------|-----|--------|
| 08-01-PLAN.md | .agents/feature-plans/08-01-auth-setup.md | .agents/prds/08-01-auth-setup.json | Mirrored |
| 08-02-PLAN.md | .agents/feature-plans/08-02-auth-flow.md | .agents/prds/08-02-auth-flow.json | Mirrored |
```

### Step 5: Report

After mirroring completes, append to the plan-phase output:

```
───────────────────────────────────────────────────────────────

## Mirrors Created

| Format | Location |
|--------|----------|
| Feature Plans | .agents/feature-plans/{phase}-*.md |
| PRDs | .agents/prds/{phase}-*.json |

**Execution options:**
- GSD: `/gsd:execute-phase {phase}`
- PIV: `/core_piv_loop:execute .agents/feature-plans/{first-plan}.md`
- Ralph: `ralph-loop .agents/prds/{first-plan}.json`

───────────────────────────────────────────────────────────────
```

---

## Transformation Rules

### Task Type Mapping

| GSD Task Type | Feature Plan Treatment | PRD Treatment |
|---------------|----------------------|---------------|
| `type="auto"` | Normal task | Normal user story |
| `type="checkpoint:human-verify"` | Task with "Verify:" note | Story with manual verification note |
| `type="checkpoint:decision"` | Task with "Decision:" note | Story marked `"requiresDecision": true` |
| `type="checkpoint:human-action"` | Task with "Manual:" warning | Story marked `"manual": true` |

### Verification Command Transformation

GSD `<verify>` elements may be prose or commands. Transform:

| GSD Verify | PRD acceptanceCriteria |
|------------|------------------------|
| `npm test` | `"npm test"` |
| `curl -X POST /api/auth` | `"curl -s -X POST /api/auth \| grep -q 'success'"` |
| "User can see dashboard" | `"echo 'MANUAL: Verify user can see dashboard'"` |
| "No TypeScript errors" | `"npx tsc --noEmit"` |

### Must-Have Transformation

GSD `<must_haves>` section has three parts:

```xml
<must_haves>
  <truths>
    - User can log in with valid credentials
    - Invalid credentials show error message
  </truths>
  <artifacts>
    - src/app/api/auth/login/route.ts
    - src/lib/auth.ts
  </artifacts>
  <key_links>
    - Login route imported in app router
    - Auth lib used by login route
  </key_links>
</must_haves>
```

**Transform to feature-plan acceptance criteria:**

```markdown
## ACCEPTANCE CRITERIA

### Behavioral (from truths)
- [ ] User can log in with valid credentials
- [ ] Invalid credentials show error message

### Artifacts (from artifacts)
- [ ] src/app/api/auth/login/route.ts exists and is not a stub
- [ ] src/lib/auth.ts exists and is not a stub

### Integration (from key_links)
- [ ] Login route imported in app router
- [ ] Auth lib used by login route
```

**Transform to PRD (add to final user story):**

```json
{
  "id": "US-{phase}{NN}-VERIFY",
  "title": "Verify plan completion",
  "acceptanceCriteria": [
    "test -f src/app/api/auth/login/route.ts",
    "test -f src/lib/auth.ts",
    "grep -q 'login' src/app/api/auth/route.ts",
    "grep -q 'auth' src/app/api/auth/login/route.ts"
  ],
  "priority": 999,
  "passes": false,
  "notes": "Auto-generated verification story from GSD must_haves",
  "origin": "gsd-must-haves"
}
```

---

## Re-Mirror Behavior

If `/gsd:plan-phase` is run again (revision, --gaps, etc.):

1. Check for existing mirrors
2. If mirrors exist with same plan numbers:
   - **Overwrite** feature-plans and PRDs
   - Log: "Re-mirrored {N} plans (previous mirrors overwritten)"
3. If new plans added (gap closure creates 04, 05):
   - Create new mirrors
   - Keep existing mirrors for 01, 02, 03
   - Log: "Mirrored {N} new plans, {M} existing unchanged"

---

## Error Handling

| Error | Action |
|-------|--------|
| PLAN.md parse failure | Log warning, skip this plan, continue with others |
| Directory creation fails | Error and abort mirror |
| JSON write fails | Log warning, feature-plan still created |
| STATE.md update fails | Log warning, mirrors still created |

---

## Integration Point

This shim is called by `/gsd:plan-phase` at step 13 (after presenting final status, before offering next steps).

Add to `plan-phase.md` process:

```markdown
## 13a. Mirror Plans (Shim)

After verification passes (or override), run post-plan-mirror:

1. Create .agents/feature-plans/ directory if needed
2. Create .agents/prds/ directory if needed
3. For each PLAN.md in phase:
   - Transform to feature-plan format
   - Transform to PRD format
4. Update STATE.md mirrored artifacts section
5. Append mirror report to output
```
