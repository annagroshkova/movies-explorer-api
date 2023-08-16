const mongoose = require('mongoose');

const URL_REGEX = /^https?:\/\/(www\.)?[a-z0-9\-._~:/?#[\]@!$&'()*+,;=]*#?$/;

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
    },
    nameRU: {
      type: String,
      required: true,
    },
    nameEN: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: (v) => URL_REGEX.test(v),
        message: (props) => `${props.value} не является валидным юэрэлом`,
      },
    },
    trailerLink: {
      type: String,
      required: true,
      validate: {
        validator: (v) => URL_REGEX.test(v),
        message: (props) => `${props.value} не является валидным юэрэлом`,
      },
    },
    thumbnail: {
      type: String,
      required: true,
      validate: {
        validator: (v) => URL_REGEX.test(v),
        message: (props) => `${props.value} не является валидным юэрэлом`,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false },
);

const Movie = mongoose.model('movie', movieSchema);

module.exports = Movie;
