const nodemailer = require('nodemailer');
require('dotenv').config();

async function email(recipient, subject, message, html) {
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
      });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"MyTourney" <${process.env.EMAIL}>`, // sender address
      to: `${recipient}`, // list of receivers
      subject: `${subject}`, // Subject line
      text: `${message}`, // plain text body
      html: `${html}` // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

module.exports = { email };