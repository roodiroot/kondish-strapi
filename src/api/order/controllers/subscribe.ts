import { Context } from "koa";
import { sendNotification } from "../../../service/telegramService";
import { createHtmlMessageForFeedback } from "../../../utils/createHtmlMessage";

export default {
  async newSubscribe(ctx: Context) {
    const { email } = ctx.request.body as { email: string };

    // Проверка наличия email
    if (!email) {
      return ctx.badRequest("Email is required"); // Возвращаем ошибку 400
    }

    // Формируем текст для Telegram
    const telegramMessage = `🎉 🧲<b>Новый подписчик на рассылку!</b>🧲\nEmail: ${email}`;
    const response = await sendNotification(telegramMessage);

    // console.log(response);

    // Проверка ответа от Telegram API
    if (response.ok) {
      return ctx.send({
        message: "Subscriber notified in Telegram!",
        ok: true,
        status: "success",
      });
    } else {
      throw new Error("Telegram API returned an error");
    }
  },

  async newFeedback(ctx: Context) {
    const { email, username, phone, message } = ctx.request.body as {
      username: string;
      email?: string;
      phone?: string;
      message?: string;
    };

    if (!username || !email) {
      return ctx.badRequest("Username and email is required");
    }

    const telegramMessage = createHtmlMessageForFeedback({
      username,
      email,
      phone,
      message,
    });
    const response = await sendNotification(telegramMessage);

    // Проверка ответа от Telegram API
    if (response.ok) {
      return ctx.send({
        ok: true,
        status: "success",
      });
    } else {
      throw new Error("Telegram API returned an error");
    }
  },
};
