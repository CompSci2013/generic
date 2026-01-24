---
name: gsd:plan-phase
description: Create detailed execution plan for a phase (PLAN.md) with verification loop
argument-hint: "[phase] [--research] [--skip-research] [--gaps] [--skip-verify]"
agent: gsd-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---

<execution_context>
@~/.claude/get-stuff-done/references/ui-brand.md
</execution_context>

<objective>
Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.

**Default flow:** Research (if needed) → Plan → Verify → Done

**Orchestrator role:** Parse arguments, validate phase, research domain (unless skipped or exists), spawn gsd-planner agent, verify plans with gsd-plan-checker, iterate until plans pass or max iterations reached, present results.

**Why subagents:** Research and planning burn context fast. Verification uses fresh context. User sees the flow between agents in main context.
</objective>

<context>
Phase number: $ARGUMENTS (optional - auto-detects next unplanned phase if not provided)

**Flags:**
- `--research` — Force re-research even if RESEARCH.md exists
- `--skip-research` — Skip research entirely, go straight to planning
- `--gaps` — Gap closure mode (reads VERIFICATION.md, skips research)
- `--skip-verify` — Skip planner → checker verification loop

Normalize phase input in step 2 before any directory lookups.
</context>

<process>

## 1. Validate Environment

```bash
ls .planning/ 2>/dev/null
```

**If not found:** Error - user should run `/gsd:new-project` first.

## 2. Parse and Normalize Arguments

Extract from $ARGUMENTS:

- Phase number (integer or decimal like `2.1`)
- `--research` flag to force re-research
- `--skip-research` flag to skip research
- `--gaps` flag for gap closure mode
- `--skip-verify` flag to bypass verification loop

**If no phase number:** Detect next unplanned phase from roadmap.

**Normalize phase to zero-padded format:**

```bash
# Normalize phase number (8 → 08, but preserve decimals like 2.1 → 02.1)
if [[ "$PHASE" =~ ^[0-9]+$ ]]; then
  PHASE=$(printf "%02d" "$PHASE")
elif [[ "$PHASE" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  PHASE=$(printf "%02d.%s" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}")
fi
```

**Check for existing research and plans:**

```bash
ls .planning/phases/${PHASE}-*/*-RESEARCH.md 2>/dev/null
ls .planning/phases/${PHASE}-*/*-PLAN.md 2>/dev/null
```

## 3. Validate Phase

```bash
grep -A5 "Phase ${PHASE}:" .planning/ROADMAP.md 2>/dev/null
```

**If not found:** Error with available phases. **If found:** Extract phase number, name, description.

## 4. Ensure Phase Directory Exists

```bash
# PHASE is already normalized (08, 02.1, etc.) from step 2
PHASE_DIR=$(ls -d .planning/phases/${PHASE}-* 2>/dev/null | head -1)
if [ -z "$PHASE_DIR" ]; then
  # Create phase directory from roadmap name
  PHASE_NAME=$(grep "Phase ${PHASE}:" .planning/ROADMAP.md | sed 's/.*Phase [0-9]*: //' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  mkdir -p ".planning/phases/${PHASE}-${PHASE_NAME}"
  PHASE_DIR=".planning/phases/${PHASE}-${PHASE_NAME}"
fi
```

## 5. Handle Research

**If `--gaps` flag:** Skip research (gap closure uses VERIFICATION.md instead).

**If `--skip-research` flag:** Skip to step 6.

**Otherwise:**

Check for existing research:

```bash
ls "${PHASE_DIR}"/*-RESEARCH.md 2>/dev/null
```

**If RESEARCH.md exists AND `--research` flag NOT set:**
- Display: `Using existing research: ${PHASE_DIR}/${PHASE}-RESEARCH.md`
- Skip to step 6

**If RESEARCH.md missing OR `--research` flag set:**

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RESEARCHING PHASE {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning researcher...
```

Proceed to spawn researcher

### Spawn gsd-phase-researcher

Gather context for research prompt:

```bash
# Get phase description from roadmap
PHASE_DESC=$(grep -A3 "Phase ${PHASE}:" .planning/ROADMAP.md)

# Get requirements if they exist
REQUIREMENTS=$(cat .planning/REQUIREMENTS.md 2>/dev/null | grep -A100 "## Requirements" | head -50)

# Get prior decisions from STATE.md
DECISIONS=$(grep -A20 "### Decisions Made" .planning/STATE.md 2>/dev/null)

# Get phase context if exists
PHASE_CONTEXT=$(cat "${PHASE_DIR}/${PHASE}-CONTEXT.md" 2>/dev/null)
```

Fill research prompt and spawn:

```markdown
<objective>
Research how to implement Phase {phase_number}: {phase_name}

Answer: "What do I need to know to PLAN this phase well?"
</objective>

<context>
**Phase description:**
{phase_description}

**Requirements (if any):**
{requirements}

**Prior decisions:**
{decisions}

**Phase context (if any):**
{phase_context}
</context>

<output>
Write research findings to: {phase_dir}/{phase}-RESEARCH.md
</output>
```

```
Task(
  prompt=research_prompt,
  subagent_type="gsd-phase-researcher",
  description="Research Phase {phase}"
)
```

### Handle Researcher Return

**`## RESEARCH COMPLETE`:**
- Display: `Research complete. Proceeding to planning...`
- Continue to step 6

**`## RESEARCH BLOCKED`:**
- Log blocker information
- **AUTONOMOUS MODE:** Skip research and proceed to planning anyway (best effort)

## 6. Check Existing Plans

```bash
ls "${PHASE_DIR}"/*-PLAN.md 2>/dev/null
```

**If exists:** **AUTONOMOUS MODE:** Replan from scratch (delete existing and recreate).

## 7. Gather Context Paths

Identify context files for the planner agent:

```bash
# Required
STATE=.planning/STATE.md
ROADMAP=.planning/ROADMAP.md
REQUIREMENTS=.planning/REQUIREMENTS.md

# Optional (created by earlier steps or commands)
CONTEXT="${PHASE_DIR}/${PHASE}-CONTEXT.md"
RESEARCH="${PHASE_DIR}/${PHASE}-RESEARCH.md"
VERIFICATION="${PHASE_DIR}/${PHASE}-VERIFICATION.md"
UAT="${PHASE_DIR}/${PHASE}-UAT.md"
```

## 8. Spawn gsd-planner Agent

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PLANNING PHASE {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning planner...
```

Fill prompt and spawn:

```markdown
<planning_context>

**Phase:** {phase_number}
**Mode:** {standard | gap_closure}

**Project State:**
@.planning/STATE.md

**Roadmap:**
@.planning/ROADMAP.md

**Requirements (if exists):**
@.planning/REQUIREMENTS.md

**Phase Context (if exists):**
@.planning/phases/{phase_dir}/{phase}-CONTEXT.md

**Research (if exists):**
@.planning/phases/{phase_dir}/{phase}-RESEARCH.md

**Gap Closure (if --gaps mode):**
@.planning/phases/{phase_dir}/{phase}-VERIFICATION.md
@.planning/phases/{phase_dir}/{phase}-UAT.md

</planning_context>

<downstream_consumer>
Output consumed by /gsd:execute-phase
Plans must be executable prompts with:

- Frontmatter (wave, depends_on, files_modified, autonomous)
- Tasks in XML format
- Verification criteria
- must_haves for goal-backward verification
</downstream_consumer>

<quality_gate>
Before returning PLANNING COMPLETE:

- [ ] PLAN.md files created in phase directory
- [ ] Each plan has valid frontmatter
- [ ] Tasks are specific and actionable
- [ ] Dependencies correctly identified
- [ ] Waves assigned for parallel execution
- [ ] must_haves derived from phase goal
</quality_gate>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-planner",
  description="Plan Phase {phase}"
)
```

## 9. Handle Planner Return

Parse planner output:

**`## PLANNING COMPLETE`:**
- Display: `Planner created {N} plan(s). Files on disk.`
- If `--skip-verify`: Skip to step 13
- Otherwise: Proceed to step 10

**`## CHECKPOINT REACHED`:**
- Present to user, get response, spawn continuation (see step 12)

**`## PLANNING INCONCLUSIVE`:**
- Show what was attempted
- Offer: Add context, Retry, Manual
- Wait for user response

## 10. Spawn gsd-plan-checker Agent

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► VERIFYING PLANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning plan checker...
```

Fill checker prompt and spawn:

```markdown
<verification_context>

**Phase:** {phase_number}
**Phase Goal:** {goal from ROADMAP}

**Plans to verify:**
@.planning/phases/{phase_dir}/*-PLAN.md

**Requirements (if exists):**
@.planning/REQUIREMENTS.md

</verification_context>

<expected_output>
Return one of:
- ## VERIFICATION PASSED — all checks pass
- ## ISSUES FOUND — structured issue list
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  description="Verify Phase {phase} plans"
)
```

## 11. Handle Checker Return

**If `## VERIFICATION PASSED`:**
- Display: `Plans verified. Ready for execution.`
- Proceed to step 13

**If `## ISSUES FOUND`:**
- Display: `Checker found issues:`
- List issues from checker output
- Check iteration count
- Proceed to step 12

## 12. Revision Loop (Max 3 Iterations)

Track: `iteration_count` (starts at 1 after initial plan + check)

**If iteration_count < 3:**

Display: `Sending back to planner for revision... (iteration {N}/3)`

Spawn gsd-planner with revision prompt:

```markdown
<revision_context>

**Phase:** {phase_number}
**Mode:** revision

**Existing plans:**
@.planning/phases/{phase_dir}/*-PLAN.md

**Checker issues:**
{structured_issues_from_checker}

</revision_context>

<instructions>
Read existing PLAN.md files. Make targeted updates to address checker issues.
Do NOT replan from scratch unless issues are fundamental.
Return what changed.
</instructions>
```

```
Task(
  prompt=revision_prompt,
  subagent_type="gsd-planner",
  description="Revise Phase {phase} plans"
)
```

- After planner returns → spawn checker again (step 10)
- Increment iteration_count

**If iteration_count >= 3:**

Display: `Max iterations reached. {N} issues remain:`
- List remaining issues

**AUTONOMOUS MODE:** Force proceed with execution despite remaining issues. Log issues to STATE.md for reference.

## 13. Mirror Plans to Feature-Plans and PRDs

**Run the post-plan-mirror shim** to create mirrors consumable by Core PIV and Ralph.

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MIRRORING PLANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating feature-plans and PRDs for cross-methodology access...
```

**For each PLAN.md in the phase directory:**

### 13a. Create Feature-Plan Mirror

Transform GSD plan to feature-plan format:

1. Read `{PHASE_DIR}/{phase}-{NN}-PLAN.md`
2. Parse YAML frontmatter and XML tasks
3. Generate feature-plan markdown with:
   - Origin marker: `> **Origin:** GSD Phase {X}, Plan {NN}`
   - Feature description from `<objective>`
   - Implementation phases from tasks
   - Step-by-step tasks from `<task>` blocks
   - Acceptance criteria from `<must_haves>`

4. Write to `.agents/feature-plans/{phase}-{NN}-{slug}.md`

```bash
mkdir -p .agents/feature-plans
```

### 13b. Create PRD Mirror

Transform feature-plan to PRD format:

1. Read just-created feature-plan
2. For each task, create user story:
   - `id`: `US-{phase}{NN}-{task_num}`
   - `title`: Task title
   - `acceptanceCriteria`: Shell commands from `<verify>`
   - `priority`: Based on task order
   - `passes`: false
   - `origin`: `gsd-task-{N}`

3. Write to `.agents/prds/{phase}-{NN}-{slug}.json`

```bash
mkdir -p .agents/prds
```

### 13c. Update STATE.md

Add mirrored artifacts to STATE.md:

1. Read `.planning/STATE.md`
2. Find or create "## Cross-Methodology Status" section
3. Update "### Mirrored Artifacts" table:
   ```markdown
   | GSD Plan | Feature Plan | PRD | Status |
   |----------|--------------|-----|--------|
   | {phase}-{NN}-PLAN.md | .agents/feature-plans/{...}.md | .agents/prds/{...}.json | Mirrored |
   ```
4. Update "### Feature Plans" table (Origin: GSD)
5. Update "### Active PRDs" table (Origin: GSD)
6. Write updated STATE.md

### 13d. Report Mirrors

```
Mirrors created:
- Feature Plans: .agents/feature-plans/{phase}-*.md ({N} files)
- PRDs: .agents/prds/{phase}-*.json ({N} files)
```

## 14. Present Final Status

Route to `<offer_next>`.

</process>

<offer_next>
Output this markdown directly (not as a code block):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {X} PLANNED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {X}: {Name}** — {N} plan(s) in {M} wave(s)

| Wave | Plans | What it builds |
|------|-------|----------------|
| 1    | 01, 02 | [objectives] |
| 2    | 03     | [objective]  |

Research: {Completed | Used existing | Skipped}
Verification: {Passed | Passed with override | Skipped}
Mirrors: {N} feature-plans, {N} PRDs created

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Execute Phase {X}** — run all {N} plans

/gsd:execute-phase {X}

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Alternative execution paths:**
- GSD: `/gsd:execute-phase {X}` — wave-based parallel execution
- PIV: `/core_piv_loop:execute .agents/feature-plans/{phase}-01-*.md` — single plan
- Ralph: `ralph-loop .agents/prds/{phase}-01-*.json` — story-based execution

**Also available:**
- `cat .planning/phases/{phase-dir}/*-PLAN.md` — review GSD plans
- `cat .agents/feature-plans/{phase}-*.md` — review feature-plan mirrors
- `/gsd:plan-phase {X} --research` — re-research first

───────────────────────────────────────────────────────────────
</offer_next>

<success_criteria>
- [ ] .planning/ directory validated
- [ ] Phase validated against roadmap
- [ ] Phase directory created if needed
- [ ] Research completed (unless --skip-research or --gaps or exists)
- [ ] gsd-phase-researcher spawned if research needed
- [ ] Existing plans checked
- [ ] gsd-planner spawned with context (including RESEARCH.md if available)
- [ ] Plans created (PLANNING COMPLETE or CHECKPOINT handled)
- [ ] gsd-plan-checker spawned (unless --skip-verify)
- [ ] Verification passed OR user override OR max iterations with user decision
- [ ] **Mirrors created:** feature-plans and PRDs for each PLAN.md
- [ ] **STATE.md updated:** Mirrored Artifacts, Feature Plans, PRDs sections
- [ ] User sees status between agent spawns
- [ ] User knows next steps (GSD, PIV, or Ralph execution paths)
</success_criteria>
