const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const accountSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    minLength: [3, 'Username characters must be greater or equal to 3'],
    unique: true
  },
  currency: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transactions'
    }
  ]
})

accountSchema.plugin(uniqueValidator)

accountSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const Account = mongoose.model('Account', accountSchema)

module.exports = Account
