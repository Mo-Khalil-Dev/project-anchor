# Why Wrap Axios (or Any HTTP Client) Behind a Wrapper

## The Core Idea

Your application code should not depend on Axios. It should depend on an interface — a thin contract that says "I can make HTTP requests." `httpService` is that contract. Axios is the implementation detail behind it.

```
UI hooks → services → httpService → axios
                                 ↑
                        swap this without touching anything above
```

---

## Advantages

### 1. Vendor independence

Axios is a dependency. Dependencies change, get deprecated, or get replaced by better tools. If your services call `axiosInstance.get()` directly, migrating to `fetch`, `ky`, or `wretch` means touching every service file. With a wrapper, you change one file:

```ts
// httpService.ts — the only file that imports axios
export const httpService = {
  get: <T>(url: string, config?) =>
    axiosInstance.get<T>(url, config).then(r => r.data),
};
```

Switching to native `fetch` tomorrow means rewriting this file only. Every service, hook, and test above it is untouched.

---

### 2. One place to add cross-cutting behaviour

Without a wrapper, cross-cutting concerns get duplicated across every call site or require monkey-patching axios interceptors (which are hard to test and reason about). With a wrapper, you add them once:

```ts
export const httpService = {
  get: async <T>(url: string, config?) => {
    const start = Date.now();
    try {
      const res = await axiosInstance.get<T>(url, config);
      logger.info(`GET ${url} — ${Date.now() - start}ms`);
      return res.data;
    } catch (err) {
      logger.error(`GET ${url} failed`, err);
      throw err;
    }
  },
};
```

Common additions handled in one place:
- Request/response logging
- Performance timing
- Auth token injection
- Retry logic with backoff
- Global error normalisation (e.g. turning 401 into a redirect)

---

### 3. Cleaner service signatures

Axios returns `AxiosResponse<T>` — a wrapper around the data with `status`, `headers`, `config`, and more. Most callers only want `response.data`. The wrapper strips that noise:

```ts
// Without wrapper — every service does this
const response = await axiosInstance.get<ApiResponse<Assessment>>(url);
return response.data; // unwrap manually every time

// With wrapper — httpService.get returns T directly
const data = await httpService.get<ApiResponse<Assessment>>(url);
```

Services stay focused on domain logic, not HTTP plumbing.

---

### 4. Easier, more honest testing

When services call `axiosInstance.get()`, tests must mock the axios module — an implementation detail. When services call `httpService.get()`, tests mock the wrapper — the actual contract the service depends on.

```ts
// Honest: mock what the service actually uses
vi.mock('@/api/httpService', () => ({
  httpService: { get: vi.fn() },
}));

// Leaky: mock an implementation detail
vi.mock('axios');
```

The first approach keeps tests decoupled from the HTTP library. Swapping axios doesn't break any tests.

---

### 5. Type safety without Axios types leaking out

Without a wrapper, `AxiosRequestConfig`, `AxiosResponse`, and `AxiosError` spread through your codebase. Services start importing Axios types. Hooks that call services start seeing Axios error shapes. The wrapper contains all Axios types inside `httpService.ts`:

```ts
// AxiosRequestConfig stays inside httpService.ts
import { AxiosRequestConfig } from 'axios';

export const httpService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => ...
};
```

Everything above `httpService` uses plain TypeScript types. If you swap Axios, nothing above this file needs updating — not even the type imports.

---

## What the Wrapper Is Not

- **Not a service.** It knows nothing about your domain. It has no concept of assessments, customers, or payment plans.
- **Not a replacement for interceptors.** Axios interceptors still handle things like token refresh. The wrapper sits above them.
- **Not an abstraction for its own sake.** The value is proportional to how much you want to insulate the rest of the app from the HTTP library and how many cross-cutting concerns you need.

---

## Summary

| Concern | Without wrapper | With wrapper |
|---|---|---|
| Swap HTTP library | Touch every service | Touch one file |
| Add logging / retries | Interceptors or duplication | One place |
| Service return types | `AxiosResponse<T>` everywhere | Plain `T` |
| Testing | Mock axios internals | Mock the contract |
| Axios types in codebase | Spread everywhere | Contained in one file |
