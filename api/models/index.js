require('pg').defaults.parseInt8 = true;
const debug = require('debug')('api:database');
const { Sequelize } = require('sequelize');
const config = require('../config');

const db = new Sequelize(config.postgres_db, config.postgres_user, config.postgres_user_password, {
  host: config.postgres_host,
  port: config.postgres_port,
  dialect: 'postgres',
  logging: config.is_development ? str => debug(str) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const User = require('./User')(db);

const models = {
  User,
};

Object.values(models).forEach(Model => {
  if (Model.associate) Model.associate(models);
});

db.authenticate()
  .then(() => debug('Database connected.'))
  .catch(error => debug('DATABASE CONNECTION ERROR', error));

// db.sync({ alter: true })
//   .then(() => debug('All tables were successfully synced.'))
//   .catch(err => debug('ON TABLE SYNC', err));

module.exports = models;
