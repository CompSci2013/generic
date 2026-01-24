---
name: gsd:run-all
description: Execute entire project autonomously from current state to completion
argument-hint: "[--from-phase N]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
---

<objective>
**AUTONOMOUS FULL PROJECT EXECUTION**

Run through all remaining phases from planning to execution without user interaction.
This is the ultimate "just go" command - Claude runs until the project is complete or hits an unrecoverable error.

Expected runtime: Hours. User does NOT need to be present.
</objective>

<execution_context>
@~/.claude/get-stuff-done/references/ui-brand.md
</execution_context>

<context>
Starting from: $ARGUMENTS (default: first incomplete phase)

@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/config.json
</context>

<process>

## 1. Load Project State

```bash
cat .planning/STATE.md
cat .planning/ROADMAP.md
```

Identify:
- Total phases in milestone
- Completed phases
- First incomplete phase (or use --from-phase argument)

## 2. Verify Autonomous Mode

```bash
cat .planning/config.json | grep '"mode"'
```

**If not "autonomous":** Display warning but proceed anyway.

## 3. Display Execution Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTONOMOUS FULL EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting: Phase {N}
Ending: Phase {M}
Total phases to execute: {count}

Mode: AUTONOMOUS (no user interaction required)

◆ Beginning execution...
```

## 4. Phase Loop

For each incomplete phase (N to M):

### 4a. Plan Phase
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE {N}: {Name} — PLANNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Check if plans exist:
```bash
ls .planning/phases/${N}-*/*-PLAN.md 2>/dev/null | wc -l
```

**If no plans:** Spawn planner
```
Task(
  prompt="Plan phase {N} autonomously. Skip research if blocked. Auto-decide all choices. Create executable plans.

  @.planning/ROADMAP.md
  @.planning/STATE.md
  @.planning/REQUIREMENTS.md",
  subagent_type="gsd-planner",
  description="Plan Phase {N}"
)
```

**If plans exist:** Skip to execution

### 4b. Execute Phase
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE {N}: {Name} — EXECUTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Spawn executor for each plan in parallel waves (as per execute-phase workflow).

All checkpoints auto-approved. All failures logged but execution continues.

### 4c. Verify Phase (Lightweight)

Spawn verifier but auto-proceed regardless of result:
```
Task(
  prompt="Verify phase {N} goal. Log gaps but return immediately - do not wait for human.",
  subagent_type="gsd-verifier",
  description="Verify Phase {N}"
)
```

**Gaps found:** Log to STATE.md, continue to next phase.
**Passed:** Continue to next phase.

### 4d. Update State

Update ROADMAP.md and STATE.md with phase completion (even if gaps exist).

### 4e. Continue Loop

Proceed to Phase {N+1}.

## 5. Milestone Summary

After all phases complete:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTONOMOUS EXECUTION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases executed: {N}
Time elapsed: {duration}

### Phase Status

| Phase | Name | Status | Gaps |
|-------|------|--------|------|
| 1 | Foundation | ✓ Complete | 0 |
| 2 | Visual System | ✓ Complete | 2 (deferred) |
...

### Deferred Items

{List all deferred checkpoints, auth gates, human verifications}

### Auto-Decisions Made

{List significant architectural decisions made autonomously}

### Next Steps

1. Review deferred items in STATE.md
2. Run /gsd:verify-work for manual acceptance testing
3. Run /gsd:audit-milestone before release
```

</process>

<error_handling>
**Unrecoverable errors:**
- Git corruption
- File system errors
- Missing critical project files

**Recoverable errors (auto-continue):**
- Build failures (log and continue)
- Test failures (log and continue)
- Missing dependencies (attempt install, log if fails)
- Verification gaps (log and continue)

**On unrecoverable error:**
1. Log error details to STATE.md
2. Commit current state
3. Display error and stop
4. User can resume with `/gsd:run-all --from-phase {N}`
</error_handling>

<success_criteria>
- [ ] All phases from start to end processed
- [ ] Each phase planned (if not already)
- [ ] Each phase executed
- [ ] Each phase verified (gaps logged)
- [ ] STATE.md tracks all progress
- [ ] ROADMAP.md updated
- [ ] All decisions logged for review
- [ ] Summary displayed at completion
</success_criteria>
