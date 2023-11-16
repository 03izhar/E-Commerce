const nodemailer = require("nodemailer")
const asyncHandler = require("express-async-handler")

const sendEmail = asyncHandler(async (data, req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Hey,👻" izhar.qadeer@indicchain.com',  // sender address
            to: data.to,                                 // list of receivers
            subject: data.subject,                     // Subject line
            text: data.text,                         // plain text body
            html: data.html,                       // html body
        });

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    } catch (error) {
        throw new Error(error);
    }
})

module.exports = {
    sendEmail
}