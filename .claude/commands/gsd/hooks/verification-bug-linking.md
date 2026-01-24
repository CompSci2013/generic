---
name: gsd:verification-bug-linking
description: "SHIM: Link GSD verification gaps to bug tracking system"
trigger: gsd-verifier gap detection
internal: true
---

# Verification Bug Linking Shim

**Purpose:** When `gsd-verifier` finds gaps (must_haves not satisfied), determine if gaps should become bugs, link to existing bugs, or remain as GSD gaps for plan-based closure.

**Trigger:** Called by `gsd-verifier` when `gaps_found` status is returned.

**Principle:** Bugs and gaps are related but distinct:
- **Bug**: Something is broken (incorrect behavior)
- **Gap**: Something is missing (incomplete implementation)

Some gaps are bugs (should have worked but doesn't). Some gaps are just incomplete work (needs more implementation). This shim helps classify and route appropriately.

---

## Gap Classification

### Gap Types

| Type | Description | Route To |
|------|-------------|----------|
| **Missing Feature** | Code not written yet | GSD gap closure (`--gaps`) |
| **Broken Feature** | Code exists but wrong | Bug tracking |
| **Missing Wiring** | Components exist but not connected | GSD gap closure |
| **Broken Wiring** | Connection exists but fails | Bug tracking |
| **Missing Test** | Feature works but no test | GSD gap closure |
| **Failing Test** | Test exists but fails | Bug tracking |

### Classification Rules

When verifier finds a gap, classify:

```
IF artifact exists AND artifact has substantive code
  → Check if it works correctly
  → IF works: Gap is "wiring" issue (GSD closure)
  → IF broken: Gap is a BUG (create/link bug)

IF artifact missing OR artifact is stub
  → Gap is "missing" (GSD closure)

IF test fails
  → Analyze failure:
  → IF code is wrong: BUG
  → IF test is wrong: GSD closure (fix test)
  → IF both: BUG (code takes precedence)
```

---

## Process

### Step 1: Parse Verification Gaps

When verifier returns `gaps_found`, parse the gaps:

```markdown
## Gaps Found

### Gap 1: {title}
- **Must-have**: {which must_have failed}
- **Type**: {truth | artifact | key_link}
- **Details**: {what's missing or broken}
- **Evidence**: {what verifier checked}

### Gap 2: ...
```

### Step 2: Check for Existing Bugs

For each gap, check if a related bug already exists:

```bash
# Search bug files for related terms
RELATED_BUGS=$(grep -l "{gap keywords}" docs/bugs/BUG-*.md 2>/dev/null)
```

If related bug found:
- Link gap to existing bug
- Don't create duplicate

### Step 3: Classify Each Gap

For each gap, determine classification:

**Automatic classification (no user input needed):**

| Evidence | Classification |
|----------|----------------|
| File doesn't exist | Missing → GSD closure |
| File exists but < 10 lines | Stub → GSD closure |
| File exists, has code, test fails | Broken → BUG |
| File exists, not imported anywhere | Missing wiring → GSD closure |
| Import exists, runtime error | Broken wiring → BUG |

**Ambiguous cases (may need user input in non-autonomous mode):**

- Feature partially works
- Edge case fails
- Works in some contexts, not others

In autonomous mode: Default to GSD closure unless clear runtime error.

### Step 4: Create/Link Bugs for Broken Gaps

For gaps classified as BUG:

**Check if related bug exists:**

```bash
# Look for bug with same file or similar description
grep -l "{primary file}" docs/bugs/BUG-*.md 2>/dev/null
grep -l "{error message}" docs/bugs/BUG-*.md 2>/dev/null
```

**If existing bug found:**

Add link to VERIFICATION.md:

```markdown
### Gap 1: Auth token refresh fails

- **Must-have**: "Expired token triggers refresh attempt"
- **Classification**: BUG (existing)
- **Linked Bug**: BUG-003 (Auth token expiry not handled)
- **Action**: Fix via `/my:fix-bug BUG-003` or include in gap closure
```

**If no existing bug:**

Create new bug using execution-bug-creation shim format:

```markdown
# BUG-{NNN}: {Gap title}

**Status:** Open
**Severity:** {derive from gap impact}
**Created:** {date}
**Source:** GSD Verification (Phase {X})

## Description

{From gap details}

## Reproduction Steps

1. Complete Phase {X} execution
2. Run verification
3. {Specific must_have that fails}

## Expected Behavior

{From must_have truth statement}

## Actual Behavior

{From gap evidence}

## Acceptance Criteria

- [ ] {must_have restated as criterion}

## Fix Log

### Discovery - {date}
- **Context**: GSD verification of Phase {X}
- **Details**: Must-have verification failed: {must_have}
- **Evidence**: {what verifier found}

## Links

- **GSD Verification**: `.planning/phases/{phase-dir}/{phase}-VERIFICATION.md`
- **Related Gap**: Gap {N} in verification report
```

### Step 5: Update VERIFICATION.md

Add bug links to the verification report:

```markdown
## Verification Status: gaps_found

**Score:** 4/6 must-haves verified

### Must-Haves Verified
- [x] User can create account
- [x] User can log in
- [x] Session persists across refresh
- [x] Logout clears session

### Gaps Found

#### Gap 1: Token refresh not working
- **Must-have**: "Expired token triggers refresh"
- **Classification**: BUG
- **Bug**: BUG-003 (linked)
- **Route**: `/my:fix-bug BUG-003` or `/gsd:plan-phase {X} --gaps`

#### Gap 2: Error messages not styled
- **Must-have**: "Error messages use design system"
- **Classification**: Missing (incomplete styling)
- **Bug**: None (not a bug, just incomplete)
- **Route**: `/gsd:plan-phase {X} --gaps`

## Recommended Actions

1. **Fix bugs first**: BUG-003 (High severity)
2. **Then close gaps**: `/gsd:plan-phase {X} --gaps`
```

### Step 6: Update STATE.md

If new bugs were created, add to Open Bugs section:

```markdown
## Open Bugs

| Bug ID | Title | Source | Status | Linked To |
|--------|-------|--------|--------|-----------|
| BUG-003 | Token refresh not working | GSD Verify Phase 8 | Open | Phase 8 gap |
```

---

## Integration with gsd-verifier

Add to `gsd-verifier.md`:

```markdown
<gap_handling>

When gaps are found:

1. Parse each gap from must_haves verification
2. **Run verification-bug-linking shim:**
   - Classify gap (missing vs broken)
   - Check for existing related bugs
   - Create new bugs for "broken" gaps
   - Link bugs in VERIFICATION.md
3. Return structured gap report with bug links
4. Orchestrator routes based on result:
   - If bugs created → Mention bug IDs, suggest fix path
   - If gaps only → Suggest `/gsd:plan-phase --gaps`
   - If both → Recommend fixing bugs first, then gaps

</gap_handling>
```

---

## Gap Closure Behavior

When `/gsd:plan-phase {X} --gaps` is run:

**For gaps linked to bugs:**

The gap closure plan should reference the bug:

```markdown
## Task 1: Fix BUG-003 - Token refresh

**Linked Bug**: docs/bugs/BUG-003.md

<files>
src/lib/api.ts
src/components/AuthProvider.tsx
</files>

<action>
Implement token refresh logic per BUG-003 acceptance criteria.
See bug file for full context and reproduction steps.
</action>

<verify>
Run BUG-003 acceptance criteria:
- Expired token triggers refresh attempt
- If refresh fails, user sees "Session expired" message
</verify>

<done>
BUG-003 status changed to Fixed.
All acceptance criteria pass.
</done>
```

**After gap closure execution:**

If a task was linked to a bug and completes successfully:
1. Update bug file status to "Fixed"
2. Add resolution to Fix Log
3. Update STATE.md bug status

---

## Decision Matrix

```
                    ┌─────────────────────────────────────┐
                    │         VERIFICATION GAP            │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              Code exists?                    Code missing?
                    │                               │
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │ Does it work? │               │ GSD CLOSURE   │
            └───────────────┘               │ (missing)     │
                    │                       └───────────────┘
          ┌─────────┴─────────┐
          │                   │
        Works               Broken
          │                   │
          ▼                   ▼
    ┌───────────┐       ┌───────────┐
    │ Wiring    │       │ BUG       │
    │ issue?    │       │ (create/  │
    └───────────┘       │  link)    │
          │             └───────────┘
    ┌─────┴─────┐
    │           │
  Yes          No
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ GSD    │  │ ???    │
│CLOSURE │  │ edge   │
└────────┘  │ case   │
            └────────┘
                │
                ▼
         User decides:
         Bug or Gap?
```

---

## Example VERIFICATION.md with Bug Links

```markdown
# Phase 8 Verification Report

**Date:** 2026-01-19
**Status:** gaps_found
**Score:** 4/6 must-haves (67%)

## Summary

Phase 8 (Authentication) execution complete. Two gaps found:
- 1 bug (token refresh broken)
- 1 incomplete feature (error styling)

## Must-Haves Verification

### Truths

| # | Truth | Status | Notes |
|---|-------|--------|-------|
| 1 | User can create account with email/password | PASS | Tested via curl |
| 2 | User can log in and receives session | PASS | JWT returned |
| 3 | Invalid credentials show error | PASS | 401 + message |
| 4 | Expired token triggers refresh | FAIL | BUG-003 |
| 5 | Session persists across page refresh | PASS | LocalStorage |
| 6 | Error messages use design system | FAIL | Unstyled |

### Artifacts

| # | Artifact | Exists | Substantive | Wired |
|---|----------|--------|-------------|-------|
| 1 | src/app/api/auth/login/route.ts | YES | YES | YES |
| 2 | src/app/api/auth/register/route.ts | YES | YES | YES |
| 3 | src/lib/auth.ts | YES | YES | YES |
| 4 | src/components/AuthProvider.tsx | YES | YES | YES |

## Gaps

### Gap 1: Token refresh fails (BUG)

**Must-have:** "Expired token triggers refresh"
**Classification:** BUG - code exists but behavior is broken
**Evidence:** Token expiry causes silent 401, no refresh attempted
**Bug:** BUG-003 (created by this verification)

**Fix path:**
- `/my:fix-bug BUG-003` (direct fix)
- Or include in `/gsd:plan-phase 8 --gaps` (bundled fix)

### Gap 2: Error messages unstyled (INCOMPLETE)

**Must-have:** "Error messages use design system"
**Classification:** MISSING - styling not implemented
**Evidence:** Error div uses default browser styling
**Bug:** None (not broken, just incomplete)

**Fix path:**
- `/gsd:plan-phase 8 --gaps`

## Recommendations

1. **Fix BUG-003 first** - High severity, core auth flow
2. **Then run gap closure** - `/gsd:plan-phase 8 --gaps`
3. **Re-verify after fixes** - `/gsd:execute-phase 8` will re-run verification
```
