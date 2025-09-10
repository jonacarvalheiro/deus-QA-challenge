class BasePage {
  constructor() {
    this.baseUrl = 'https://www.booking.com'
  }

  // Find element and wait for it to show up 
  findElement(selector, timeout = 5000) {
    try {
      return cy.get(selector, { timeout })
    } catch (error) {
      throw new Error(`Element not found: ${selector} - ${error.message}`)
    }
  }

  // Find multiple elements and wait for them 
  findElements(selector, timeout = 5000, wait = true) {
    if (!wait) {
      return cy.get('body').then($body => {
        return $body.find(selector).length > 0 ? cy.get(selector) : cy.wrap([])
      })
    }

    try {
      return cy.get(selector, { timeout })
    } catch (error) {
      throw new Error(`Elements not found: ${selector} - ${error.message}`)
    }
  }

  // Click element after making sure it's ready 
  clickElement(selector, timeout = 5000) {
    // Always check for popups before any interaction
    this.acceptCookiesIfPresent()
    this.closeGeniusModalIfPresent()
    
    cy.get(selector, { timeout })
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    
    cy.log(`Successfully clicked element: ${selector}`)
    console.log(`Successfully clicked element: ${selector}`)
    return this
  }

  // Type text into element after waiting for it
  sendKeysToElement(selector, text, timeout = 5000) {
    // Always check for popups before any interaction
    this.acceptCookiesIfPresent()
    this.closeGeniusModalIfPresent()
    
    // Handle potential DOM re-rendering by completely separating operations
    // Step 1: Wait for element to be visible
    cy.get(selector, { timeout }).should('be.visible')
    
    // Step 2: Clear the field (re-query to avoid detachment)
    cy.get(selector).then($el => {
      if ($el.val()) {
        cy.get(selector).clear({ force: true })
      }
    })
    
    // Step 3: Type the text (re-query again to avoid detachment)
    cy.get(selector).type(text, { force: true })
    
    cy.log(`Successfully sent keys to element: ${selector}`)
    console.log(`Successfully sent keys to element: ${selector}`)
    return this
  }

  // Get text from element
  getElementText(selector, timeout = 10000) {
    cy.get(selector, { timeout })
      .should('be.visible')
      .invoke('text')
      .then(text => {
        cy.log(`Successfully got text from element: ${selector} - "${text}"`)
        console.log(`Successfully got text from element: ${selector} - "${text}"`)
      })
    return this
  }

  // Wait for element to show up 
  waitForElementVisible(selector, timeout = 10000) {
    cy.get(selector, { timeout }).should('be.visible')
    cy.log(`Element is visible: ${selector}`)
    console.log(`Element is visible: ${selector}`)
    return this
  }

  // Close Genius modal if it's there 
  closeGeniusModalIfPresent() {
    // Look for modal close button (works in English and Portuguese)
    const englishSelector = 'button[aria-label="Dismiss sign in information."]'
    const portugueseSelector = 'button[aria-label="Ignorar informação sobre iniciar sessão."]'
    
    cy.get('body').then($body => {
      const englishButtons = $body.find(englishSelector)
      const portugueseButtons = $body.find(portugueseSelector)
      
      // No modal found, keep going
      if (englishButtons.length === 0 && portugueseButtons.length === 0) {
        return // No modal found, continue normally
      }
      
      // Found modal, close it
      if (englishButtons.length > 0) {
        cy.get(englishSelector)
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        console.log('English Genius modal found and closed successfully')
        cy.log('Genius modal found and closed successfully')
        console.log('Genius modal found and closed successfully')
        cy.wait(1000)
      } else if (portugueseButtons.length > 0) {
        cy.get(portugueseSelector)
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        console.log('Portuguese Genius modal found and closed successfully')
        cy.log('Genius modal found and closed successfully')
        console.log('Genius modal found and closed successfully')
        cy.wait(1000)
      }
    })
  }

  // Fail-safe method to close Genius modal if it appears (legacy method) - exact equivalent
  closeGeniusModal() {
    // Try both English and Portuguese selectors
    const englishSelector = 'button[aria-label="Dismiss sign in information."]'
    const portugueseSelector = 'button[aria-label="Ignorar informação sobre iniciar sessão."]'
    
    cy.get('body').then($body => {
      if ($body.find(englishSelector).length > 0) {
        cy.get(englishSelector, { timeout: 3000 })
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        
        cy.log('Genius modal closed successfully (English)')
        cy.wait(1000)
      } else if ($body.find(portugueseSelector).length > 0) {
        cy.get(portugueseSelector, { timeout: 3000 })
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        
        cy.log('Genius modal closed successfully (Portuguese)')
        cy.wait(1000)
      } else {
        cy.log('No Genius modal found or already closed')
      }
    })
  }

  visit(path = '') {
    cy.visit(this.baseUrl + path)
  }

  // Start fresh by clearing everything 
  clearCookiesAndCache() {
    try {
      cy.log('Clearing cookies and cache...')
      
      // Clear all cookies
      cy.clearCookies()
      cy.log('All cookies cleared')
      console.log('All cookies cleared')
      
      // Navigate to the target site first to enable storage access
      cy.visit(this.baseUrl)
      cy.wait(1000)
      
      // Clear local storage
      try {
        cy.clearLocalStorage()
        cy.log('Local storage cleared')
        console.log('Local storage cleared')
      } catch (e) {
        cy.log('Local storage already clear or not accessible')
        console.log('Local storage already clear or not accessible')
      }
      
      // Clear session storage
      try {
        cy.window().then((win) => {
          win.sessionStorage.clear()
        })
        cy.log('Session storage cleared')
        console.log('Session storage cleared')
      } catch (e) {
        cy.log('Session storage already clear or not accessible')
        console.log('Session storage already clear or not accessible')
      }
      
      // Clear cache by navigating to about:blank and back
      cy.visit('about:blank')
      cy.wait(1000)
      
      cy.log('Cache and cookies cleared successfully')
      console.log('Cache and cookies cleared successfully')
      
    } catch (error) {
      cy.log('Error clearing cookies/cache:', error.message)
    }
  }

  // Wait for and accept cookies if they appear
  waitForAndAcceptCookies() {
    cy.log('Waiting for cookie popup to appear...')
    console.log('Waiting for cookie popup to appear...')
    
    // Wait for cookie popup to appear (with reasonable timeout)
    cy.get('body').then($body => {
      // First check if any cookie popup is already visible
      const existingCookies = $body.find('#onetrust-accept-btn-handler:visible, [data-gdpr-consent="accept"]:visible, button:contains("Accept"):visible')
      
      if (existingCookies.length > 0) {
        // Cookie popup already visible
        this.acceptCookiesIfPresent()
      } else {
        // Wait for cookie popup to appear
        cy.get('#onetrust-accept-btn-handler, [data-gdpr-consent="accept"], button:contains("Accept")', { timeout: 10000 })
          .should('be.visible')
          .then(() => {
            cy.log('Cookie popup appeared, accepting...')
            console.log('Cookie popup appeared, accepting...')
            this.acceptCookiesIfPresent()
          })
      }
    }).then(() => {
      // Extra wait to ensure cookies are fully processed
      cy.wait(2000)
      cy.log('Cookie handling completed')
      console.log('Cookie handling completed')
    })
  }

  // Accept cookies if they show up (immediate check)
  acceptCookiesIfPresent() {
    cy.get('body').then($body => {
      // Look for visible cookie buttons
      const primaryButton = $body.find('#onetrust-accept-btn-handler:visible')
      const altButton = $body.find('[data-gdpr-consent="accept"]:visible')
      const genericButton = $body.find('button:contains("Accept"):visible')
      
      if (primaryButton.length > 0) {
        cy.get('#onetrust-accept-btn-handler')
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        
        cy.log('Cookie popup accepted')
        console.log('Cookie popup accepted')
        cy.wait(1000)
      } else if (altButton.length > 0) {
        cy.log('Primary cookie button not found, trying alternative...')
        console.log('Primary cookie button not found, trying alternative...')
        
        cy.get('[data-gdpr-consent="accept"]')
          .should('be.visible')
          .should('not.be.disabled')
          .click()
        
        cy.log('Alternative cookie popup accepted')
        console.log('Alternative cookie popup accepted')
        cy.wait(1000)
      } else if (genericButton.length > 0) {
        cy.log('Trying generic Accept button...')
        console.log('Trying generic Accept button...')
        cy.contains('button', 'Accept').click()
        
        cy.log('Generic Accept button clicked')
        console.log('Generic Accept button clicked')
        cy.wait(1000)
      }
      // If no visible cookie popup found, just continue - no logging needed
    })
  }

  // Legacy method for backward compatibility
  acceptCookies() {
    this.acceptCookiesIfPresent()
  }

  // Deal with popups that show up
  handlePopups() {
    console.log('Starting popup handling...')
    
    // Wait for and handle cookies if they appear
    this.waitForAndAcceptCookies()
    
    // Check and handle Genius modal if present
    this.closeGeniusModalIfPresent()
    
    console.log('Popup handling completed')
  }

  waitForPageLoad() {
    cy.url().should('contain', 'booking.com')
  }
}

module.exports = BasePage
