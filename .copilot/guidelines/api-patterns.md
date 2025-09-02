# API Design Patterns

## RESTful API Design

### Endpoint Structure

- Use nouns for resources
- Use plural forms for collections
- Keep URLs simple and intuitive
- Use proper HTTP methods

### HTTP Methods

- GET: Retrieve resources
- POST: Create new resources
- PUT: Update existing resources
- DELETE: Remove resources
- PATCH: Partial updates

### Status Codes

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Request/Response Format

### Request Format

```json
{
  "data": {
    // Request payload
  },
  "meta": {
    // Metadata like pagination
  }
}
```

### Response Format

```json
{
  "data": {
    // Response payload
  },
  "meta": {
    // Metadata
  },
  "error": {
    // Error details if any
  }
}
```

## Authentication

### JWT Authentication

- Token in Authorization header
- Bearer token format
- Token refresh mechanism
- Token invalidation

### API Keys

- For service-to-service
- Rate limiting
- Usage tracking
- Access control

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User friendly message",
    "details": {
      // Additional error details
    }
  }
}
```

### Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password too short"
      }
    }
  }
}
```

## Versioning

### URL Versioning

```
/api/v1/resources
/api/v2/resources
```

### Header Versioning

```
Accept: application/vnd.api.v1+json
```

## Security

### Authentication

- JWT tokens
- API keys
- OAuth 2.0
- Rate limiting

### Data Protection

- Input validation
- Output sanitization
- CORS policy
- XSS prevention

## Performance

### Caching

- ETags
- Cache-Control headers
- Conditional requests
- Response compression

### Pagination

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  },
  "links": {
    "first": "/api/resources?page=1",
    "last": "/api/resources?page=5",
    "prev": null,
    "next": "/api/resources?page=2"
  }
}
```

## Documentation

### OpenAPI/Swagger

- Complete API documentation
- Request/response examples
- Authentication details
- Error scenarios

### Code Examples

- Curl examples
- SDK examples
- Common use cases
- Error handling
