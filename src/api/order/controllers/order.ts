/**
 * order controller
 */

import { factories } from "@strapi/strapi";

import sendEmail from "../../../service/emailService";
import { sendNotification } from "../../../service/telegramService";
import { createHtmlMessageForOrder } from "../../../utils/createHtmlMessage";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async create(ctx) {
      const { contact, delivery, payment, status, totalPrice, products } =
        ctx.request.body;

      // Validate the input
      if (!contact || !delivery || !products || !Array.isArray(products)) {
        return ctx.badRequest("Invalid data for the order");
      }

      // Check if the products exist
      const validProductIds = [];
      for (const item of products) {
        const product = await strapi.db
          .query("api::product.product")
          .findOne({ where: { id: item.product } });
        if (!product || product.publishedAt === null) {
          return ctx.badRequest(`Product with ID ${item.product} not found`);
        }
        validProductIds.push(product.id);
      }

      // Create the order
      try {
        const newOrder = await strapi.db.query("api::order.order").create({
          data: {
            contact,
            delivery,
            payment,
            statusPay: status,
            totalPrice,
            products: validProductIds,
          },
        });

        // Create the order products
        for (const item of products) {
          await strapi.db.query("api::order-product.order-product").create({
            data: {
              order: newOrder.id,
              count: item.count,
              product: item.product,
            },
          });
        }

        // Load the order products
        const orderProducts = await strapi.db
          .query("api::order-product.order-product")
          .findMany({
            where: {
              order: {
                documentId: newOrder.documentId,
              },
            },
            populate: { product: true },
          });

        // Формируем ответ с товарами и их количеством
        const orderWithProducts = {
          ...newOrder,
          products: orderProducts.map((item) => ({
            productId: item.product.documentId,
            name: item.product.name,
            price: item.product.price,
            count: item.count,
            totalPrice: item.product.price * item.count,
          })),
        };

        // Формируем данные для шаблона
        const orderProductsEmailTemplate = orderProducts.map((item) => ({
          name: item.product.name,
          count: item.count,
          price: item.product.price,
          totalPrice: item.product.price * item.count,
        }));

        const templateData = {
          contact,
          delivery,
          products: orderProductsEmailTemplate,
          totalPrice,
        };

        // console.log(process.env.EMAIL_ADMIN);

        // Сообщение на почту
        await sendEmail(
          [templateData.contact.email, process.env.EMAIL_ADMIN],
          "Новый заказ в kondish.su",
          "У вас новый заказ. Подробности в письме.",
          templateData
        );

        // Сообщение в телеграм
        const htmlMessage = createHtmlMessageForOrder(templateData);
        await sendNotification(htmlMessage);

        // Return the response
        return ctx.send(orderWithProducts, 201);
      } catch (error) {
        strapi.log.error("Error in order_create:", error);
        return ctx.internalServerError("Something went wrong.");
      }
    },
    async findOne(ctx) {
      const { id } = ctx.params;

      try {
        // Ищем заказ по ID
        const order = await strapi.db.query("api::order.order").findOne({
          where: { documentId: id },
          populate: {
            orderProducts: {
              populate: {
                product: true, // Загружаем продукт внутри связанной записи
              },
            },
          },
        });

        // Если заказ не найден
        if (!order) {
          return ctx.notFound(`Order with ID ${id} not found`);
        }

        // Ищем ID товаров в заказе
        const orderProducts = await strapi.db
          .query("api::order-product.order-product")
          .findMany({
            where: {
              order: {
                documentId: order.documentId,
              },
            },
            populate: { product: true },
          });

        // Формируем ответ с товарами и их количеством
        const orderWithProducts = {
          ...order,
          products: orderProducts.map((item) => ({
            slug: item.product.slug,
            name: item.product.name,
            price: item.product.price,
            count: item.count,
            totalPrice: item.product.price * item.count,
          })),
        };

        // Возвращаем заказ с товарами
        return ctx.send(orderWithProducts, 200);
      } catch (error) {
        strapi.log.error("Error in findOne order:", error);
        return ctx.internalServerError("Something went wrong.");
      }
    },
  })
);
