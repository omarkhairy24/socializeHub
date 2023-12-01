const nodemailer = require('nodemailer');

const sendEmail = async option =>{
    const transporter = nodemailer.createTransport({
        host:process.env.SERVICE,
        port:process.env.port,
        auth:{
            user:process.env.USER,
            pass:process.env.PASS
        }
    });

    const mailOptions = {
        from:'<ADMIN>',
        to:option.email,
        subject:option.subject,
        text:option.text
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail