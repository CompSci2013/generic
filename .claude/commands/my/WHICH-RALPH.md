# Which Ralph? - Reference Guide

Two approaches for autonomous AI development loops.

---

## Option 1: Ralph-Wiggum Plugin (Claude-Only)

**What it is:** Official Claude Code plugin that intercepts exit attempts and re-feeds prompts.

**Requirements:**
- Claude CLI (not VSCode extension)
- `--dangerously-skip-permissions` flag

**Launch:**
```bash
claude --plugin-dir ~/projects/claude-code/plugins/ralph-wiggum --dangerously-skip-permissions
```

**Usage:**
```bash
/ralph-wiggum:ralph-loop "<prompt>" --max-iterations 20 --completion-promise "COMPLETE"
```

**Commands:**
| Command | Purpose |
|---------|---------|
| `/ralph-wiggum:ralph-loop` | Start autonomous loop |
| `/ralph-wiggum:cancel-ralph` | Stop the loop |

**How it works:**
1. User runs `/ralph-loop` with prompt
2. Claude works on task
3. Claude tries to exit
4. Stop hook blocks exit, feeds SAME prompt back
5. Loop repeats until `<promise>COMPLETE</promise>` detected or max iterations

**State file:** `.claude/ralph-loop.local.md`

**Pros:**
- Official, well-tested
- Integrated with Claude Code ecosystem
- Simple setup

**Cons:**
- Tightly coupled to Claude CLI
- Cannot use other LLM backends
- Requires `--dangerously-skip-permissions`

---

## Option 2: Custom Ralph (Backend-Agnostic)

**What it is:** Standalone implementation of Ralph's loop pattern, decoupled from Claude.

**Location:** `~/projects/ralph-server/`

**Key files:**
- `ralph-agent.py` - Agent logic
- `ralph-runner.py` - Loop orchestration
- `ralph-server.py` - Server implementation

**Concept:**
```
┌─────────────┐     ┌─────────────┐
│   Ralph     │────▶│  LLM API    │
│   Runner    │◀────│  (any)      │
└─────────────┘     └─────────────┘
       │
       ▼
  Loop until:
  - Completion promise detected
  - Max iterations reached
  - Manual cancellation
```

**Backend options:**
| Backend | Endpoint | API Format | Use case |
|---------|----------|------------|----------|
| Claude | `api.anthropic.com` | Anthropic Messages API | Cloud, high capability |
| Local MLX | `mimir:8081` | OpenAI-compatible | Self-hosted on Apple Silicon |
| OpenAI-compatible | `localhost:PORT` | OpenAI Chat Completions | Any local model server |

**Proposed usage (future):**
```bash
# Use Claude API (Anthropic format - requires ANTHROPIC_API_KEY)
ralph-runner --backend claude --prompt "Build feature X" --max-iterations 20

# Use local MLX on Mimir (OpenAI-compatible format)
ralph-runner --backend openai --endpoint mimir:8081 --prompt "Build feature X" --max-iterations 20

# Use any other OpenAI-compatible API (Ollama, LM Studio, vLLM, etc.)
ralph-runner --backend openai --endpoint localhost:1234 --prompt "Build feature X"
```

**Pros:**
- Backend-agnostic (Claude, MLX, any OpenAI-compatible)
- No Claude CLI dependency
- Can run against self-hosted models
- Full control over loop behavior

**Cons:**
- Custom implementation to maintain
- Not integrated with Claude Code plugin system
- May need manual tool/file handling

---

## Decision Matrix

| Factor | Ralph-Wiggum Plugin | Custom Ralph |
|--------|---------------------|--------------|
| Setup complexity | Low | Medium |
| Backend flexibility | Claude only | Any LLM |
| Cost control | Claude pricing | Self-hosted option |
| Integration | Claude Code native | Standalone |
| Maintenance | Anthropic maintains | Self-maintained |

**Choose Ralph-Wiggum when:**
- Using Claude exclusively
- Want simplest setup
- Need Claude Code integration

**Choose Custom Ralph when:**
- Want to use local/self-hosted models
- Need backend flexibility
- Want to avoid Claude API costs for long loops
- Building a pipeline (e.g., textbook generation on Mimir)

---

## References

- Original technique: https://ghuntley.com/ralph/
- Ralph Orchestrator (Rust): https://github.com/mikeyobrien/ralph-orchestrator
- Official plugin: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
- Community impl: https://github.com/frankbria/ralph-claude-code
