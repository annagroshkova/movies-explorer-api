const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { patchMe, getMe } = require('../controllers/users');

router.get('/me', getMe);

router.patch(
  '/me',
  celebrate({
    body: {
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
    },
  }),
  patchMe,
);

module.exports = router;
