const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const MAIL_USER = process.env.MAIL_USER; // your gmail address
const MAIL_PASS = process.env.MAIL_PASS; // app password
const MAIL_FROM =
  process.env.MAIL_FROM ||
  `"webbanhang" <${MAIL_USER || "no-reply@example.com"}>`;
const MAIL_COMPANY = process.env.MAIL_COMPANY || "WebBanHang";
const RESET_EXP_MINUTES = parseInt(process.env.RESET_EXP_MINUTES || "10", 10);

if (!MAIL_USER || !MAIL_PASS) {
  console.warn(
    "MAIL_USER or MAIL_PASS not set. Email sending will fail until configured."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS, // App Password when using Gmail + 2FA
  },
});

function renderTemplate(url) {
  try {
    const tplPath = path.join(
      __dirname,
      "..",
      "templates",
      "mailForgotpassword.html"
    );
    let tpl = fs.readFileSync(tplPath, "utf8");
    tpl = tpl.replace(/{{reset_link}}/g, url);
    tpl = tpl.replace(/{{expiry_hours}}/g, (RESET_EXP_MINUTES / 60).toFixed(3));
    tpl = tpl.replace(/{{company_name}}/g, MAIL_COMPANY);
    return tpl;
  } catch (err) {
    // fallback to simple HTML
    return `<p>Click vào link để đổi mật khẩu: <a href="${url}">${url}</a></p>`;
  }
}

module.exports = {
  sendMail: async function (to, url) {
    const html = renderTemplate(url);
    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject: "Quên Mật Khẩu",
      text: `Mở link để đổi mật khẩu: ${url}`,
      html,
    };
    return transporter.sendMail(mailOptions);
  },
};
