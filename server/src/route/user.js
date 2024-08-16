const express = require('express')
const router = express.Router()
const { User } = require('../class/user')
const { Session } = require('../class/session')
const { Notification } = require('../class/notification')
const { Transaction } = require('../class/transaction')

router.post('/change-email', (req, res) => {
  const { email, password } = req.body
  const token = req.headers.authorization.split(' ')[1]

  if (!email || !password) {
    return res.status(400).json({
      message: 'Not correct data',
    })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(401)
        .json({ message: 'User isn`t authentificated' })
    }

    const user = User.getByEmail(session.user.email)

    if (password !== user.password) {
      return res
        .status(400)
        .json({ message: 'Password isn`t correct' })
    }

    user.email = email

    session.user.email = email
    Session.update(token, session)

    Notification.create(user.id, 'Warning', 'New Email')

    console.log(user)
    return res
      .status(200)
      .json({ message: 'Email has been updated', email })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=====================================================================

router.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: 'Not correct data',
    })
  }

  if (!token) {
    return res
      .status(400)
      .json({ message: 'User isn`t authentificated' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(400)
        .json({ message: 'User isn`t authentificated' })
    }

    const user = User.getByEmail(session.user.email)

    if (!user || user.password !== oldPassword) {
      return res
        .status(400)
        .json({ message: 'Old password isn`t correct' })
    }

    user.password = newPassword
    Notification.create(user.id, 'Warning', 'New Password')
    console.log(user)
    return res
      .status(200)
      .json({ message: 'Password has been updated' })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=====================================================================

router.get('/notifications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res
      .status(400)
      .json({ message: 'User isn`t authentificated' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(400)
        .json({ message: 'User isn`t authentificated' })
    }

    const notifications = Notification.getByUserId(
      session.user.id,
    )
    return res.status(200).json({ notifications })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=====================================================================

router.get('/balance', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(401)
        .json({ message: 'User isn`t authentificated' })
    }

    const user = User.getById(session.user.id)
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User wasn`t found' })
    }

    const transactions = Transaction.getByUserId(
      session.user.id,
    )
    console.log('Transactions:', transactions)

    return res
      .status(200)
      .json({ balance: user.balance, transactions })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=====================================================================

router.post('/receive', (req, res) => {
  const { amount, paymentSystem } = req.body
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: 'Not correct amount' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(401)
        .json({ message: 'User isn`t authentificated' })
    }

    const user = User.getById(session.user.id)
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User wasn`t found' })
    }

    user.balance += amount

    Notification.create(
      user.id,
      'Payment',
      `The balance is replenished with ${amount} using ${paymentSystem}`,
    )
    Transaction.create(
      user.id,
      'receive',
      amount,
      paymentSystem,
    )

    return res.status(200).json({
      message: 'Balance has been replenished successfully',
      balance: user.balance,
    })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=======================================================================

router.get('/transactions', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(401)
        .json({ message: 'User isn`t authentificated' })
    }

    const transactions = Transaction.getByUserId(
      session.user.id,
    )
    return res
      .status(200)
      .json({ transactions: transactions })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

//=======================================================================

router.get('/transaction/:transactionId', (req, res) => {
  const transactionId = parseInt(req.params.transactionId)
  const numericTransactionId = Number(transactionId)

  if (isNaN(numericTransactionId)) {
    return res
      .status(400)
      .json({ message: 'Not correct transaction ID' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res
        .status(401)
        .json({ message: 'User isn`t authentificated' })
    }

    const transaction = Transaction.getById(
      numericTransactionId,
    )

    if (!transaction) {
      return res
        .status(404)
        .json({ message: 'Transaction wasn`t found' })
    }

    let userEmail
    if (transaction.type === 'send') {
      const recipient = User.getById(transaction.userId)
      userEmail = recipient ? recipient.email : 'Unknown'
    } else if (transaction.type === 'receive') {
      if (transaction.paymentSystem) {
        userEmail = transaction.paymentSystem
      } else {
        const sender = User.getById(transaction.userId)
        userEmail = sender ? sender.email : 'Unknown'
      }
    }

    return res.status(200).json({ transaction, userEmail })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

//=======================================================================
router.post('/send', (req, res) => {
  const { email, amount } = req.body
  console.log('Email: ', email)
  console.log('Amount: ', amount)

  const token = req.headers.authorization?.split(' ')[1]

  console.log(
    `Received request to send money: email=${email}, amount=${amount}`,
  )

  if (!token) {
    console.log('Authorization token not provided')
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  const session = Session.get(token)

  if (!session) {
    console.log('Session not found for provided token')
    return res
      .status(401)
      .json({ message: 'User isn`t authentificated' })
  }

  const sender = User.getByEmail(session.user.email)
  console.log('Sender: ', sender)

  const receiver = User.getByEmail(email)
  console.log('Receiver: ', receiver)

  if (!receiver) {
    console.log(`Receiver with email ${email} not found`)
    return res
      .status(404)
      .json({ message: 'Password wasn`t foud' })
  }

  const numericAmount = Number.parseFloat(amount)
  console.log('Numeric amount:', numericAmount)

  if (isNaN(numericAmount) || numericAmount <= 0) {
    console.log(`Invalid amount provided: ${amount}`)
    return res
      .status(400)
      .json({ message: 'Not correct amount' })
  }

  if (sender.balance < numericAmount) {
    console.log('Sender has insufficient balance')
    return res
      .status(400)
      .json({ message: 'Insufficient funds' })
  }

  try {
    Transaction.create(
      sender.id,
      'send',
      numericAmount,
      receiver.email,
    )
    Transaction.create(
      receiver.id,
      'receive',
      numericAmount,
      sender.email,
    )

    Notification.create(
      sender.id,
      'Send',
      `You sent ${numericAmount} USD to ${email}`,
    )
    Notification.create(
      receiver.id,
      'Payment',
      `You received ${numericAmount} USD from ${sender.email}`,
    )

    sender.balance -= numericAmount
    receiver.balance += numericAmount

    console.log('Money sent successfully')
    return res
      .status(200)
      .json({ message: 'Money sent successfully' })
  } catch (err) {
    console.error('Error processing the request:', err)
    return res.status(500).json({ message: err.message })
  }
})
//=============================================================================
module.exports = router
