const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getMovies, deleteMovie, createMovie } = require('../controllers/movies');
const { URL_REGEX } = require('../constants/constants');

router.get('/', getMovies);

router.post(
  '/',
  celebrate({
    body: {
      movieId: Joi.number().required(),
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().pattern(URL_REGEX).required(),
      trailerLink: Joi.string().pattern(URL_REGEX).required(),
      thumbnail: Joi.string().pattern(URL_REGEX).required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    },
  }),
  createMovie,
);

router.delete(
  '/:movieId',
  celebrate({
    params: {
      movieId: Joi.string().hex().length(24).required(),
    },
  }),
  deleteMovie,
);

module.exports = router;
