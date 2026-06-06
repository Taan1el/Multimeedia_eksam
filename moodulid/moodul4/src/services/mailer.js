import nodemailer from "nodemailer";
import { config } from "../config.js";

export async function sendContactMessage({ name, email, message }) {
  const transporter =
    !config.smtp.host
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.secure,
          auth: {
            user: config.smtp.user,
            pass: config.smtp.pass
          }
        });

  const info = await transporter.sendMail({
    to: config.smtp.to || "tere@slowpour.ee",
    from: config.smtp.from || "no-reply@slowpour.test",
    replyTo: email,
    subject: "Slow Pour kontaktivorm",
    text: `Nimi: ${name}\nE-post: ${email}\n\n${message}`
  });

  if (!config.smtp.host) {
    console.log("Contact message accepted", info.messageId);
  }

  return info;
}
