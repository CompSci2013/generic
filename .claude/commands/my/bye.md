# Command: /bye

**Description:** Executes the Monster Shutdown Protocol. Compatible with both `/monster` and `/monsterwatch` sessions.

## Instructions
When the user types `/bye`:

### 1. Detect Session Type
Check if `.dialog/` contains an active dialog file:
- **If dialog file exists** → This is a `/monsterwatch` session
- **If no dialog file** → This is a standard `/monster` session

---

### 2. Common Steps (Both Protocols)

1.  **Update `docs/claude/PROJECT-STATUS.md`**:
    -   Bump the version number.
    -   Update the timestamp to the current time. **CRITICAL**: Use the current system time (Thor's time). Run `date` to confirm.
    -   Summarize the "Current State" and "Completed Work" for this session.

2.  **Update `docs/claude/NEXT-STEPS.md`**:
    -   Clear out completed tasks.
    -   Define the *exact* starting task for the next session.

3.  **Archive Status**:
    -   Append the content of `docs/claude/PROJECT-STATUS.md` to `docs/claude/STATUS-HISTORY.md`.
    -   Add a header with the version and date.

4.  **Commit All Changes**:
    -   Run `git add .` to stage code and documentation.
    -   Commit with a descriptive message: `docs: session [Version] summary - [Brief Description]`.
    -   **CRITICAL**: You are responsible for this commit. Do not leave it for Gemini.

---

### 3. Protocol-Specific Steps

#### For `/monster` Sessions (No dialog file)

4.  **Update `MONSTER-LOG.md`**:
    -   Write a "Hand-off" note. Leave architectural insights, warnings, or specific theories for the next "Brain" to consider.

5.  **Final Message**:
    -   State: "Shutdown Step 1 Complete. Code committed and documents updated. @Gemini - Execute Step 2: Secure the Perimeter (Archive & Doc Commit)."

#### For `/monsterwatch` Sessions (Dialog file exists)

4.  **Write final entry to dialog file**:
    -   Add a `CLAUDE:<timestamp>` entry documenting session end
    -   Include: what was accomplished, any pending work, and session end marker
    -   Example:
    ```
    CLAUDE:2025-12-26T15:30:00
    Session ending. Accomplished: [summary of work].
    Pending: [any incomplete items].

    SESSION END
    ```

5.  **Final Message**:
    -   State: "MonsterWatch session complete. Dialog file updated, code committed, and documents updated."

---

**Version**: 2.0
**Updated**: 2025-12-26
**Purpose**: Unified shutdown for both Monster Protocol variants
