// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock React Router (replacing Next.js router mocks)
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: "/",
    search: "",
    hash: "",
    state: null,
    key: "default",
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
}));

// Mock Reown AppKit
jest.mock("@reown/appkit/react", () => ({
  useAppKitAccount: () => ({
    address: undefined,
    isConnected: false,
  }),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [],
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  useAppKit: () => ({
    open: jest.fn(),
  }),
  AppKitProvider: ({ children }) => children,
}));

// Mock Clerk (React version, not Next.js)
jest.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: null,
    isLoaded: true,
  }),
  ClerkProvider: ({ children }) => children,
  useClerk: () => ({
    signOut: jest.fn(),
  }),
}));

// Mock Supabase
jest.mock("@/lib/services/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
