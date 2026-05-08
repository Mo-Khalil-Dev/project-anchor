# Requirements Document

## Introduction

This feature completes the GoCardless Direct Debit mandate flow. After a customer selects a payment plan and is redirected to GoCardless to authorise their Direct Debit, they are returned to the app at `/payment-plans/dd-callback`. At that point the mandate exists in GoCardless but has not yet been confirmed in the app's database.

The feature adds three things:

1. **A holding page** — shown at `/payment-plans/dd-callback` while the app waits for the GoCardless `mandates.active` webhook confirming the mandate is live.
2. **A success page** — shown once the mandate is confirmed, summarising the payment schedule.
3. **Backend mandate status transitions** — the webhook handler must update the `Mandate` record's `status` field in the database when GoCardless fires `mandates.active`, `mandates.failed`, or `mandates.cancelled` events.

### What is already implemented

- The GoCardless billing request flow (create billing request → collect customer details → collect bank account → create flow → return `authorizationUrl`).
- The `POST /api/payments/webhook` endpoint with HMAC signature verification.
- `HandleWebhookEventUseCase` — dispatches webhook events; currently calls `onMandateActive` on `mandates.created` (this should be corrected to `mandates.active`).
- `ProcessMandateActiveUseCase` — fetches the mandate from GoCardless, saves `Mandate` + `PaymentMethod` rows, and creates the instalment schedule.
- The `Mandate` schema with `status` field (`PENDING | ACTIVE | FAILED | CANCELLED`).

---

## Glossary

- **App**: The Bridge backend + frontend application.
- **GoCardless (GC)**: The third-party Direct Debit provider.
- **Mandate**: A Direct Debit authorisation record stored in the App's database, linked to a GoCardless mandate ID.
- **Mandate_Status**: The `status` field on the `Mandate` record. Valid values: `PENDING`, `ACTIVE`, `FAILED`, `CANCELLED`.
- **Holding_Page**: The frontend page shown at `/payment-plans/dd-callback` while the App awaits the GoCardless webhook.
- **Success_Page**: The frontend page shown after the mandate is confirmed as `ACTIVE`.
- **Webhook_Handler**: The `HandleWebhookEventUseCase` and its downstream `ProcessMandateActiveUseCase`.
- **Mandate_Status_Endpoint**: A new `GET /api/payments/mandate-status` endpoint that returns the current `Mandate_Status` for the authenticated customer's latest mandate.
- **Polling_Interval**: The frequency at which the Holding_Page queries the Mandate_Status_Endpoint. Fixed at 3 seconds.
- **Polling_Timeout**: The maximum duration the Holding_Page will poll before showing an error state. Fixed at 5 minutes.

---

## Requirements

### Requirement 1: DD Callback Route and Holding Page

**User Story:** As a customer who has just authorised a Direct Debit on GoCardless, I want to be returned to a holding page in the app, so that I know my setup is being processed and I don't have to do anything else.

#### Acceptance Criteria

1. WHEN the customer is redirected back from GoCardless to `/payment-plans/dd-callback`, THE App SHALL render the Holding_Page.
2. WHILE the Mandate_Status is `PENDING`, THE Holding_Page SHALL display a loading indicator and a message informing the customer that their Direct Debit is being confirmed.
3. WHILE the Mandate_Status is `PENDING`, THE Holding_Page SHALL poll the Mandate_Status_Endpoint at the Polling_Interval.
4. WHEN the Mandate_Status_Endpoint returns `ACTIVE`, THE Holding_Page SHALL navigate the customer to the Success_Page without requiring any user action.
5. IF the Mandate_Status_Endpoint returns `FAILED` or `CANCELLED`, THEN THE Holding_Page SHALL display an error message explaining that the Direct Debit setup was unsuccessful and offering a link to restart the setup.
6. IF the Polling_Timeout elapses without the Mandate_Status becoming `ACTIVE`, THEN THE Holding_Page SHALL stop polling and display a timeout message with a support contact option.
7. THE Holding_Page SHALL NOT expose any bank account details or sensitive payment information.

---

### Requirement 2: Mandate Status Endpoint

**User Story:** As the Holding_Page, I need to query the current status of the customer's mandate, so that I can determine when to transition to the Success_Page.

#### Acceptance Criteria

1. THE App SHALL expose a `GET /api/payments/mandate-status` endpoint protected by the existing authentication middleware.
2. WHEN a valid authenticated request is received, THE Mandate_Status_Endpoint SHALL return the `Mandate_Status` of the most recently created `Mandate` record for the authenticated customer.
3. IF no `Mandate` record exists for the customer, THEN THE Mandate_Status_Endpoint SHALL return a `404` response with a descriptive error message.
4. THE Mandate_Status_Endpoint SHALL return a response within 2000ms under normal operating conditions.
5. FOR ALL valid authenticated requests, THE Mandate_Status_Endpoint SHALL return a response body containing at minimum the fields `status` and `mandateId`.

---

### Requirement 3: Backend Mandate Status Transitions

**User Story:** As the system, I need to update the Mandate record's status in the database when GoCardless fires webhook events, so that the Holding_Page can accurately reflect the mandate's state.

#### Acceptance Criteria

1. WHEN a `mandates.active` webhook event is received, THE Webhook_Handler SHALL update the corresponding `Mandate` record's `Mandate_Status` to `ACTIVE` in the database.
2. WHEN a `mandates.failed` webhook event is received, THE Webhook_Handler SHALL update the corresponding `Mandate` record's `Mandate_Status` to `FAILED` in the database.
3. WHEN a `mandates.cancelled` webhook event is received, THE Webhook_Handler SHALL update the corresponding `Mandate` record's `Mandate_Status` to `CANCELLED` in the database.
4. IF a webhook event is received for a mandate that does not exist in the database, THEN THE Webhook_Handler SHALL log a warning and return a successful response to GoCardless without throwing an error.
5. IF the same `mandates.active` webhook event is delivered more than once, THEN THE Webhook_Handler SHALL process it idempotently — the `Mandate` record SHALL remain `ACTIVE` and no duplicate `PaymentSchedule` records SHALL be created.
6. WHEN a `mandates.active` event is processed successfully, THE Webhook_Handler SHALL also execute the existing instalment schedule creation logic (as currently implemented in `ProcessMandateActiveUseCase`).
7. THE Webhook_Handler SHALL respond to GoCardless with HTTP 200 regardless of whether individual event processing succeeds or fails, so that GoCardless does not retry the entire batch.

---

### Requirement 4: Success Page

**User Story:** As a customer whose Direct Debit mandate has been confirmed, I want to see a success page summarising my payment plan, so that I have confidence my repayment plan is active.

#### Acceptance Criteria

1. WHEN the customer is navigated to the Success_Page, THE App SHALL display a confirmation message indicating the Direct Debit mandate is active.
2. THE Success_Page SHALL display the selected payment plan type (Conservative, Balanced, or Aggressive), the monthly payment amount, and the total number of payments.
3. THE Success_Page SHALL display the date of the first scheduled payment.
4. THE Success_Page SHALL provide a navigation action that takes the customer to their account home or dashboard.
5. IF the customer navigates directly to the Success_Page URL without a confirmed `ACTIVE` mandate, THEN THE App SHALL redirect the customer to the Holding_Page.

---

### Requirement 5: Webhook Event Trigger Correction

**User Story:** As the system, I need the mandate activation logic to be triggered by the correct GoCardless webhook event, so that the mandate is only marked active when GoCardless has fully confirmed it.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL trigger the mandate activation flow (`ProcessMandateActiveUseCase`) on the `mandates.active` event, not on the `mandates.created` event.
2. WHEN a `mandates.created` event is received, THE Webhook_Handler SHALL log the event and return successfully without triggering the activation flow.
3. FOR ALL mandate webhook events (`created`, `active`, `failed`, `cancelled`), THE Webhook_Handler SHALL log the event ID, mandate ID, and action at the `INFO` level.
