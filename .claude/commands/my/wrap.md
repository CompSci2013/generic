# Session End Protocol

**IMPORTANT**: Focus only on this wrap protocol. Do not reference unrelated topics from earlier in the conversation.

**This command triggers the end-of-session documentation and commit process.**

---

## Actions Required

1. **Read STATE.md**
   - Read `.planning/STATE.md` to understand current state
   - Note the current version, recent activity, and immediate actions

2. **Update STATE.md Version Section**
   - Increment version if significant changes were made (e.g., v1.0.0-alpha.8 → v1.0.0-alpha.9)
   - Keep "Last Release" unchanged unless a release was made

3. **Update STATE.md Immediate Actions**
   - Mark completed items with `[x]`
   - Add new immediate actions discovered during this session
   - Remove items that are no longer relevant

4. **Update STATE.md Recent Activity (if significant work done)**
   - Add a new entry at the top of "Recent Activity" section
   - Format: `### YYYY-MM-DD — <brief description>`
   - Include bullet points of key accomplishments

5. **Commit all changes**
   - Stage all modified files
   - Create a descriptive commit message summarizing the session work
   - Include: features added, bugs fixed, documentation updated

---

## File Locations

- **STATE.md**: `.planning/STATE.md` (master state file)
- **Version section**: Under `## Version` in STATE.md
- **Immediate Actions section**: Under `## Immediate Actions` in STATE.md
- **Recent Activity section**: Under `## Recent Activity` in STATE.md

---

## Commit Message Format

```
<type>: <brief description> - v<version>

- <bullet point 1>
- <bullet point 2>
- <bullet point 3>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`

---

## Pre-Commit Checklist

- [ ] All file edits are complete
- [ ] STATE.md version updated if significant changes
- [ ] STATE.md Immediate Actions reflects current state
- [ ] STATE.md Recent Activity updated if work was done
- [ ] No debug code left in files

---

## Directive

Execute the session end protocol:

1. Read the current `.planning/STATE.md`
2. Determine what changes were made this session
3. Update STATE.md:
   - Version section (increment if significant changes)
   - Immediate Actions (mark completed, add new)
   - Recent Activity (add entry for significant work)
4. Run `git status` to see all changes
5. Run `git diff` to review changes
6. Stage and commit with a descriptive message including version

After completing, confirm:
- "Session ended. Version X.Y.Z. Committed N files with message: '<message>'"

---

## Session Continuity (SUMMARY.md)

**After the commit is complete**, create a `SUMMARY.md` file in the project root to preserve session context for the next session.

### SUMMARY.md Structure

```markdown
# Session Summary — YYYY-MM-DD

## What Was Accomplished
- <bullet points of key work completed>

## Current State
- **Phase/Focus**: <what area of the project>
- **Last Action**: <what was the final thing done>
- **Open Files/Areas**: <relevant files that were being worked on>

## Next Steps
- <immediate next actions for the next session>
- <any pending items or decisions>

## Context to Preserve
- <important decisions made and why>
- <gotchas or issues discovered>
- <any temporary workarounds in place>

## Commands to Resume
```bash
# Suggested commands to continue work
<relevant slash commands or shell commands>
```
```

### Notes
- SUMMARY.md is **temporary** — intended for session-to-session handoff
- It should be **discarded** once the next session has absorbed the context
- Do NOT commit SUMMARY.md (it's ephemeral working memory)
- If SUMMARY.md already exists, **overwrite it** with the current session's summary

### Final Confirmation

After creating SUMMARY.md, add to the session end message:
- "SUMMARY.md created for next session continuity."
