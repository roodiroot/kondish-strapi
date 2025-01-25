/**
 * product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;

      try {
        // Ищем заказ по ID
        const product = await strapi.db.query("api::product.product").findOne({
          where: { documentId: id },
          populate: true,
        });

        // Если товар не найден
        if (!product) {
          return ctx.notFound(`Product with ID ${id} not found`);
        }

        return ctx.send(product);
      } catch (error) {
        strapi.log.error("Error in findOne product:", error);
        return ctx.internalServerError("Something went wrong.");
      }
    },
  })
);
