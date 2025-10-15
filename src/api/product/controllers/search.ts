import { Context } from "koa";

export default {
  async getProductsSearch(ctx: Context) {
    if (!ctx.query.q)
      return ctx.notFound("Request parameter is missing or undefined.");
    // Формируем фильтры
    const query = typeof ctx.query.q === "string" ? ctx.query.q : "";

    const trimmedQuery = query.trim();

    // Получаем параметры пагинации из запроса
    const pagination =
      typeof ctx.query.pagination === "object" && ctx.query.pagination !== null
        ? (ctx.query.pagination as {
            page?: number | string;
            pageSize?: number | string;
          })
        : {};
    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 25;
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 25;
    const start = (pageNum - 1) * pageSizeNum;
    const limit = pageSizeNum;

    const filters = {
      $and: [
        { available: true },
        {
          $or: [
            { name: { $containsi: trimmedQuery } },
            { category: { name: { $containsi: trimmedQuery } } },
            { brand: { name: { $containsi: trimmedQuery } } },
          ],
        },
      ],
    };

    try {
      // Получаем данные и общее количество
      const [products, total] = await Promise.all([
        strapi.documents("api::product.product").findMany({
          status: "published",
          filters,
          populate: ["category", "brand", "images"],
          limit,
          start,
        }),
        strapi.documents("api::product.product").count({
          status: "published",
          filters,
        }),
      ]);

      // Возвращаем ответ в формате Strapi REST API
      ctx.body = {
        data: products,
        meta: {
          pagination: {
            page: pageNum,
            pageSize: limit,
            pageCount: Math.ceil(total / limit),
            total,
          },
        },
      };
    } catch (error) {
      strapi.log.error("Error in findOne product:", error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
};
