import { resolve } from "path";

export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.beget.com",
        port: 465,
        auth: {
          user: env("BEGET_EMAIL_USER"),
          pass: env("BEGET_EMAIL_PASS"),
        },
      },
      settings: {
        defaultFrom: env("BEGET_EMAIL_USER"),
        defaultReplyTo: env("BEGET_EMAIL_USER"),
      },
    },
  },
});
