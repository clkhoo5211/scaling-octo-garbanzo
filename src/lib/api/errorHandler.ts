/**
 * Error Handling Utilities
 * Centralized error handling and error types
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 'RATE_LIMIT', 429, details);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

/**
 * Error handler utility
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for network errors
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return new NetworkError('Network request failed', { original: error.message });
    }

    // Check for validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return new ValidationError(error.message);
    }

    // Default to server error
    return new ServerError(error.message);
  }

  // Unknown error type
  return new ServerError('An unknown error occurred', { original: error });
}

/**
 * Error logger utility
 */
export function logError(error: AppError, context?: string) {
  const logData = {
    name: error.name,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', logData);
  }

  // TODO: Send to error tracking service (e.g., Sentry) in production
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: logData });
  // }
}

/**
 * Error message formatter for user-facing messages
 */
export function formatErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'VALIDATION_ERROR':
      return error.message || 'Invalid input. Please check your data and try again.';
    case 'AUTH_ERROR':
      return 'Please sign in to continue.';
    case 'AUTHORIZATION_ERROR':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'RATE_LIMIT':
      return 'Too many requests. Please wait a moment and try again.';
    case 'SERVER_ERROR':
      return 'Something went wrong. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Safe async wrapper that catches errors and returns them as result
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error);
    logError(appError);
    return { data: null, error: appError };
  }
}

