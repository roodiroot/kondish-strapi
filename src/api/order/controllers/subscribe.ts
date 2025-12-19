import { Context } from "koa";
import { sendNotification } from "../../../service/telegramService";
import { createHtmlMessageForFeedback } from "../../../utils/createHtmlMessage";
import { toCallType } from "../../../utils/toCallType";

export default {
  async newSubscribe(ctx: Context) {
    const { email } = ctx.request.body as { email: string };

    if (!email) {
      return ctx.badRequest("Email is required"); // Возвращаем ошибку 400
    }

    const telegramMessage = `🎉 🧲<b>Новый подписчик на рассылку!</b>🧲\nEmail: ${email}`;
    const response = await sendNotification(telegramMessage);

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

    const data = {
      callId: "no call",
      type: toCallType("feedback"),
      userName: username || null,
      userComment: message || null,
      userEmail: email || null,
      clientPhone: phone,
    };

    ctx.send({
      ok: true,
      status: "success",
    });

    setImmediate(async () => {
      try {
        const saved = await strapi
          .documents("api::callibri-webhook-log.callibri-webhook-log")
          .create({
            data,
            status: "published",
          });

        strapi.log.info("Save DB", saved.documentId);
        const tw = await strapi
          .service("api::callibri-webhook-log.callibri-webhook-log")
          .createCallInCrmByDocumentId(saved.documentId);

        strapi.log.info("Push crm ", tw?.data?.createCall?.id);
      } catch (e) {
        strapi.log.error("Save / CRM error", e);
      }

      try {
        const res = await sendNotification(
          createHtmlMessageForFeedback({
            username,
            email,
            phone,
            message,
          })
        );
        strapi.log.info("Send Message ", res.ok);
      } catch (e) {
        strapi.log.error("Telegram error", e);
      }
    });
  },
};
