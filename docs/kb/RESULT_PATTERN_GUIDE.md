# Result Pattern Guide

## Why the Result Pattern?

### Problems with Traditional Error Handling

**Traditional approach (throw/catch):**
```typescript
try {
  const user = await findUserById('123');  // Might throw
  const updated = await updateUser(user);  // Might throw
  return updated;
} catch (error) {
  // What type of error? Network? Validation? Not found?
  // How do we recover?
  res.status(500).json({ error: 'Something went wrong' });
}
```

**Issues:**
❌ Hidden error paths - not visible from function signatures  
❌ Exception overhead - expensive in JavaScript/Node.js  
❌ Loses error context - generic error messages  
❌ Hard to compose - difficult to chain operations  
❌ Mixed concerns - business logic and error handling intertwined  

### Result Pattern Benefits

**Result pattern approach:**
```typescript
const result = await findUserById('123')
  .flatMap(user => updateUser(user))
  .match(
    ok => res.json(ok),
    err => res.status(err.statusCode).json(err)
  );
```

**Advantages:**
✅ **Explicit error paths** - Result<T, E> shows exactly what can fail  
✅ **No exceptions** - Errors are values, not control flow jumps  
✅ **Composable** - Chain operations safely with map/flatMap  
✅ **Type-safe** - TypeScript knows what errors are possible  
✅ **Separation of concerns** - Business logic separate from error handling  
✅ **Testable** - Easy to test failure paths  
✅ **Performance** - No expensive stack traces in normal paths  

---

## When to Use Result Pattern

### ✅ Use Result for:

| Scenario | Why |
|----------|-----|
| **Repository/Database operations** | Expected failures (not found, constraint violation) |
| **Validation logic** | Input validation always has failure paths |
| **External API calls** | Network failures, rate limits, invalid responses |
| **Business logic** | Domain rules that can be violated |
| **Use cases** | Composed operations with multiple failure points |
| **Domain services** | Complex calculations with validation |

### ❌ Don't use Result for:

| Scenario | Why |
|----------|-----|
| **Programming errors** | Typos, null pointer exceptions → let them crash |
| **Unrecoverable errors** | Out of memory, process needs restart → throw |
| **Infrastructure failures** | Database connection lost → throw (retry at higher level) |
| **Unexpected conditions** | Should never happen → assertions/errors |

---

## How to Use the Result Pattern

### 1. Creating Results

```typescript
// Success
const success = Result.ok({ id: '123', name: 'John' });

// Failure  
const failure = Result.fail(
  new ApplicationError(
    'USER_NOT_FOUND',
    'User with ID 123 not found',
    404
  )
);
```

### 2. Checking the Result

```typescript
if (result.isOk) {
  const value = result.getOrThrow();
  console.log(value);
} else if (result.isFail) {
  const error = result.getError();
  console.error(error.message);
}
```

### 3. Transforming Values with `map()`

Transform successful values, leaving failures unchanged:

```typescript
const result = Result.ok(5)
  .map(x => x * 2)           // 5 → 10
  .map(x => x + 10)          // 10 → 20
  .map(x => x.toString());   // 20 → "20"

console.log(result.getOrThrow()); // "20"

// With failure, map is skipped
const failed = Result.fail<number>(new Error('Failed'))
  .map(x => x * 2);  // Skipped, still a failure
```

### 4. Chaining Results with `flatMap()`

Use when a function returns a Result (monadic bind):

```typescript
const findUser = (id: string): Result<User, ApplicationError> => {
  if (id === '123') {
    return Result.ok({ id: '123', name: 'John' } as any);
  }
  return Result.fail(new ApplicationError('NOT_FOUND', 'User not found', 404));
};

const updateUser = (user: User): Result<User, ApplicationError> => {
  if (!user.name) {
    return Result.fail(new ApplicationError('INVALID', 'Name required', 400));
  }
  return Result.ok({ ...user, name: user.name.toUpperCase() } as any);
};

const result = findUser('123')
  .flatMap(user => updateUser(user));

result.match(
  user => console.log('Updated:', user),
  err => console.error(`Error [${err.code}]:`, err.message)
);
```

**Key difference:** `map` works with regular functions, `flatMap` works with functions that return Results.

### 5. Pattern Matching with `match()`

Execute different logic based on success/failure:

```typescript
const result = await getAssessment('cust_123');

const response = result.match(
  // Success handler
  assessment => ({
    status: 200,
    body: { assessment }
  }),
  // Failure handler
  error => ({
    status: error.statusCode,
    body: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  })
);

return res.status(response.status).json(response.body);
```

### 6. Side Effects with `tap()`

Log, send analytics, etc. without transforming the result:

```typescript
const result = findUser('123')
  .tap(
    user => console.log('User found:', user.id),
    err => logger.error('User lookup failed:', err)
  )
  .map(user => ({ ...user, active: true }));

// Logging happens, but the original result flows through
```

### 7. Combining Results with `and()` / `or()`

**`and()` - Both must succeed:**
```typescript
const validateInput = (): Result<Input, ValidationError> => {
  // ...validation logic
};

const saveToDb = (input: Input): Result<void, ApplicationError> => {
  // ...save logic
};

const result = validateInput()
  .and(saveToDb());  // If validation fails, save is skipped
```

**`or()` - Use fallback on failure:**
```typescript
const result = findUserInCache('123')
  .or(findUserInDatabase('123'));

// Tries cache first, if fails, tries database
```

### 8. Getting Values Safely

```typescript
const result = Result.ok(42);

// Throws if failed
const value1 = result.getOrThrow();  // 42

// Returns default if failed
const value2 = result.getOrElse(99); // 42

// Get the error (returns undefined if successful)
const error = result.getError();     // undefined
```

### 9. Converting to Promise

Integrate with async/await code:

```typescript
const result = findUser('123');
const value = await result.toPromise();  // Resolves if ok, rejects if fail
```

---

## Real-World Examples

### Example 1: User Creation Use Case

```typescript
class CreateUserUseCase {
  execute(input: CreateUserInput): Result<User, ApplicationError> {
    // Validate input
    return validateUserInput(input)
      .flatMap(validInput => {
        // Check if email already exists
        return this.userRepository.findByEmail(validInput.email)
          .flatMap(existing => {
            if (existing) {
              return Result.fail(
                new ApplicationError(
                  'EMAIL_EXISTS',
                  'Email already in use',
                  409
                )
              );
            }
            return Result.ok(validInput);
          });
      })
      .flatMap(validInput => {
        // Create the user
        const user = User.create(validInput);
        return this.userRepository.save(user);
      })
      .tap(
        user => logger.info('User created', { userId: user.id }),
        err => logger.warn('User creation failed', { error: err.code })
      );
  }
}

// In controller
const result = useCase.execute(req.body);

const response = result.match(
  user => ({ status: 201, body: user }),
  err => ({ status: err.statusCode, body: { error: err.code } })
);

res.status(response.status).json(response.body);
```

### Example 2: Assessment Flow

```typescript
class GetAssessmentUseCase {
  execute(customerId: string): Result<Assessment, ApplicationError> {
    return this.assessmentRepository
      .findLatestByCustomerId(customerId)
      .flatMap(assessment => {
        // Check if assessment is stale
        if (this.isStale(assessment)) {
          return Result.fail(
            new ApplicationError(
              'ASSESSMENT_STALE',
              'Assessment is outdated, please run a new one',
              400
            )
          );
        }
        return Result.ok(assessment);
      })
      .map(assessment => this.enrich(assessment));
  }

  private isStale(assessment: Assessment): boolean {
    const daysOld = (Date.now() - assessment.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 30;
  }

  private enrich(assessment: Assessment): Assessment {
    return {
      ...assessment,
      recommendations: this.calculateRecommendations(assessment)
    };
  }
}
```

### Example 3: Validation

```typescript
function validateAssessmentInput(input: any): Result<ValidatedInput, ValidationError> {
  try {
    const schema = z.object({
      customerId: z.string().uuid('Invalid customer ID'),
      monthlyIncome: z.number().positive('Income must be positive'),
      expenses: z.number().nonnegative('Expenses cannot be negative'),
    });

    const validated = schema.parse(input);
    return Result.ok(validated);
  } catch (error) {
    return Result.fail(ValidationError.fromZod(error));
  }
}

// Usage
const result = validateAssessmentInput(req.body)
  .flatMap(validInput => createAssessment(validInput));
```

---

## Common Patterns

### Pattern 1: Validate → Save → Return

```typescript
validateInput(input)
  .flatMap(valid => repository.save(valid))
  .match(
    saved => res.json(saved),
    err => res.status(err.statusCode).json(err)
  );
```

### Pattern 2: Multiple Operations with Short-Circuit

```typescript
findUser('123')
  .flatMap(user => updateName(user, newName))
  .flatMap(user => saveToDb(user))
  .flatMap(user => sendNotification(user))
  .tap(
    () => res.json({ success: true }),
    err => res.status(err.statusCode).json(err)
  );
```

If any step fails, remaining steps are skipped and error is returned.

### Pattern 3: Try Multiple Approaches

```typescript
findUserInCache('123')
  .or(findUserInDb('123'))
  .or(fetchFromExternalAPI('123'))
  .match(
    user => res.json(user),
    err => res.status(404).json({ error: 'User not found' })
  );
```

### Pattern 4: Combine Multiple Results

```typescript
const results = [
  validateField1(input.field1),
  validateField2(input.field2),
  validateField3(input.field3)
];

const combined = combineResults(results);

combined.match(
  validFields => saveData(validFields),
  firstError => res.status(400).json(firstError)
);
```

---

## Error Handling Best Practices

### 1. Create Specific Error Types

```typescript
// Not good - too generic
return Result.fail(new Error('Something went wrong'));

// Good - specific, informative
return Result.fail(
  new ApplicationError(
    'PAYMENT_FAILED',
    'Payment processing failed: insufficient funds',
    402,
    { attemptedAmount: 100, availableBalance: 50 }
  )
);
```

### 2. Include Context in Errors

```typescript
// Not good
if (!email.includes('@')) {
  return Result.fail(new ValidationError('Invalid email'));
}

// Good
if (!email.includes('@')) {
  return Result.fail(
    new ValidationError('Invalid email format', {
      field: 'email',
      received: email,
      required: 'email@example.com'
    })
  );
}
```

### 3. Transform Errors at Boundaries

```typescript
// Repository returns low-level database errors
const dbResult = await db.query(...);

// Transform to application error
const result = dbResult
  .mapError(dbError => {
    if (dbError.code === 'UNIQUE_CONSTRAINT') {
      return new ApplicationError('EMAIL_EXISTS', 'Email already in use', 409);
    }
    return new ApplicationError(
      'DATABASE_ERROR',
      'Failed to query database',
      500
    );
  });
```

### 4. Preserve Error Chain

```typescript
findUser(id)
  .mapError(err => {
    // Add context but preserve original error
    return new ApplicationError(
      'USER_LOOKUP_FAILED',
      `Failed to find user: ${err.message}`,
      500,
      { originalError: err, userId: id }
    );
  });
```

---

## Testing with Results

### Testing Success Path

```typescript
it('should create user successfully', () => {
  const input = { email: 'john@example.com', name: 'John' };
  const result = useCase.execute(input);

  expect(result.isOk).toBe(true);
  const user = result.getOrThrow();
  expect(user.email).toBe('john@example.com');
});
```

### Testing Failure Path

```typescript
it('should fail if email already exists', () => {
  const input = { email: 'existing@example.com', name: 'John' };
  const result = useCase.execute(input);

  expect(result.isFail).toBe(true);
  const error = result.getError() as ApplicationError;
  expect(error.code).toBe('EMAIL_EXISTS');
  expect(error.statusCode).toBe(409);
});
```

### Testing Transformations

```typescript
it('should transform user name to uppercase', () => {
  const user = { id: '1', name: 'john' };
  const result = Result.ok(user)
    .map(u => ({ ...u, name: u.name.toUpperCase() }));

  expect(result.getOrThrow().name).toBe('JOHN');
});
```

---

## Migration from Try/Catch

### Before (Try/Catch)

```typescript
async function getAssessment(id: string) {
  try {
    const assessment = await db.assessments.findById(id);
    if (!assessment) {
      throw new Error('Not found');
    }
    return assessment;
  } catch (error) {
    throw error; // Just re-throw, doesn't help
  }
}
```

### After (Result Pattern)

```typescript
async function getAssessment(
  id: string
): Promise<Result<Assessment, ApplicationError>> {
  const assessment = await db.assessments.findById(id);
  
  if (!assessment) {
    return Result.fail(
      new ApplicationError(
        'ASSESSMENT_NOT_FOUND',
        'Assessment not found',
        404
      )
    );
  }
  
  return Result.ok(assessment);
}
```

Benefits:
- **Explicit** - Clear from signature that this can fail
- **Testable** - Easy to test both paths
- **Composable** - Easy to chain with other operations
- **Informative** - Error details are structured

---

## Summary

| Aspect | Benefit |
|--------|---------|
| **Readability** | Error handling is explicit and visible |
| **Composability** | Operations chain naturally with map/flatMap |
| **Type Safety** | TypeScript knows possible error types |
| **Testability** | Both success and failure paths easy to test |
| **Performance** | No exception overhead in normal flow |
| **Maintainability** | Clear error paths, easier to understand |

**Start using Result pattern in:**
1. All repository methods
2. All use cases
3. All services that can fail
4. Anywhere you'd normally use try/catch for expected errors

