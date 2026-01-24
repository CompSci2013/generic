---
name: new:project
description: Initialize a new project with unified Claude workflow
allowed-tools:
  - Bash
  - Write
  - Read
---

# /new:project - Initialize New Project

Create a new project with the unified Claude Code workflow system.

## Arguments

- `$ARGUMENTS` - Project name in kebab-case (e.g., "my-app", "todo-service")

## Overview

This skill initializes a project with a **unified workflow system** that seamlessly blends:
- Strategic planning (milestones, phases, roadmaps)
- Tactical execution (define → plan → atomize → execute)
- Bug tracking, validation, and session management

All components share state through common files. You don't choose between workflows - you use whatever command fits the moment, and everything stays in sync.

## Process

### Step 1: Parse and Validate Project Name

Extract the project name from arguments. If empty, ask the user:

```
What would you like to name your project?
```

**Validation rules:**
- Must be kebab-case (lowercase letters, numbers, hyphens)
- Cannot start or end with hyphen
- Cannot have consecutive hyphens
- Minimum 2 characters

**Validate with:**
```bash
PROJECT_NAME="$ARGUMENTS"
if [[ ! "$PROJECT_NAME" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo "ERROR: Project name must be kebab-case (e.g., my-app, todo-service)"
    exit 1
fi
```

### Step 2: Check for Conflicts

Verify the project directory doesn't already exist:

```bash
PROJECT_PATH="$HOME/projects/$PROJECT_NAME"
if [ -d "$PROJECT_PATH" ]; then
    echo "ERROR: Directory already exists: $PROJECT_PATH"
    echo "Choose a different name or remove the existing directory."
    exit 1
fi
```

Determine the source directory (where autonomous-workflow is installed):
```bash
# Source is the autonomous-workflow installation
SOURCE_DIR="$HOME/projects/autonomous-workflow"
if [ ! -d "$SOURCE_DIR/.claude" ]; then
    echo "ERROR: autonomous-workflow not found at $SOURCE_DIR"
    exit 1
fi
```

### Step 3: Create Project Structure

```bash
mkdir -p "$HOME/projects/$PROJECT_NAME"
cd "$HOME/projects/$PROJECT_NAME"

# Shared state directories
mkdir -p .planning
mkdir -p .agents/features .agents/plans .agents/prds
mkdir -p docs/bugs
```

### Step 4: Initialize Git Repository

```bash
git init
git checkout -b main
```

### Step 5: Copy Unified Configuration

Copy the complete unified system from autonomous-workflow:

```bash
# Core configuration
mkdir -p .claude/commands
cp "$SOURCE_DIR/.claude/settings.local.json" .claude/

# All commands (unified system)
cp -r "$SOURCE_DIR/.claude/commands/gsd" .claude/commands/
cp -r "$SOURCE_DIR/.claude/commands/my" .claude/commands/
cp -r "$SOURCE_DIR/.claude/commands/validation" .claude/commands/

# Tactical execution commands (define/plan/atomize/execute)
cp "$SOURCE_DIR/.claude/commands/define.md" .claude/commands/
cp "$SOURCE_DIR/.claude/commands/plan.md" .claude/commands/
cp "$SOURCE_DIR/.claude/commands/atomize.md" .claude/commands/
cp "$SOURCE_DIR/.claude/commands/execute.md" .claude/commands/

# Framework files (templates, references, workflows)
cp -r "$SOURCE_DIR/.claude/get-stuff-done" .claude/

# Specialized agents
cp -r "$SOURCE_DIR/.claude/agents" .claude/

# Schemas and templates
cp -r "$SOURCE_DIR/schemas" .
cp -r "$SOURCE_DIR/templates" .
```

### Step 6: Generate CLAUDE.md

Create `CLAUDE.md` explaining the unified system:

```markdown
# {PROJECT_NAME}

New project initialized with Claude Code unified workflow.

## Current State

Greenfield project. No code yet.

## Workflow

This project uses a unified workflow system. All commands share state - use whatever fits the moment:

### Starting a Project
```
/gsd:new-project    # Full project setup with milestones and roadmap
```

### Quick Feature Development
```
/define <feature>   # Document what to build
/plan <feature>     # Create implementation plan
/atomize <plan>     # Convert to atomic tasks
/execute <prd>      # Autonomous implementation
```

### During Development
```
/my:dev             # See unified status, get routed to next action
/my:new-bug         # Report a bug (tracked across all commands)
/my:fix-bug <id>    # Fix a bug (can generate plans/PRDs)
/gsd:progress       # Check project progress
```

### Session Management
```
/my:wrap            # End session with summary
```

All commands read from and write to shared state files. A bug created with `/my:new-bug` appears in `/gsd:progress`. A plan created by `/gsd:plan-phase` can be executed via `/execute`. Everything stays in sync.

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `.planning/` | Project state, roadmap, requirements, phase artifacts |
| `.agents/` | Features, plans, PRDs (shared across all commands) |
| `docs/bugs/` | Bug tracking (shared across all commands) |
| `.claude/` | Configuration, commands, agents |

## Conventions

- Follow existing patterns when adding code
- Keep files focused and small
- Write tests for business logic

## Critical Constraints

- Don't modify .claude/ configuration without explicit request
- Keep each commit focused on a single change
- Don't add dependencies without discussing first

## Getting Started

For a new project with planning:
```
/gsd:new-project
```

For a quick feature:
```
/define my-feature
```
```

### Step 7: Generate README.md

Create `README.md`:

```markdown
# {PROJECT_NAME}

Created with `/new:project` from autonomous-workflow.

## Setup

```bash
cd ~/projects/{PROJECT_NAME}
claude
```

## Project Structure

```
{PROJECT_NAME}/
├── .claude/           # Commands, agents, configuration
├── .planning/         # Project state and planning artifacts
├── .agents/           # Features, plans, PRDs
├── docs/bugs/         # Bug tracking
├── schemas/           # JSON schemas
├── templates/         # Document templates
├── CLAUDE.md          # Project context
└── README.md          # This file
```

## Workflow

See CLAUDE.md for available commands and workflow documentation.

## License

Add your license here.
```

### Step 8: Create Initial Commit

```bash
git add .
git commit -m "$(cat <<'EOF'
chore: initialize project with unified Claude workflow

Includes:
- Strategic planning (gsd:* commands)
- Tactical execution (define/plan/atomize/execute)
- Bug tracking (my:new-bug, my:fix-bug)
- Session management (my:dev, my:wrap)
- Validation commands

All commands share state via .planning/, .agents/, docs/bugs/

Created with /new:project from autonomous-workflow
EOF
)"
```

### Step 9: Display Success

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PROJECT CREATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{PROJECT_NAME}**

Location: ~/projects/{PROJECT_NAME}

| Component          | Status              |
|--------------------|---------------------|
| Git repo           | Initialized (main)  |
| Unified workflow   | Installed           |
| Specialized agents | Installed           |

───────────────────────────────────────────────────────

## ▶ Next Steps

```bash
cd ~/projects/{PROJECT_NAME}
claude
```

**For a new project with full planning:**
```
/gsd:new-project
```
This guides you through project definition, research, requirements, and roadmap creation.

**For a quick feature:**
```
/define my-feature
```
Jump straight into building something specific.

**To see what's available:**
```
/my:dev
```
Shows unified status and suggests next actions.

───────────────────────────────────────────────────────
```

---

## Output

- **Directory:** `~/projects/{PROJECT_NAME}/`
- **Shared state:**
  - `.planning/` - Project planning artifacts
  - `.agents/` - Features, plans, PRDs
  - `docs/bugs/` - Bug tracking
- **Configuration:**
  - `.claude/settings.local.json`
  - `.claude/commands/` - All unified commands
  - `.claude/get-stuff-done/` - Templates and references
  - `.claude/agents/` - Specialized agents
- **Support files:**
  - `schemas/prd.schema.json`
  - `templates/`
  - `CLAUDE.md`
  - `README.md`

---

## How the Unified System Works

All commands operate on shared state:

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED STATE LAYER                        │
│                                                              │
│  .planning/STATE.md    ◄── Central hub, all commands R/W    │
│  .planning/ROADMAP.md  ◄── Phase structure                  │
│  docs/bugs/BUG-*.md    ◄── Bug tracking                     │
│  .agents/prds/*.json   ◄── Execution plans                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Strategic              Tactical              Support
   /gsd:*                 /define               /my:dev
   milestones             /plan                 /my:new-bug
   phases                 /atomize              /my:fix-bug
   roadmaps               /execute              /my:wrap
```

**Example flow:**
1. `/gsd:new-project` creates `.planning/STATE.md`, `ROADMAP.md`
2. `/gsd:plan-phase 1` creates plans AND mirrors to `.agents/prds/`
3. `/my:new-bug` during work creates `docs/bugs/BUG-001.md`, updates `STATE.md`
4. `/gsd:progress` shows the bug in its status
5. `/my:fix-bug BUG-001 --plan` creates fix plan in `.agents/feature-plans/`
6. `/execute` runs the fix plan
7. Everything stays in sync

---

## Error Handling

| Condition | Action |
|-----------|--------|
| Project name invalid | Show error with valid format example |
| Directory exists | Abort, suggest different name |
| autonomous-workflow missing | Abort (should not happen if running from it) |
| Git init fails | Show error, suggest manual intervention |
| Copy fails | Show which files failed, continue with others |

---

## Examples

```
/new:project my-saas-app
→ Creates ~/projects/my-saas-app with complete unified system
→ User runs /gsd:new-project to set up milestones
```

```
/new:project quick-script
→ Creates ~/projects/quick-script with unified system
→ User runs /define my-feature for quick development
```
