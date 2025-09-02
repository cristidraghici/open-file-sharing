# Backend (SlimPHP)

## Technology Stack

- SlimPHP 4 for lightweight, fast API development
- PHP 8.1+ leveraging modern PHP features
- PSR-7/PSR-15 for HTTP message interfaces and middleware
- JWT for stateless authentication
- PHP-DI for dependency injection
- PHPUnit for testing
- PHP_CodeSniffer for code style enforcement

## Architecture & Best Practices

- Clean Architecture principles with clear separation of concerns
- Domain-Driven Design (DDD) concepts for complex business logic
- Middleware for CORS, Authentication, and Request Validation
- Rate limiting for API security
- Comprehensive request logging

## Data Storage

- `Media`: Store uploaded files in a dedicated directory on the server (e.g., `/data/uploads/`). File access should be controlled by the backend application, not a public web server
- `User Authentication`: A file should be used to store user credentials securely (hashed passwords) and other user-specific data

# API Endpoints breakdown suggestion

The SlimPHP backend must implement the following REST endpoints:

Authentication:

- `POST /api/auth/login`: Authenticates a user with a username/password

Media Management:

- `POST /api/media/upload`: Accepts a multipart form data upload of a media file
- `GET /api/media/list`: Returns a list of available media files for the authenticated user
- `GET /api/media/{filename}`: Serves the requested media file. This endpoint must be protected and verify the user's authentication token

User Data:

- `GET /api/users/me`: Returns the authenticated user's profile information

## Security

- Use modern password hashing algorithms (e.g., Argon2, bcrypt)
- Implement server-side validation for all API requests
- Ensure all API calls requiring authentication are protected by a token-based system (e.g., JWT). Unauthenticated requests to protected endpoints should receive a 401 Unauthorized HTTP status code
- Implement proper CORS policies
- Use CSRF tokens for forms
- Validate all input data
- Sanitize all output
- Use prepared statements
- Implement rate limiting
- Use HTTPS only if possible
- Set secure headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy
  - Strict-Transport-Security

## Error Handling

- Don't expose sensitive info in errors
- Log security events securely
- Implement proper error responses
- Monitor for suspicious activity

### Exception Handling

```php
class ApiException extends Exception
{
    private int $statusCode;
    private string $errorCode;

    public function __construct(
        string $message,
        int $statusCode = 500,
        string $errorCode = 'INTERNAL_ERROR'
    ) {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
    }
}

// Error middleware
$app->add(function ($request, $handler) {
    try {
        return $handler->handle($request);
    } catch (ApiException $e) {
        return $this->respondWithError($e);
    } catch (Exception $e) {
        // Log unexpected errors
        $this->logger->error($e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        return $this->respondWithError(new ApiException(
            'An unexpected error occurred',
            500,
            'INTERNAL_ERROR'
        ));
    }
});
```

## Coding Standards

- Follow PSR-12 coding style
- Use PHP 8.1+ features appropriately
- Implement SOLID principles
- Use type declarations everywhere
- Follow PHP_CodeSniffer rules
- Use meaningful class and method names
- Implement proper error handling

## Testing

- Use PHPUnit for unit and integration testing
- Focus on service and controller layer testing
- Use test doubles (mocks, stubs) appropriately
- Maintain separate test database configuration
- Use test fixtures for consistent test data

## API Guidelines

### Request/Response

- Use JSON:API specification
- Implement proper HTTP methods
- Use appropriate status codes
- Include error details
- Support pagination
- Enable filtering
- Allow field selection
- Support relationships

### Headers

- Use Content-Type correctly
- Implement ETag caching
- Set CORS headers
- Use compression
- Add rate limit headers

### Versioning

- Use URL versioning (/api/v1)
- Maintain backwards compatibility
- Document breaking changes
- Support version transitions

### Security

- Validate all input
- Sanitize all output
- Rate limit endpoints
- Require authentication
- Check authorizations
- Log API access

### Performance

- Implement caching
- Use compression
- Optimize queries
- Batch operations
- Stream large responses

#### Caching Strategies

- API response caching
- Database query caching
- Static file caching
- Cache invalidation
- Cache warming

#### Database Optimization

- Index optimization
- Query optimization
- Connection pooling
- Batch operations
- Proper pagination

#### File Handling

- Streaming large files
- Chunked uploads
- Background processing
- Proper cleanup
- Storage optimization
