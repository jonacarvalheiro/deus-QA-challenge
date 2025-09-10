const BasePage = require('./BasePage.js')

class SearchResultsPage extends BasePage {
  constructor() {
    super()
    this.selectors = {
      propertyCard: '[data-testid="property-card"]',
      propertyTitle: '[data-testid="title"]',
      checkInDisplay: '[data-testid="date-display-field-start"]',
      checkOutDisplay: '[data-testid="date-display-field-end"]',
      propertyName: '.sr-hotel__name',
      propertyNameAlt: 'h3',
      propertyNameAlt2: 'h2'
    }
  }

  waitForResults() {
    cy.url().should('contain', 'searchresults', { timeout: 15000 })
    
    // Wait for property cards to be present
    cy.get(this.selectors.propertyCard, { timeout: 15000 }).should('exist')
    return this
  }

  getPropertyCount() {
    cy.get(this.selectors.propertyCard).then($cards => {
      const count = $cards.length
      cy.log(`Total number of properties found: ${count}`)
      console.log(`Total number of properties found: ${count}`)
    })
    return this
  }

  verifyCheckInDate(expectedDate) {
    cy.get(this.selectors.checkInDisplay)
      .should('be.visible')
      .invoke('text')
      .then(checkInText => {
        cy.log(`Check-in date displayed: ${checkInText}`)
        cy.log(`Expected day: ${expectedDate.getDate()}`)
        console.log(`Check-in date displayed: ${checkInText}`)
        console.log(`Expected day: ${expectedDate.getDate()}`)
      })
    return this
  }

  verifyCheckOutDate(expectedDate) {
    cy.get(this.selectors.checkOutDisplay)
      .should('be.visible')
      .invoke('text')
      .then(checkOutText => {
        cy.log(`Check-out date displayed: ${checkOutText}`)
        cy.log(`Expected day: ${expectedDate.getDate()}`)
        console.log(`Check-out date displayed: ${checkOutText}`)
        console.log(`Expected day: ${expectedDate.getDate()}`)
      })
    return this
  }

  getPropertyNames(maxRetries = 3) {
    cy.log('Property names from first page:')
    console.log('Property names from first page:')
    
    const attemptExtraction = (attempt) => {
      cy.log(`Attempt ${attempt} to extract property names...`)
      console.log(`Attempt ${attempt} to extract property names...`)
      
      cy.get(this.selectors.propertyCard).then($propertyCards => {
        const propertyNames = []
        let allNamesExtracted = true
        
        for (let i = 0; i < $propertyCards.length; i++) {
          let propertyName = ''
          
          // Try multiple selectors for property names using jQuery
          try {
            // Try primary selector first
            const titleSelector = this.selectors.propertyTitle.replace(/^\[data-testid="/, '').replace(/"\]$/, '')
            const $titleElement = $propertyCards.eq(i).find(`[data-testid="${titleSelector}"]`)
            if ($titleElement.length > 0) {
              propertyName = $titleElement.text().trim()
            } else {
              // Try alternative selectors
              const $altElement = $propertyCards.eq(i).find(this.selectors.propertyName)
              if ($altElement.length > 0) {
                propertyName = $altElement.text().trim()
              } else {
                const $altElement2 = $propertyCards.eq(i).find('h3')
                if ($altElement2.length > 0) {
                  propertyName = $altElement2.text().trim()
                } else {
                  const $altElement3 = $propertyCards.eq(i).find('h2')
                  if ($altElement3.length > 0) {
                    propertyName = $altElement3.text().trim()
                  }
                }
              }
            }
          } catch (e) {
            cy.log(`Property ${i + 1}: Error extracting name - ${e.message}`)
            console.log(`Property ${i + 1}: Error extracting name - ${e.message}`)
            allNamesExtracted = false
            propertyName = ''
          }
          
          // Check if we got a valid property name
          if (propertyName && propertyName.length > 0) {
            propertyNames.push(propertyName)
          } else {
            cy.log(`Property ${i + 1}: Empty name found`)
            console.log(`Property ${i + 1}: Empty name found`)
            allNamesExtracted = false
            propertyNames.push('') // Keep index alignment
          }
        }
        
        // Check if we have all property names
        const validNames = propertyNames.filter(name => name && name.trim().length > 0)
        
        if (allNamesExtracted && validNames.length === $propertyCards.length) {
          cy.log(`Successfully extracted all ${propertyNames.length} property names on attempt ${attempt}`)
          console.log(`Successfully extracted all ${propertyNames.length} property names on attempt ${attempt}`)
          
          // Print all property names in consolidated format 
          cy.log('Property names from first page:')
          console.log('Property names from first page:')
          for (let i = 0; i < propertyNames.length; i++) {
            cy.log(`Property ${i + 1}: ${propertyNames[i]}`)
            console.log(`Property ${i + 1}: ${propertyNames[i]}`)
          }
        } else {
          cy.log(`Attempt ${attempt} failed: Only ${validNames.length}/${$propertyCards.length} property names extracted`)
          console.log(`Attempt ${attempt} failed: Only ${validNames.length}/${$propertyCards.length} property names extracted`)
          
          if (attempt < maxRetries) {
            cy.log('Waiting 2 seconds before retry...')
            console.log('Waiting 2 seconds before retry...')
            cy.wait(2000)
            attemptExtraction(attempt + 1)
          } else {
            // If we get here, all attempts failed
            cy.log(`Failed to extract all property names after ${maxRetries} attempts`)
            console.log(`Failed to extract all property names after ${maxRetries} attempts`)
            
            // Still print whatever names we managed to extract
            cy.log('Property names from first page (partial):')
            console.log('Property names from first page (partial):')
            for (let i = 0; i < propertyNames.length; i++) {
              if (propertyNames[i]) {
                cy.log(`Property ${i + 1}: ${propertyNames[i]}`)
                console.log(`Property ${i + 1}: ${propertyNames[i]}`)
              } else {
                cy.log(`Property ${i + 1}: [Could not extract name]`)
                console.log(`Property ${i + 1}: [Could not extract name]`)
              }
            }
          }
        }
      })
    }
    
    attemptExtraction(1)
    return this
  }

  performAllVerifications(checkInDate, checkOutDate) {
    this.waitForResults()
    this.getPropertyCount()
    this.verifyCheckInDate(checkInDate)
    this.verifyCheckOutDate(checkOutDate)
    this.getPropertyNames()
    return this
  }
}

module.exports = SearchResultsPage
