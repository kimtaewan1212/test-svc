'use strict';

const auth     = require('../middlewares/authMiddleware');
const authRouter     = require('./authRouter');
const userRouter     = require('./userRouter');
const categoryRouter = require('./categoryRouter');
const todoRouter     = require('./todoRouter');

module.exports = (app) => {
  app.use('/api/v1/auth',       authRouter);
  app.use('/api/v1/users/me',   auth, userRouter);
  app.use('/api/v1/categories', auth, categoryRouter);
  app.use('/api/v1/todos',      auth, todoRouter);
};
