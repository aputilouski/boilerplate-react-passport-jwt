const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const env = require('./env');
const { User } = require('../models');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt_secret,
};

module.exports.useJwtStrategy = () => {
  passport.use(
    new JwtStrategy(options, async function (jwt_payload, done) {
      User.findByPk(jwt_payload.uuid)
        .then(user => {
          if (user) done(null, user);
          else done(null, false);
        })
        .catch(error => done(error, false));
    })
  );
};

module.exports.generateAccessToken = user => {
  return jwt.sign({ uuid: user.uuid }, env.jwt_secret, {
    expiresIn: eval(env.session_expiry),
  });
};

module.exports.generateRefreshToken = user => {
  return jwt.sign({ uuid: user.uuid }, env.refresh_token_secret, {
    expiresIn: eval(env.refresh_token_expiry),
  });
};

module.exports.COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.is_production,
  signed: true,
  maxAge: eval(env.refresh_token_expiry) * 1000,
  // sameSite: 'none',
};

// module.exports.getUserUuidByAccessToken = token => {
//   const { uuid } = jwt.decode(token, jwt_secret);
//   return uuid;
// };

module.exports.verifyUser = passport.authenticate('jwt', { session: false });