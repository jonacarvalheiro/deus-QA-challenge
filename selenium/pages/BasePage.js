const { until, By } = require('selenium-webdriver')

class BasePage {
  constructor(driver) {
    this.driver = driver
    this.baseUrl = 'https://www.booking.com'
  }

  // Wrapper for findElement with proper waiting
  async findElement(selector, timeout = 10000) {
    try {
      const element = await this.driver.wait(
        until.elementLocated(selector),
        timeout
      )
      return element
    } catch (error) {
      throw new Error(`Element not found: ${selector} - ${error.message}`)
    }
  }

  // Wrapper for findElements with proper waiting
  async findElements(selector, timeout = 10000, wait=true) {
    if(!wait){
      return await this.driver.findElements(selector)
    }

    try {
      const elements = await this.driver.wait(
        until.elementsLocated(selector),
        timeout
      )
      return elements
    } catch (error) {
      throw new Error(`Elements not found: ${selector} - ${error.message}`)
    }
  }



  // Wait for element to be visible and clickable, then click
  async clickElement(selector, timeout = 10000) {
    try {
      // Check if Genius modal exists and close it if present
      await this.closeGeniusModalIfPresent()
      
      const element = await this.findElement(selector, timeout)
      
      // Wait for element to be visible
      await this.driver.wait(until.elementIsVisible(element), 5000)
      
      // Wait for element to be clickable
      await this.driver.wait(until.elementIsEnabled(element), 5000)
      
      // Click the element
      await element.click()
      
      console.log(`Successfully clicked element: ${selector}`)
      return element
    } catch (error) {
      throw new Error(`Failed to click element: ${selector} - ${error.message}`)
    }
  }

  // Wait for element to be visible, then send keys
  async sendKeysToElement(selector, text, timeout = 10000) {
    try {
      // Check if Genius modal exists and close it if present
      await this.closeGeniusModalIfPresent()
      
      const element = await this.findElement(selector, timeout)
      
      // Wait for element to be visible
      await this.driver.wait(until.elementIsVisible(element), 5000)
      
      // Clear existing text and send new text
      await element.clear()
      await element.sendKeys(text)
      
      console.log(`Successfully sent keys to element: ${selector}`)
      return element
    } catch (error) {
      throw new Error(`Failed to send keys to element: ${selector} - ${error.message}`)
    }
  }

  // Wait for element to be visible, then get text
  async getElementText(selector, timeout = 10000) {
    try {
      const element = await this.findElement(selector, timeout)
      
      // Wait for element to be visible
      await this.driver.wait(until.elementIsVisible(element), 5000)
      
      const text = await element.getText()
      console.log(`Successfully got text from element: ${selector} - "${text}"`)
      return text
    } catch (error) {
      throw new Error(`Failed to get text from element: ${selector} - ${error.message}`)
    }
  }

  // Wait for element to be visible
  async waitForElementVisible(selector, timeout = 10000) {
    try {
      const element = await this.findElement(selector, timeout)
      await this.driver.wait(until.elementIsVisible(element), timeout)
      console.log(`Element is visible: ${selector}`)
      return element
    } catch (error) {
      throw new Error(`Element not visible: ${selector} - ${error.message}`)
    }
  }

  // Check if Genius modal exists and close it if present
  async closeGeniusModalIfPresent() {
    // Check if the modal exists by counting elements
    const geniusModalCloseButton = By.css('button[aria-label="Dismiss sign in information."]')
    const modalButtons = await this.driver.findElements(geniusModalCloseButton,0,false)
    
    // If count is 0, modal doesn't exist - move forward
    if (modalButtons.length === 0) {
      return // No modal found, continue normally
    }
    
    // If count > 0, modal exists - close it
    try {
      const closeButton = modalButtons[0] // Get the first (and should be only) button
      
      // Wait for button to be visible and clickable
      await this.driver.wait(until.elementIsVisible(closeButton), 2000)
      await this.driver.wait(until.elementIsEnabled(closeButton), 2000)
      
      // Click the close button
      await closeButton.click()
      console.log('Genius modal found and closed successfully')
      
      // Wait a moment for the modal to disappear
      await this.driver.sleep(1000)
      
    } catch (error) {
      console.log('Error closing Genius modal:', error.message)
    }
  }

  // Fail-safe method to close Genius modal if it appears (legacy method)
  async closeGeniusModal() {
    try {
      // Try to find and close the Genius modal using the dismiss button
      const geniusModalCloseButton = By.css('button[aria-label="Dismiss sign in information."]')
      
      // Wait for the modal to appear (short timeout)
      const closeButton = await this.driver.wait(
        until.elementLocated(geniusModalCloseButton),
        3000
      )
      
      // Wait for button to be visible and clickable
      await this.driver.wait(until.elementIsVisible(closeButton), 2000)
      await this.driver.wait(until.elementIsEnabled(closeButton), 2000)
      
      // Click the close button
      await closeButton.click()
      console.log('Genius modal closed successfully')
      
      // Wait a moment for the modal to disappear
      await this.driver.sleep(1000)
      
    } catch (error) {
      // Modal not found or already closed - this is expected behavior
      console.log('No Genius modal found or already closed')
    }
  }


  async visit(path = '') {
    await this.driver.get(this.baseUrl + path)
  }

  async clearCookiesAndCache() {
    try {
      console.log('Clearing cookies and cache...')
      
      // Clear all cookies
      await this.driver.manage().deleteAllCookies()
      console.log('All cookies cleared')
      
      // Navigate to the target site first to enable storage access
      await this.driver.get(this.baseUrl)
      await this.driver.sleep(1000)
      
      // Clear local storage
      try {
        await this.driver.executeScript('window.localStorage.clear();')
        console.log('Local storage cleared')
      } catch (e) {
        console.log('Local storage already clear or not accessible')
      }
      
      // Clear session storage
      try {
        await this.driver.executeScript('window.sessionStorage.clear();')
        console.log('Session storage cleared')
      } catch (e) {
        console.log('Session storage already clear or not accessible')
      }
      
      // Clear cache by navigating to about:blank and back
      await this.driver.get('about:blank')
      await this.driver.sleep(1000)
      
      console.log('Cache and cookies cleared successfully')
      
    } catch (error) {
      console.log('Error clearing cookies/cache:', error.message)
    }
  }

  async acceptCookies() {
    try {
      // Wait for the cookie button to be present and visible
      const cookieButton = await this.driver.wait(
        until.elementLocated(By.id('onetrust-accept-btn-handler')),
        5000
      )
      
      // Wait for the button to be visible and clickable
      await this.driver.wait(until.elementIsVisible(cookieButton), 3000)
      await this.driver.wait(until.elementIsEnabled(cookieButton), 2000)
      
      // Click the button
      await cookieButton.click()
      console.log('Cookie popup accepted')
      
      // Wait a moment for the popup to disappear
      await this.driver.sleep(1000)
      
    } catch (e) {
      console.log('Primary cookie button not found, trying alternative...')
      try {
        // Try alternative cookie button selector
        const altCookieButton = await this.driver.wait(
          until.elementLocated(By.css('[data-gdpr-consent="accept"]')),
          3000
        )
        
        await this.driver.wait(until.elementIsVisible(altCookieButton), 2000)
        await this.driver.wait(until.elementIsEnabled(altCookieButton), 2000)
        await altCookieButton.click()
        console.log('Alternative cookie popup accepted')
        
        // Wait a moment for the popup to disappear
        await this.driver.sleep(1000)
        
      } catch (e2) {
        console.log('No cookie popup found or already accepted')
      }
    }
  }

  // Handle both cookies and Genius modal
  async handlePopups() {
    // First handle cookies
    await this.acceptCookies()
    
  }

  async waitForPageLoad() {
    await this.driver.wait(
      until.urlContains('booking.com'),
      10000
    )
  }
}

module.exports = BasePage
