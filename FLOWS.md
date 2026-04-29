# System Flows

End-to-end traces for the five most complex flows in PROJECT BRIDGE. Each section has a plain-English walkthrough followed by a Mermaid sequence diagram with file references.

---

## Table of Contents

1. [Sign-In (OAuth)](#1-sign-in-oauth)
2. [Sign-In (Mock / Dev)](#2-sign-in-mock--dev)
3. [Session Restore on Page Load](#3-session-restore-on-page-load)
4. [Journey Selection After Auth](#4-journey-selection-after-auth)
5. [Bank Connection (Tink OAuth)](#5-bank-connection-tink-oauth)
6. [Assessment Polling](#6-assessment-polling)
7. [Silent Token Refresh (401 Interceptor)](#7-silent-token-refresh-401-interceptor)

---

## 1. Sign-In (OAuth)

**What happens:**
User clicks "Sign In". The frontend asks the backend for a login URL, redirects the browser to the OAuth provider (Cognito), and waits. When the provider redirects back to `/auth/callback`, the frontend exchanges the code for tokens, stores them in Redux, then asks the backend which page the user should see next.

**Key files:**
- `frontend/src/journeys/Login/useLoginPage.ts` — initiates login
- `frontend/src/hooks/useAuth.ts` — calls `authService.initiateLogin()`
- `frontend/src/services/authService.ts` — `GET /auth/initiate-login`
- `frontend/src/journeys/Auth/useAuthCallback.ts` — handles the redirect back
- `frontend/src/services/redirectService.ts` — `GET /auth/redirect-to-journey`
- `backend/src/application/use-cases/auth/InitiateLoginUseCase.ts`
- `backend/src/application/use-cases/auth/HandleAuthCallbackUseCase.ts`
- `backend/src/application/services/TokenService.ts`

```mermaid
sequenceDiagram
    actor User
    participant LP as LoginPage<br/>(useLoginPage.ts)
    participant Auth as useAuth.ts
    participant AS as authService.ts
    participant BE as Backend /auth
    participant OP as OAuth Provider<br/>(Cognito)
    participant AC as AuthCallback<br/>(useAuthCallback.ts)
    participant RS as redirectService.ts

    User->>LP: clicks "Sign In"
    LP->>Auth: initiateLogin()
    Auth->>AS: authService.initiateLogin()
    AS->>BE: GET /auth/initiate-login
    BE-->>AS: { loginUrl, state }
    AS-->>Auth: { loginUrl, state }
    Auth-->>LP: { loginUrl, state }
    LP->>OP: window.location.href = loginUrl

    Note over OP: User authenticates<br/>with OAuth provider

    OP->>AC: redirect to /auth/callback?code=...&state=...
    AC->>Auth: handleCallback(code, state)
    Auth->>AS: authService.handleCallback(code, state)
    AS->>BE: GET /auth/callback?code=...&state=...
    BE->>OP: exchange code for tokens
    OP-->>BE: { accessToken, refreshToken, user }
    BE->>BE: store refreshToken hash in DB<br/>(TokenService.issueTokens)
    BE-->>AS: { accessToken, expiresIn, user }
    AS-->>Auth: unwrapped result
    Auth->>Auth: dispatch(setUser(user))<br/>dispatch(setAccessToken(token))

    AC->>RS: redirectService.getRedirectToJourney()
    RS->>BE: GET /auth/redirect-to-journey
    BE-->>RS: { nextPage, reason }
    RS-->>AC: { nextPage }
    AC->>AC: navigate(nextPage, { replace: true })
```

---

## 2. Sign-In (Mock / Dev)

**What happens:**
Development-only shortcut. The user types an email and clicks "Mock Login". The frontend base64-encodes the email as a fake `code` and navigates directly to `/auth/callback` with `state=mock`, skipping the OAuth provider entirely. The rest of the callback flow is identical to real OAuth.

**Key files:**
- `frontend/src/journeys/Login/useLoginPage.ts` — `handleMockLogin()`
- `frontend/src/journeys/Auth/useAuthCallback.ts` — same callback handler as OAuth
- `backend/src/infrastructure/auth/MockAuthProvider.ts` — decodes email from base64

```mermaid
sequenceDiagram
    actor User
    participant LP as LoginPage<br/>(useLoginPage.ts)
    participant AC as AuthCallback<br/>(useAuthCallback.ts)
    participant Auth as useAuth.ts
    participant AS as authService.ts
    participant BE as Backend /auth<br/>(MockAuthProvider)
    participant RS as redirectService.ts

    User->>LP: types email, clicks "Mock Login"
    LP->>LP: code = btoa(email)
    LP->>AC: navigate('/auth/callback?code=<b64>&state=mock')

    AC->>Auth: handleCallback(code, 'mock')
    Auth->>AS: authService.handleCallback(code, 'mock')
    AS->>BE: GET /auth/callback?code=<b64>&state=mock
    BE->>BE: MockAuthProvider: atob(code) → email<br/>find or create user by email<br/>sign JWT with config.auth.jwtSecret
    BE-->>AS: { accessToken, expiresIn, user }
    AS-->>Auth: unwrapped result
    Auth->>Auth: dispatch(setUser(user))<br/>dispatch(setAccessToken(token))

    AC->>RS: redirectService.getRedirectToJourney()
    RS->>BE: GET /auth/redirect-to-journey
    BE-->>RS: { nextPage, reason }
    AC->>AC: navigate(nextPage, { replace: true })
```

---

## 3. Session Restore on Page Load

**What happens:**
When the user refreshes the page or opens a protected URL directly, the access token is gone from Redux (in-memory only). `ProtectedRoute` fires one refresh attempt using the httpOnly cookie that the browser sends automatically. If the refresh succeeds the user sees their page; if it fails they are sent to `/login`.

**Key files:**
- `frontend/src/components/auth/ProtectedRoute.tsx`
- `frontend/src/services/authService.ts` — `refreshToken()`
- `backend/src/presentation/routes/auth.routes.ts` — `GET /auth/refresh`
- `backend/src/application/services/TokenService.ts` — `refreshAccessToken()`

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant PR as ProtectedRoute.tsx
    participant AS as authService.ts
    participant BE as Backend /auth/refresh
    participant Redux as Redux store

    User->>Browser: opens /assessment/abc (or refreshes)
    Browser->>PR: mount — isAuthenticated = false
    PR->>PR: show loading spinner
    PR->>AS: authService.refreshToken()
    AS->>BE: GET /auth/refresh<br/>(browser auto-sends httpOnly cookie)

    alt refresh token valid
        BE->>BE: TokenService: hash lookup,<br/>check revokedAt + expiresAt
        BE-->>AS: { accessToken, expiresIn }
        AS-->>PR: new accessToken
        PR->>Redux: dispatch(setAccessToken(token))
        PR->>PR: setRestoreAttempted(true)
        PR->>Browser: render <Outlet /> (protected content)
    else refresh token missing or expired
        BE-->>AS: 401
        AS-->>PR: throws
        PR->>PR: setRestoreAttempted(true)
        PR->>Browser: <Navigate to="/login" replace />
    end
```

---

## 4. Journey Selection After Auth

**What happens:**
After every successful auth callback (OAuth or mock), the frontend calls `GET /auth/redirect-to-journey`. The backend inspects the user's state in the database and returns the right page. This is the single decision point that routes users to the correct place.

**Key files:**
- `frontend/src/journeys/Auth/useAuthCallback.ts` — calls `redirectService`
- `frontend/src/services/redirectService.ts`
- `backend/src/presentation/controllers/AuthController.ts` — `getRedirectToJourney()`

```mermaid
flowchart TD
    A[Auth callback completes\nRedux has user + accessToken] --> B
    B["GET /auth/redirect-to-journey"] --> C{Does user have\na Customer record?}

    C -- No --> D["/account-setup\nReason: no_customer_record"]
    C -- Yes --> E{Does customer have\na BankConnection?}

    E -- No --> F["/\nReason: no_bank_connection\nHome → connect bank"]
    E -- Yes --> G{Assessment exists?}

    G -- No --> H["/bank-connection\nReason: no_assessment"]
    G -- Yes, PENDING or\nCOMPLETED --> I["/assessment/:assessmentId\nReason: assessment_exists"]
    G -- FAILED --> J["/\nReason: assessment_failed\nHome → retry"]
```

> **Note:** The exact branching logic lives in the backend controller. The frontend receives only `nextPage` (a URL string) and `reason` (a string label) — it does not reimplement any of this logic.

---

## 5. Bank Connection (Tink OAuth)

**What happens:**
The most complex customer-facing flow. It has two separate HTTP round-trips separated by a full browser redirect to Tink's UI. The frontend tracks progress with a Redux state machine (`bankJourneyState`).

**States:** `intro → privacy → youAreBeingDirected → [Tink UI] → connecting → success | error`

**Key files:**
- `frontend/src/journeys/BankConnection/BankConnectionRoot.tsx` — state machine renderer + OAuth callback detection
- `frontend/src/journeys/BankConnection/hooks/useBankConnection.ts` — `initiateBank()`, `handleCallback()`
- `frontend/src/services/bankConnectionService.ts`
- `backend/src/application/use-cases/InitiateBankOAuthUseCase.ts`
- `backend/src/application/use-cases/HandleBankOAuthCallbackUseCase.ts`
- `backend/src/infrastructure/services/TinkOAuthService.ts`
- `backend/src/infrastructure/services/BankDataExtractionService.ts`

```mermaid
sequenceDiagram
    actor User
    participant Home
    participant BCR as BankConnectionRoot.tsx<br/>(state machine)
    participant Hook as useBankConnection.ts
    participant BCS as bankConnectionService.ts
    participant BE as Backend /bank-connections
    participant Tink as Tink API

    User->>Home: clicks "Connect Your Bank Account"
    Home->>Home: dispatch(setCurrentStep('bank-connection'))
    Home->>BCR: navigate('/bank-connection')

    Note over BCR: journeyState = null → <Intro />
    User->>BCR: reads intro, clicks proceed
    BCR->>BCR: setBankJourneyState('privacy') → <Privacy />
    User->>BCR: accepts privacy notice

    BCR->>Hook: initiateBank()
    Hook->>BCS: bankConnectionService.initiate()
    BCS->>BE: POST /bank-connections/initiate
    BE->>BE: create Customer + BankConnection records
    BE->>Tink: POST /oauth/token (client credentials)
    Tink-->>BE: { access_token }
    BE->>Tink: POST /expense-checks (create expense check)
    Tink-->>BE: { authorizationUrl, state }
    BE-->>BCS: { authUrl, state }
    BCS-->>Hook: unwrapped { authUrl, state }
    Hook->>Hook: dispatch(setBankConnectionData({ authUrl, state }))
    Hook->>Hook: dispatch(setBankJourneyState('youAreBeingDirected'))

    BCR->>BCR: renders <YouAreBeingDirected />
    Note over BCR: screen shows redirect message
    BCR->>Tink: window.location.href = authUrl

    Note over Tink: User links bank account<br/>in Tink UI (2–3 min)

    Tink->>BCR: redirect to /bank-connection?expense_check_id=...&state=...
    BCR->>BCR: useEffect detects expense_check_id in URL
    BCR->>BCR: dispatch(setBankJourneyState('connecting'))
    BCR->>Hook: handleCallback(expenseCheckId, state)
    Hook->>BCS: bankConnectionService.callback(expenseCheckId, state)
    BCS->>BE: GET /bank-connections/callback?code=...&state=...
    BE->>BE: validate state matches stored value
    BE->>Tink: GET /expense-checks/:id/report
    Tink-->>BE: income + expense transaction data
    BE->>BE: BankDataExtractionService.extractIncome()<br/>BankDataExtractionService.extractExpenses()
    BE->>BE: Assessment.create(...) → save to DB
    BE-->>BCS: { connectionId, totalIncome, totalExpenses,\nassessmentId, incomeBreakdown, expenseBreakdown }
    BCS-->>Hook: unwrapped result
    Hook->>Hook: dispatch(setBankConnectionData({ connectionId, assessmentId, ... }))
    Hook->>Hook: dispatch(setBankJourneyState('success'))

    BCR->>BCR: renders <Success />
    User->>BCR: clicks "View My Assessment"
    BCR->>BCR: navigate('/assessment/:assessmentId')
```

---

## 6. Assessment Polling

**What happens:**
When the user lands on `/assessment/:assessmentId`, the backend assessment record may still be `PENDING` (the processing job hasn't finished). `useOverview` immediately fetches the assessment and starts a 3-second poll. Once the status becomes `COMPLETED` or `FAILED`, polling stops and the correct view renders.

**Key files:**
- `frontend/src/journeys/Assessment/screens/overview/useOverview.ts`
- `frontend/src/services/assessmentService.ts`
- `backend/src/presentation/controllers/AssessmentController.ts`
- `backend/src/application/services/ProcessAssessmentJobService.ts`

```mermaid
sequenceDiagram
    actor User
    participant OV as Overview.tsx
    participant Hook as useOverview.ts
    participant AS as assessmentService.ts
    participant BE as Backend /assessments/:id

    User->>OV: navigates to /assessment/abc
    OV->>Hook: mount
    Hook->>Hook: setLoading(true)<br/>start setInterval(fetchAssessment, 3000)

    loop every 3 seconds while PENDING
        Hook->>AS: assessmentService.get(assessmentId)
        AS->>BE: GET /assessments/abc
        BE-->>AS: { status: 'PENDING', ... }
        AS-->>Hook: Assessment (PENDING)
        Hook->>Hook: setAssessment(data)
        OV->>User: <AssessmentPendingView /> with spinner
    end

    Note over BE: ProcessAssessmentJobService<br/>finishes calculation

    Hook->>AS: assessmentService.get(assessmentId)
    AS->>BE: GET /assessments/abc

    alt status = COMPLETED
        BE-->>AS: { status: 'COMPLETED', hardshipLevel,\ndisposableIncome, billRatio, ... }
        AS-->>Hook: Assessment (COMPLETED)
        Hook->>Hook: stopPolling()<br/>setLoading(false)
        OV->>User: <CompletedAssessmentView />\n(hardship level, income/expense cards, CTA)
        User->>OV: clicks "Explore Payment Plans"
        OV->>OV: dispatch(setCurrentStep('plan-select'))<br/>navigate('/plan-select')
    else status = FAILED
        BE-->>AS: { status: 'FAILED', ... }
        AS-->>Hook: Assessment (FAILED)
        Hook->>Hook: stopPolling()<br/>setLoading(false)
        OV->>User: error state with retry option
    end
```

---

## 7. Silent Token Refresh (401 Interceptor)

**What happens:**
Access tokens expire after 15 minutes. When any request returns a 401, the axios interceptor silently fetches a new access token using the httpOnly refresh-token cookie and retries the original request — transparently to the calling service or hook. If multiple requests fail simultaneously, they are all queued and retried together once the refresh completes.

**Key files:**
- `frontend/src/api/interceptors.ts` — the entire flow lives here
- `frontend/src/services/authService.ts` — `refreshToken()`
- `backend/src/application/services/TokenService.ts` — validates + rotates token

```mermaid
sequenceDiagram
    participant Hook as Any hook
    participant SVC as Any service
    participant HTTP as httpService.ts
    participant IC as interceptors.ts
    participant BE as Backend
    participant Redux as Redux store

    Hook->>SVC: service.someMethod()
    SVC->>HTTP: httpService.get('/some-endpoint')
    HTTP->>BE: GET /some-endpoint (with expired Bearer token)
    BE-->>IC: 401 Unauthorized

    IC->>IC: is refresh already in progress?

    alt no refresh in progress
        IC->>IC: isRefreshing = true
        IC->>BE: GET /auth/refresh (httpOnly cookie sent automatically)
        BE->>BE: TokenService: hash lookup,\ncheck revokedAt + expiresAt,\nissue new access token
        BE-->>IC: { accessToken }
        IC->>Redux: dispatch(setAccessToken(newToken))
        IC->>IC: processQueue(null, newToken)
        IC->>BE: retry original request with new Bearer token
        BE-->>HTTP: 200 + data
        HTTP-->>SVC: response data
        SVC-->>Hook: unwrapped result
    else refresh already in progress (concurrent request)
        IC->>IC: push { resolve, reject } onto failedQueue
        Note over IC: waits for first refresh to complete
        IC->>BE: retry with new token (from queue resolution)
        BE-->>HTTP: 200 + data
        HTTP-->>SVC: response data
    else refresh fails (token expired or revoked)
        BE-->>IC: 401 on /auth/refresh
        IC->>Redux: dispatch(clearAuth())
        IC->>IC: processQueue(error)
        IC->>IC: window.location.href = '/login'
    end
```

> **Guard against infinite loops:** The interceptor explicitly checks whether the failing request is `/auth/refresh` itself. If it is, the retry logic is skipped — the 401 bubbles up and `clearAuth()` + redirect runs immediately.
