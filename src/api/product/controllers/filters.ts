import { Context } from "koa";
export default {
  async getFilters(ctx: Context) {
    // console.log("FILTERS");

    const fieldsFilterObjects = [
      { key: "area_of_room", label: "Площадь помещения м²" },
      { key: "energy_efficiency_class", label: "Класс энергоэффективности" },
      { key: "compressor_type", label: "Тип компрессора" },
      { key: "noise_level", label: "Уровень шума" },
      { key: "wifi_availability", label: "Наличие Wi-Fi" },
      { key: "series", label: "Серия" },
      { key: "country_of_manufacturer", label: "Страна производителя" },
      { key: "color", label: "Цвет" },
      { key: "refrigerant", label: "Хладагент" },
      { key: "max_pipe_length", label: "Максимальная длина трубопровода" },
      { key: "cooling_capacity", label: "Мощность охлаждения" },
    ];

    // Достаем ключи для запроса
    const selectedFields = fieldsFilterObjects.map((field) => field.key);

    // Запрашиваем только нужные поля
    const products = await strapi.db.query("api::product.product").findMany({
      select: selectedFields, // Укажите нужные свойства
    });

    // Формируем объект уникальных значений
    const filters = fieldsFilterObjects.reduce((acc, field) => {
      acc[field.key] = {
        label: field.label,
        values: [...new Set(products.map((product) => product[field.key]))],
      };
      return acc;
    }, {});

    // const filters = {};
    // for (const field of fieldsFilter) {
    //   filters[field] = await strapi.db
    //     .connection("products")
    //     .distinct(field)
    //     .pluck(field);
    // }

    ctx.send(filters);
  },
};
