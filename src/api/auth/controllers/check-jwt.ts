import { Context } from "koa";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "your-jwt-secret"; // Секрет из переменных окружения

export default {
  async index(ctx: Context) {
    const token = ctx.request.header["authorization"];
    if (!token) {
      return ctx.throw(401, "Token is missing");
    }
    const formattedToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    try {
      const decoded = jwt.verify(formattedToken, secret); // Проверка токена на валидность
      // Получаем id пользователя из декодированного токена
      const userId = decoded as { id: number };
      //   Ищем пользователя в базе данных по его ID
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: userId.id },
        });

      if (!user) {
        return ctx.throw(404, "User not found");
      }
      ctx.send({
        valid: true,
        decoded,
        user,
      });
    } catch (error) {
      ctx.throw(401, "Invalid token");
    }
    // console.log(formattedToken);
    // called by GET /hello
    // ctx.body = "Hello World!"; // we could also send a JSON
  },
};
