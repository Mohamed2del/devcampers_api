// @desc GET all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ status: true, msg: 'Show all bootcamps' });
};

// @desc GET single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ status: true, msg: `get bootcamp ${req.params.id}` });
};

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps/
// @access private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ status: true, msg: 'Create new bootcamp' });
};

// @desc Update  bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ status: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desc Delete new bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ status: true, msg: `Delete bootcamp ${req.params.id}` });
};
