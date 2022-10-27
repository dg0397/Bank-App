const bcrypt = require('bcrypt')
const accountRouter = require('express').Router()
const Account = require('../models/account')

const pkg = require('../package.json')

// Get server infos
accountRouter.get('/', (request, response) => {
  console.log('hey')
  return response.send(`${pkg.description} v${pkg.version}`)
})

// ----------------------------------------------

// Create an account
accountRouter.post('/accounts', async (request, response) => {
  let { user, currency, balance, description, password } = request.body

  // Convert balance to number if needed
  if (balance && typeof balance !== 'number') {
    balance = parseFloat(balance)
    if (isNaN(balance)) {
      return response.status(400).json({ error: 'Balance must be a number' })
    }
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // Create account
  const account = new Account({
    user,
    currency,
    balance,
    passwordHash,
    description: description || `${user}'s budget`
  })

  const savedAccount = await account.save()

  return response.status(201).json(savedAccount)
})

// ----------------------------------------------

// Get all data for the specified account
accountRouter.get('/accounts/:accountId', async (request, response) => {
  const account = await Account.findById(request.params.accountId)

  // Check if account exists
  if (!account) {
    return response.status(404).json({ error: 'User does not exist' })
  }

  return response.json(account)
})

// ----------------------------------------------

// Get all of transactions for the specified account
accountRouter.get('/accounts/:accountId/transactions', async (request, response) => {
  const account = await Account.findById(request.params.accountId)

  // Check if account exists
  if (!account) {
    return response.status(404).json({ error: 'User does not exist' })
  }

  return response.json({
    data: [...account.transactions]
  })
})

// ----------------------------------------------

// Remove specified account
accountRouter.delete('/accounts/:accountId', async (request, response) => {
  const account = await Account.findById(request.params.accountId)

  // Check if account exists
  if (!account) {
    return response.status(404).json({ error: 'User does not exist' })
  }

  // Removed account
  await account.remove()

  response.sendStatus(204)
})

// ----------------------------------------------
/*
// Add a transaction to a specific account
accountRouter.post('/accounts/:user/transactions', async (request, response) => {
  const account = await Account.findById(request.params.accountId);
  let { date, object,amount } = request.body
  // Check if account exists
  if (!account) {
    return response.status(404).json({ error: 'User does not exist' });
  }

  // Check mandatory requests parameters
  if (date || object || amount) {
    return response.status(400).json({ error: 'Missing parameters' });
  }

  // Convert amount to number if needed
  if (amount && typeof amount !== 'number') {
    amount = parseFloat(amount);
  }

  // Check that amount is a valid number
  if (amount && isNaN(amount)) {
    return response.status(400).json({ error: 'Amount must be a number' });
  }

  // Add transaction
  const transaction = {
    date,
    object,
    amount,
  };

  account.transactions.push(transaction);

  // Update balance
  account.balance += transaction.amount;

  return response.status(201).json(transaction);
});

// ----------------------------------------------

// Remove specified transaction from account
accountRouter.delete('/accounts/:user/transactions/:id', async (request, response) => {
  const account = db[req.params.user];

  // Check if account exists
  if (!account) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  const transactionIndex = account.transactions.findIndex(
    (transaction) => transaction.id === req.params.id
  );

  // Check if transaction exists
  if (transactionIndex === -1) {
    return res.status(404).json({ error: 'Transaction does not exist' });
  }

  // Remove transaction
  account.transactions.splice(transactionIndex, 1);

  res.sendStatus(204);
});
*/
module.exports = accountRouter
