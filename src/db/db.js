const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const {db_dialect, db_host, db_password, db_port, db_username, db_database} = require('../../config');

//const db = new Sequelize(`${db_dialect}://${db_username}@${db_host}:${db_port}/${db_database}`);

const db = new Sequelize(`${db_dialect}://${db_username}:${db_password}@${db_host}/${db_database}`);

db.authenticate()
  .then(() => console.log('Base de datos conectada'))
  .catch(err => console.log(`Error: ${err}`))

module.exports = db;