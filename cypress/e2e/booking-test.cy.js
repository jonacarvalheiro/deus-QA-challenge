const HomePage = require('../pages/HomePage.js')
const SearchResultsPage = require('../pages/SearchResultsPage.js')

class BookingTestPOM {
  constructor() {
    this.homePage = null
    this.searchResultsPage = null
    this.checkInDate = null
    this.checkOutDate = null
  }

  setup() {
    // Calculate dates for next month
    const now = new Date()
    this.checkInDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    this.checkOutDate = new Date(now.getFullYear(), now.getMonth() + 1, 7)

    // Initialize page objects
    this.homePage = new HomePage()
    this.searchResultsPage = new SearchResultsPage()
  }

  runTest() {
    cy.log('Step 1: Clearing cache and cookies...')
    console.log('Step 1: Clearing cache and cookies...')
    this.homePage.clearCookiesAndCache()
    
    cy.log('Step 2: Navigating to booking.com...')
    console.log('Step 2: Navigating to booking.com...')
    this.homePage.visit('/')
    this.homePage.handlePopups() // Handle both cookies and Genius modal
    this.homePage.waitForPageLoad()

    cy.log('Steps 2-5: Performing search...')
    console.log('Steps 2-5: Performing search...')
    
    // Wait a moment for page to stabilize after popup handling
    cy.wait(2000)
    
    this.homePage.searchForHotels('Porto', this.checkInDate, this.checkOutDate)

    cy.log('Steps 6-9: Verifying results...')
    console.log('Steps 6-9: Verifying results...')
    this.searchResultsPage.performAllVerifications(this.checkInDate, this.checkOutDate)

    cy.log('Test completed successfully!')
    console.log('Test completed successfully!')
  }
}

describe('Booking.com Test - Cypress Version', () => {
  let test

  beforeEach(() => {
    test = new BookingTestPOM()
    test.setup()
  })

  it('should search for hotels in Porto and verify results', () => {
    test.runTest()
  })
  
})

module.exports = BookingTestPOM
