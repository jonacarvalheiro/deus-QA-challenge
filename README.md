# Booking.com Selenium Automation

## Overview

This project provides a robust set of Selenium WebDriver automated tests for the Booking.com website, implemented using JavaScript and the Page Object Model (POM) design pattern. The tests are designed to simulate user interactions, such as searching for hotels, handling dynamic pop-ups (like cookie consent and Genius modals), and extracting information from search results. The focus is on creating stable, maintainable, and reliable automation scripts.

## Decisions Taken

Here are the key decisions and approaches taken during the development of this automation suite:

### **Why Selenium?**
The choice to use Selenium WebDriver was primarily driven by extensive prior experience with the framework. This allowed for a quicker setup and focused effort on implementing robust test logic, leveraging existing knowledge to address automation challenges efficiently.

### **Why JavaScript?**
JavaScript was selected as the programming language for this project to provide an opportunity for practice and to enhance proficiency in a language where I'm not as comfortable as with Java or C#. This choice aimed to improve JavaScript skills while building a functional automation suite. It's important to note that Selenium WebDriver operations are inherently asynchronous, involving network calls to the browser, and all WebDriver methods return Promises. Therefore, `async/await` is essential for writing clean, readable, and maintainable test code, avoiding complex `.then()` chains.

### **Page Object Model (POM)**
The Page Object Model (POM) design pattern was adopted to make the codebase simpler and more reusable. By encapsulating elements and interactions specific to each page within dedicated page classes (e.g., `HomePage`, `SearchResultsPage`), the tests become more organized, easier to understand, and less prone to breaking changes when UI elements are modified. This separation of concerns makes the test suite scalable and easier to manage.

### **Robust Element Interaction (Wrappers & Waits)**
To ensure test stability and reliability, a set of wrapper methods was implemented in the `BasePage`. These wrappers abstract away common Selenium interactions (like `findElement`, `clickElement`, `sendKeysToElement`) and incorporate explicit waits. This ensures that elements are not only present in the DOM but also visible and clickable before any interaction, significantly reducing flaky tests caused by timing issues.

**Genius Modal Handling**: A dynamic and efficient fail-safe mechanism was implemented to handle the "Genius modal" pop-up. Instead of relying on `try-catch` blocks, the system now proactively checks for the modal's existence by counting elements. If the modal is present, it is gracefully dismissed before proceeding with other interactions, ensuring uninterrupted test flow. This check is integrated into core interaction methods like `clickElement` and `sendKeysToElement` for comprehensive coverage.

**Cookie Acceptance Logic**: A comprehensive cookie acceptance mechanism was developed. It first attempts to find and click the primary cookie acceptance button, waiting for it to be located, visible, and clickable. If the primary button is not found, it gracefully falls back to an alternative selector. This ensures that the test can proceed regardless of the specific cookie banner implementation.

### **Selector Strategy**
Wherever possible, `data-testid` attributes provided by the Booking.com website were prioritized for element selection. These attributes are generally more stable and less likely to change than CSS classes or other dynamic attributes, leading to more resilient selectors. When `data-testid` was not available or insufficient, more robust XPath selectors were crafted to target specific elements, such as the "Porto, Portugal" suggestion in the autocomplete dropdown or the "Next month" button using its `aria-label`.

### **Clean Test Environment**
To guarantee consistent test results and prevent interference from previous runs, a robust cache and cookie clearing mechanism was implemented. Each test execution now starts with a clean browser state. For debugging purposes, unique user data directories and remote debugging ports are generated for each run, preventing conflicts and allowing for simultaneous debugging sessions.

### **Robust Data Extraction**
The method for extracting property names from search results was enhanced with retry logic. This ensures that if initial attempts to retrieve all property names yield incomplete or empty results (due to potential loading delays), the operation is retried after a short delay until all expected data is successfully extracted. This makes the data extraction process more reliable and resilient to dynamic content loading.

## Project Structure

```
deus-QA-challenge/
├── selenium/
│   ├── pages/
│   │   ├── BasePage.js          # Base page with common functionality and wrappers
│   │   ├── HomePage.js          # Home page interactions and search functionality
│   │   └── SearchResultsPage.js # Search results page and data extraction
│   └── test.js              # Main test file using Page Object Model
├── package.json                 # Project dependencies and scripts
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

### Running the Main Test

To execute the primary Page Object Model test suite:

```bash
node selenium/test.js
```

This command will:
- Launch a Chrome browser
- Navigate to Booking.com
- Clear cookies and cache for a clean start
- Handle cookie consent and Genius modals
- Search for hotels in Porto, Portugal
- Extract and display property information
- Print results to the console

### Running Tests with Debugging

To run the tests with the Node.js debugger attached, allowing you to set breakpoints and step through the code:

1. **Start the debug script from your terminal:**
   ```bash
   npm run selenium:debug
   ```
   This command will start the test in debug mode and open a Chrome browser instance. The browser will pause at the first line of code or at any `debugger;` statements you've placed in the code.

2. **Attach your IDE's debugger:**
   - **VS Code**: Go to the "Run and Debug" view (Ctrl+Shift+D or Cmd+Shift+D). Select "Attach to Node.js Process" or ensure your debugger automatically attaches to the specified remote debugging port.
   - **Chrome DevTools**: Open `chrome://inspect` in your browser and click "Open dedicated DevTools for Node" when the process appears.

3. **Control execution:**
   You can then use the debugger controls (step over, step into, continue, etc.) to navigate through your test execution, inspect variables, and understand the flow.

### Alternative Debug Commands

- **Non-breaking debug mode:**
  ```bash
  npm run selenium:debug-chrome
  ```
  This starts the debugger without breaking at the first line, allowing the test to run normally while still providing debugging capabilities.

## Test Features

### **Automated Popup Handling**
- **Cookie Consent**: Automatically accepts cookies using multiple fallback selectors
- **Genius Modal**: Dynamically detects and dismisses promotional modals
- **Clean State**: Each test starts with cleared cache and cookies

### **Robust Element Interaction**
- **Explicit Waits**: All interactions wait for elements to be visible and clickable
- **Multiple Selectors**: Fallback strategies for different UI variations
- **Error Handling**: Graceful degradation when elements are not found

### **Data Extraction**
- **Retry Logic**: Automatically retries data extraction if incomplete
- **Multiple Selectors**: Tries various selectors to find property names
- **Complete Validation**: Ensures all expected data is extracted before proceeding

### **Search Functionality**
- **Destination Selection**: Specifically targets "Porto, Portugal" from autocomplete
- **Date Selection**: Navigates calendar and selects specific dates
- **Results Verification**: Validates search parameters and extracts property information

## Troubleshooting

### Debug Tips

- Use `debugger;` statements in your code to pause execution at specific points
- Check the browser console for any JavaScript errors
- Verify that Chrome is not being blocked by security software
- Ensure you have a stable internet connection

## Dependencies

- **selenium-webdriver**: ^4.15.0 - Core Selenium WebDriver functionality
- **chromedriver**: ^140.0.0 - Chrome browser driver for Selenium

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

