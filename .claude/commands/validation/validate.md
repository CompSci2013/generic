Run comprehensive validation of the MLX Code project.

Execute the following commands in sequence and report results:

## 1. Python Syntax Check (Thor)

```bash
python3 -m py_compile ~/projects/mlx-code/mlx-code-app/server.py
```

**Expected:** No output (clean syntax)

## 2. Python Syntax Check (Mimir)

```bash
python3 -m py_compile ~/projects/mlx-code/mlx-code-server/mlx-code-llm-server.py
```

**Expected:** No output (clean syntax)

## 3. Check Server Status

```bash
~/projects/mlx-code/scripts/mlx-code-status.sh
```

**Expected:** Shows status of Thor and Mimir servers

## 4. Test Thor Health Endpoint

```bash
curl -s http://minilab:4208/health 2>/dev/null || echo "Thor server not running"
```

**Expected:** Health check response or "not running" message

## 5. Test Mimir Health Endpoint

```bash
curl -s http://mimir:8081/health 2>/dev/null || echo "Mimir server not running"
```

**Expected:** Health check response with model info or "not running" message

## 6. Test Mimir Models Endpoint

```bash
curl -s http://mimir:8081/v1/available-models 2>/dev/null | head -c 500 || echo "Mimir server not running"
```

**Expected:** JSON list of available models

## 7. Verify Frontend Files

```bash
ls -la ~/projects/mlx-code/mlx-code-app/*.html ~/projects/mlx-code/mlx-code-app/*.js ~/projects/mlx-code/mlx-code-app/*.css
```

**Expected:** index.html, chat.js, styles.css present

## 8. Check Git Status

```bash
cd ~/projects/mlx-code && git status --short
```

**Expected:** Shows any uncommitted changes

## 9. Summary Report

After all validations complete, provide a summary report with:

- Python syntax status (Thor)
- Python syntax status (Mimir)
- Thor server status (running/stopped)
- Mimir server status (running/stopped)
- Frontend files status
- Any errors or warnings encountered
- Overall health assessment (PASS/FAIL)

**Format the report clearly with sections and status indicators**
