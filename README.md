# Self-Hosted Judge0 Code Execution System

Production-ready, self-hosted deployment of **Judge0 Community Edition (v1.13.1)**.

---

## 1. Architecture

```
Frontend Code Editor / Web Client / API Consumers
        │
        ▼ (HTTP REST / JSON)
Judge0 API Server (http://127.0.0.1:2358)
        │
        ▼ (Jobs Queue & Results)
Submission Queue ──┬── Redis 7.2 (Authentication required)
                   └── PostgreSQL 15 (Encrypted credentials)
        │
        ▼
Judge0 Execution Workers (Privileged Isolate Sandboxes)
        │
        ▼
Sandboxed Process Execution (CPU, RAM, Stack, Process bounds)
```

### Security Isolation Principles
- **No Direct Frontend Access**: The Judge0 API binds exclusively to `127.0.0.1:2358` (or internal Docker network). It is never exposed publicly to browsers.
- **Database & Cache Isolation**: PostgreSQL and Redis ports (`5432`, `6379`) are not published to the host machine.
- **Strict Sandbox Bounds**: Code is executed inside an `isolate` sandbox with hard limits:
  - Max CPU Time: 2.0s (burst up to 5.0s)
  - Wall Time: 5.0s (prevents hanging loops)
  - Memory: 256 MB
  - Max Processes/Threads: 60 (prevents fork bombs)
  - Max File Size: 4 KB
- **Ephemeral Sandbox Storage**: Each submission runs in a clean temporary directory that is wiped immediately upon completion.

---

## 2. Directory Structure

```
judge0/
├── docker-compose.yml       # Production-ready Compose orchestration
├── judge0.conf              # Judge0 system, sandbox, and database config
├── .env.example             # Template for environment secrets
├── .env                     # Local environment secrets (ignored by git)
├── .gitignore               # Excludes secrets, databases, logs
├── README.md                # Comprehensive documentation
├── frontend/                # Standalone Light Studio Code Environment (Port 5174)
│   ├── src/                 # React 19 + TypeScript + Monaco Editor (Light Theme)
│   ├── package.json
│   └── vite.config.ts
└── scripts/                 # Management scripts (POSIX & PowerShell)
    ├── start.sh / start.ps1         # Safe staged startup
    ├── stop.sh / stop.ps1           # Graceful teardown
    ├── restart.sh / restart.ps1     # Clean restart
    ├── logs.sh / logs.ps1           # Follow log output
    ├── status.sh / status.ps1       # Container health & status
    ├── start-frontend.sh / start-frontend.ps1 # Launch dedicated Light Studio
    └── health-check.sh / health-check.ps1     # Automated HTTP probe
```

---

## 3. Dedicated Light Studio Frontend (Port 5174)

A dedicated, elegant standalone web frontend is included in `judge0/frontend` specifically designed for Judge0 code execution with a **Light Color Mood / Theme**:
- **Light Aesthetic**: Crisp porcelain canvas (`#f8fafc`), elevated white cards, slate typography, and VS Light Monaco code editor.
- **Port 5174**: Dedicated standalone port (defaulting to 5174 so it avoids conflicts with standard web services).
- **Direct Execution Engine**: Communicates directly with Judge0 CE (`http://127.0.0.1:2358/submissions`) with base64 UTF-8 encoding and synchronized/asynchronous submission handling.
- **Languages**: C++ (GCC 9.2.0), Java (OpenJDK 13), Python 3 (3.8.1), and JavaScript (Node.js 12.14).
- **Interactive Workspaces**:
  - Live code editor with font size zoom, reset, and copy
  - Standard Input (`stdin`) interactive tab
  - Standard Output (`stdout`) and error diagnostics tabs
  - Real-time test cases verification runner
  - Preloaded algorithmic presets (Two Sum, Fibonacci DP, Palindrome Checker)
  - Live execution telemetry (verdict badge, runtime in ms, memory in KB, exit code)

### Starting the Light Frontend:
```powershell
# PowerShell
.\scripts\start-frontend.ps1

# Or directly with Vite
cd frontend
npm run dev
# Browse to: http://127.0.0.1:5174
```

---

## 3. Quick Start

### Prerequisites
- Docker Engine 20.10+ & Docker Compose v2+
- On Linux/WSL2: cgroup v1 compatibility (`systemd.unified_cgroup_hierarchy=0` in kernel parameters if using standard isolate kernels)

### Windows (PowerShell)
```powershell
# 1. Navigate to the judge0 directory
cd C:\Users\ritik\Coding\Projects\judge0

# 2. Start services (will auto-generate .env from .env.example if missing)
.\scripts\start.ps1

# 3. Verify health
.\scripts\health-check.ps1

# 4. View logs
.\scripts\logs.ps1
```

### Linux / macOS / WSL (Bash)
```bash
# 1. Navigate to the judge0 directory
cd judge0

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Start services
./scripts/start.sh

# 4. Verify health
./scripts/health-check.sh
```

---

## 4. Supported Languages

| Language | Default Judge0 ID | Dynamic Resolution | Starter Code Template |
| :--- | :---: | :---: | :--- |
| **C++ (GCC)** | `54` / `105` | Yes via `/languages` | `#include <iostream>` |
| **Java (OpenJDK)** | `62` / `91` | Yes via `/languages` | `public class Main { ... }` |
| **Python 3** | `71` / `92` | Yes via `/languages` | `print("Hello World")` |
| **JavaScript (Node.js)** | `63` / `93` | Yes via `/languages` | `console.log("Hello World");` |

---

## 5. Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `http://127.0.0.1:2358/health` | `GET` | Judge0 server health check |
| `http://127.0.0.1:2358/system_info` | `GET` | System specs, isolate version, workers count |
| `http://127.0.0.1:2358/languages` | `GET` | Full list of supported compilers & runtime engines |
| `http://127.0.0.1:2358/submissions` | `POST` | Create a code execution job (`wait=true` supported) |
| `http://127.0.0.1:2358/submissions/:token` | `GET` | Query status and result of a queued submission |

---

## 6. Troubleshooting

- **Container failed to start**: Check logs via `docker compose logs -f server` or `docker compose logs -f workers`.
- **Database connection error**: Ensure `judge0-db` is healthy before `judge0-server` starts. The `start.ps1` / `start.sh` script automates this staggered startup.
- **Worker isolate error**: On Linux hosts using cgroup v2 exclusively, verify kernel cgroup v1 compatibility (`systemd.unified_cgroup_hierarchy=0`).
