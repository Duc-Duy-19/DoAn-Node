let nodemailer = require('nodemailer');
let fs = require('fs');
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525, // Mailtrap recommends port 2525 or 587
    secure: false, // true for 465, false for other ports
    auth: {
        user: "b97899f22dd285f25dfcaed3142a7957",
        pass: "b97899f22dd285f25dfcaed3142a7957", // Mailtrap uses same token for both
    },
});

// Wrap in an async IIFE so we can use await.

module.exports = {
    sendMail: async function (to,url) {
        //let data = fs.readFileSync('../templates/mailForgotpassword.html');
        //console.log(data);
        await transporter.sendMail({
            from: '"Tungnt with love"<admin@hehehe.com>',
            to: to,
            subject: "Quen mat khau",
            text: "Click vo day", // plain‑text body
            html: url, // HTML body
        });
    }
}