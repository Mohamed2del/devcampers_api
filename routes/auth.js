const express = require('express');
const {
  register,
  login,
  getMe,
  forogtPassword,
} = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forogtPassword);

module.exports = router;
