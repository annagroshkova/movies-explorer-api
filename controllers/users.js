const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const {
  AppError,
  STATUS_UNAUTHORIZED,
  STATUS_BAD_REQUEST,
  STATUS_NOT_FOUND,
  STATUS_CONFLICT,
} = require('../errors/AppError');

const { NODE_ENV } = process.env;
const JWT_SECRET = NODE_ENV === 'production' ? process.env.JWT_SECRET : 'dev';

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Неправильные почта или пароль', STATUS_UNAUTHORIZED));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return next(new AppError('Неправильные почта или пароль', STATUS_UNAUTHORIZED));
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).send({
      token,
    });
  } catch (err) {
    console.log(err);
    return next(new AppError());
  }
};

module.exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const user = (await User.create({ name, email, password: hash })).toObject({
      useProjection: true,
    });
    res.status(201).send(user);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return next(new AppError('Пользователь с таким имэйлом уже существует', STATUS_CONFLICT));
    }
    if (err.name === 'ValidationError') {
      return next(new AppError('Ошибка валидации', STATUS_BAD_REQUEST));
    }
    return next(new AppError());
  }
};

module.exports.getMe = async (req, res, next) => {
  const { _id: userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (user) {
      res.send(user);
    } else {
      return next(new AppError('Пользователь не найден', STATUS_NOT_FOUND));
    }
  } catch (err) {
    console.log(err);
    if (err.name === 'CastError') {
      return next(new AppError('Переданы некорректные данные', STATUS_BAD_REQUEST));
    }
    return next(new AppError());
  }
};

module.exports.patchMe = async (req, res, next) => {
  const { _id: userId } = req.user;

  try {
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return next(new AppError('Пользователь не найден', STATUS_NOT_FOUND));
    }
    res.send(user);
  } catch (err) {
    console.log(err);
    if (err.name === 'ValidationError') {
      return next(new AppError('Ошибка валидации', STATUS_BAD_REQUEST));
    }
    if (err.name === 'CastError') {
      return next(new AppError('Переданы некорректные данные', STATUS_BAD_REQUEST));
    }
    return next(new AppError());
  }
};
