---
description: Fix a bug using its Bug ID (Ralph-style iterative fixing)
argument-hint: "<BUG-ID> [--plan] [--ralph]"
---

# Fix Bug: $ARGUMENTS

## Objective

Fix bug by iterating through investigate → fix → test cycles until all acceptance criteria are met.

**Modes:**
- **Direct fix (default):** Investigate → Fix → Test cycle in this session
- **`--plan`:** Create feature-plan and PRD for complex bugs requiring structured approach
- **`--ralph`:** Create PRD only, for Ralph-loop execution

---

## Parse Arguments

Extract from $ARGUMENTS:
- Bug ID (e.g., BUG-003)
- `--plan` flag (create feature-plan + PRD)
- `--ralph` flag (create PRD only)

```bash
# Parse arguments
BUG_ID=$(echo "$ARGUMENTS" | grep -oP 'BUG-\d+')
HAS_PLAN_FLAG=$(echo "$ARGUMENTS" | grep -q '\-\-plan' && echo "yes")
HAS_RALPH_FLAG=$(echo "$ARGUMENTS" | grep -q '\-\-ralph' && echo "yes")
```

**Route by flags:**
- No flags → Direct Fix Mode (Phase 1-5)
- `--plan` → Planned Fix Mode (Phase P1-P4)
- `--ralph` → Ralph Fix Mode (Phase R1-R3)

---

# DIRECT FIX MODE (Default)

## Phase 1: Load Bug Definition

Read the bug file:
```
docs/bugs/$BUG_ID.md
```

Extract and understand:
- **Description**: What's broken
- **Reproduction Steps**: How to trigger it
- **Expected Behavior**: What should happen
- **Acceptance Criteria**: Success conditions (CRITICAL - these define "done")
- **Source**: Where bug was discovered (manual, GSD execution, verification)
- **Linked To**: Any GSD phase/plan this bug is linked to

Update the bug status to "In Progress":
- Edit the bug file, change `**Status:** Open` to `**Status:** In Progress`

**Check complexity:**

| Indicator | Suggests |
|-----------|----------|
| 1-2 acceptance criteria | Direct fix |
| 3+ acceptance criteria | Consider `--plan` |
| Multiple files affected | Consider `--plan` |
| Requires architectural change | Consider `--plan` |
| "I don't know where to start" | Consider `--plan` |

If complex, suggest: "This bug looks complex. Consider `/my:fix-bug {BUG_ID} --plan` for a structured approach."

## Phase 2: Investigate

### Search Codebase

Based on the bug description:
1. Search for relevant error messages
2. Find related files/functions
3. Read the code to understand current behavior

### Identify Root Cause

Document in the Fix Log:
```markdown
### Investigation - {timestamp}
- **Files examined**: [list]
- **Root cause**: [explanation]
- **Affected code**: [file:line]
```

## Phase 3: Fix

### Implement the Fix

1. Read the file before editing
2. Make minimal, targeted changes
3. Follow existing code patterns

### Document the Change

Add to Fix Log:
```markdown
### Fix Attempt {N} - {timestamp}
- **File**: [path]
- **Change**: [what was changed]
- **Rationale**: [why this fixes it]
```

## Phase 4: Validate

### Run Available Checks

```bash
# Syntax checks (language-appropriate)
python3 -m py_compile [modified_file.py]
npx tsc --noEmit
```

### Test Against Acceptance Criteria

Go through each acceptance criterion:
- [ ] Criterion 1 - Test it, document result
- [ ] Criterion 2 - Test it, document result

### Update Bug File

For each criterion tested, update the checkbox:
- `- [ ]` → `- [x]` if passing
- Add notes if partially passing or blocked

## Phase 5: Iterate or Complete

### If Criteria NOT Met

1. Analyze why the fix didn't work
2. Document findings in Fix Log
3. Return to Phase 2 or 3
4. Try a different approach

**After 3 failed attempts:**
- Ask user if they want to continue or switch to `--plan` mode

### If ALL Criteria Met

1. Update bug status to "Fixed":
   ```markdown
   **Status:** Fixed
   **Fixed:** {YYYY-MM-DD}
   ```

2. Add final Fix Log entry:
   ```markdown
   ### Resolution - {timestamp}
   - **Root cause**: [summary]
   - **Fix**: [summary of changes]
   - **Files modified**: [list]
   - **All acceptance criteria passing**
   ```

3. **Update STATE.md:**
   - Find bug in "Open Bugs" table
   - Change Status to "Fixed"
   - Or move to "Recently Fixed" section

4. **If bug was linked to GSD phase:**
   - Note in the linked VERIFICATION.md that bug is fixed
   - This helps gap closure know the bug is resolved

5. Report to user:
   ```
   Bug $BUG_ID has been fixed!

   Summary:
   - Root cause: [brief]
   - Fix: [brief]
   - Files changed: [list]

   All acceptance criteria are now passing.

   Next steps:
   - Restart server if needed: [command]
   - Verify manually
   - Run: /my:commit
   ```

---

# PLANNED FIX MODE (`--plan`)

For complex bugs that benefit from structured planning.

## Phase P1: Load and Analyze Bug

Read `docs/bugs/$BUG_ID.md` and extract all context.

Update status to "In Progress (Planning)".

## Phase P2: Create Feature Plan

Create `.agents/feature-plans/BUG-{ID}-fix.md`:

```markdown
# Feature: BUG-{ID} Fix - {Bug Title}

> **Origin:** Bug fix
> **Bug file:** docs/bugs/BUG-{ID}.md
> **Type:** bugfix

## Feature Description

Fix for BUG-{ID}: {bug title}

{Bug description from bug file}

## User Story

As a user
I want {expected behavior from bug file}
So that {derived benefit}

## Feature Metadata

**Feature Type**: Bug Fix
**Estimated Complexity**: {Low|Medium|High based on criteria count}
**Bug ID**: BUG-{ID}
**Source**: {bug source field}

---

## CONTEXT REFERENCES

### Bug Context

- **Bug file**: `docs/bugs/BUG-{ID}.md`
- **Reproduction**: {reproduction steps}
- **Root cause hypothesis**: {if investigated}

### Relevant Codebase Files

{Files identified from bug description and any prior investigation}

---

## IMPLEMENTATION PLAN

### Phase 1: Investigate Root Cause

{If not already investigated}

### Phase 2: Implement Fix

{Derived from acceptance criteria}

### Phase 3: Verify Fix

{Test each acceptance criterion}

---

## STEP-BY-STEP TASKS

### 1. {First task based on acceptance criteria}

- **IMPLEMENT**: {specific action}
- **PATTERN**: {existing pattern to follow}
- **VALIDATE**: `{shell command}`

**Done when:** {acceptance criterion satisfied}

{Continue for each acceptance criterion}

---

## VALIDATION COMMANDS

```bash
{Commands to verify fix}
```

---

## ACCEPTANCE CRITERIA

{Copy from bug file}

- [ ] {criterion 1}
- [ ] {criterion 2}
```

## Phase P3: Create PRD

Transform feature-plan to PRD using atomize-plan logic:

Create `.agents/prds/BUG-{ID}-fix.json`:

```json
{
  "featureName": "BUG-{ID}-fix",
  "origin": "bug",
  "bugFile": "docs/bugs/BUG-{ID}.md",
  "featurePlanSource": ".agents/feature-plans/BUG-{ID}-fix.md",
  "version": 1,
  "testCommand": "{appropriate test command}",
  "userStories": [
    {
      "id": "US-BUG{ID}-001",
      "title": "{task 1 from plan}",
      "acceptanceCriteria": [
        "{criterion as shell command}"
      ],
      "priority": 1,
      "passes": false,
      "notes": "{context}",
      "origin": "bug-fix"
    }
  ]
}
```

## Phase P4: Update State and Report

1. Update bug file:
   ```markdown
   **Status:** In Progress (Planned)

   ## Planning Artifacts
   - Feature Plan: `.agents/feature-plans/BUG-{ID}-fix.md`
   - PRD: `.agents/prds/BUG-{ID}-fix.json`
   ```

2. Update STATE.md:
   - Add to "Active Feature Plans" section
   - Add to "Active PRDs" section

3. Report:
   ```
   Bug BUG-{ID} planned for structured fix.

   Created:
   - Feature Plan: .agents/feature-plans/BUG-{ID}-fix.md
   - PRD: .agents/prds/BUG-{ID}-fix.json

   Execution options:
   - Direct: /core_piv_loop:execute .agents/feature-plans/BUG-{ID}-fix.md
   - Ralph: ralph-loop .agents/prds/BUG-{ID}-fix.json
   - Manual: Review plan and implement step by step

   After fix is complete, run: /my:fix-bug BUG-{ID}
   (This will verify criteria and update status)
   ```

---

# RALPH FIX MODE (`--ralph`)

For bugs that should be executed by Ralph loop.

## Phase R1: Load Bug

Read `docs/bugs/$BUG_ID.md`.

Update status to "In Progress (Ralph)".

## Phase R2: Create PRD Directly

Skip feature-plan, create PRD directly from bug acceptance criteria:

Create `.agents/prds/BUG-{ID}-fix.json`:

```json
{
  "featureName": "BUG-{ID}-fix",
  "origin": "bug",
  "bugFile": "docs/bugs/BUG-{ID}.md",
  "version": 1,
  "testCommand": "{appropriate test command}",
  "userStories": [
    {
      "id": "US-BUG{ID}-001",
      "title": "Fix: {acceptance criterion 1}",
      "acceptanceCriteria": [
        "{criterion 1 as shell command that exits 0 on success}"
      ],
      "priority": 1,
      "passes": false,
      "notes": "From BUG-{ID}: {bug description context}",
      "file": "{likely file based on bug}",
      "origin": "bug-criterion-1"
    }
  ]
}
```

**Criterion transformation rules:**

| Bug Criterion | PRD acceptanceCriteria |
|---------------|------------------------|
| "User sees error message" | `grep -q 'error' src/... \|\| echo 'MANUAL: Verify error message'` |
| "Function returns X" | `node -e "require('./...').func() === X"` |
| "No console errors" | `npm test 2>&1 \| grep -v 'error'` |
| "API returns 200" | `curl -s -o /dev/null -w '%{http_code}' /api/... \| grep -q 200` |

## Phase R3: Report

1. Update bug file with PRD link
2. Update STATE.md
3. Report:
   ```
   Bug BUG-{ID} ready for Ralph execution.

   PRD: .agents/prds/BUG-{ID}-fix.json
   Stories: {N} user stories from {M} acceptance criteria

   To execute with Ralph:
   ralph-loop .agents/prds/BUG-{ID}-fix.json --max-iterations 10

   After Ralph completes, verify with: /my:fix-bug BUG-{ID}
   ```

---

## Post-Fix Integration

After a bug is fixed (by any method), ensure:

1. **Bug file updated:**
   - Status: Fixed
   - Fixed date
   - Resolution in Fix Log

2. **STATE.md updated:**
   - Bug moved from "Open" to "Fixed"
   - If linked to GSD phase, note updated

3. **If bug was linked to GSD verification gap:**
   - Update VERIFICATION.md to note bug is resolved
   - Next `/gsd:execute-phase` re-verification will check

4. **Commit:**
   - Suggest `/my:commit` with bug ID in message
   - Format: `fix(BUG-{ID}): {brief description}`

---

## Important Rules

1. **Never declare fixed until ALL acceptance criteria pass**
2. **Document every attempt** in the Fix Log (success or failure)
3. **Ask user if stuck** after 3 failed attempts in direct mode
4. **One bug at a time** - don't fix unrelated issues
5. **Update STATE.md** - bugs are tracked centrally
6. **Respect GSD links** - if bug came from GSD, maintain the link

## Fix Log Format

Each entry in the Fix Log should follow this pattern:

```markdown
### {Action} - {YYYY-MM-DD HH:MM}
- **Details**: [what was done/found]
- **Result**: [outcome]
- **Next step**: [if applicable]
```

This creates an audit trail of all investigation and fix attempts.
