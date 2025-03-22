import { Context } from "koa";
export default {
  async getFilters(ctx: Context) {
    // console.log(ctx.query);

    const query = ctx?.query;

    // {
    //   filters: {
    //     category: { product_catalog: [Object] },
    //     brand: { slug: 'energolux' }
    //   }
    // }

    const fieldsFilterObjects = [
      { key: "price", label: "Цена" },
      { key: "series", label: "Серия" },
      { key: "color", label: "Цвет" },
      { key: "area_of_room", label: "Площадь помещения м²" },
      { key: "compressor_type", label: "Тип компрессора" },
      { key: "noise_level", label: "Уровень шума" },
      { key: "wifi_availability", label: "Наличие Wi-Fi" },
      { key: "country_of_manufacturer", label: "Страна производителя" },
      { key: "refrigerant", label: "Хладагент" },
      { key: "max_pipe_length", label: "Максимальная длина трубопровода" },
      { key: "cooling_capacity", label: "Мощность охлаждения" },
    ];

    // Достаем ключи для запроса
    const selectedFields = fieldsFilterObjects.map((field) => field.key);

    // Запрашиваем только нужные поля
    const products = await strapi.db.query("api::product.product").findMany({
      where: query.filters, // Фильтры если есть с фронта
      select: selectedFields, // Нужные свойства
    });

    // Формируем объект уникальных значений
    const filters = fieldsFilterObjects.reduce((acc, field) => {
      acc[field.key] = {
        label: field.label,
        values: [...new Set(products.map((product) => product[field.key]))],
      };
      return acc;
    }, {});

    ctx.send(filters);
  },
};
