# Unified Development Session

Initialize a development session with full cross-methodology awareness.

## Directive

Read and synthesize context from ALL methodologies:

### 1. Core Project Context

Read in order:
1. `README.md` - Project overview
2. `.planning/PROJECT.md` - Project vision and goals
3. `.planning/STATE.md` - Current state and progress
4. `.planning/ROADMAP.md` - Phase breakdown and milestones

### 2. Cross-Methodology Status

**GSD Status:**
```bash
# Current phase progress
ls .planning/phases/ 2>/dev/null | tail -5
# Count plans vs summaries in current phase
CURRENT_PHASE=$(grep -oP 'Phase \K\d+' .planning/STATE.md 2>/dev/null | head -1)
if [ -n "$CURRENT_PHASE" ]; then
  PHASE_DIR=$(ls -d .planning/phases/${CURRENT_PHASE}-* 2>/dev/null | head -1)
  PLANS=$(ls ${PHASE_DIR}/*-PLAN.md 2>/dev/null | wc -l)
  SUMMARIES=$(ls ${PHASE_DIR}/*-SUMMARY.md 2>/dev/null | wc -l)
  echo "Phase $CURRENT_PHASE: $SUMMARIES/$PLANS plans complete"
fi
```

**Feature Plans Status:**
```bash
# Count feature plans by origin
mkdir -p .agents/feature-plans
TOTAL_PLANS=$(ls .agents/feature-plans/*.md 2>/dev/null | wc -l)
GSD_PLANS=$(grep -l "Origin.*GSD" .agents/feature-plans/*.md 2>/dev/null | wc -l)
NATIVE_PLANS=$(( TOTAL_PLANS - GSD_PLANS ))
echo "Feature plans: $TOTAL_PLANS total ($GSD_PLANS from GSD, $NATIVE_PLANS native)"
```

**PRD Status:**
```bash
# Count PRDs and completion status
mkdir -p .agents/prds
for prd in .agents/prds/*.json; do
  [ -f "$prd" ] || continue
  NAME=$(basename "$prd" .json)
  TOTAL=$(grep -c '"id":' "$prd" 2>/dev/null || echo 0)
  PASSING=$(grep -c '"passes": true' "$prd" 2>/dev/null || echo 0)
  echo "$NAME: $PASSING/$TOTAL stories passing"
done
```

**Bug Status:**
```bash
# Count bugs by status
mkdir -p docs/bugs
OPEN=$(grep -l "Status.*Open" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
IN_PROGRESS=$(grep -l "Status.*In Progress" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
FIXED=$(grep -l "Status.*Fixed" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
echo "Bugs: $OPEN open, $IN_PROGRESS in progress, $FIXED fixed"
```

---

## After Reading

Provide a **unified status report** with blank lines between sections:

### 1. Project Summary

**{Project Name}**

{Brief description from PROJECT.md}

### 2. Unified Progress

```
GSD Progress:    [████████░░] Phase 8/10
Feature Plans:   3 total (2 from GSD, 1 native)
PRDs:            2 active (auth: 5/8, recovery: 0/12)
Bugs:            1 open, 0 in progress
```

### 3. Current State by Methodology

**GSD:**
- Phase {N}: {name} - {status}
- Next plan: {phase}-{plan} or "phase complete"

**Feature Plans:**
| Plan | Origin | Status |
|------|--------|--------|
| {name} | GSD/Native | {ready/in-progress} |

**PRDs:**
| PRD | Stories | Passing | Ready for |
|-----|---------|---------|-----------|
| {name} | {total} | {passing} | Ralph/Manual |

**Bugs:**
| Bug ID | Title | Status | Source |
|--------|-------|--------|--------|
| BUG-{N} | {title} | Open | {source} |

### 4. Recommended Actions

Based on current state, suggest next actions in priority order:

```
## Recommended Next Steps

1. **[HIGH]** Fix open bugs first
   → /my:fix-bug BUG-003

2. **[MEDIUM]** Continue GSD execution
   → /gsd:execute-phase 8

3. **[LOW]** Execute feature plans
   → /core_piv_loop:execute .agents/feature-plans/recovery.md
   → ralph-loop .agents/prds/recovery.json
```

### 5. Quick Start

```bash
cd {project-dir} && {appropriate start command}
```

### 6. Available Paths

Present all viable continuation paths:

```
───────────────────────────────────────────────────────────────

## Continue With...

**GSD (Phase-based development):**
- /gsd:progress — Check GSD status and routing
- /gsd:execute-phase 8 — Execute current phase
- /gsd:plan-phase 9 — Plan next phase

**Core PIV (Feature-based development):**
- /core_piv_loop:define-feature — Define new feature
- /core_piv_loop:plan-feature {name} — Plan a feature
- /core_piv_loop:execute {plan} — Execute a feature plan

**Bug Fixing:**
- /my:list-bugs — See all bugs
- /my:fix-bug BUG-003 — Fix specific bug
- /my:new-bug — Report new bug

**Ralph Execution:**
- ralph-loop .agents/prds/{name}.json — Execute PRD

**Validation:**
- /validation:validate — Health check
- /validation:code-review — Review before commit

**Session:**
- /my:wrap — End session (update state + commit)

───────────────────────────────────────────────────────────────
```

### 7. Question

"What would you like to work on?"

---

## Routing Logic

Based on state, emphasize the most relevant path:

| State | Primary Suggestion |
|-------|-------------------|
| Open bugs exist (High severity) | `/my:fix-bug` first |
| GSD phase has unexecuted plans | `/gsd:execute-phase` |
| GSD phase complete, next not planned | `/gsd:plan-phase` |
| Feature plans ready, no GSD work | `/core_piv_loop:execute` |
| PRDs have incomplete stories | `ralph-loop` or `/core_piv_loop:execute` |
| All work complete | `/gsd:audit-milestone` or `/my:wrap` |

---

## State Synchronization

If STATE.md is missing sections that should exist, offer to add them:

```
STATE.md is missing unified tracking sections. Add them?
- Open Bugs section
- Feature Plans section
- Active PRDs section

This enables cross-methodology awareness.
```

If user agrees, add the sections per the STATE.md template.

---

## Session Notes

- Use `/my:wrap` when ending the session to update state and commit
- Use `/validation:validate` before committing to catch issues
- Use `/gsd:progress` for GSD-specific routing
- Bugs discovered during any work should use `/my:new-bug`
- STATE.md is the single source of truth for cross-methodology state
