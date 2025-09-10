const BasePage = require('./BasePage.js')
const { By, until, Key } = require('selenium-webdriver')

class HomePage extends BasePage {
  constructor(driver) {
    super(driver)
    this.selectors = {
      destinationInput: By.name('ss'),
      autocompleteResults: By.css('ul[data-testid="autocomplete-results"]'),
      autocompleteItem: By.css('li[data-testid="autocomplete-result"]'),
      checkInButton: By.css('button[data-testid="date-display-field-start"]'),
      checkOutButton: By.css('button[data-testid="date-display-field-end"]'),
      searchButton: By.css('button[type="submit"]'),
      calendarNextButton: By.css('button[aria-label="Next month"]'),
      calendarPrevButton: By.css('button[data-testid="calendar-prev-month"]')
    }
  }

  async enterDestination(destination) {
    console.log(`Entering destination: ${destination}`)
    
    
    // Type destination using wrapper method
    await this.sendKeysToElement(this.selectors.destinationInput, destination)
    await this.driver.sleep(3000) // Wait for autocomplete
    return this
  }

  async selectPortoSuggestion() {
    try {
      // Look for Porto, Portugal in the suggestions
      await this.clickElement(
        By.xpath("//li[.//div[contains(text(), 'Porto')] and .//div[contains(text(), 'Portugal')]]"),
        5000
      )
      console.log('Selected Porto, Portugal from suggestions')
      
    } catch (e) {
      console.log('Porto suggestion not found, trying alternative selectors...')
      try {
        // Try alternative selector
        await this.clickElement(
          By.xpath("//li[.//div[contains(text(), 'Porto')] and .//div[contains(text(), 'Portugal')]]"),
          3000
        )
        console.log('Selected Porto, Portugal using alternative selector')
      } catch (e2) {
        console.log('Could not find Porto suggestion, trying first available suggestion...')
        try {
          await this.clickElement(this.selectors.autocompleteItem, 3000)
          console.log('Selected first available suggestion')
        } catch (e3) {
          // If autocomplete doesn't work, try pressing Enter
          const destinationField = await this.findElement(this.selectors.destinationInput)
          await destinationField.sendKeys(Key.ENTER)
          console.log('Pressed Enter as fallback')
        }
      }
    }
    return this
  }

  async openDatePicker() {
    await this.clickElement(this.selectors.checkInButton)
    return this
  }

  async navigateToNextMonth() {
    await this.clickElement(this.selectors.calendarNextButton)
    return this
  }

  async selectDate(date) {
    const dateStr = this.formatDateForBooking(date)
    await this.clickElement(By.css(`span[data-date="${dateStr}"]`))
    return this
  }

  async selectCheckInDate(date) {
    await this.navigateToNextMonth()
    await this.selectDate(date)
    return this
  }

  async selectCheckOutDate(date) {
    await this.selectDate(date)
    return this
  }

  async clickSearch() {
    await this.clickElement(this.selectors.searchButton)
    return this
  }

  formatDateForBooking(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async searchForHotels(destination, checkInDate, checkOutDate) {
    await this.enterDestination(destination)
    await this.selectPortoSuggestion()
    await this.selectCheckInDate(checkInDate)
    await this.selectCheckOutDate(checkOutDate)
    await this.clickSearch()
    return this
  }
}

module.exports = HomePage
