const BasePage = require('./BasePage.js')
const { By, until } = require('selenium-webdriver')

class SearchResultsPage extends BasePage {
  constructor(driver) {
    super(driver)
    this.selectors = {
      propertyCard: By.css('[data-testid="property-card"]'),
      propertyTitle: By.css('[data-testid="title"]'),
      checkInDisplay: By.css('[data-testid="date-display-field-start"]'),
      checkOutDisplay: By.css('[data-testid="date-display-field-end"]'),
      propertyName: By.css('.sr-hotel__name'),
      propertyNameAlt: By.css('h3'),
      propertyNameAlt2: By.css('h2')
    }
  }

  async waitForResults() {
    await this.driver.wait(
      until.urlContains('searchresults'),
      15000
    )
    
    // Wait for property cards to be present
    await this.findElements(this.selectors.propertyCard, 15000)
    return this
  }

  async getPropertyCount() {
    const propertyCards = await this.findElements(this.selectors.propertyCard)
    const count = propertyCards.length
    console.log(`Total number of properties found: ${count}`)
    return count
  }

  async verifyCheckInDate(expectedDate) {
    const checkInText = await this.getElementText(this.selectors.checkInDisplay)
    console.log(`Check-in date displayed: ${checkInText}`)
    console.log(`Expected day: ${expectedDate.getDate()}`)
    return this
  }

  async verifyCheckOutDate(expectedDate) {
    const checkOutText = await this.getElementText(this.selectors.checkOutDisplay)
    console.log(`Check-out date displayed: ${checkOutText}`)
    console.log(`Expected day: ${expectedDate.getDate()}`)
    return this
  }

  async getPropertyNames(maxRetries = 3) {
    console.log('Property names from first page:')
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt} to extract property names...`)
      
      const propertyCards = await this.findElements(this.selectors.propertyCard)
      const propertyNames = []
      let allNamesExtracted = true
      
      for (let i = 0; i < propertyCards.length; i++) {
        try {
          // Try multiple selectors for property names
          let propertyName = ''
          
          // Try primary selector first
          try {
            const titleElement = await propertyCards[i].findElement(this.selectors.propertyTitle)
            propertyName = await titleElement.getText()
          } catch (e) {
            // Try alternative selectors
            try {
              const altElement = await propertyCards[i].findElement(this.selectors.propertyName)
              propertyName = await altElement.getText()
            } catch (e2) {
              try {
                const altElement2 = await propertyCards[i].findElement(this.selectors.propertyNameAlt)
                propertyName = await altElement2.getText()
              } catch (e3) {
                try {
                  const altElement3 = await propertyCards[i].findElement(this.selectors.propertyNameAlt2)
                  propertyName = await altElement3.getText()
                } catch (e4) {
                  propertyName = ''
                }
              }
            }
          }
          
          // Check if we got a valid property name
          if (propertyName && propertyName.trim().length > 0) {
            propertyNames.push(propertyName.trim())
          } else {
            console.log(`Property ${i + 1}: Empty name found`)
            allNamesExtracted = false
            propertyNames.push('') // Keep index alignment
          }
          
        } catch (e) {
          console.log(`Property ${i + 1}: Error extracting name - ${e.message}`)
          allNamesExtracted = false
          propertyNames.push('') // Keep index alignment
        }
      }
      
      // Check if we have all property names
      const validNames = propertyNames.filter(name => name && name.trim().length > 0)
      
      if (allNamesExtracted && validNames.length === propertyCards.length) {
        console.log(`Successfully extracted all ${propertyNames.length} property names on attempt ${attempt}`)
        
        // Print all property names
        for (let i = 0; i < propertyNames.length; i++) {
          console.log(`Property ${i + 1}: ${propertyNames[i]}`)
        }
        
        return this
      } else {
        console.log(`Attempt ${attempt} failed: Only ${validNames.length}/${propertyCards.length} property names extracted`)
        
        if (attempt < maxRetries) {
          console.log('Waiting 2 seconds before retry...')
          await this.driver.sleep(2000)
        }
      }
    }
    
    // If we get here, all attempts failed
    console.log(`Failed to extract all property names after ${maxRetries} attempts`)
    return this
  }

  async performAllVerifications(checkInDate, checkOutDate) {
    await this.waitForResults()
    await this.getPropertyCount()
    await this.verifyCheckInDate(checkInDate)
    await this.verifyCheckOutDate(checkOutDate)
    await this.getPropertyNames()
    return this
  }
}

module.exports = SearchResultsPage
