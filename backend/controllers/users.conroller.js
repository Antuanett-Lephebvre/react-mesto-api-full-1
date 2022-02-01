const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const HTTP_CODES = require('../utils/response.codes');
const TOKEN_SECRET = require('../utils/secret');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const UnauthorizedError = require('../errors/unauthorized-error');

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({});
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(users);
  } catch (e) {
    return next(e);
  }
}

async function getCurrentUser(req, res, next) {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id).orFail();

    return res.status(HTTP_CODES.SUCCESS_CODE).json(user);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Пользователь не найден'));
    }
    if (e.name === 'CastError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }

    return next(e);
  }
}

async function getUserById(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(user);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError(`Пользователь c ${userId} не найден`));
    }
    if (e.name === 'CastError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }

    return next(e);
  }
}

async function createNewUser(req, res, next) {
  const {
    name, about, avatar, password, email,
  } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name, about, password: hashPassword, email, avatar,
    });

    return res
      .status(HTTP_CODES.SUCCESS_CREATED_CODE)
      .json({
        name: newUser.name,
        about: newUser.about,
        email: newUser.email,
        avatar: newUser.avatar,
      });
  } catch (e) {
    if (e.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

async function updateProfile(req, res, next) {
  const { _id } = req.user;
  const { name, about } = req.body;

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      { name, about },
      {
        runValidators: true,
        new: true,
      },
    ).orFail();
    return res.status(HTTP_CODES.SUCCESS_CODE).json(updatedProfile);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Пользователь не найден'));
    }

    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }

    return next(e);
  }
}

async function updateAvatar(req, res, next) {
  const { _id } = req.user;
  const { avatar } = req.body;

  try {
    const updatedAvatar = await User.findByIdAndUpdate(
      _id,
      { avatar },
      {
        runValidators: true,
        new: true,
      },
    ).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(updatedAvatar);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Пользователь не найден'));
    }

    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }

    return next(e);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const matchingUser = await User.findOne({ email }).select('+password');
    if (!matchingUser) {
      return next(new UnauthorizedError('Переданы некорректные данные'));
    }

    const isSame = await bcrypt.compare(password, matchingUser.password);

    if (!isSame) {
      return next(new UnauthorizedError('Переданы некорректные данные'));
    }

    const token = jwt.sign(
      { _id: matchingUser._id },
      TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    return res
      .cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      })
      .json({
        _id: matchingUser._id,
        name: matchingUser.name,
        about: matchingUser.about,
        avatar: matchingUser.avatar,
        email: matchingUser.email,
      });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new UnauthorizedError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

module.exports = {
  getAllUsers, getUserById, createNewUser, updateProfile, updateAvatar, login, getCurrentUser,
};
