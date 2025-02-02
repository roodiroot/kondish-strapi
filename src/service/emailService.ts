// src/services/emailService.js
import path from "path";
import ejs from "ejs";

type templateData = {
  contact: {
    fullName: string;
    phone: string;
    email: string;
  };
  delivery: {
    address: string;
  };
  products: {
    name: string;
    count: number;
    price: number;
    totalPrice: number;
  }[];
  totalPrice: number;
};

const sendEmail = async (
  to: string | string[],
  subject: string,
  text: string,
  templateData: templateData
) => {
  try {
    // Путь к шаблону
    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "new-order-template.ejs"
    );

    // Рендерим HTML с данными
    const htmlContent = await ejs.renderFile(templatePath, templateData);

    // Отправка email
    await strapi.plugins["email"].services.email.send({
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      text,
      html: htmlContent, // Вставляем HTML шаблон
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
