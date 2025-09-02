# Frontend (React)

## Technology Stack

- React 18+ with TypeScript for type safety
- TailwindCSS for responsive, utility-first styling
- React Hook Form for efficient form handling and validation
- React Query for API state management
- Axios for HTTP requests
- Jest and React Testing Library for tests
- ESLint and Prettier for code quality

## Component Architecture

The React application should include these key components:

- `LoginPage`: A form for user login that will make a POST request to the /api/auth/login endpoint. It should handle both success (redirect to Dashboard) and error states
- `Dashboard`: The main view after login, containing an upload button and the media gallery
- `MediaGallery`: Displays a grid or list of media items fetched from the GET /api/media/list endpoint
- `UploadForm`: A modal or component for uploading new files via a POST request to the /api/media/upload endpoint

## Best Practices

- Use functional components with React Hooks
- Employ a clear and organized component structure
- Follow atomic design principles for components
- Keep API calls abstracted in a dedicated `services` folder
- Use environment variables for backend URLs
- Create a responsive design

## Coding Standards

- Use TypeScript strict mode
- Follow React functional component patterns
- Implement proper error boundaries
- Use custom hooks for reusable logic
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names
- Implement proper prop-types or TypeScript interfaces

## Testing

- Use Jest and React Testing Library for unit and integration tests
- Follow testing pyramid: more unit tests, fewer integration/E2E tests
- Test components in isolation using mocked dependencies
- Use MSW (Mock Service Worker) for API mocking
- Test key user flows with Cypress E2E tests

## Performance

### Image Optimization

- Use responsive images
- Implement lazy loading
- Use proper image formats
- Generate thumbnails
- Optimize image quality
- Use image CDN when possible

### JavaScript Performance

- Code splitting
- Tree shaking
- Bundle optimization
- Lazy component loading
- Virtualized lists
- Debounce/throttle events

## Error Handling

### React Error Boundaries

```typescript
class GlobalErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    errorReporting.log(error, errorInfo);
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
// Custom error types
interface ApiError extends Error {
  status: number;
  code: string;
}

// API error handler
const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return new ApiError({
      message: error.response?.data?.message || "Unknown error occurred",
      status: error.response?.status || 500,
      code: error.response?.data?.code || "UNKNOWN_ERROR",
    });
  }

  return new ApiError({
    message: "Unknown error occurred",
    status: 500,
    code: "UNKNOWN_ERROR",
  });
};
```
