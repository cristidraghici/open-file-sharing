/**
 * Configuration for accessibility testing with axe-core
 */
module.exports = {
  // Base URL for the application
  baseUrl: 'http://localhost:3001',

  // Pages to test (relative to baseUrl)
  pages: [
    {
      name: 'home',
      url: '/',
      description: 'Home page'
    },
    {
      name: 'login',
      url: '/login',
      description: 'Login page'
    }
  ],

  // Axe configuration options
  axeOptions: {
    // Rules configuration
    rules: {
      // Enable all rules by default
      // You can disable specific rules like this:
      // 'color-contrast': { enabled: false }
    },

    // Tags to include (WCAG levels, best practices, etc.)
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],

    // Elements to include/exclude
    include: [],
    exclude: [
      // Exclude third-party components that you can't control
      // Example: ['#third-party-widget']
    ]
  },

  // Browser configuration
  browserOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  },

  // Viewport settings
  viewport: {
    width: 1280,
    height: 800
  },

  // Wait time before running tests (in milliseconds)
  waitTime: 2000,

  // Output configuration
  output: {
    // Directory for reports
    directory: './accessibility-reports',

    // Report formats to generate
    formats: ['json', 'html'],

    // Include screenshots in reports
    includeScreenshots: true
  },

  // Threshold configuration
  thresholds: {
    // Fail if violations exceed these numbers
    violations: {
      minor: 5,      // Allow up to 5 minor violations
      moderate: 5,   // Allow up to 5 moderate violations
      serious: 0,    // No serious violations allowed
      critical: 0    // No critical violations allowed
    },
    
    // Pass if incomplete results are below these numbers
    incomplete: {
      minor: 10,
      moderate: 5,
      serious: 2,
      critical: 0
    }
  }
};
