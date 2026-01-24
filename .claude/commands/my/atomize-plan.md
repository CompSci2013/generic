---
description: "Convert feature plan to Ralph-compatible prd.json with atomic user stories"
---

# Atomize Plan: $ARGUMENTS

## Mission

Transform a feature plan from `.agents/feature-plans/<name>.md` into a **Ralph-compatible prd.json** with atomic, testable user stories.

**Core Principle**: Ralph succeeds when each story does ONE thing with ONE clear test. We break down architectural plans into executable micro-tasks.

**Input**: Feature plan at `.agents/feature-plans/<plan-name>.md`
**Output**: `prd.json` at `.agents/prds/<plan-name>.json`

## Process

### Phase 1: Load the Plan

1. Read the specified plan file from `.agents/feature-plans/`
2. Extract:
   - Feature name and description
   - Step-by-step tasks
   - Validation commands
   - Acceptance criteria
   - Affected files

### Phase 2: Identify Atomic Units

For each task in the plan, determine if it's atomic:

| Factor | Atomic | Needs Splitting |
|--------|--------|-----------------|
| Files touched | 1-2 | 3+ |
| Acceptance criteria | 1-3 | 4+ |
| Title contains "and" | No | Yes |
| Can verify with 1 command | Yes | No |
| Estimated time | 5-15 min | 30+ min |

### Phase 3: Create Testable Acceptance Criteria

**For JavaScript (chat.js):**
```json
{
  "acceptanceCriteria": [
    "grep -q 'reconnectionTimer' mlx-code-app/chat.js",
    "node --check mlx-code-app/chat.js 2>&1 | grep -v 'SyntaxError'",
    "cd mlx-code-app && npm test -- --grep 'reconnection'"
  ]
}
```

**For Python (server.py):**
```json
{
  "acceptanceCriteria": [
    "grep -q 'max_retries' mlx-code-app/server.py",
    "python3 -m py_compile mlx-code-app/server.py",
    "cd mlx-code-app && python3 -c 'from server import ...; ...'"
  ]
}
```

**For CSS (styles.css):**
```json
{
  "acceptanceCriteria": [
    "grep -q '.status-indicator.reconnecting' mlx-code-app/styles.css"
  ]
}
```

**Playwright Tests (preferred for UI):**
```json
{
  "acceptanceCriteria": [
    "cd mlx-code-app && npm test -- tests/reconnection.spec.js"
  ]
}
```

### Phase 4: Structure User Stories

**Story Format:**
```json
{
  "id": "US-001",
  "title": "Add reconnection state variables",
  "acceptanceCriteria": [
    "grep -q 'this.reconnectionTimer = null' mlx-code-app/chat.js",
    "grep -q 'this.reconnectionAttempt = 0' mlx-code-app/chat.js",
    "node --check mlx-code-app/chat.js"
  ],
  "priority": 1,
  "passes": false,
  "notes": "Add to MimirChat constructor after line 27. Follow existing state pattern.",
  "file": "mlx-code-app/chat.js",
  "lines": "27-33"
}
```

**Story Ordering Rules:**
1. Setup/infrastructure first (priority 1-5)
2. Core logic next (priority 6-15)
3. UI/integration last (priority 16-25)
4. Tests/validation final (priority 26+)

### Phase 5: Generate prd.json

**Structure:**
```json
{
  "featureName": "<feature-name>",
  "planSource": ".agents/feature-plans/<plan-name>.md",
  "version": 1,
  "testCommand": "cd mlx-code-app && npm test",
  "userStories": [
    // Stories ordered by priority
  ]
}
```

### Phase 6: Create Test Scaffold (Optional)

If the plan involves UI changes, create a Playwright test file:

**File**: `mlx-code-app/tests/<feature-name>.spec.js`

```javascript
const { test, expect } = require('@playwright/test');
const { waitForChatReady, captureScreenshot } = require('./utils/test-helpers');

test.describe('<Feature Name>', () => {
  // Tests for each user story that needs UI verification
});
```

## Output

1. **Create directory** `.agents/prds/` if it doesn't exist
2. **Write prd.json** to `.agents/prds/<plan-name>.json`
3. **Optionally create** test scaffold at `mlx-code-app/tests/<feature>.spec.js`
4. **Provide summary** with Ralph execution command

## Quality Checklist

Before finishing, verify:

- [ ] Every story has 1-3 acceptance criteria
- [ ] Every criterion is a shell command that exits 0 on success
- [ ] Stories are ordered by dependency
- [ ] No story title contains "and" connecting two tasks
- [ ] Each story touches 1-2 files maximum
- [ ] Notes field has context from original plan
- [ ] File and line references included where helpful

## Example Atomization

### Input (from plan)

```markdown
### 2. IMPLEMENT startReconnectionLoop() - chat.js

- **IMPLEMENT**: Add new method after `checkMimirConnection()` (after line 282)
- **PATTERN**: Follow existing async method patterns
- **VALIDATE**: Trigger by stopping Mimir server, verify reconnection attempts in console
```

### Output (in prd.json)

```json
[
  {
    "id": "US-002",
    "title": "Add startReconnectionLoop method",
    "acceptanceCriteria": [
      "grep -q 'startReconnectionLoop()' mlx-code-app/chat.js",
      "grep -q 'this.reconnectionTimer' mlx-code-app/chat.js",
      "node --check mlx-code-app/chat.js"
    ],
    "priority": 2,
    "passes": false,
    "notes": "Add after checkMimirConnection() around line 282. Implement exponential backoff with scheduleReconnectionAttempt().",
    "file": "mlx-code-app/chat.js",
    "lines": "282-310"
  },
  {
    "id": "US-003",
    "title": "Add scheduleReconnectionAttempt method",
    "acceptanceCriteria": [
      "grep -q 'scheduleReconnectionAttempt()' mlx-code-app/chat.js",
      "grep -q 'Math.pow(2,' mlx-code-app/chat.js",
      "node --check mlx-code-app/chat.js"
    ],
    "priority": 3,
    "passes": false,
    "notes": "Exponential backoff: delay = baseDelay * 2^attempt. Max 10 attempts.",
    "file": "mlx-code-app/chat.js",
    "lines": "310-340"
  },
  {
    "id": "US-004",
    "title": "Add stopReconnectionLoop method",
    "acceptanceCriteria": [
      "grep -q 'stopReconnectionLoop()' mlx-code-app/chat.js",
      "grep -q 'clearTimeout(this.reconnectionTimer)' mlx-code-app/chat.js",
      "node --check mlx-code-app/chat.js"
    ],
    "priority": 4,
    "passes": false,
    "notes": "Clear timer and reset attempt counter.",
    "file": "mlx-code-app/chat.js",
    "lines": "340-350"
  }
]
```

## Summary Output Format

```
Atomized: connection-failure-recovery

Plan: .agents/feature-plans/connection-failure-recovery.md
PRD:  .agents/prds/connection-failure-recovery.json

Stories: 15 user stories
- US-001 to US-004: Reconnection state and methods (chat.js)
- US-005 to US-008: Stream failure handling (chat.js)
- US-009 to US-011: Thor retry logic (server.py)
- US-012 to US-013: UI status indicator (styles.css)
- US-014 to US-015: Playwright tests

Test command: cd mlx-code-app && npm test

To run Ralph:
  /ralph-loop "Execute .agents/prds/connection-failure-recovery.json. For each story: implement, run acceptance criteria commands, mark passes:true when all pass. Output <promise>COMPLETE</promise> when all stories pass." --max-iterations 20 --completion-promise "COMPLETE"
```

## Atomicity Patterns for MLX Code

### Pattern: "Add method X that does A and B"
Split into:
1. Add method X skeleton
2. Implement A in method X
3. Implement B in method X

### Pattern: "Modify existing function"
Split into:
1. Add new helper/variable (if needed)
2. Integrate helper into function
3. Update callers (if needed)

### Pattern: "Add error handling"
Split into:
1. Add try/catch structure
2. Add error message/logging
3. Add recovery/retry logic

### Pattern: "Add UI element"
Split into:
1. Add CSS styles
2. Add HTML/DOM element
3. Add JavaScript handler
4. Add Playwright test
