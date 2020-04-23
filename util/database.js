require("dotenv").config();
const { Sequelize } = require("sequelize");

const HOST = process.env.HOST || "localhost";
const DATABASE = process.env.DATABASE;
const PORT = process.env.DB_PORT;
const USER = process.env.USER;
const PASS = process.env.PASS;

const sequelize = new Sequelize(DATABASE, USER, PASS, {
  dialect: "postgres",
  host: HOST,
  port: PORT
});
module.exports = sequelize;

// const mysql = require("mysql2");
// const pool = mysql.createPool({
//   host: HOST,
//   user: USER,
//   password: PASS,
//   database: DATABASE
// });
// module.exports = pool.promise();
