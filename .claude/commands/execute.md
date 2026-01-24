# /execute - Autonomous Execution

Process a prd.json and implement all user stories autonomously without human intervention.

## Arguments

- `$ARGUMENTS` - Path to prd.json (e.g., `.agents/prds/feature-name.json`)

## Core Principles

### Context Degradation Awareness

Quality degrades as context fills:
- **0-30%:** Peak quality - thorough, comprehensive
- **30-50%:** Good quality - confident, solid
- **50-70%:** Degrading - efficiency mode begins
- **70%+:** Poor - rushed, minimal

**Solution:** Fresh sub-agent context per story. Orchestrator stays lean (<30%).

### Goal-Backward Verification

Not "did we finish tasks?" but "did we achieve the goal?"

Three-level verification:
1. **Truths** - Observable user behaviors that must be true
2. **Artifacts** - Files must exist AND be substantive (not stubs)
3. **Wiring** - Components must be connected to actually work

### Deviation Rules

During execution, auto-apply these rules:

| Rule | Trigger | Action | User Input? |
|------|---------|--------|-------------|
| **RULE 1: Bug Fix** | Code doesn't work as intended | Fix immediately, document | No |
| **RULE 2: Critical Gap** | Security/correctness gap discovered | Add and document | No |
| **RULE 3: Blocker Fix** | Can't proceed without fixing | Fix immediately, document | No |
| **RULE 4: Architecture** | Major structural decision needed | Stop and ask | **Yes** |

Only Rule 4 requires user intervention.

---

## Process

### Step 1: Load and Validate PRD

```
1. Read the prd.json file
2. Validate against schema
3. Load or create state (STATE.md)
4. Check for pending checkpoint - if exists, present to user first
5. Check for pending stories (passes: false)
6. If no pending stories, run goal-backward verification and exit
```

### Step 2: Wave-Based Execution

Stories are grouped into waves based on dependencies:
- **Wave 1:** All stories with no dependencies (run in parallel)
- **Wave 2:** Stories depending only on Wave 1 (run in parallel after Wave 1)
- **Wave N:** Stories depending on Wave N-1

```
for wave in 1..total_waves:
    stories_in_wave = get_stories_by_wave(wave)

    # Execute all stories in wave in parallel
    results = parallel_execute(stories_in_wave)

    # Process results
    for story, result in results:
        if result.success:
            mark_complete(story)
        elif result.checkpoint:
            save_checkpoint(story, result.checkpoint)
            pause_execution()
        else:
            handle_failure(story, result)

    save_prd()
    update_state()
```

### Step 3: Story Execution (Sub-Agent)

For each story, spawn a fresh sub-agent:

```
Task(
    prompt: build_story_prompt(story),
    subagent_type: "general-purpose",
    description: "Execute {story.id}: {story.title}"
)
```

**Story Prompt Structure:**

```markdown
## Task: {story.title}

### Story ID: {story.id}
### Context Budget: {story.contextBudget} (target <50% context usage)

### Files to Modify/Create:
{story.files}

### Acceptance Criteria:
When complete, these commands must exit 0:
{story.acceptanceCriteria}

### Implementation Notes:
{story.notes}

### Current Code State:
{Inject contents of story.files and story.contextFiles}

### Deviation Rules (AUTO-APPLY):
- RULE 1: If you find a bug, fix it immediately and document
- RULE 2: If you find a security/correctness gap, fill it and document
- RULE 3: If you hit a blocker, fix it and document
- RULE 4: If you need an architectural decision, STOP and report

### Checkpoint (if defined):
{story.checkpoint}

### Instructions:
1. Implement the changes described above
2. Apply deviation rules as needed (Rules 1-3 auto, Rule 4 stop)
3. Create atomic git commit: `{type}({story.id}): {description}`
4. Run acceptance criteria to verify
5. If checkpoint defined, pause and report status
6. Report: COMPLETE, FAILED, CHECKPOINT, or BLOCKED
```

### Step 4: Handle Results

**On Success:**
```
1. Set story.passes = true
2. Record commit hash in story.commits
3. Record any deviations applied
4. Update state and save prd.json
5. Log: "[PASS] {story.id}: {story.title}"
6. Continue to next story/wave
```

**On Checkpoint:**
```
1. Save checkpoint to prd.state.checkpoint
2. Update STATE.md with checkpoint details
3. Log: "[CHECKPOINT] {story.id}: {checkpoint.prompt}"
4. Pause execution
5. Present checkpoint to user
6. Wait for user response before continuing
```

**On Failure (retryable):**
```
1. Increment story.retryCount
2. Set story.lastError = error_message
3. If retryCount < MAX_RETRIES:
   - Log: "[RETRY] {story.id}: attempt {count}/{max}"
   - Re-execute with error context included
4. Else: treat as non-retryable failure
```

**On Failure (non-retryable):**
```
1. Set story.lastError = error_message
2. Add to state.blockers
3. Log: "[FAILED] {story.id}: {error}"
4. STOP execution (don't compound errors)
```

**On Architecture Decision (Rule 4):**
```
1. Create decision checkpoint
2. Present options to user
3. Wait for user choice
4. Continue with chosen direction
```

### Step 5: Goal-Backward Verification

After all stories pass, verify the goal was achieved:

```
1. Load prd.verification criteria

2. Verify Truths:
   for truth in verification.truths:
       if truth.verifyCommand:
           run_command(truth.verifyCommand)
       else:
           log_for_manual_verification(truth.description)

3. Verify Artifacts:
   for artifact in verification.artifacts:
       # File exists
       assert file_exists(artifact.file)

       # File is substantive (not stub)
       for pattern in artifact.mustContain:
           assert grep(pattern, artifact.file)

       # File has no placeholder patterns
       for pattern in artifact.mustNotContain:
           assert not grep(pattern, artifact.file)

4. Verify Wiring:
   for wire in verification.wiring:
       if wire.verifyCommand:
           run_command(wire.verifyCommand)
       else:
           # Check import/reference exists
           assert grep(wire.to, wire.from)

5. If all pass:
   - Log: "[VERIFIED] Goal achieved"
   - Create summary commit
   - Update state to complete

6. If any fail:
   - Log: "[VERIFICATION FAILED] {details}"
   - Create fix plan for gaps
   - Present to user
```

### Step 6: Completion

When all stories pass and verification succeeds:

```
1. Run final integration validation
2. Create summary git commit:
   "feat({prd.name}): complete implementation"
3. Generate execution summary
4. Update STATE.md to complete
5. Report success with statistics
```

---

## Checkpoint Protocols

### Type: human-verify (90% of checkpoints)

Used when: Claude automated work, user confirms it works

```markdown
## Checkpoint: Human Verification Required

**Story:** {story.id} - {story.title}

**What was built:**
{description of completed work}

**How to verify:**
{steps user should take to confirm}

**Resume signal:**
Reply "continue" to proceed, or describe any issues found.
```

### Type: decision (9% of checkpoints)

Used when: User must choose implementation direction

```markdown
## Checkpoint: Decision Required

**Story:** {story.id} - {story.title}

**Decision needed:**
{what needs to be decided}

**Options:**
1. {option 1} - {pros/cons}
2. {option 2} - {pros/cons}
3. {option 3} - {pros/cons}

**Recommendation:** {if applicable}

Reply with your choice (1, 2, or 3) or describe an alternative.
```

---

## State Management

### STATE.md Updates

After each story:
```markdown
# Execution State

**PRD:** .agents/prds/feature.json
**Last Updated:** {timestamp}

## Current Position
- Phase: executing
- Wave: 2 of 4
- Story: US-005 (in progress)
- Progress: 4/12 stories

## Recent Activity
| Time | Story | Action | Result |
|------|-------|--------|--------|
| 10:15 | US-004 | Execute | PASS |
| 10:12 | US-003 | Execute | PASS |

## Velocity
- Stories/Hour: 4.2
- Avg Retries: 0.3
```

### prd.json State Updates

```json
{
  "state": {
    "phase": "executing",
    "currentWave": 2,
    "currentStory": "US-005",
    "lastActivity": "2026-01-17T10:15:00Z",
    "velocity": {
      "storiesPerHour": 4.2,
      "avgRetries": 0.3
    }
  }
}
```

---

## Parallel Execution

### Wave Assignment (done during /atomize)

```
Wave 1: Stories with no dependencies
Wave 2: Stories depending only on Wave 1 stories
Wave 3: Stories depending on Wave 1 or 2 stories
...
```

### Parallel Spawn Pattern

```
# For each wave, spawn all stories in parallel
tasks = []
for story in wave_stories:
    task = Task(
        prompt: build_story_prompt(story),
        subagent_type: "general-purpose",
        run_in_background: true
    )
    tasks.append(task)

# Wait for all to complete
results = wait_all(tasks)
```

---

## Error Recovery

### Syntax Errors
1. Include error message in retry prompt
2. Include problematic code
3. Ask agent to fix syntax

### Test Failures
1. Include command output
2. Include expected vs actual
3. Ask agent to adjust implementation

### Missing Dependencies
1. Log dependency issue
2. Mark story blocked
3. Stop (dependency ordering was wrong in /atomize)

### Context Overflow
1. Story too large for context budget
2. Mark story as needs-splitting
3. Stop and report to user

---

## Output

### During Execution
```
Executing: .agents/prds/feature.json
Wave 1/4: 3 stories (parallel)

[PASS] US-001: Create configuration file
[PASS] US-002: Add base types
[PASS] US-003: Create utility functions

Wave 2/4: 2 stories (parallel)

[PASS] US-004: Implement core service
[....] US-005: Add validation logic (executing)
```

### On Checkpoint
```
[CHECKPOINT] US-006: Visual component complete

What was built:
- Created UserCard component with avatar, name, and status

How to verify:
1. Run `npm start`
2. Navigate to /users
3. Confirm user cards display correctly

Reply "continue" to proceed, or describe issues.
```

### On Completion
```
Execution complete: .agents/prds/feature.json

Results:
  Passed: 12/12
  Waves: 4
  Deviations: 2 (1 bug-fix, 1 blocker-fix)

Goal Verification:
  Truths: 3/3 verified
  Artifacts: 5/5 substantive
  Wiring: 4/4 connected

[VERIFIED] Goal achieved: User authentication system complete

Commits:
  abc123 feat(US-001): create auth configuration
  def456 feat(US-002): add user types
  ...

Total time: 28 minutes
Velocity: 4.3 stories/hour
```

### On Failure
```
Execution stopped: .agents/prds/feature.json

Results:
  Passed: 7/12
  Failed: 1 (US-008)
  Remaining: 4

Error in US-008: Add form validation
  Rule 4 triggered: Architecture decision needed

  Decision: Should validation run client-side, server-side, or both?

  Options:
  1. Client-only (faster UX, less secure)
  2. Server-only (secure, slower UX)
  3. Both (best security, more code)

To continue, respond with your choice and run:
  /execute .agents/prds/feature.json
```

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| MAX_RETRIES | 3 | Max attempts per story |
| CONTEXT_TARGET | 50% | Target context usage per story |
| PARALLEL_LIMIT | 4 | Max parallel sub-agents |

---

## Safety Checks

### Before Execution
- Verify working directory exists
- Check file permissions
- Validate PRD schema
- Check for unresolved checkpoints

### During Execution
- Monitor context usage per story
- Enforce deviation rules
- Validate commits created
- Check acceptance criteria

### After Execution
- Run goal-backward verification
- Check for stub implementations
- Verify component wiring
- Generate execution summary
