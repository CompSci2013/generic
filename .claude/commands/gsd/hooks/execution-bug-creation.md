---
name: gsd:execution-bug-creation
description: "SHIM: Auto-create bug reports when GSD execution encounters failures"
trigger: gsd-executor deviation handling
internal: true
---

# Execution Bug Creation Shim

**Purpose:** When `gsd-executor` encounters a bug during plan execution, automatically create a bug report in the unified bug tracking format (`docs/bugs/BUG-*.md`).

**Trigger:** Called by `gsd-executor` during deviation handling when:
- A bug is discovered (RULE 1: Auto-fix bugs)
- The fix succeeds OR the fix is deferred
- Creates audit trail regardless of fix outcome

**Principle:** All bugs discovered anywhere in the system end up in `docs/bugs/`. GSD execution is no exception.

---

## When to Create a Bug

### Create Bug Report When:

1. **Unexpected runtime error** during task execution
   - Test failure not anticipated by plan
   - Exception/crash during code execution
   - Build failure due to code issue (not environment)

2. **Logic error discovered** while implementing
   - Code doesn't behave as expected
   - Edge case not handled
   - Incorrect algorithm/calculation

3. **Integration failure** between components
   - API contract violation
   - Data format mismatch
   - Missing dependency

4. **Security vulnerability** found
   - Injection risk
   - Auth bypass
   - Data exposure

### Do NOT Create Bug Report When:

1. **Environment issue** (missing dependency, wrong version)
   - Log in SUMMARY.md as "environment fix"
   - Not a code bug

2. **Plan was incomplete** (missing task/step)
   - This is a gap, not a bug
   - Handled by verification → gap closure flow

3. **User preference change** (want different behavior)
   - This is a requirement change
   - Not a bug

---

## Bug Creation Process

### Step 1: Generate Bug ID

```bash
# Find next bug ID
LAST_BUG=$(ls docs/bugs/BUG-*.md 2>/dev/null | sort -V | tail -1 | grep -oP 'BUG-\K\d+')
if [ -z "$LAST_BUG" ]; then
  NEXT_ID="001"
else
  NEXT_ID=$(printf "%03d" $((10#$LAST_BUG + 1)))
fi
BUG_ID="BUG-${NEXT_ID}"
```

### Step 2: Create Bug File

**File:** `docs/bugs/${BUG_ID}.md`

```markdown
# ${BUG_ID}: {Short descriptive title}

**Status:** {Open | Fixed}
**Created:** {YYYY-MM-DD}
**Source:** GSD Execution (Phase {X}, Plan {Y}, Task {Z})
**Fixed:** {YYYY-MM-DD if fixed during execution, otherwise omit}

## Description

{What went wrong - factual description of the bug}

## Reproduction Steps

1. Execute plan {phase}-{plan} task {task-number}
2. {Specific action that triggers the bug}
3. {What happens vs what should happen}

**Context:**
- Plan: `.planning/phases/{phase-dir}/{phase}-{NN}-PLAN.md`
- Task: {task number and title}
- Code location: `{file}:{line}` (if known)

## Expected Behavior

{What should have happened}

## Actual Behavior

{What actually happened}

## Acceptance Criteria

- [ ] {Criterion 1 - specific, testable}
- [ ] {Criterion 2 - specific, testable}
- [ ] {Criterion 3 - if applicable}

## Fix Log

### Discovery - {YYYY-MM-DD HH:MM}
- **Context**: During GSD execution of {phase}-{plan}
- **Details**: {How the bug was discovered}
- **Initial assessment**: {Severity, scope}

{If fixed during execution:}

### Fix Attempt 1 - {YYYY-MM-DD HH:MM}
- **File**: {path}
- **Change**: {what was changed}
- **Result**: {Success/Failure}
- **Rationale**: {why this fixes it}

### Resolution - {YYYY-MM-DD HH:MM}
- **Root cause**: {summary}
- **Fix**: {summary of changes}
- **Files modified**: {list}
- **All acceptance criteria passing**

## Links

- **GSD Plan**: `.planning/phases/{phase-dir}/{phase}-{NN}-PLAN.md`
- **GSD Summary**: `.planning/phases/{phase-dir}/{phase}-{NN}-SUMMARY.md`
- **Commit**: {hash if fixed and committed}
```

### Step 3: Update STATE.md

Add to "Open Bugs" section (create section if missing):

```markdown
## Open Bugs

| Bug ID | Title | Source | Status | Linked To |
|--------|-------|--------|--------|-----------|
| BUG-{NNN} | {title} | GSD {phase}-{plan} | {Open\|Fixed} | Phase {X} execution |
```

If bug was fixed during execution, status is "Fixed". Otherwise "Open".

### Step 4: Log in SUMMARY.md

Add to the deviations section of the plan's SUMMARY.md:

```markdown
### Deviations

#### Bug Discovered: {BUG_ID}

- **Type**: Bug (auto-created)
- **Description**: {short description}
- **Action**: {Fixed immediately | Logged for later}
- **Bug file**: `docs/bugs/{BUG_ID}.md`
- **Commit**: {hash if fixed}
```

---

## Severity Classification

When creating bugs, classify severity to help prioritization:

| Severity | Criteria | Example |
|----------|----------|---------|
| **Critical** | Blocks execution, security risk, data loss | Auth bypass, crash on start |
| **High** | Major feature broken, no workaround | Login fails, can't save data |
| **Medium** | Feature degraded, workaround exists | Slow performance, UI glitch |
| **Low** | Minor issue, cosmetic, edge case | Typo in message, rare edge case |

Add severity to bug file:

```markdown
**Status:** Open
**Severity:** {Critical | High | Medium | Low}
**Created:** {date}
```

---

## Integration with gsd-executor

Add to `gsd-executor.md` deviation rules:

```markdown
<deviation_rules>

**RULE 1: Auto-fix bugs**

**Trigger:** Code doesn't work as intended

**Action:**
1. Assess if fixable within current context
2. **Create bug report** via execution-bug-creation shim:
   - Always create `docs/bugs/BUG-{NNN}.md`
   - Include execution context (phase, plan, task)
   - Set status based on fix outcome
3. If fixable: Fix, verify, commit, mark bug as Fixed
4. If not fixable: Log bug as Open, continue with remaining tasks
5. Track in SUMMARY.md deviations section

**Bug creation is MANDATORY** for any bug encountered, whether fixed or not.
This creates audit trail and enables `/my:list-bugs` visibility.
```

---

## Fix During Execution vs. Defer

### Fix During Execution (Preferred)

When executor fixes a bug immediately:

1. Create bug file with status "Open"
2. Attempt fix
3. If fix succeeds:
   - Add "Fix Attempt" and "Resolution" to Fix Log
   - Change status to "Fixed"
   - Add "Fixed: {date}" field
   - Commit the fix
4. If fix fails after reasonable attempts:
   - Keep status "Open"
   - Add "Fix Attempt" entries showing what was tried
   - Continue with remaining tasks

### Defer Fix (When Appropriate)

Sometimes executor should log bug and continue:

- Bug is in code not touched by current plan
- Fix would derail current task scope
- Bug is low severity and not blocking
- Bug requires investigation beyond executor's context

When deferring:

1. Create bug file with status "Open"
2. Add "Discovery" entry to Fix Log
3. Note "Deferred: {reason}" in Fix Log
4. Continue execution
5. Bug will appear in `/my:list-bugs` for later attention

---

## Example Bug File (Fixed During Execution)

```markdown
# BUG-003: Auth token expiry not handled in API calls

**Status:** Fixed
**Severity:** High
**Created:** 2026-01-19
**Source:** GSD Execution (Phase 8, Plan 2, Task 3)
**Fixed:** 2026-01-19

## Description

API calls fail silently when auth token expires. No refresh attempt, no error message to user.

## Reproduction Steps

1. Execute plan 08-02 task 3 (implement API call)
2. Let token expire (or manually invalidate)
3. Make API call
4. Call fails with 401, but UI shows no feedback

**Context:**
- Plan: `.planning/phases/08-auth/08-02-PLAN.md`
- Task: 3. Implement fetchUserData API call
- Code location: `src/lib/api.ts:45`

## Expected Behavior

When token expires, either:
- Automatically refresh token and retry
- Show user-friendly error asking to re-login

## Actual Behavior

API call fails silently. Console shows 401 error but UI is stuck in loading state.

## Acceptance Criteria

- [x] Expired token triggers refresh attempt
- [x] If refresh fails, user sees "Session expired" message
- [x] User is redirected to login page

## Fix Log

### Discovery - 2026-01-19 14:32
- **Context**: During GSD execution of 08-02, task 3
- **Details**: Test call with expired token hung indefinitely
- **Initial assessment**: High severity, core auth flow broken

### Fix Attempt 1 - 2026-01-19 14:45
- **File**: src/lib/api.ts
- **Change**: Added 401 response interceptor with token refresh logic
- **Result**: Success
- **Rationale**: Intercept at API client level handles all calls uniformly

### Resolution - 2026-01-19 14:52
- **Root cause**: No error handling for 401 responses in API client
- **Fix**: Added response interceptor that attempts refresh, shows error on failure
- **Files modified**: src/lib/api.ts, src/components/AuthProvider.tsx
- **All acceptance criteria passing**

## Links

- **GSD Plan**: `.planning/phases/08-auth/08-02-PLAN.md`
- **GSD Summary**: `.planning/phases/08-auth/08-02-SUMMARY.md`
- **Commit**: a1b2c3d
```

---

## Directory Setup

Ensure bug directory exists:

```bash
mkdir -p docs/bugs
```

If this is first bug, create `.gitkeep` or initial structure:

```bash
if [ ! -d docs/bugs ]; then
  mkdir -p docs/bugs
  echo "# Bug Tracking\n\nBugs discovered during development.\n\nUse \`/my:list-bugs\` to see all bugs.\nUse \`/my:fix-bug BUG-XXX\` to fix a specific bug." > docs/bugs/README.md
fi
```
