import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../errors/ValidationError';
import { extractValidationErrors } from '../validators/schemas';

/**
 * Request validation middleware
 *
 * Validates incoming request data (body, params, query) against a Zod schema.
 * If validation fails, passes a ValidationError to the error handler.
 * If validation succeeds, attaches validated data to the request object.
 *
 * Usage:
 *   app.post('/users',
 *     validateRequest(createUserSchema),
 *     handler
 *   );
 *
 *   // In handler:
 *   const { body, params, query } = (req as any).validated;
 */

export interface ValidatedRequest extends Request {
  validated?: {
    body?: any;
    params?: any;
    query?: any;
  };
}

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Prepare data to validate
      const dataToValidate: any = {};

      // Check if schema is a ZodObject and has shape property
      const schemaShape = (schema as any).shape || {};
      const shapeKeys = Object.keys(schemaShape);

      // Include body if present and request has body
      if (shapeKeys.includes('body')) {
        dataToValidate.body = req.body;
      }

      // Include params if present
      if (shapeKeys.includes('params')) {
        dataToValidate.params = req.params;
      }

      // Include query if present
      if (shapeKeys.includes('query')) {
        dataToValidate.query = req.query;
      }

      // Validate the data
      const validated = schema.parse(dataToValidate);

      // Attach validated data to request
      (req as ValidatedRequest).validated = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = extractValidationErrors(error);
        const validationError = new ValidationError(
          'Request validation failed',
          details
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
}

/**
 * Strict validation middleware - rejects unknown fields
 *
 * By default, Zod ignores unknown properties in objects.
 * Use this middleware to reject requests with unexpected fields.
 *
 * Usage:
 *   app.post('/users',
 *     validateRequest(createUserSchema.strict()),
 *     handler
 *   );
 */
export function createStrictValidator(schema: ZodSchema) {
  const strictSchema = schema instanceof z.ZodObject
    ? schema.strict()
    : schema;

  return validateRequest(strictSchema);
}

/**
 * Partial validation middleware - validates only specified fields
 *
 * Useful for PATCH endpoints that allow partial updates.
 *
 * Usage:
 *   app.patch('/users/:id',
 *     validateRequest(updateUserSchema.partial()),
 *     handler
 *   );
 */
export function createPartialValidator(schema: ZodSchema) {
  const partialSchema = schema instanceof z.ZodObject
    ? schema.partial()
    : schema;

  return validateRequest(partialSchema);
}

/**
 * Validate only specific part of request (body, params, or query)
 *
 * Useful when you only want to validate one aspect of the request.
 *
 * Usage:
 *   app.post('/users', validateBody(userBodySchema), handler);
 *   app.get('/users/:id', validateParams(userParamsSchema), handler);
 */
export function validateBody(schema: ZodSchema) {
  return validateRequest(z.object({ body: schema }));
}

export function validateParams(schema: ZodSchema) {
  return validateRequest(z.object({ params: schema }));
}

export function validateQuery(schema: ZodSchema) {
  return validateRequest(z.object({ query: schema }));
}

/**
 * Compose multiple validators
 *
 * Usage:
 *   app.post('/users/:id',
 *     composeValidators(
 *       validateParams(paramsSchema),
 *       validateBody(bodySchema)
 *     ),
 *     handler
 *   );
 */
export function composeValidators(...validators: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const executeNext = () => {
      if (index < validators.length) {
        const validator = validators[index++];
        validator(req, res, (err?: any) => {
          if (err) {
            next(err);
          } else {
            executeNext();
          }
        });
      } else {
        next();
      }
    };

    executeNext();
  };
}
