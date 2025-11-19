# Session 03: Complete Tier 1 - Core Framework Infrastructure

**Session Goal**: Complete the final milestone (F5) of Tier 1 and tag the framework as `tier-1-core-infrastructure`.

---

## Current Status

### ✅ Completed: Tier 0 - Foundation (Week 1)

**Milestone F1: Project Foundation & Framework Structure** - COMPLETE ✔
- Angular 14 project at `~/projects/generic`
- Docker container running (`generic-frontend-dev`)
- Three-layer architecture established
- PrimeNG + Plotly.js integrated
- ESLint enforcing domain-agnostic naming
- Git repository on `develop` branch
- Tagged: `tier-0-foundation`

### ✅ Completed: Tier 1 - Core Infrastructure (Weeks 2-4) - 3 of 4 Milestones

**Milestone F2: Generic API Service** - COMPLETE ✔
- Location: [src/app/framework/core/services/api.service.ts](src/app/framework/core/services/api.service.ts)
- Deliverables:
  * Generic `ApiService` with full CRUD operations (GET, POST, PUT, PATCH, DELETE)
  * `ApiResponse<TData, TStatistics>` interface
  * `ApiRequest` interface with flexible configuration
  * `ApiErrorResponse` interface
  * HTTP interceptors: `ApiErrorInterceptor`, `LoadingInterceptor`
- Commit: `39e129f` - Merge milestone/F2-generic-api into develop
- Files: 10 files, +614 insertions

**Milestone F3: URL State Management Service** - COMPLETE ✔ ⚠️ CRITICAL
- Location: [src/app/framework/core/services/url-state.service.ts](src/app/framework/core/services/url-state.service.ts)
- Deliverables:
  * `UrlStateService` with bidirectional URL ↔ State sync
  * `UrlSerializer` utility for parameter encoding/decoding
  * Observable-based reactive API
  * Browser history integration (back/forward)
  * Cross-route parameter persistence
- Commit: `4bb1829` - Merge milestone/F3-url-state-management into develop
- Files: 5 files, +563 insertions

**Milestone F4: Generic Resource Management Service** - COMPLETE ✔ ⚠️ CRITICAL
- Location: [src/app/framework/core/services/resource-management.service.ts](src/app/framework/core/services/resource-management.service.ts)
- Deliverables:
  * `ResourceManagementService<TFilters, TData, TStatistics>` - THE HEART OF THE FRAMEWORK
  * `IFilterUrlMapper<TFilters>` interface
  * `IApiAdapter<TFilters, TData, TStatistics>` interface
  * `ICacheKeyBuilder<TFilters>` interface
  * `ResourceState<TFilters, TData, TStatistics>` interface
  * `ResourceManagementConfig<TFilters, TData, TStatistics>` interface
  * Full URL-first paradigm implementation
  * Reactive state management: `filters$`, `data$`, `statistics$`, `loading$`, `error$`
  * Automatic URL synchronization and data fetching
- Commit: `7c37fd9` - Merge milestone/F4-resource-management into develop
- Files: 10 files, +755 insertions

**Current Build Stats:**
- Dev server: http://localhost:4204
- Main.js: 110.52 kB
- Total bundle: ~2.43 MB
- All validation checks passing ✅

---

## Next Steps: Complete Tier 1

### **F5: Request Coordination & Caching Service** (Week 4) 🎯 FINAL TIER 1 MILESTONE

**Location:** `src/framework/core/services/`

**Deliverables:**
1. `request-coordinator.service.ts` - Request coordination with caching and deduplication
2. Configurable TTL (time-to-live) for cached responses
3. Retry logic with exponential backoff
4. Request deduplication (prevent duplicate API calls)
5. Cache invalidation strategies

**Key Features to Implement:**
```typescript
@Injectable({ providedIn: 'root' })
export class RequestCoordinatorService {
  /**
   * Execute a request with coordination (caching + deduplication)
   */
  execute<T>(
    cacheKey: string,
    request: () => Observable<T>,
    options?: CoordinationOptions
  ): Observable<T>;

  /**
   * Get loading state for a specific request
   */
  getLoadingState$(cacheKey: string): Observable<RequestState>;

  /**
   * Get global loading state (any request loading)
   */
  getGlobalLoading$(): Observable<boolean>;

  /**
   * Invalidate cache by key or pattern
   */
  invalidateCache(pattern?: string): void;

  /**
   * Clear all cached responses
   */
  clearCache(): void;

  /**
   * Cancel a specific request or all requests
   */
  cancel(cacheKey?: string): void;
}

export interface CoordinationOptions {
  ttl?: number;              // Cache time-to-live in ms
  retries?: number;          // Number of retry attempts
  deduplication?: boolean;   // Enable request deduplication
  skipCache?: boolean;       // Force fresh request
}

export interface RequestState {
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}
```

**Success Criteria:**
- ✅ Caching reduces redundant API calls
- ✅ Deduplication prevents parallel identical requests
- ✅ Retry logic handles transient failures with exponential backoff
- ✅ Works with any data type (fully generic)
- ✅ Observable-based API for reactive integration
- ✅ Linting passes
- ✅ Zero domain-specific terms

**Reference Implementation:**
- Study: `~/projects/auto-generic/frontend/src/app/core/services/request-coordinator.service.ts`
- Extract patterns, make fully generic
- Integrate with F4 (ResourceManagementService will use this)

**After F5 completion:**
```bash
cd ~/projects/generic
git tag -a tier-1-core-infrastructure -m "Tier 1: Core Framework Infrastructure Complete (F2-F5)"
git push origin tier-1-core-infrastructure
```

---

## Framework Architecture Overview

### **The Three Layers:**

```
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (src/app/)                               │
│  - Feature modules                                          │
│  - Domain-specific components                               │
│  - Routes and navigation                                    │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN CONFIGURATION LAYER (src/domain-config/)            │
│  - Domain-specific adapters (IApiAdapter, IFilterUrlMapper) │
│  - Domain models and types                                  │
│  - Filter configurations                                    │
│  - Cache key builders                                       │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  FRAMEWORK LAYER (src/framework/) - DOMAIN-AGNOSTIC         │
│  ✅ F2: ApiService - HTTP abstraction                       │
│  ✅ F3: UrlStateService - URL state management              │
│  ✅ F4: ResourceManagementService - State orchestration     │
│  🔜 F5: RequestCoordinatorService - Caching & coordination  │
│  🔜 F7-F19: UI Components, Charts, Tables, Pickers          │
└─────────────────────────────────────────────────────────────┘
```

### **How F2, F3, F4 Work Together:**

```
┌──────────────────────────────────────────────────────────────────┐
│  URL-First Data Flow (The Heart of the Framework)               │
└──────────────────────────────────────────────────────────────────┘

User Action (e.g., filter change)
    ▼
ResourceManagementService.updateFilters()
    ▼
IFilterUrlMapper.filtersToParams() ← Domain-specific adapter
    ▼
UrlStateService.replaceParams() ← F3
    ▼
Angular Router (URL changes)
    ▼
NavigationEnd event
    ▼
ResourceManagementService.watchUrlChanges() ← F4
    ▼
IFilterUrlMapper.paramsToFilters() ← Domain-specific adapter
    ▼
ResourceManagementService.fetchData()
    ▼
IApiAdapter.fetchData(filters) ← Domain-specific adapter
    ▼
ApiService.get<TData, TStatistics>() ← F2
    ▼
HTTP Request → Backend API
    ▼
ApiResponse<TData, TStatistics>
    ▼
ResourceManagementService updates state
    ▼
Observables emit: data$, statistics$, loading$, error$
    ▼
Components update (Angular Change Detection)
```

### **Key Interfaces (F4):**

All domain logic is injected via these interfaces:

```typescript
// Convert between typed filters and URL parameters
interface IFilterUrlMapper<TFilters> {
  filtersToParams(filters: TFilters): Params;
  paramsToFilters(params: Params): TFilters;
}

// Abstract API calls for any domain
interface IApiAdapter<TFilters, TData, TStatistics> {
  fetchData(filters: TFilters): Observable<ApiResponse<TData, TStatistics>>;
  fetchRelatedData?(page: number, size: number): Observable<any>;
  fetchInstances?(resourceId: string, count: number): Observable<any>;
}

// Build unique cache keys for request coordination
interface ICacheKeyBuilder<TFilters> {
  buildKey(filters: TFilters): string;
}
```

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

# Generate service
podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/request-coordinator --skip-tests"

# Generate interface
podman exec generic-frontend-dev bash -c "cd /app && ng generate interface framework/core/models/request-state"

# Build project
podman exec generic-frontend-dev bash -c "cd /app && ng build --configuration development"

# Install packages (if needed)
podman exec generic-frontend-dev bash -c "cd /app && npm install <package-name>"

# Interactive shell (for multiple commands)
podman exec -it generic-frontend-dev bash
# Then inside container:
cd /app
ng serve --host 0.0.0.0 --port 4204
```

---

## Git Workflow for Each Milestone

### **Standard Milestone Workflow**

```bash
# 1. Start milestone (example: F5)
cd ~/projects/generic
git checkout develop
git checkout -b milestone/F5-request-coordination

# 2. Do work (generate files, implement, test)
podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/request-coordinator --skip-tests"
# ... implement the service ...

# 3. Test your work
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"
podman exec generic-frontend-dev bash -c "cd /app && ng build --configuration development"
# Check dev server: http://localhost:4204

# 4. Domain contamination audit
grep -riw "vehicle\|manufacturer\|automobile\|bodyClass\|body_class\|dealer\|inventory" ~/projects/generic/src/app/framework/
# Should return nothing

# 5. Commit changes
git add .
git commit -m "$(cat <<'EOF'
F5: Request Coordination & Caching Service

Deliverables:
- RequestCoordinatorService with caching and deduplication
- Configurable TTL for cached responses
- Retry logic with exponential backoff
- Request cancellation support
- Global and per-request loading states

Success criteria met:
- Caching reduces redundant API calls
- Deduplication prevents parallel identical requests
- Retry logic handles transient failures
- Linting passes
- Build succeeds

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 6. Merge to develop
git checkout develop
git merge milestone/F5-request-coordination --no-ff -m "Merge milestone/F5-request-coordination into develop"

# 7. Delete milestone branch
git branch -d milestone/F5-request-coordination

# 8. Tag Tier 1 complete
git tag -a tier-1-core-infrastructure -m "Tier 1: Core Framework Infrastructure Complete (F2-F5)"
```

---

## Critical Architectural Constraints

### **1. NO Domain-Specific Terms in Framework**

**ESLint is configured to prevent this!** Run `npm run lint` frequently.

**Forbidden in `src/framework/`:**
- ❌ vehicle, automobile, car, auto
- ❌ manufacturer, make, model (when referring to automotive)
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
grep -riw "vehicle\|manufacturer\|vin\|automobile\|car\|auto\|bodyClass\|body_class\|dealer\|inventory" src/app/framework/

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
class RequestCoordinatorService {
  execute<T>(
    cacheKey: string,
    request: () => Observable<T>,
    options?: CoordinationOptions
  ): Observable<T> {
    // Implementation
  }
}
```

---

## Validation Checklist (Run After Each Milestone)

### **Before Committing:**

```bash
# 1. Linting passes
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"

# 2. Dev server compiles
# Check http://localhost:4204 - should compile successfully

# 3. Domain contamination audit (framework milestones only)
grep -riw "vehicle\|manufacturer\|vin\|automobile\|bodyClass\|body_class\|dealer\|inventory" src/app/framework/
# Should return nothing (exit code 1)

# 4. TypeScript compiles
podman exec generic-frontend-dev bash -c "cd /app && ng build --configuration development"
```

### **After Tier 1 Complete (F2-F5):**

- [ ] Container runs successfully
- [ ] Dev server accessible at http://localhost:4204
- [ ] F2: API service makes typed requests ✅
- [ ] F3: URL state management works ✅
- [ ] F4: ResourceManagementService orchestrates everything ✅
- [ ] F5: Request coordination caches responses 🔜
- [ ] Zero domain-specific terms in `src/framework/`
- [ ] Linting passes
- [ ] Tagged: `tier-1-core-infrastructure`

---

## Reference Documents

### **Primary References**
- **This file** - Current status and immediate next steps
- **[SESSION-02.md](SESSION-02.md)** - Previous session context
- **[MILESTONES-FRAMEWORK.md](MILESTONES-FRAMEWORK.md)** - Detailed milestone requirements

### **Reference Implementation**
- **`~/projects/auto-generic/`** - Existing automobile implementation
  - ✅ **DO**: Study patterns, understand RxJS usage, learn architecture
  - ❌ **DON'T**: Copy-paste without removing domain terms
  - Key files for F5:
    * `frontend/src/app/core/services/request-coordinator.service.ts`

---

## Common Pitfalls to Avoid

### **1. Domain Contamination**
```typescript
// ❌ WRONG
class RequestCoordinatorService {
  private vehicleCache = new Map();  // "vehicle" is domain-specific!
}

// ✅ CORRECT
class RequestCoordinatorService {
  private cache = new Map<string, any>();  // Generic!
}
```

### **2. Hard-Coded Configuration**
```typescript
// ❌ WRONG
class RequestCoordinatorService {
  private defaultTTL = 30000;  // Hard-coded!
}

// ✅ CORRECT
class RequestCoordinatorService {
  constructor(private config: CoordinatorConfig) {
    this.defaultTTL = config.ttl || 30000;  // Configured!
  }
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

# Generate files for F5
podman exec generic-frontend-dev bash -c "cd /app && ng g service framework/core/services/request-coordinator --skip-tests"
podman exec generic-frontend-dev bash -c "cd /app && ng g interface framework/core/models/request-state"

# Test
podman exec generic-frontend-dev bash -c "cd /app && npm run lint"
curl -s http://localhost:4204 > /dev/null && echo "Dev server OK" || echo "Dev server DOWN"

# Commit (see Git Workflow section for full commit message template)
git add .
git commit -m "F5: Request Coordination & Caching Service [details...]"

# Merge to develop
git checkout develop
git merge milestone/F5-request-coordination --no-ff
git branch -d milestone/F5-request-coordination

# Tag Tier 1 complete
git tag -a tier-1-core-infrastructure -m "Tier 1: Core Framework Infrastructure Complete (F2-F5)"
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

1. ✅ **No domain terms in framework code**: `grep -r "vehicle" src/app/framework/` returns nothing
2. ✅ **Type-safe**: TypeScript enforces correct usage across all domains
3. ✅ **Configuration-driven**: 90%+ of domain specifics are in config files, not code
4. ✅ **Reusable**: Can add agriculture domain in < 1 week with ZERO framework changes

---

## What to Build Next

**Start with Milestone F5: Request Coordination & Caching Service**

This is the FINAL milestone to complete Tier 1!

1. Create milestone branch: `git checkout -b milestone/F5-request-coordination`
2. Generate service: `podman exec generic-frontend-dev bash -c "cd /app && ng generate service framework/core/services/request-coordinator --skip-tests"`
3. Study reference implementation: `~/projects/auto-generic/frontend/src/app/core/services/request-coordinator.service.ts`
4. Implement generic request coordination with:
   - Response caching with configurable TTL
   - Request deduplication (prevent parallel identical requests)
   - Retry logic with exponential backoff
   - Global and per-request loading states
   - Cache invalidation
   - Request cancellation
5. Test, lint, commit, merge to develop
6. Tag: `tier-1-core-infrastructure`

**Remember:** Run ALL `ng` and `npm` commands in the container!

---

## After F5 Completion

Once F5 is complete and merged:

```bash
# Tag Tier 1 as complete
cd ~/projects/generic
git tag -a tier-1-core-infrastructure -m "Tier 1: Core Framework Infrastructure Complete (F2-F5)"

# Celebrate! 🎉
echo "🎉 Tier 1 Complete! The framework core is SOLID!"
```

**Then move to Tier 2:**
- F6: Advanced State Management Features
- F7-F10: UI Component Layer (Tables, Pickers, Charts, Filters)

---

## Accessing the Application

- **Dev Server:** http://localhost:4204
- **Dev Server (hostname):** http://thor:4204

---

## Current Project State

**Branch:** `develop`
**Latest Commit:** `7c37fd9` - Merge milestone/F4-resource-management into develop
**Container:** `generic-frontend-dev` (running on port 4204)
**Build Status:** ✅ All checks passing
**Main.js Size:** 110.52 kB
**Total Bundle:** ~2.43 MB

**Milestones Complete:** F1, F2, F3, F4 (4/5 in Tier 1)
**Next Milestone:** F5 - Request Coordination & Caching Service 🎯

---

**Good luck completing Tier 1! You're ONE milestone away from a fully functional framework core! 🚀**

The foundation (F1), API layer (F2), URL state management (F3), and resource orchestration (F4) are all SOLID. F5 will add the final polish with caching and coordination!
