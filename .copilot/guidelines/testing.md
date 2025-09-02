# Testing Guidelines

## Testing Philosophy

### Core Principles

1. Write tests first (TDD)
2. Test behavior, not implementation
3. Keep tests simple and readable
4. Maintain test independence
5. Aim for meaningful coverage

### Test Types

1. Unit Tests
2. Integration Tests
3. E2E Tests
4. Performance Tests
5. Security Tests

## Frontend Testing

### 1. Component Testing

#### React Testing Library

```typescript
describe("MediaCard", () => {
  it("should display media information", () => {
    const media = {
      id: "1",
      title: "Test Media",
      thumbnail: "thumb.jpg",
    };

    render(<MediaCard media={media} />);

    expect(screen.getByText("Test Media")).toBeVisible();
    expect(screen.getByRole("img")).toHaveAttribute("src", "thumb.jpg");
  });

  it("should handle click events", () => {
    const onView = jest.fn();
    render(<MediaCard onView={onView} />);

    userEvent.click(screen.getByRole("button"));
    expect(onView).toHaveBeenCalled();
  });
});
```

### 2. Hook Testing

```typescript
describe("useMedia", () => {
  it("should fetch media data", async () => {
    const media = { id: "1", title: "Test" };
    server.use(
      rest.get("/api/media/1", (req, res, ctx) => {
        return res(ctx.json(media));
      })
    );

    const { result } = renderHook(() => useMedia("1"));

    await waitFor(() => {
      expect(result.current.data).toEqual(media);
    });
  });
});
```

### 3. Integration Testing

```typescript
describe("MediaUpload", () => {
  it("should upload media and update list", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MediaUpload />
      </QueryClientProvider>
    );

    const file = new File(["test"], "test.jpg");
    await userEvent.upload(screen.getByLabelText(/upload/i), file);

    await screen.findByText("Upload successful");
    expect(screen.getByRole("list")).toContainElement(
      screen.getByText("test.jpg")
    );
  });
});
```

## Backend Testing

### 1. Unit Testing

#### PHP Unit Tests

```php
class MediaServiceTest extends TestCase
{
    public function testCreateMedia()
    {
        $data = [
            'title' => 'Test Media',
            'type' => 'image'
        ];

        $media = $this->mediaService->create($data);

        $this->assertEquals('Test Media', $media->title);
        $this->assertInstanceOf(Media::class, $media);
    }

    public function testInvalidMediaType()
    {
        $this->expectException(ValidationException::class);

        $this->mediaService->create([
            'title' => 'Test',
            'type' => 'invalid'
        ]);
    }
}
```

### 2. Integration Testing

```php
class MediaApiTest extends TestCase
{
    public function testUploadMedia()
    {
        $response = $this->post('/api/media', [
            'file' => UploadedFile::fake()->image('test.jpg')
        ]);

        $response->assertStatus(201)
                 ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('media', [
            'filename' => 'test.jpg'
        ]);
    }
}
```

## E2E Testing

### 1. Cypress Tests

```typescript
describe("Media Upload Flow", () => {
  it("should upload and display media", () => {
    cy.login();
    cy.visit("/dashboard");

    cy.get('[data-test="upload-button"]').click();
    cy.get('input[type="file"]').attachFile("test.jpg");
    cy.get('[data-test="submit"]').click();

    cy.get('[data-test="media-list"]').should("contain", "test.jpg");
  });
});
```

## Performance Testing

### 1. Load Testing

```typescript
import { check } from "k6";
import http from "k6/http";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const res = http.get("http://api.domain.com/media");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });
}
```

## Test Coverage

### 1. Coverage Requirements

- Unit Tests: 80% coverage
- Integration Tests: Key flows covered
- E2E Tests: Critical paths covered
- Performance Tests: SLA requirements met

### 2. Coverage Report

```bash
# Frontend coverage
jest --coverage

# Backend coverage
phpunit --coverage-html coverage/
```

## Best Practices

### 1. Test Structure

```typescript
describe("Component/Feature", () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path
  it("should work with valid input", () => {
    // Test
  });

  // Edge cases
  it("should handle empty input", () => {
    // Test
  });

  // Error cases
  it("should handle invalid input", () => {
    // Test
  });

  // Cleanup
  afterEach(() => {
    // Common cleanup
  });
});
```

### 2. Test Naming

- Describe block: Component/Feature name
- Test case: Should + expected behavior
- Clear and descriptive names

### 3. Test Data

- Use factories for test data
- Avoid sharing state
- Clean up after tests
- Use meaningful test data

### 4. Assertions

- Test one thing per test
- Use explicit assertions
- Check for positive and negative cases
- Verify state and behavior
