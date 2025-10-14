import { Context } from "koa";

export default {
  async getProducts(ctx: Context) {
    const request = ctx.request.query as { query: string };
    const query = request?.query;

    if (!query || query?.trim() === "")
      return ctx.notFound(`Нет параметров поиска`);

    try {
      const products = await strapi.documents("api::product.product").findMany({
        status: "published",
        filters: {
          $or: [
            { name: { $containsi: query.trim() } },
            { category: { name: { $containsi: query.trim() } } },
            { brand: { name: { $containsi: query.trim() } } },
          ],
        },
        populate: ["category", "brand"],
      });

      return ctx.send({
        status: "success",
        data: {
          count: products.length,
          products,
        },
      });
    } catch (error) {
      strapi.log.error("Error in findOne product:", error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
};
