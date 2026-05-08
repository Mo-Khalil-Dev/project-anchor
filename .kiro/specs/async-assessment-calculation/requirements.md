# Requirements Document

## Introduction

This feature implements asynchronous hardship assessment calculation for Project Bridge. When a customer completes bank OAuth, the system creates an Assessment record and dispatches a background job to calculate the customer's disposable income, bill affordability ratio, hardship level, and payment plan options. The system supports two deployment modes: **production mode** (AWS infrastructure — SQS queue + Lambda worker) and **demo mode** (all components run locally in a single process using an in-process job dispatcher with a configurable delay). The calculation result is persisted back to the Assessment record and made available via the reference data API.

## Glossary

- **Assessment**: A domain aggregate that captures a customer's financial snapshot, hardship level, and generated payment plan options.
- **AssessmentJob**: A persistence record that tracks the lifecycle of a single background calculation job (PENDING → SUCCESS | FAILED).
- **Job_Dispatcher**: The component responsible for routing a job to the correct execution backend (SQS in production, in-process in demo mode).
- **ProcessAssessmentJob**: The background job service that reads bank report data, runs hardship calculations, and updates the Assessment.
- **BankDataExtractionService**: The service that parses raw Tink income and expense JSON into structured financial figures.
- **PaymentPlanCalculationService**: The domain service that generates Conservative, Balanced, and Aggressive payment plan options from disposable income and arrears.
- **Hardship_Level**: A classification of bill affordability — NONE (0–5%), LOW (5–10%), MODERATE (10–25%), SEVERE (>25% or disposable ≤ 0).
- **Disposable_Income**: Monthly income minus essential monthly expenses, representing the customer's available budget.
- **Bill_Ratio**: The monthly utility bill expressed as a percentage of Disposable_Income.
- **SQS_Queue**: The AWS Simple Queue Service queue used in production mode to decouple job dispatch from job execution.
- **Local_Job_Dispatcher**: The in-process dispatcher used in demo mode that executes the job via `setImmediate` after a configurable delay.
- **AssessmentReadyForProcessingEvent**: A domain event raised when an Assessment is created and ready for background processing.
- **RUNTIME**: A configuration variable (`local` | `docker` | `ecs`) that determines which deployment mode is active.
- **BankReports**: The persistence record storing raw Tink income and expense JSON for a bank connection.

---

## Requirements

### Requirement 1: Assessment and Job Creation on Bank OAuth Callback

**User Story:** As a customer, I want my financial assessment to be automatically initiated when I complete bank authorisation, so that I do not need to take any additional action to start the calculation.

#### Acceptance Criteria

1. WHEN a customer completes the bank OAuth callback with a valid authorisation code and state token, THE System SHALL create an Assessment record with status `PENDING` and a linked AssessmentJob record with status `PENDING` before returning the callback response.
2. WHEN the Assessment record is created, THE System SHALL persist the customer's raw Tink income JSON and expense JSON to the BankReports table linked to the bank connection.
3. WHEN the Assessment record is created, THE System SHALL store the extracted `monthlyIncome`, `monthlyExpenses`, `monthlyBill`, and `arrears` values on the Assessment record.
4. WHEN the Assessment record is created, THE System SHALL raise an `AssessmentReadyForProcessingEvent` domain event containing the assessment ID.
5. IF the bank OAuth callback fails to create the Assessment record, THEN THE System SHALL return an error response and SHALL NOT create a dangling AssessmentJob record.
6. THE System SHALL return the `assessmentId`, `connectionId`, `totalIncome`, `totalExpenses`, `incomeBreakdown`, and `expenseBreakdown` in the OAuth callback response upon successful Assessment creation.

---

### Requirement 2: Job Dispatch — Production Mode (SQS)

**User Story:** As a platform operator running in production, I want assessment jobs to be dispatched to an SQS queue, so that job execution is decoupled from the HTTP request lifecycle and can be processed by a Lambda worker.

#### Acceptance Criteria

1. WHEN `RUNTIME` is `ecs` and an AssessmentJob is created, THE Job_Dispatcher SHALL send a message to the configured SQS queue containing the `jobId`.
2. WHEN the SQS message is sent successfully, THE Job_Dispatcher SHALL log the `queueUrl` and `jobId` at info level.
3. IF the SQS `sendMessage` call throws an error, THEN THE Job_Dispatcher SHALL propagate the error to the caller without silently swallowing it.
4. THE System SHALL read the SQS queue URL from the application configuration and SHALL NOT hard-code the queue URL in the dispatcher.

---

### Requirement 3: Job Dispatch — Demo Mode (Local In-Process)

**User Story:** As a developer or demo operator running locally, I want assessment jobs to execute in-process after a short delay, so that the full async calculation flow can be demonstrated without any cloud infrastructure.

#### Acceptance Criteria

1. WHEN `RUNTIME` is `local` or `docker` and an AssessmentJob is created, THE Job_Dispatcher SHALL schedule the job for in-process execution using `setImmediate` and SHALL return immediately without blocking the HTTP response.
2. WHEN the Local_Job_Dispatcher executes a job, THE Local_Job_Dispatcher SHALL wait for the configured `delayMs` before calling `ProcessAssessmentJob.execute`.
3. WHEN the Local_Job_Dispatcher completes a job successfully, THE Local_Job_Dispatcher SHALL log the `jobId` at info level with the message `Background local job completed`.
4. IF the Local_Job_Dispatcher job execution throws an unexpected error, THEN THE Local_Job_Dispatcher SHALL log the `jobId` and error message at error level and SHALL NOT crash the host process.
5. THE System SHALL allow the `delayMs` value to be configured at construction time with a default of 35,000 milliseconds.

---

### Requirement 4: Assessment Calculation (ProcessAssessmentJob)

**User Story:** As a customer, I want my hardship level and payment plan options to be calculated from my real bank data, so that I receive an accurate and personalised financial assessment.

#### Acceptance Criteria

1. WHEN `ProcessAssessmentJob.execute` is called with a valid `jobId`, THE ProcessAssessmentJob SHALL fetch the linked AssessmentJob and Assessment records from the database.
2. WHEN the bank report is retrieved, THE ProcessAssessmentJob SHALL parse the raw income JSON and expense JSON using BankDataExtractionService and SHALL store the structured breakdown on the Assessment.
3. WHEN income and expense figures are extracted, THE ProcessAssessmentJob SHALL calculate `disposableIncome` as `monthlyIncome − monthlyExpenses`.
4. WHEN `disposableIncome` is calculated, THE ProcessAssessmentJob SHALL invoke PaymentPlanCalculationService to generate Conservative, Balanced, and Aggressive payment plan options using `disposableIncome`, `arrears`, and `monthlyBill`.
5. WHEN all calculations succeed, THE ProcessAssessmentJob SHALL update the Assessment record with `incomeBreakdown`, `expenseBreakdown`, `expensesByCategory`, `incomeSources`, and `paymentPlans` JSON fields.
6. WHEN all calculations succeed, THE ProcessAssessmentJob SHALL call `CompleteAssessmentUseCase` to transition the Assessment status to `COMPLETED` and raise an `AssessmentCompletedEvent`.
7. WHEN the job completes successfully, THE ProcessAssessmentJob SHALL update the AssessmentJob record to status `SUCCESS` with a `processedAt` timestamp.
8. IF any step in the calculation pipeline fails, THEN THE ProcessAssessmentJob SHALL call `FailAssessmentUseCase` to transition the Assessment status to `FAILED` and SHALL update the AssessmentJob record to status `FAILED` with the error message and an incremented `retryCount`.
9. IF the AssessmentJob record is not found for the given `jobId`, THEN THE ProcessAssessmentJob SHALL return a `Result.fail` with a descriptive error message and SHALL NOT throw an unhandled exception.
10. IF the BankReports record is not found for the Assessment's bank connection, THEN THE ProcessAssessmentJob SHALL mark the Assessment as `FAILED` with error code `BANK_DATA_PROCESSING_FAILED` before returning a failure result.

---

### Requirement 5: Hardship Calculation Rules

**User Story:** As a utility company officer, I want hardship levels to be calculated using the regulatory affordability formula, so that assessments are consistent, auditable, and compliant with support obligations.

#### Acceptance Criteria

1. THE Assessment SHALL calculate `Bill_Ratio` as `(monthlyBill / Disposable_Income) × 100`, rounded to two decimal places.
2. WHEN `Disposable_Income` is less than or equal to zero, THE Assessment SHALL classify `Hardship_Level` as `SEVERE`.
3. WHEN `Bill_Ratio` exceeds 100, THE Assessment SHALL classify `Hardship_Level` as `SEVERE`.
4. WHEN `Bill_Ratio` is greater than 25 and at most 100, THE Assessment SHALL classify `Hardship_Level` as `SEVERE`.
5. WHEN `Bill_Ratio` is greater than 10 and at most 25, THE Assessment SHALL classify `Hardship_Level` as `MODERATE`.
6. WHEN `Bill_Ratio` is greater than 5 and at most 10, THE Assessment SHALL classify `Hardship_Level` as `LOW`.
7. WHEN `Bill_Ratio` is at most 5, THE Assessment SHALL classify `Hardship_Level` as `NONE`.
8. THE Assessment SHALL calculate `Sustainability_Score` as `HIGH` when `Bill_Ratio` is at most 25, `MEDIUM` when `Bill_Ratio` is greater than 25 and at most 100, and `LOW` when `Disposable_Income` is less than or equal to zero or `Bill_Ratio` exceeds 100.

---

### Requirement 6: Payment Plan Generation

**User Story:** As a customer in hardship, I want to be offered three payment plan options at different affordability levels, so that I can choose the plan that best fits my financial situation.

#### Acceptance Criteria

1. WHEN `PaymentPlanCalculationService` is invoked, THE PaymentPlanCalculationService SHALL generate exactly three payment plan options: Conservative, Balanced, and Aggressive.
2. THE Conservative plan SHALL set the monthly payment to `Disposable_Income × 14%`.
3. THE Balanced plan SHALL set the monthly payment to `Disposable_Income × 18%`.
4. THE Aggressive plan SHALL set the monthly payment to `Disposable_Income × 20%`.
5. WHEN `arrears` is greater than zero, THE PaymentPlanCalculationService SHALL include arrears repayment in the plan duration calculation.
6. THE PaymentPlanCalculationService SHALL persist the three plans as a JSON array on the Assessment record under the `paymentPlans` field.

---

### Requirement 7: Assessment Status Lifecycle

**User Story:** As a frontend application, I want to poll the assessment status and receive a clear lifecycle state, so that I can display the correct UI state (loading, complete, or error) to the customer.

#### Acceptance Criteria

1. THE Assessment SHALL support exactly three status values: `PENDING`, `COMPLETED`, and `FAILED`.
2. WHEN an Assessment is first created, THE Assessment SHALL have status `PENDING`.
3. WHEN `CompleteAssessmentUseCase` is executed for an Assessment, THE Assessment SHALL transition to status `COMPLETED` and SHALL raise an `AssessmentCompletedEvent`.
4. WHEN `FailAssessmentUseCase` is executed for an Assessment, THE Assessment SHALL transition to status `FAILED` and SHALL raise an `AssessmentFailedEvent` containing the failure reason and error code.
5. THE AssessmentJob SHALL support exactly three status values: `PENDING`, `SUCCESS`, and `FAILED`.
6. WHEN an AssessmentJob transitions to `FAILED`, THE AssessmentJob SHALL increment `retryCount` by one and SHALL record the `errorMessage`.

---

### Requirement 8: Reference Data API

**User Story:** As a frontend application, I want to retrieve the assessment result via an authenticated API endpoint, so that I can display the customer's financial breakdown and payment plan options.

#### Acceptance Criteria

1. WHEN an authenticated GET request is made to `/api/reference-data`, THE System SHALL return the customer's Assessment data including `status`, `monthlyIncome`, `monthlyExpenses`, `disposableIncome`, `monthlyBill`, `hardshipLevel`, `sustainabilityScore`, `paymentPlans`, `incomeBreakdown`, `expenseBreakdown`, and `expensesByCategory`.
2. WHEN the Assessment status is `PENDING`, THE System SHALL return the Assessment record with status `PENDING` and SHALL NOT return calculated financial fields that have not yet been populated.
3. WHEN the Assessment status is `FAILED`, THE System SHALL return the Assessment record with status `FAILED` so that the frontend can display an appropriate error state.
4. IF no Assessment exists for the authenticated customer, THEN THE System SHALL return a response indicating no assessment is available without returning a 5xx error.
5. THE System SHALL require a valid authentication token for all `/api/reference-data` requests and SHALL return HTTP 401 for unauthenticated requests.

---

### Requirement 9: Deployment Mode Configuration

**User Story:** As a platform operator, I want the job dispatch strategy to be selected automatically based on the runtime environment, so that no code changes are required when switching between demo and production deployments.

#### Acceptance Criteria

1. WHEN `RUNTIME` is `ecs`, THE System SHALL instantiate `AwsSqsJobDispatcher` as the active Job_Dispatcher.
2. WHEN `RUNTIME` is `local` or `docker`, THE System SHALL instantiate `LocalJobDispatcher` as the active Job_Dispatcher.
3. THE System SHALL resolve the Job_Dispatcher at application startup through the dependency injection container and SHALL NOT conditionally branch on `RUNTIME` inside use cases or domain services.
4. WHERE the SQS deployment mode is active, THE System SHALL read the SQS queue URL from the `SQS_QUEUE_URL` environment variable and SHALL fail startup with a descriptive error if the variable is absent.
5. THE System SHALL validate all required configuration values at startup using the Zod configuration schema and SHALL refuse to start if any required value is missing or invalid.

---

### Requirement 10: Error Handling and Observability

**User Story:** As a platform operator, I want all job failures to be logged with sufficient context, so that I can diagnose and remediate assessment processing issues without manual database inspection.

#### Acceptance Criteria

1. WHEN a job fails at any step, THE ProcessAssessmentJob SHALL log the `jobId`, `assessmentId`, and error message at error level before returning a failure result.
2. WHEN a job completes successfully, THE ProcessAssessmentJob SHALL log the `jobId`, `assessmentId`, `monthlyIncome`, `monthlyExpenses`, `disposableIncome`, and `paymentPlanCount` at info level.
3. WHEN the OAuth callback creates an Assessment and dispatches a job, THE System SHALL log the `connectionId`, `customerId`, `assessmentId`, `monthlyIncome`, and `monthlyExpenses` at info level.
4. IF an unexpected exception is thrown inside `ProcessAssessmentJob.execute`, THEN THE ProcessAssessmentJob SHALL catch the exception, log it at error level, attempt to mark the Assessment as `FAILED`, and return a `Result.fail` rather than propagating the exception.
5. THE System SHALL record a `processedAt` timestamp on the AssessmentJob record when the job transitions to either `SUCCESS` or `FAILED`.
