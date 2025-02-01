// src/services/emailService.js
import path from "path";
import ejs from "ejs";

const sendEmail = async (to, subject, templateData) => {
  try {
    // Путь к шаблону
    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "order-template.ejs"
    );

    // Рендерим HTML с данными
    const htmlContent = await ejs.renderFile(templatePath, templateData);

    // Отправка email
    await strapi.plugins["email"].services.email.send({
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      text: "У вас новый заказ. Подробности в письме.",
      html: htmlContent, // Вставляем HTML шаблон
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
