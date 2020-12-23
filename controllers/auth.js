const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmails');
const User = require('../models/User');

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  sendTokenResponse(user, 200, res);
});

// @desc Login user
// @route POST /api/v1/auth/register
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  email = email.toString().toLowerCase();
  // Validate email and Password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password'), 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials'), 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials'), 401);
  }

  sendTokenResponse(user, 200, res);
});

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update user details
// @route PUT /api/v1/auth/updatedetails
// @access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access public
exports.forogtPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }
  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receving this email because ( or someone else ) has requested the rest of a a password. please make a put request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Rest Password email cannot be sent', 500));
  }
  console.log(resetToken);
  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model , create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSingedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
