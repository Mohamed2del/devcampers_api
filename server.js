const { request } = require('express');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();
// Route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//  Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promis) => {
  console.log(`Error : ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});
