import { Context } from "koa";
export default {
  async incrementPopularity(ctx: Context) {
    try {
      const { slug, action } = ctx.request.body;

      if (!slug || !action) {
        return ctx.badRequest("ID и действие (action) обязательны.");
      }

      const weights = {
        views: 1, // Вес для просмотров
        favorites: 5, // Вес для добавления в избранное
        cart_adds: 10, // Вес для добавления в корзину
      };

      if (!weights[action]) {
        return ctx.badRequest(`Недопустимое действие: ${action}`);
      }

      // Найти товар
      const product = await strapi.db
        .query("api::product.product")
        .findOne({ where: { slug } });

      if (!product) {
        return ctx.notFound("Товар не найден.");
      }

      // Увеличить популярность на основе веса действия
      const updatedProduct = await strapi
        .documents("api::product.product")
        .update({
          documentId: product.documentId, // или другой способ идентификации документа
          data: {
            popularity: product?.popularity + weights[action],
          },
          status: "published",
        });

      return ctx.send({ data: updatedProduct });
    } catch (err) {
      strapi.log.error("Ошибка в incrementPopularity:", err);
      return ctx.internalServerError("Что-то пошло не так.");
    }
  },
};
