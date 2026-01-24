# /define - Feature Discovery

Interactively discover and document WHAT to build before any planning or implementation.

## Arguments

- `$ARGUMENTS` - Feature name or brief description (e.g., "user authentication", "shopping cart")

## Process

### Step 1: Initialize

Create the feature directory if it doesn't exist:

```bash
mkdir -p .agents/features
```

Convert the feature name to kebab-case for the filename:
- "User Authentication" → "user-authentication"
- "Add Shopping Cart" → "add-shopping-cart"

### Step 2: Gather Information

Ask the user the following questions using AskUserQuestion. Group related questions together.

**Question Set 1: Core Purpose**
- What is the user-facing goal of this feature?
- Who is the target user?
- What problem does this solve?

**Question Set 2: Scope**
- What are the must-have requirements?
- What are nice-to-have requirements?
- What should explicitly NOT be included?

**Question Set 3: Technical Context**
- What existing code/patterns should this follow?
- Are there any dependencies or prerequisites?
- Are there any known constraints (performance, security, etc.)?

**Question Set 4: Verification**
- How will we know when this feature is complete?
- What are the measurable success criteria?

### Step 3: Generate Requirements

From the answers, create a requirements table with unique IDs:

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-001 | {requirement} | Must Have |
| REQ-002 | {requirement} | Must Have |
| REQ-003 | {requirement} | Should Have |

Priority levels:
- **Must Have** - Feature is incomplete without this
- **Should Have** - Important but not blocking
- **Could Have** - Nice to have if time permits

### Step 4: Create Feature Definition

Write the feature definition to `.agents/features/{kebab-name}.md` using this structure:

```markdown
# Feature: {Feature Name}

**Created:** {YYYY-MM-DD}
**Status:** Draft

---

## Summary

{One paragraph description of the feature}

---

## User Story

**As a** {user type}
**I want** {capability}
**So that** {benefit}

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
{requirements table}

---

## Inputs

| Input | Type | Source | Required |
|-------|------|--------|----------|
{inputs if any}

---

## Outputs

| Output | Type | Destination |
|--------|------|-------------|
{outputs if any}

---

## Existing Patterns

{References to existing code patterns to follow}

---

## Success Criteria

{Numbered list of measurable criteria}

---

## Out of Scope

{Bulleted list of exclusions}

---

## Notes

{Any additional context}
```

### Step 5: Confirm

Display the created file location and a summary:

```
Feature definition created: .agents/features/{kebab-name}.md

Summary:
- {count} requirements identified
- {count} Must Have, {count} Should Have, {count} Could Have

Next steps:
1. Review the feature definition
2. Run /plan {kebab-name} to create an implementation plan
```

## Output

- **File:** `.agents/features/{kebab-name}.md`
- **Format:** Markdown following the template structure

## Example

```
User: /define user authentication

Claude: I'll help you define the user authentication feature. Let me ask a few questions...

[Interactive Q&A session]

Claude: Feature definition created: .agents/features/user-authentication.md

Summary:
- 6 requirements identified
- 3 Must Have, 2 Should Have, 1 Could Have

Next steps:
1. Review the feature definition
2. Run /plan user-authentication to create an implementation plan
```

## Notes

- Keep the definition focused on WHAT, not HOW
- Requirements should be testable/verifiable
- Capture what's out of scope to prevent scope creep
- The feature definition becomes the contract for planning
