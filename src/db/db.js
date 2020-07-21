const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const {db_dialect, db_host, db_password, db_port, db_username, db_database} = require('../../config');

const db = new Sequelize(`mysql://be719d462a6ffb@us-cdbr-east-02.cleardb.com:${db_port}/heroku_fadb7e7045e315e`);

//mysql://be719d462a6ffb:1355c1c0@us-cdbr-east-02.cleardb.com/heroku_fadb7e7045e315e
//           user          pass        host                         database

db.authenticate()
  .then(() => console.log('Base de datos conectada'))
  .catch(err => console.log(`Error: ${err}`))

module.exports = db;