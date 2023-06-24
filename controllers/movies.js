const Movie = require('../models/movies');
const {
  AppError,
  STATUS_BAD_REQUEST,
  STATUS_NOT_FOUND,
  STATUS_FORBIDDEN,
} = require('../errors/AppError');

module.exports.getMovies = async (req, res, next) => {
  const { _id: userId } = req.user;
  try {
    const movies = await Movie.find({
      owner: userId,
    });
    res.send(movies);
  } catch (err) {
    console.log(err);
    return next(new AppError());
  }
};

module.exports.createMovie = async (req, res, next) => {
  const { _id: userId } = req.user;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  try {
    const card = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: userId,
    });
    res.status(201).send(card);
  } catch (err) {
    console.log(err);
    if (err.name === 'ValidationError') {
      return next(new AppError('Ошибка валидации', STATUS_BAD_REQUEST));
    }
    return next(new AppError());
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { movieId } = req.params;

  try {
    const card = await Movie.findById(movieId);
    if (!card) {
      return next(new AppError('Карточка не найдена', STATUS_NOT_FOUND));
    }

    if (String(card.owner) !== userId) {
      return next(new AppError('Невозможно удалить чужую карточку', STATUS_FORBIDDEN));
    }

    await Movie.findByIdAndDelete(movieId);
    res.send(card);
  } catch (err) {
    console.log(err);
    if (err.name === 'CastError') {
      return next(new AppError('Переданы некорректные данные', STATUS_BAD_REQUEST));
    }
    return next(new AppError());
  }
};
