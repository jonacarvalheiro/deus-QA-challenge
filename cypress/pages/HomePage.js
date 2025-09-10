const BasePage = require('./BasePage.js')

class HomePage extends BasePage {
  constructor() {
    super()
    this.selectors = {
      destinationInput: '[name="ss"]',
      autocompleteResults: 'ul[data-testid="autocomplete-results"]',
      autocompleteItem: 'li[data-testid="autocomplete-result"]',
      checkInButton: 'button[data-testid="date-display-field-start"]',
      checkOutButton: 'button[data-testid="date-display-field-end"]',
      searchButton: 'button[type="submit"]',
      calendarNextButton: 'button[aria-label="Next month"]',
      calendarPrevButton: 'button[data-testid="calendar-prev-month"]'
    }
  }

  enterDestination(destination) {
    cy.log(`Entering destination: ${destination}`)
    console.log(`Entering destination: ${destination}`)
    
    // Type destination (wrapper handles popups automatically)
    this.sendKeysToElement(this.selectors.destinationInput, destination)
    cy.wait(3000) // Wait for autocomplete
    return this
  }

  selectPortoSuggestion() {
    // Check for popups first
    this.acceptCookiesIfPresent()
    this.closeGeniusModalIfPresent()
    
    // Check if Porto, Portugal suggestion exists
    cy.get('body').then($body => {
      // Try to find Porto, Portugal suggestion
      const portoSuggestion = $body.find('li:contains("Porto"):contains("Portugal")')
      
      if (portoSuggestion.length > 0) {
        cy.contains('li', 'Porto').contains('Portugal').click()
        cy.log('Selected Porto, Portugal from suggestions')
        console.log('Selected Porto, Portugal from suggestions')
      } else {
        cy.log('Porto suggestion not found, trying alternative selectors...')
        console.log('Porto suggestion not found, trying alternative selectors...')
        
        // Try to find any Porto suggestion
        const anyPortoSuggestion = $body.find('li:contains("Porto")')
        if (anyPortoSuggestion.length > 0) {
          cy.contains('li', 'Porto').first().click()
          cy.log('Selected Porto using alternative selector')
          console.log('Selected Porto using alternative selector')
        } else {
          cy.log('Could not find Porto suggestion, trying first available suggestion...')
          console.log('Could not find Porto suggestion, trying first available suggestion...')
          
          // Try first autocomplete item
          const autocompleteItems = $body.find(this.selectors.autocompleteItem.replace(/^\[/, '').replace(/\]$/, ''))
          if (autocompleteItems.length > 0) {
            this.clickElement(this.selectors.autocompleteItem)
            cy.log('Selected first available suggestion')
            console.log('Selected first available suggestion')
          } else {
            // If autocomplete doesn't work, try pressing Enter
            cy.get(this.selectors.destinationInput).type('{enter}')
            cy.log('Pressed Enter as fallback')
            console.log('Pressed Enter as fallback')
          }
        }
      }
    })
    return this
  }

  openDatePicker() {
    this.clickElement(this.selectors.checkInButton)
    return this
  }

  navigateToNextMonth() {
    this.clickElement(this.selectors.calendarNextButton)
    return this
  }

  selectDate(date) {
    const dateStr = this.formatDateForBooking(date)
    this.clickElement(`span[data-date="${dateStr}"]`)
    return this
  }

  selectCheckInDate(date) {
    this.navigateToNextMonth()
    this.selectDate(date)
    return this
  }

  selectCheckOutDate(date) {
    this.selectDate(date)
    return this
  }

  clickSearch() {
    this.clickElement(this.selectors.searchButton)
    return this
  }

  formatDateForBooking(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  searchForHotels(destination, checkInDate, checkOutDate) {
    this.enterDestination(destination)
    this.selectPortoSuggestion()
    this.selectCheckInDate(checkInDate)
    this.selectCheckOutDate(checkOutDate)
    this.clickSearch()
    return this
  }
}

module.exports = HomePage
