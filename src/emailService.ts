import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachmentPath?: string
) {
  const mailOptions: nodemailer.SendMailOptions = {
    from: `"Mohamed Al Hamdhy" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  if (attachmentPath) {
    if (fs.existsSync(attachmentPath)) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath
        }
      ];
    } else {
      console.error(`❌ Attachment missing at: "${attachmentPath}" — sending without it`);
    }
  }

  await transporter.sendMail(mailOptions);
}