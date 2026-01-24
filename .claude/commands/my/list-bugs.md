---
description: List all bugs with status and filtering
argument-hint: "[--open] [--fixed] [--all]"
---

# List Bugs

List all bugs from `docs/bugs/` with status information.

## Parse Arguments

Extract from $ARGUMENTS:
- `--open` — Show only open/in-progress bugs (default)
- `--fixed` — Show only fixed bugs
- `--all` — Show all bugs regardless of status

Default behavior (no flags): Show open and in-progress bugs.

## Process

### 1. Ensure Bug Directory Exists

```bash
if [ ! -d "docs/bugs" ]; then
  echo "No bugs directory found. No bugs have been reported yet."
  echo ""
  echo "To report a bug: /my:new-bug"
  exit 0
fi
```

### 2. Count Bugs by Status

```bash
OPEN=$(grep -l "Status.*Open" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
IN_PROGRESS=$(grep -l "Status.*In Progress" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
FIXED=$(grep -l "Status.*Fixed" docs/bugs/BUG-*.md 2>/dev/null | wc -l)
TOTAL=$((OPEN + IN_PROGRESS + FIXED))
```

### 3. Parse Bug Files

For each bug file matching the filter:

```bash
for bug in docs/bugs/BUG-*.md; do
  [ -f "$bug" ] || continue

  BUG_ID=$(basename "$bug" .md)
  TITLE=$(head -1 "$bug" | sed 's/# //' | sed "s/$BUG_ID: //")
  STATUS=$(grep -oP "Status:\*\* \K[A-Za-z ]+" "$bug" | head -1)
  SEVERITY=$(grep -oP "Severity:\*\* \K[A-Za-z]+" "$bug" | head -1)
  SOURCE=$(grep -oP "Source:\*\* \K[^\n]+" "$bug" | head -1)
  CREATED=$(grep -oP "Created:\*\* \K[0-9-]+" "$bug" | head -1)

  echo "$BUG_ID|$TITLE|$STATUS|$SEVERITY|$SOURCE|$CREATED"
done
```

### 4. Display Results

**Header:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BUG TRACKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: {OPEN} open, {IN_PROGRESS} in progress, {FIXED} fixed ({TOTAL} total)
```

**Bug Table (for --open or default):**

```markdown
## Open Bugs

| Bug ID | Title | Severity | Source | Created |
|--------|-------|----------|--------|---------|
| BUG-003 | Auth token not refreshing | High | GSD Execution | 2026-01-15 |
| BUG-005 | Form validation error | Medium | Manual | 2026-01-18 |

## In Progress

| Bug ID | Title | Severity | Source | Created |
|--------|-------|----------|--------|---------|
| BUG-004 | Session timeout issue | High | GSD Verify | 2026-01-17 |
```

**Bug Table (for --fixed):**

```markdown
## Fixed Bugs

| Bug ID | Title | Severity | Fixed Date |
|--------|-------|----------|------------|
| BUG-001 | Login redirect loop | High | 2026-01-10 |
| BUG-002 | CSS overflow on mobile | Low | 2026-01-12 |
```

**Bug Table (for --all):**

Show all sections.

### 5. Severity Ordering

Sort bugs by severity within each status group:
1. Critical
2. High
3. Medium
4. Low

### 6. Quick Actions

```
───────────────────────────────────────────────────────────────

## Quick Actions

- `/my:fix-bug BUG-XXX` — Fix a specific bug
- `/my:fix-bug BUG-XXX --plan` — Create structured plan for complex bug
- `/my:new-bug` — Report a new bug

───────────────────────────────────────────────────────────────
```

### 7. Source Legend

If bugs from multiple sources:

```
**Source Legend:**
- Manual — Reported via /my:new-bug
- GSD Execution — Discovered during gsd-executor
- GSD Verify — Found in verification gap analysis
- PIV Execution — Discovered during Core PIV execution
```

## Empty State

If no bugs match the filter:

**For --open (default):**
```
No open bugs!

{FIXED} bugs have been fixed.

To see all bugs: /my:list-bugs --all
To report a bug: /my:new-bug
```

**For --fixed:**
```
No fixed bugs yet.

{OPEN} bugs are still open.

To see open bugs: /my:list-bugs --open
To fix a bug: /my:fix-bug BUG-XXX
```

**For --all with no bugs:**
```
No bugs have been reported.

To report a bug: /my:new-bug
```

## Integration Notes

- Bugs are stored in `docs/bugs/BUG-*.md`
- Bug format follows the template in execution-bug-creation.md
- STATE.md "Open Bugs" section should match this listing
- If discrepancy found, suggest: "STATE.md bug list may be out of sync. Update it?"
