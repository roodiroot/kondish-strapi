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
  "export-import-strapi5-plugin": {
    enabled: true,
    config: {
      entities: {
        "api::product.product": {
          fields: [
            "category.name",
            "brand.name",
            "name",
            "slug",
            "price",
            "sale",
            "hit",
            "available",
            "popularity",
          ],
        },
      },
    },
  },
});
