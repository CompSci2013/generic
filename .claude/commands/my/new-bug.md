---
description: Create a new bug report through interactive dialog
---

# New Bug Report

## Objective

Gather bug information through dialog with the user and create a structured bug report file.

## Step 1: Generate Bug ID

Check existing bugs to determine next ID:
```bash
ls docs/bugs/BUG-*.md 2>/dev/null | sort -V | tail -1
```

If no bugs exist, start with BUG-001. Otherwise increment from the highest number.

## Step 2: Gather Information

Ask the user the following questions ONE AT A TIME. Wait for their response before asking the next question.

### Question 1: Title
> What's a short title for this bug? (e.g., "Model claims to be Claude")

### Question 2: Description
> Describe what's happening. What did you observe?

### Question 3: Reproduction Steps
> How can we reproduce this bug? List the steps:
> 1. ...
> 2. ...
> 3. ...

### Question 4: Expected Behavior
> What should happen instead?

### Question 5: Acceptance Criteria
> How will we know this bug is fixed? List specific criteria:
> - [ ] Criterion 1
> - [ ] Criterion 2

### Question 6: Additional Context (Optional)
> Any screenshots, error messages, or other context? (Type "none" to skip)

## Step 3: Create Bug File

Save to `docs/bugs/BUG-{ID}.md` with this format:

```markdown
# BUG-{ID}: {Title}

**Status:** Open
**Created:** {YYYY-MM-DD}
**Priority:** Medium

## Description

{User's description}

## Reproduction Steps

1. {Step 1}
2. {Step 2}
3. {Step 3}

## Expected Behavior

{What should happen}

## Actual Behavior

{What actually happens - from description}

## Acceptance Criteria

- [ ] {Criterion 1}
- [ ] {Criterion 2}

## Additional Context

{Screenshots, error messages, or "None"}

---

## Fix Log

_This section is updated by `/fix-bug BUG-{ID}` as work progresses._
```

## Step 4: Confirm Creation

After creating the file, tell the user:

```
Created: docs/bugs/BUG-{ID}.md

To fix this bug, run:
  /fix-bug BUG-{ID}

To view all bugs:
  ls docs/bugs/
```

## Notes

- Always ask questions one at a time
- Accept brief answers - don't require excessive detail
- If user provides a screenshot, describe what you see in the description
- Generate sensible defaults if user says "not sure" or similar
