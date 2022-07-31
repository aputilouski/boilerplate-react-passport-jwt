const express = require('express');
const router = express.Router();
const yup = require('yup');
const { validate } = require('../utils');
const { User, RefreshToken } = require('../models');
const { strategies } = require('../config');

const USERNAME = yup.string().min(4, 'Must be 4 characters or more').max(20, 'Must be 20 characters or less').required('Required');
const PASSWORD = yup.string().min(8, 'Must be 8 characters or more').max(20, 'Must be 20 characters or less').required('Required');
const NAME = yup.string().min(4, 'Must be 4 characters or more').max(40, 'Must be 40 characters or less').required('Required');

const SignUpSchema = yup.object({ body: yup.object({ username: USERNAME, password: PASSWORD, name: NAME }) });

router.post('/sign-up', validate(SignUpSchema), async (req, res) => {
  try {
    const { name, username, password } = req.body;

    const encryptedPassword = await User.encryptPassword(password);
    await User.create({ name, username, password: encryptedPassword });

    res.status(201).json({ message: 'User has been registered' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while creating the user');
  }
});

const SignInSchema = yup.object({ body: yup.object({ username: USERNAME, password: PASSWORD }) });

router.post('/sign-in', validate(SignInSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      include: { model: RefreshToken, as: 'tokens' },
      order: [[{ model: RefreshToken, as: 'tokens' }, 'created_at', 'desc']],
    });
    if (!user) return res.status(400).json({ message: 'Incorrect credentials' });

    const passwordConfirmed = await user.confirmPassword(password);
    if (!passwordConfirmed) return res.status(400).json({ message: 'Incorrect username or password' });

    const tokens = user.tokens;
    if (req.signedCookies?.refreshToken) {
      const { uuid, token } = req.signedCookies?.refreshToken;
      const index = tokens.findIndex(token => token.uuid === uuid);
      const currentRefreshToken = tokens[index];
      if (currentRefreshToken) {
        await currentRefreshToken.destroy();
        tokens.splice(index, 1);
      } else res.clearCookie('refreshToken');
    }

    if (tokens.length > 4) {
      await RefreshToken.destroy({
        where: { uuid: tokens.filter((t, i) => i >= 4).map(t => t.uuid) },
      });
    }

    const { uuid, token } = await RefreshToken.create({ token: strategies.generateRefreshToken(user), user_id: user.uuid });
    res.cookie('refreshToken', { uuid, token }, strategies.COOKIE_OPTIONS);
    res.json({ token: strategies.generateAccessToken(user), user: user.getPublicAttributes() });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'An error occurred while logging in');
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    if (!req.signedCookies?.refreshToken) return res.status(400).json({ message: 'No refresh token' });
    const refreshToken = await RefreshToken.findByPk(req.signedCookies.refreshToken.uuid);
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });
    await refreshToken.destroy();
    if (req.signedCookies.refreshToken.token !== refreshToken.token) return res.status(400).json({ message: 'Bad token' });
    // const payload = strategies.verifyRefreshToken(token);
    const { uuid, token } = await RefreshToken.create({ token: strategies.generateRefreshToken({ uuid: refreshToken.user_id }), user_id: refreshToken.user_id });
    res.cookie('refreshToken', { uuid, token }, strategies.COOKIE_OPTIONS);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'An error occurred while generating a new token');
  }
});

const UserUpdateSchema = yup.object({ body: yup.object({ username: USERNAME, name: NAME }) });

router.post('/user', strategies.verifyUser, validate(UserUpdateSchema), async (req, res) => {
  try {
    const { name, username } = req.body;

    if (req.user.username !== username) {
      const user = await User.findOne({ where: { username } });
      if (user) return res.status(400).json({ message: 'User with the same username already exists' });
    }

    req.user.name = name;
    req.user.username = username;
    await req.user.save();

    res.json({ user: req.user.getPublicAttributes(), message: 'User information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while updating the user');
  }
});

module.exports = router;
