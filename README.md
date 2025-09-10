# Booking.com Test Automation - Selenium & Cypress

## Overview

This project contains automated tests for Booking.com built with both **Selenium WebDriver** and **Cypress**. I wrote both versions in JavaScript using the Page Object Model pattern to show how the same test can work across different frameworks. Both tests do exactly the same thing: search for hotels in Porto, deal with those annoying cookie popups and Genius modals, and pull out the property information from the results.

## Decisions Taken

Here are the key decisions and approaches taken during the development of this automation suite:

### **Why Both Selenium and Cypress?**
I wanted to show how the same test logic works in both frameworks because:
- **Compare approaches**: See how each framework handles the same scenario differently
- **Learn both tools**: Get hands-on experience with different automation styles
- **Popup handling**: Each framework deals with those pesky cookie and modal popups in its own way
- **Reliability**: Selenium makes you manage waits explicitly, while Cypress handles retries automatically

### **Why JavaScript?**
I chose JavaScript because I wanted to practice it more - I'm more comfortable with Java and C#, so this was a good chance to get better at JS while building something useful. Since Selenium WebDriver calls are all asynchronous (they're making network calls to the browser), everything returns Promises. Using `async/await` keeps the code much cleaner than chaining a bunch of `.then()` calls everywhere.

### **Page Object Model (POM)**
I used the Page Object Model because it keeps things organized. Instead of having element selectors scattered everywhere, each page gets its own class (`HomePage`, `SearchResultsPage`, etc.) with all its elements and actions in one place. This way, if Booking.com changes their UI, I only need to update the page class instead of hunting through all the test files.

### **Element Interaction (Wrappers & Waits)**
I created wrapper methods in `BasePage` to make element interactions more reliable. Instead of calling Selenium methods directly, these wrappers add proper waiting - making sure elements are not just there, but actually visible and clickable before trying to interact with them. This cuts down on those frustrating flaky tests that fail randomly because of timing issues.

**Genius Modal Handling**: Instead of using try-catch everywhere and hoping for the best, I check if that annoying Genius modal is actually there before trying to close it. The code counts how many modal close buttons exist - if there's one, it clicks it and moves on. This check happens before every click or type action so the modal never gets in the way.

**Cookie Acceptance**: The cookie handling tries the main "Accept" button first, and if that doesn't work, it falls back to alternative selectors. This way the test works regardless of which cookie banner Booking.com decides to show.

### **Selector Strategy**
I used `data-testid` attributes whenever possible since they're more stable than CSS classes that might change when designers update the site. When those weren't available, I used XPath or aria-labels to find specific elements like the "Porto, Portugal" option in the dropdown or the "Next month" calendar button.

### **Clean Test Environment**
Each test starts fresh by clearing all cookies and cache so previous runs don't mess with the current one. For debugging, each run gets its own temp directory and debug port so you can run multiple tests at the same time without them stepping on each other.

### **Data Extraction**
Getting property names from the results page sometimes fails on the first try because the page is still loading. So I added retry logic - if it doesn't get all the property names on the first attempt, it waits a bit and tries again until it gets everything.

## Project Structure

```
deus-QA-challenge/
├── selenium/                    # Selenium WebDriver Implementation
│   ├── pages/
│   │   ├── BasePage.js          # Base page with common functionality and wrappers
│   │   ├── HomePage.js          # Home page interactions and search functionality
│   │   └── SearchResultsPage.js # Search results page and data extraction
│   └── test.js                  # Main Selenium test file using Page Object Model
├── cypress/                     # Cypress Implementation (Identical Logic)
│   ├── pages/
│   │   ├── BasePage.js          # Base page with Cypress-specific wrappers
│   │   ├── HomePage.js          # Home page interactions (same logic as Selenium)
│   │   └── SearchResultsPage.js # Search results (same logic as Selenium)
│   ├── e2e/
│   │   └── booking-test.cy.js   # Main Cypress test file
│   └── support/
│       ├── commands.js          # Custom Cypress commands
│       └── e2e.js               # Global Cypress configuration
├── cypress.config.js            # Cypress configuration file
├── package.json                 # Project dependencies and scripts (both frameworks)
└── README.md                    # This documentation
```

## Prerequisites

Before running the tests, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (Node Package Manager, usually comes with Node.js)
- **Google Chrome browser** installed on your system

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd deus-QA-challenge
   ```

2. **Install dependencies:**
   Navigate to the `deus-QA-challenge` directory and install the required Node.js packages:
   ```bash
   npm install
   ```

## How to Run Tests

### Selenium Tests

To execute the Selenium Page Object Model test suite:

```bash
npm run selenium:test
```

Alternative direct execution:
```bash
node selenium/test.js
```

### Cypress Tests

To execute the Cypress test suite:

**Headless execution:**
```bash
npm run cypress:test
```

**With visible browser:**
```bash
npm run cypress:test-headed
```

**Interactive Test Runner:**
```bash
npm run cypress:open
```

Both implementations will:
- Launch a Chrome browser
- Navigate to Booking.com
- Clear cookies and cache for a clean start
- Handle cookie consent and Genius modals
- Search for hotels in Porto, Portugal
- Extract and display property information
- Print results to the console

### Debugging Tests

#### Selenium Debugging

To run Selenium tests with Node.js debugger attached:

1. **Start the debug script:**
   ```bash
   npm run selenium:debug
   ```

2. **Alternative debug mode:**
   ```bash
   npm run selenium:debug-chrome
   ```

3. **Attach your IDE's debugger:**
   - **VS Code**: Go to "Run and Debug" view (Ctrl+Shift+D)
   - **Chrome DevTools**: Open `chrome://inspect` and connect to Node process

#### Cypress Debugging

Cypress provides built-in debugging capabilities:

1. **Interactive debugging:**
   ```bash
   npm run cypress:open
   ```
   - Real-time browser interaction
   - Command execution step-by-step
   - DOM inspection and element highlighting

2. **Browser DevTools:**
   - Right-click and "Inspect" during test execution
   - Use `cy.debug()` commands in test code
   - Browser console shows detailed command logs

## Test Features

Both Selenium and Cypress implementations include identical functionality:

### **Automated Popup Handling**
- **Cookie Consent**: Automatically accepts cookies using multiple fallback selectors
- **Genius Modal**: Dynamically detects and dismisses promotional modals (English/Portuguese)
- **Clean State**: Each test starts with cleared cache and cookies
- **Proactive Detection**: Checks for popups before every interaction (Cypress) vs reactive handling (Selenium)

### **Robust Element Interaction**
- **Explicit Waits**: All interactions wait for elements to be visible and clickable
- **Multiple Selectors**: Fallback strategies for different UI variations
- **Error Handling**: Graceful degradation when elements are not found
- **Force Interactions**: Cypress uses force clicks/typing to bypass overlays when needed

### **Data Extraction**
- **Retry Logic**: Automatically retries data extraction if incomplete
- **Multiple Selectors**: Tries various selectors to find property names
- **Complete Validation**: Ensures all expected data is extracted before proceeding
- **Identical Output**: Both frameworks produce the same property lists and verification results

### **Search Functionality**
- **Destination Selection**: Specifically targets "Porto, Portugal" from autocomplete
- **Date Selection**: Navigates calendar and selects next month (1st to 7th)
- **Results Verification**: Validates search parameters and extracts property information

### **Framework-Specific Features**

#### Selenium Advantages
- **Fine-grained Control**: Direct WebDriver control over browser actions
- **Cross-browser Support**: Extensive browser compatibility
- **Custom Wait Conditions**: Flexible explicit wait implementations

#### Cypress Advantages
- **Built-in Retry Logic**: Automatic command retries and smart waiting
- **Real-time Debugging**: Live browser interaction during test execution
- **Simpler Syntax**: More intuitive API for web automation
- **Automatic Screenshots**: Built-in failure capture and reporting

## Troubleshooting

### Debug Tips

- Use `debugger;` statements in your code to pause execution at specific points
- Check the browser console for any JavaScript errors
- Verify that Chrome is not being blocked by security software
- Ensure you have a stable internet connection

## Dependencies

### Selenium Dependencies
- **selenium-webdriver**: ^4.15.0 - Core Selenium WebDriver functionality
- **chromedriver**: ^140.0.0 - Chrome browser driver for Selenium

### Cypress Dependencies
- **cypress**: ^14.5.4 - Cypress testing framework with built-in browser automation

### Shared Dependencies
- **Node.js**: LTS version recommended for both frameworks

## Future Improvements

This section outlines planned enhancements to make the automation suite more robust, configurable, and suitable for enterprise-level CI/CD integration.

### **Configuration Management**
- **Config File System**: Implement a centralized configuration file (JSON/YAML) to manage:
  - Default timeouts for different operations (element waits, page loads, retries)
  - Browser selection (Chrome, Firefox, Safari, Edge)
  - Headless vs headed execution modes
  - Test data parameters (destinations, dates, retry counts)
  - Environment-specific settings (dev, staging, production)
  - Logging levels and output formats

### **Docker Integration**
- **Containerized Execution**: Create Docker images to enable:
  - Consistent test execution across different environments
  - Easy integration with CI/CD pipelines (GitHub Actions, Jenkins, GitLab CI)
  - Scalable parallel test execution
  - Simplified setup and deployment
  - Cross-platform compatibility

### **Reporting and Analytics**
- **Report Portal Integration**: Implement comprehensive reporting with:
  - Real-time test execution feedback
  - Historical test data and trends
  - Test failure analysis and root cause identification
  - Performance metrics and execution times
  - Screenshot and video capture on failures
  - Custom dashboards and notifications

### **Additional Enhancements**
- **Test Data Management**: Externalize test data to support multiple test scenarios
- **Parallel Execution**: Support for running multiple test instances simultaneously
- **API Integration**: Combine UI automation with API testing for comprehensive coverage
- **Visual Regression Testing**: Implement screenshot comparison for UI validation
- **Cross-Browser Testing**: Automated testing across multiple browser versions
- **Mobile Testing**: Extend automation to mobile web and responsive design testing

### **CI/CD Pipeline Integration**
- **Automated Triggers**: Configure tests to run on:
  - Pull request creation and updates
  - Code commits to specific branches
  - Scheduled nightly runs
  - Manual triggers for specific test suites
- **Quality Gates**: Implement test result-based deployment decisions
- **Notification System**: Alert teams on test failures and performance regressions

## Author

Jonathan Mendes Carvalheiro

