const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

// App constants
const apiPrefix = '/api'

const accountRouter = require('./controllers/accounts')
/*
// Store data in-memory, not suited for production use!
const db = {
  test: {
    user: 'test',
    currency: '$',
    description: `Test account`,
    balance: 75,
    transactions: [
      { id: '1', date: '2020-10-01', object: 'Pocket money', amount: 50 },
      { id: '2', date: '2020-10-03', object: 'Book', amount: -10 },
      { id: '3', date: '2020-10-04', object: 'Sandwich', amount: -5 }
    ],
  }
};
*/
// Create the Express app & setup middlewares
const app = express()

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({ origin: /http:\/\/(127(\.\d){3}|localhost)/ }))
app.options('*', cors())
app.use(middleware.requestLogger)


// ***************************************************************************

// ***************************************************************************

// Add 'api` prefix to all routes
app.use(apiPrefix, accountRouter)

module.exports = app
