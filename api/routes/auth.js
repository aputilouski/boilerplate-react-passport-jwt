const express = require('express');
const router = express.Router();
const yup = require('yup');
const { validate } = require('../utils');
const { User } = require('../models');
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

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(403).json({ message: 'Incorrect credentials' });

    const passwordConfirmed = await user.confirmPassword(password);
    if (!passwordConfirmed) return res.status(403).json({ message: 'Incorrect username or password' });

    res.cookie('refreshToken', strategies.generateRefreshToken(user), strategies.COOKIE_OPTIONS);
    res.json({ token: strategies.generateAccessToken(user), user: user.getPublicAttributes() });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'An error occurred while logging in');
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
