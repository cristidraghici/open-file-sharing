# State Management Patterns

## Frontend State Management

### 1. Server State

#### React Query Implementation

```typescript
// API hooks
export const useMedia = (id: string) => {
  return useQuery(["media", id], () => mediaService.getMedia(id));
};

export const useMediaList = (params: ListParams) => {
  return useQuery(["media", params], () => mediaService.list(params));
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation((file: File) => mediaService.upload(file), {
    onSuccess: () => {
      queryClient.invalidateQueries(["media"]);
    },
  });
};
```

### 2. Client State

#### Context Implementation

```typescript
// Auth Context
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await authService.login(credentials);
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Form State

#### Form Management

```typescript
// Upload Form
interface UploadForm {
  title: string;
  description: string;
  file: File;
}

export const UploadForm = () => {
  const { register, handleSubmit } = useForm<UploadForm>();
  const upload = useUploadMedia();

  const onSubmit = handleSubmit(async (data) => {
    await upload.mutateAsync(data);
  });

  return <form onSubmit={onSubmit}>{/* Form fields */}</form>;
};
```

### 4. UI State

#### Modal State

```typescript
interface ModalState {
  isOpen: boolean;
  type: "upload" | "preview" | null;
  data?: any;
}

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case "OPEN":
      return {
        isOpen: true,
        type: action.modalType,
        data: action.data,
      };
    case "CLOSE":
      return {
        isOpen: false,
        type: null,
      };
    default:
      return state;
  }
};
```

## State Management Best Practices

### 1. State Organization

#### State Types

- Server State: API data
- Client State: UI state
- Form State: Input data
- URL State: Route params

#### State Location

- Global State: App-wide data
- Component State: Local data
- Route State: URL-based data

### 2. Performance Optimization

#### Memoization

```typescript
// Memoized selector
const selectFilteredMedia = createSelector(
  [selectMedia, selectFilters],
  (media, filters) => {
    return media.filter((item) => item.type === filters.type);
  }
);

// Memoized component
const MediaItem = memo(({ item }: Props) => {
  return <div className="media-item">{/* Item content */}</div>;
});
```

### 3. State Updates

#### Immutable Updates

```typescript
// State update example
const updateMedia = (state: State, media: Media): State => {
  return {
    ...state,
    media: {
      ...state.media,
      [media.id]: media,
    },
  };
};
```

### 4. State Persistence

#### Local Storage

```typescript
// Persist auth state
const persistAuth = (state: AuthState) => {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      token: state.token,
      user: state.user,
    })
  );
};

// Hydrate auth state
const hydrateAuth = (): AuthState | null => {
  const stored = localStorage.getItem("auth");
  return stored ? JSON.parse(stored) : null;
};
```

## Testing State Management

### 1. Unit Tests

```typescript
describe("mediaReducer", () => {
  it("should handle ADD_MEDIA", () => {
    const initialState = { items: [] };
    const media = { id: "1", title: "Test" };

    const newState = mediaReducer(initialState, addMedia(media));

    expect(newState.items).toContain(media);
  });
});
```

### 2. Integration Tests

```typescript
describe("MediaList", () => {
  it("should display media items", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MediaList />
      </QueryClientProvider>
    );

    await screen.findByText("Media Title");
    expect(screen.getByRole("list")).toBeVisible();
  });
});
```

## Error Handling

### 1. API Error State

```typescript
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const initialState: ApiState<T> = {
  data: null,
  loading: false,
  error: null,
};
```

### 2. Error Boundaries

```typescript
class StateErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```
