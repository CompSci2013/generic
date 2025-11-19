# Session 02: Continue Building the Generic Discovery Framework

**Session Goal**: Continue building the domain-agnostic Angular 14 framework at `~/projects/generic` following the milestone plan in [MILESTONES-FRAMEWORK.md](MILESTONES-FRAMEWORK.md).

---

## Current Status

### ✅ Completed: Tier 0 - Foundation (Week 1)

**Milestone F1: Project Foundation & Framework Structure** - COMPLETE ✔

**What's Been Built:**
- Angular 14 project with strict typing at `~/projects/generic`
- Docker development container running (`generic-frontend-dev`)
- Three-layer folder structure:
  - `src/framework/` - Domain-agnostic code (empty, ready for F2-F20)
  - `src/domain-config/` - Domain-specific config (placeholders created)
  - `src/app/` - Application instance (thin layer)
- PrimeNG 14.2.3 + Plotly.js 3.2.0 integration
- ESLint rules **forbidding domain-specific terms in framework/**
- Git repository on `develop` branch
- Tagged: `tier-0-foundation`

**Current State:**
- Dev server running at http://localhost:4204
- Linting passes: `npm run lint` ✔
- Container status: Running
- Branch: `develop`
- All commands run in container (Thor pristine ✔)

**Project Structure Created:**
```
~/projects/generic/
├── Dockerfile.dev                    # Development container
├── src/
│   ├── framework/                    # Domain-agnostic code (F-milestones)
│   │   ├── core/
│   │   │   ├── services/             # Empty - ready for F2, F3, F4, F5
│   │   │   ├── models/               # Empty - ready for F2
│   │   │   └── interfaces/           # Empty - ready for F2, F4
│   │   ├── components/
│   │   │   ├── base-table/           # Empty - ready for F7
│   │   │   ├── base-picker/          # Empty - ready for F8
│   │   │   ├── base-chart/           # Empty - ready for F9
│   │   │   └── base-filter/          # Empty - ready for F12
│   │   └── utils/                    # Empty - ready as needed
│   │
│   ├── domain-config/                # Domain-specific configurations
│   │   ├── automobile/               # Placeholder - ready for D1-D4
│   │   │   ├── models/
│   │   │   ├── adapters/
│   │   │   └── configs/
│   │   ├── agriculture/              # Future domain placeholder
│   │   └── real-estate/              # Future domain placeholder
│   │
│   ├── app/                          # Application instance (thin)
│   │   ├── features/                 # Ready for A1-A2
│   │   ├── config/
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   └── primeng.module.ts         # ✔ PrimeNG configured
│   │
│   ├── environments/
│   ├── assets/
│   └── styles.scss
│
├── .eslintrc.json                    # ✔ Domain-agnostic naming enforced
├── angular.json                      # ✔ PrimeNG styles + lint configured
├── package.json                      # ✔ Dependencies installed
└── README.md
```

---

## Next Steps: Tier 1 - Core Framework Infrastructure (Weeks 2-4)

You should now implement **Milestones F2 through F5** in order:

### **F2: Generic API Service** (Week 2)
Build the foundational API service layer.

### **F3: URL State Management Service** (Week 2) ⚠️ CRITICAL
URL-first paradigm - all state derives from URL.

### **F4: Generic Resource Management Service** (Week 3) ⚠️ CRITICAL
The heart of the framework - orchestrates URL → Filters → API → Data.

### **F5: Request Coordination & Caching Service** (Week 3)
Optimize API calls with caching and deduplication.

**After completing F2-F5, tag as:** `tier-1-core-infrastructure`

---

## Development Environment - Docker Container

**CRITICAL**: All `npm` and `ng` commands MUST be run inside the Docker development container.

### **Container Status Check**

```bash
# Check if container is running
podman ps | grep generic-frontend-dev

# If not running, start it
podman start generic-frontend-dev

# Check dev server status (should be on port 4204)
curl -s http://localhost:4204 > /dev/null && echo "Dev server is running" || echo "Dev server is NOT running"
```

### **Container Commands Reference**

```bash
# Start dev server (if not already running)
podman exec generic-frontend-dev bash -c "cd /app && ng serve --host 0.0.0.0 --port 4204" &

# Run linting
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"

# Generate component
podman exec generic-frontend-dev bash -c "cd /app && ng generate component framework/components/base-data-table"

# Generate service
podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/url-state"

# Generate interface
podman exec generic-frontend-dev bash -c "cd /app && ng generate interface framework/core/interfaces/api-adapter"

# Install packages
podman exec generic-frontend-dev bash -c "cd /app && npm install <package-name>"

# Interactive shell (for multiple commands)
podman exec -it generic-frontend-dev bash
# Then inside container:
cd /app
ng serve --host 0.0.0.0 --port 4204
```

### **Container Troubleshooting**

```bash
# Container not running?
podman start generic-frontend-dev

# Container misbehaving?
podman restart generic-frontend-dev

# Need to rebuild?
podman stop generic-frontend-dev
podman rm generic-frontend-dev
cd ~/projects/generic
podman build -f Dockerfile.dev -t generic-frontend-dev .
podman run -d --name generic-frontend-dev -p 4204:4204 -v $(pwd):/app:Z generic-frontend-dev
```

---

## Git Workflow for Each Milestone

### **Standard Milestone Workflow**

```bash
# 1. Start milestone (example: F2)
cd ~/projects/generic
git checkout develop
git checkout -b milestone/F2-generic-api

# 2. Do work (generate files, implement, test)
podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/api"
# ... implement the service ...

# 3. Test your work
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"
# Check dev server: http://localhost:4204

# 4. Commit changes
git add .
git commit -m "$(cat <<'EOF'
F2: Generic API Service

Deliverables:
- Domain-agnostic ApiService
- Generic ApiResponse<T> interface
- Generic ApiRequest interface
- HTTP interceptor infrastructure
- Error response models

Success criteria met:
- API service works with ANY data type
- Linting passes
- Dev server compiles successfully

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 5. Merge to develop
git checkout develop
git merge milestone/F2-generic-api --no-ff -m "Merge milestone/F2-generic-api into develop"

# 6. Delete milestone branch
git branch -d milestone/F2-generic-api

# 7. Tag if tier complete (after F5, F10, F19, D4, A4)
# Example after F5:
git tag -a tier-1-core-infrastructure -m "Tier 1: Core Framework Infrastructure Complete (F2-F5)"
```

---

## Critical Architectural Constraints

### **1. NO Domain-Specific Terms in Framework**

**ESLint is configured to prevent this!** Run `npm run lint` frequently.

**Forbidden in `src/framework/`:**
- ❌ vehicle, automobile, car, auto
- ❌ manufacturer, make, model
- ❌ vin, VIN, vehicle identification number
- ❌ bodyClass, body_class, body type
- ❌ dealer, inventory, registration
- ❌ Any other domain-specific terminology

**Required in `src/framework/`:**
- ✅ Generic type parameters: `TData`, `TFilters`, `TStatistics`
- ✅ Generic naming: `Base*Component`, `I*Adapter`, `*Config`
- ✅ Configuration-driven patterns
- ✅ Observable streams: `Observable<T>`

**Domain terms are ONLY allowed in `src/domain-config/`**

### **2. Domain Contamination Audit**

Run this after completing each framework milestone:

```bash
# ❌ FAIL if any domain terms found:
grep -ri "vehicle\|manufacturer\|vin\|automobile\|car\|auto\|make\|model" src/framework/

# ✅ PASS if clean (exit code 1 = no matches found)
```

### **3. Type Safety Requirements**

All framework services/components must:
- Use TypeScript generic type parameters
- Have proper interface definitions
- Export types for domain configurations
- Enforce type contracts via interfaces

**Example - Correct Generic Pattern:**

```typescript
// ✅ CORRECT: Fully generic
class ResourceManagementService<TFilters, TData, TStatistics> {
  filters$: Observable<TFilters>;
  data$: Observable<TData[]>;
  statistics$: Observable<TStatistics>;

  constructor(
    private apiAdapter: IApiAdapter<TFilters, TData, TStatistics>,
    private urlMapper: IFilterUrlMapper<TFilters>
  ) {}
}

// ✅ CORRECT: Generic interface
interface IApiAdapter<TFilters, TData, TStatistics> {
  fetchData(filters: TFilters): Observable<ApiResponse<TData>>;
  fetchStatistics(filters: TFilters): Observable<TStatistics>;
}
```

**Example - Incorrect Pattern:**

```typescript
// ❌ WRONG: Domain-specific
class VehicleService {
  vehicles$: Observable<VehicleResult[]>;
  manufacturers$: Observable<string[]>;
}

// ❌ WRONG: Not generic enough
class ResourceService {
  data$: Observable<any>;  // Loses type safety!
}
```

---

## Reference Documents

### **Primary References**
- **This file** - Current status and immediate next steps
- **[MILESTONES-FRAMEWORK.md](MILESTONES-FRAMEWORK.md)** - Detailed milestone requirements

### **Reference Implementation**
- **`~/projects/auto-generic/`** - Existing automobile implementation
  - ✅ **DO**: Study patterns, understand RxJS usage, learn architecture
  - ❌ **DON'T**: Copy-paste without removing domain terms
  - Use as hints for F3, F4 especially (URL state, resource management)

---

## Milestone Details: F2-F5

### **F2: Generic API Service**

**Location:** `src/framework/core/services/`

**Deliverables:**
1. `api.service.ts` - Domain-agnostic HTTP service
2. `src/framework/core/models/api-response.interface.ts` - Generic paginated response
3. `src/framework/core/models/api-request.interface.ts` - Generic request model
4. HTTP interceptors (error handling, loading)

**Key Interfaces:**
```typescript
interface ApiResponse<TData> {
  results: TData[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface ApiRequest {
  endpoint: string;
  params: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(endpoint: string, params?: Record<string, any>): Observable<ApiResponse<T>>;
  post<T>(endpoint: string, body: any): Observable<T>;
}
```

**Success Criteria:**
- Works with ANY data type (Person, Product, Vehicle, etc.)
- Properly typed responses
- Linting passes

**Reference:** Check `~/projects/auto-generic/src/app/services/` for patterns

---

### **F3: URL State Management Service** ⚠️ CRITICAL

**Location:** `src/framework/core/services/`

**Deliverables:**
1. `url-state.service.ts` - Bidirectional URL synchronization
2. Parameter serialization utilities
3. Observable streams for URL changes
4. Browser history integration

**Key Interfaces:**
```typescript
@Injectable({ providedIn: 'root' })
export class UrlStateService {
  getParams<TParams>(): TParams;
  setParams<TParams>(params: Partial<TParams>): void;
  watchParams<TParams>(): Observable<TParams>;
  clearParams(): void;
}

export class UrlSerializer {
  serialize(params: Record<string, any>): string;
  deserialize(urlParams: string): Record<string, any>;
}
```

**Success Criteria:**
- URL state works for any parameter shape
- Bidirectional sync (URL ↔ State)
- Browser back/forward works
- Bookmarkable URLs

**Reference:** `~/projects/auto-generic/src/app/services/url-state.service.ts`

---

### **F4: Generic Resource Management Service** ⚠️ CRITICAL

**Location:** `src/framework/core/services/` and `src/framework/core/interfaces/`

**Deliverables:**
1. `resource-management.service.ts` - Orchestrates URL → Filters → API → Data
2. `src/framework/core/interfaces/api-adapter.interface.ts`
3. `src/framework/core/interfaces/filter-url-mapper.interface.ts`
4. `src/framework/core/interfaces/cache-key-builder.interface.ts`

**Key Interfaces:**
```typescript
@Injectable({ providedIn: 'root' })
export class ResourceManagementService<TFilters, TData, TStatistics> {
  filters$: Observable<TFilters>;
  data$: Observable<TData[]>;
  statistics$: Observable<TStatistics>;
  loading$: Observable<boolean>;
  error$: Observable<Error | null>;

  constructor(
    private urlState: UrlStateService,
    private apiAdapter: IApiAdapter<TFilters, TData, TStatistics>,
    private urlMapper: IFilterUrlMapper<TFilters>,
    private cacheKeyBuilder: ICacheKeyBuilder<TFilters>
  ) {}

  updateFilters(filters: Partial<TFilters>): void;
  clearFilters(): void;
  refresh(): void;
}

export interface IFilterUrlMapper<TFilters> {
  filtersToParams(filters: TFilters): Record<string, any>;
  paramsToFilters(params: Record<string, any>): Partial<TFilters>;
}

export interface IApiAdapter<TFilters, TData, TStatistics> {
  fetchData(filters: TFilters): Observable<ApiResponse<TData>>;
  fetchStatistics(filters: TFilters): Observable<TStatistics>;
}

export interface ICacheKeyBuilder<TFilters> {
  buildKey(filters: TFilters): string;
}
```

**Success Criteria:**
- Service compiles with any generic type arguments
- Automatic URL synchronization
- Reactive state management
- Works for ANY domain

**Reference:** `~/projects/auto-generic/src/app/services/resource-management.service.ts`

---

### **F5: Request Coordination & Caching Service**

**Location:** `src/framework/core/services/`

**Deliverables:**
1. `request-coordinator.service.ts` - Caching + deduplication
2. Configurable TTL
3. Retry logic with exponential backoff
4. Cache invalidation strategies

**Key Interfaces:**
```typescript
@Injectable({ providedIn: 'root' })
export class RequestCoordinatorService {
  coordinate<T>(
    cacheKey: string,
    request: () => Observable<T>,
    options?: CoordinationOptions
  ): Observable<T>;

  invalidateCache(pattern?: string): void;
  clearCache(): void;
}

export interface CoordinationOptions {
  ttl?: number;
  retries?: number;
  deduplication?: boolean;
}
```

**Success Criteria:**
- Works with any data type
- Caching reduces redundant API calls
- Deduplication prevents parallel identical requests
- Retry logic handles transient failures

---

## Validation Checklist (Run After Each Milestone)

### **Before Committing:**

```bash
# 1. Linting passes
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"

# 2. Dev server compiles
# Check http://localhost:4204 - should compile successfully

# 3. Domain contamination audit (framework milestones only)
grep -ri "vehicle\|manufacturer\|vin\|automobile" src/framework/
# Should return nothing (exit code 1)

# 4. TypeScript compiles
podman exec generic-frontend-dev bash -c "cd /app && ng build --configuration development"
```

### **After Tier 1 Complete (F2-F5):**

- [ ] Container runs successfully
- [ ] Dev server accessible at http://localhost:4204
- [ ] URL state management works
- [ ] Generic ResourceManagementService compiles with any type args
- [ ] API service makes typed requests
- [ ] Request coordination caches responses
- [ ] Zero domain-specific terms in `src/framework/`
- [ ] Linting passes
- [ ] Tagged: `tier-1-core-infrastructure`

---

## Common Pitfalls to Avoid

### **1. Domain Contamination**
```typescript
// ❌ WRONG
class ResourceManagementService {
  private vehicles$: BehaviorSubject<any[]>;  // "vehicles" is domain-specific!
}

// ✅ CORRECT
class ResourceManagementService<TData> {
  private data$: BehaviorSubject<TData[]>;  // Generic!
}
```

### **2. Hard-Coded Configuration**
```typescript
// ❌ WRONG
class BaseDataTableComponent {
  columns = [{ field: 'manufacturer', header: 'Manufacturer' }];  // Hard-coded!
}

// ✅ CORRECT
class BaseDataTableComponent<TData> {
  @Input() columns: TableColumn<TData>[];  // Configured!
}
```

### **3. Running Commands on Host**
```bash
# ❌ WRONG: Running on Thor directly
npm install some-package

# ✅ CORRECT: Running in container
podman exec generic-frontend-dev bash -c "cd /app && npm install some-package"
```

---

## Quick Command Reference

```bash
# Start session
cd ~/projects/generic
git status  # Should be on 'develop'
podman ps | grep generic-frontend-dev  # Should be running

# Start dev server if needed
podman exec generic-frontend-dev bash -c "cd /app && ng serve --host 0.0.0.0 --port 4204" &

# Generate files
podman exec generic-frontend-dev bash -c "cd /app && ng g service framework/core/services/api"
podman exec generic-frontend-dev bash -c "cd /app && ng g interface framework/core/interfaces/api-adapter"

# Test
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"
curl -s http://localhost:4204 > /dev/null && echo "Dev server OK" || echo "Dev server DOWN"

# Commit (see Git Workflow section for full commit message template)
git add .
git commit -m "F2: Generic API Service [details...]"

# Merge to develop
git checkout develop
git merge milestone/F2-generic-api --no-ff
git branch -d milestone/F2-generic-api
```

---

## Project Philosophy

> **"Configuration over code. Generic over specific. Reusable over custom."**

If you find yourself writing domain-specific logic in the framework layer, **stop and refactor to make it generic**.

> **"Thor stays pristine. All commands run in the container."**

If you're about to run `npm` or `ng` directly, **stop and run it via `podman exec` instead**.

> **"URL is the source of truth. All state derives from URL."**

The URL-first paradigm means state synchronizes TO the URL, and the URL is the canonical source.

---

## Success Metrics

The framework is successful if:

1. ✅ **No domain terms in framework code**: `grep -r "vehicle" src/framework/` returns nothing
2. ✅ **Type-safe**: TypeScript enforces correct usage across all domains
3. ✅ **Configuration-driven**: 90%+ of domain specifics are in config files, not code
4. ✅ **Reusable**: Can add agriculture domain in < 1 week with ZERO framework changes

---

## Accessing the Application

- **Dev Server:** http://localhost:4204
- **Dev Server (hostname):** http://thor:4204

---

## What to Build Next

**Start with Milestone F2: Generic API Service**

1. Create milestone branch: `git checkout -b milestone/F2-generic-api`
2. Generate service: `podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/api"`
3. Implement generic API service with full type safety
4. Create interfaces for ApiResponse, ApiRequest
5. Test, lint, commit, merge to develop
6. Move to F3 (URL State Management)

**Remember:** Run ALL `ng` and `npm` commands in the container!

---

**Good luck continuing the framework! 🚀**

The foundation is solid. Tier 1 will build the critical infrastructure for state management and data flow.
