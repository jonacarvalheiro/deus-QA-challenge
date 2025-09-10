const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const HomePage = require('./pages/HomePage.js');
const SearchResultsPage = require('./pages/SearchResultsPage.js');

class BookingTestPOM {
  constructor() {
    this.driver = null;
    this.homePage = null;
    this.searchResultsPage = null;
    this.checkInDate = null;
    this.checkOutDate = null;
    this.tempDirTimestamp = Date.now();
  }

  async setup() {
    // Calculate dates for next month
    const now = new Date();
    this.checkInDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    this.checkOutDate = new Date(now.getFullYear(), now.getMonth() + 1, 7);

    // Setup Chrome options for debugging with cache/cookie clearing
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1280,720');
    options.addArguments('--disable-web-security');
    options.addArguments('--disable-features=VizDisplayCompositor');
    options.addArguments(`--remote-debugging-port=${9222 + Math.floor(Math.random() * 1000)}`);
    options.addArguments(`--user-data-dir=/tmp/chrome-debug-${this.tempDirTimestamp}`);
    // Clear cache and cookies on startup
    options.addArguments('--clear-cache');
    options.addArguments('--disable-application-cache');
    options.addArguments('--disable-offline-load-stale-cache');
    options.addArguments('--aggressive-cache-discard');
    // Remove headless mode for debugging
    // options.addArguments('--headless');

    // Initialize WebDriver
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000
    });

    // Initialize page objects
    this.homePage = new HomePage(this.driver);
    this.searchResultsPage = new SearchResultsPage(this.driver);
  }

  async teardown() {
    if (this.driver) {
      await this.driver.quit();
    }
    
    // Clean up temporary Chrome data directory
    try {
      const fs = require('fs');
      const path = require('path');
      const tempDir = `/tmp/chrome-debug-${this.tempDirTimestamp}`;
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Cleaned up temporary Chrome data directory');
      }
    } catch (e) {
      console.log('Could not clean up temporary directory:', e.message);
    }
  }

  async runTest() {
    try {
      await this.setup();

      console.log('Step 1: Clearing cache and cookies...');
      await this.homePage.clearCookiesAndCache();
      
      console.log('Step 2: Navigating to booking.com...');
      await this.homePage.visit('/');
      await this.homePage.handlePopups(); // Handle both cookies and Genius modal
      await this.homePage.waitForPageLoad();

      console.log('Steps 2-5: Performing search...');
      await this.homePage.searchForHotels('Porto', this.checkInDate, this.checkOutDate);

      console.log('Steps 6-9: Verifying results...');
      await this.searchResultsPage.performAllVerifications(this.checkInDate, this.checkOutDate);

      console.log('\nTest completed successfully!');

    } catch (error) {
      console.error('Test failed:', error.message);
      throw error;
    } finally {
      await this.teardown();
    }
  }
}

// Run the test
async function runBookingTestPOM() {
  const test = new BookingTestPOM();
  await test.runTest();
}

// Execute if this file is run directly
if (require.main === module) {
  runBookingTestPOM().catch(console.error);
}

module.exports = BookingTestPOM;
