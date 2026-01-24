# Session End Protocol

**This command implements the session end protocol before exiting.**

---

## Directive

Execute the following 3 steps to properly end the session:

1. **Update PROJECT-STATUS.md**
   - Bump version number (increment decimal)
   - Update timestamp to current session time
   - Document what was accomplished
   - Note any new blockers or decisions

2. **Update NEXT-STEPS.md**
   - Document the ONE immediate action for the next session
   - Include reproduction steps if it's a bug
   - Reference related files

3. **Commit all changes to `docs/claude/` directory**
   - Use descriptive commit message
   - Example: `git commit -m "docs: session summary - Added agriculture domain"`
   - Git history serves as the historical record (use `git log` to view past versions)

---

## After All 3 Steps Complete

Provide:
1. **Summary** of what was accomplished this session
2. **Next session action**: What immediate work is needed?
3. **Confirmation**: All changes committed to git

---

**Session protocol**:
- Include version bump and timestamp in all PROJECT-STATUS updates
- Use git log to verify commits were successful
- Git history serves as the historical record for tracking changes
- This protocol ensures continuity across sessions
