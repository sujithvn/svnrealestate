const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
require("dotenv").config();

const SGMAIL_API = process.env.SGMAIL_API;
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SGMAIL_API
    }
  })
);
module.exports = transporter;
