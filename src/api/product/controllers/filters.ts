import { Context } from "koa";
export default {
  async getFilters(ctx: Context) {
    console.log("Начало запроса фильтров");

    const query = ctx?.query;

    const FIELDS_FILTER_OBJECT = [
      { key: "price", label: "Цена" },
      { key: "series", label: "Серия" },
      { key: "color", label: "Цвет" },
      { key: "area_of_room", label: "Площадь помещения м²" },
      { key: "compressor_type", label: "Тип компрессора" },
      { key: "noise_level", label: "Уровень шума" },
      { key: "wifi_availability", label: "Наличие Wi-Fi" },
      { key: "country_of_manufacturer", label: "Страна производителя" },
      { key: "refrigerant", label: "Хладагент" },
      { key: "max_pipe_length", label: "Максимальная длина трубы" },
      { key: "cooling_capacity", label: "Мощность охлаждения" },
    ];

    const FIELDS_FILTER_RELATION_OBJECT = [
      { key: "brand.name", label: "Бренд", withSlug: true },
      { key: "product_catalog.name", label: "Каталог", withSlug: true },
      { key: "category.name", label: "Категория", withSlug: true },
    ];

    // Достаем ключи для запроса
    const selectedFields = FIELDS_FILTER_OBJECT.map((field) => field.key);

    try {
      // Запрашиваем только нужные поля
      const products = await strapi.db.query("api::product.product").findMany({
        where: query.filters, // Фильтры если есть с фронта
        // select: selectedFields, // Нужные свойства
        select: selectedFields,
        populate: {
          brand: {
            select: ["name", "slug"], // Выбираем только поле name у бренда
          },
          category: {
            select: ["name", "slug"],
          },
          product_catalog: {
            select: ["name", "slug"],
          },
        },
      });

      const result = {
        simpleFilters: {},
        complexFilters: {},
      };

      // Формируем объект уникальных значений
      [...FIELDS_FILTER_OBJECT, ...FIELDS_FILTER_RELATION_OBJECT].forEach(
        (field: { key: string; label: string; withSlug?: boolean }) => {
          const keys = field.key.split(".");
          const relation = keys[0];
          const uniqueValues = new Map();

          products.forEach((product) => {
            let value = product;
            let slug = null;

            // Получаем значение
            for (const key of keys) {
              value = value?.[key];
              if (value === undefined) break;
            }

            // Получаем slug если требуется
            if (field?.withSlug && product[relation]?.slug) {
              slug = product[relation].slug;
            }

            if (value !== undefined) {
              if (field?.withSlug) {
                // Для сложных фильтров сохраняем объект с value и slug
                uniqueValues.set(value, { value, slug });
              } else {
                // Для простых фильтров сохраняем только значение
                uniqueValues.set(value, value);
              }
            }
          });

          const filterData = {
            label: field.label,
            values: Array.from(uniqueValues.values()),
          };

          // Распределяем по соответствующим разделам
          if (field?.withSlug) {
            result.complexFilters[field.key] = filterData;
          } else {
            result.simpleFilters[field.key] = filterData;
          }
        }
      );

      ctx.send(result);
    } catch (error) {
      strapi.log.error("Error get filters product:", error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
};
