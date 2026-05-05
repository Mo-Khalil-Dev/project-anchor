# Shared Layer

The `shared` folder contains reusable patterns, utilities, and infrastructure components used across the application.

## Directory Structure

```
shared/
├── result/
│   └── Result.ts          # Railway-oriented error handling
├── errors/
│   ├── applicationError.ts # Base error for application logic
│   └── validationError.ts  # Validation-specific errors
└── validators/
    └── schemas.ts         # Zod validation schemas (to be created)
```

## Quick Start

### Result Pattern - Handle Errors Safely

```typescript
import { Result } from '@shared/result/Result';
import { ApplicationError } from '@shared/errors/ApplicationError';

// Create a result
const result = Result.ok({ id: 1 });

// Transform it
const mapped = result
  .map(user => ({ ...user, name: user.name.toUpperCase() }))
  .flatMap(user => saveUser(user));

// Handle it
mapped.match(
  saved => console.log('Success:', saved),
  error => console.error('Failed:', error.message)
);
```

### Error Types

**ApplicationError** - For application-level failures:
```typescript
return Result.fail(
  new ApplicationError(
    'USER_NOT_FOUND',        // Code
    'User with ID not found', // Message
    404,                      // HTTP Status
    { userId: id }            // Optional details
  )
);
```

**ValidationError** - For request validation:
```typescript
return Result.fail(
  new ValidationError(
    'Request validation failed',
    { email: ['Invalid email format'] }
  )
);
```

## Key Principles

✅ **Use Results for expected failures** - Input validation, not found, constraint violations  
✅ **Use Errors for programming mistakes** - Null pointer, typos, assertions  
✅ **Transform errors at boundaries** - Convert DB errors to application errors  
✅ **Include context** - Always provide details about what failed and why  

See [Result Pattern Guide](../../docs/RESULT_PATTERN_GUIDE.md) for detailed documentation.
