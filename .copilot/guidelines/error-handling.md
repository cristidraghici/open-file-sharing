# Error Handling Guidelines

## General Principles

1. Never Fail Silently

   - Log all errors
   - Return appropriate error responses
   - Include helpful error messages
   - Maintain security through abstraction

2. Error Categories
   - Validation Errors
   - Authentication Errors
   - Authorization Errors
   - Business Logic Errors
   - External Service Errors
   - System Errors

## Frontend Error Handling

### React Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
const useApiCall = <T>(apiFunc: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    try {
      setLoading(true);
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      setError(err as Error);
      handleError(err); // Global error handler
    } finally {
      setLoading(false);
    }
  };

  return { execute, data, error, loading };
};
```

## Backend Error Handling

### Exception Hierarchy

```php
abstract class AppException extends Exception {
    protected $code = 500;
    protected $userMessage = '';
    protected $context = [];
}

class ValidationException extends AppException {
    protected $code = 400;
}

class AuthenticationException extends AppException {
    protected $code = 401;
}
```

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User friendly message",
    "details": {
      "field": "Specific error details"
    },
    "requestId": "unique-request-id"
  }
}
```

## Error Logging

### Log Levels

- ERROR: Application errors
- WARN: Warning conditions
- INFO: Information messages
- DEBUG: Debug messages
- TRACE: Detailed debug messages

### Log Format

```json
{
  "timestamp": "2025-09-02T12:00:00Z",
  "level": "ERROR",
  "requestId": "unique-request-id",
  "message": "Error message",
  "stack": "Stack trace",
  "context": {
    "user": "user-id",
    "action": "action-name"
  }
}
```

## Error Recovery

### Retry Strategies

```typescript
const withRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((r) => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error("Circuit breaker is open");
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const shouldReset = Date.now() - this.lastFailure >= this.resetTimeout;
      if (shouldReset) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailure = 0;
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}
```
