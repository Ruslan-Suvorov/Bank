// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()

// Підключіть файли роутів
const auth = require('./auth')
const user = require('./user')
// Підключіть інші файли роутів, якщо є

// Об'єднайте файли роутів за потреби
router.use('/', auth)
router.use('/', user)
// Використовуйте інші файли роутів, якщо є

router.get('/', (req, res) => {
  res.status(200).json('Wellcome to our bank API')
})

// Експортуємо глобальний роутер
module.exports = router
