// Функция для создания HTML-текста
type ProductItem = {
  name: string; // Название товара
  count: number; // Количество товара
  price: number; // Цена за единицу товара
  totalPrice: number; // Общая стоимость товара (цена * количество)
};

type ContactInfo = {
  fullName: string; // Имя клиента
  phone: string; // Телефон клиента
  email: string; // Email клиента
};

type DeliveryInfo = {
  address: string; // Адрес доставки
  comment?: string; // Комментарий к доставке (необязательное поле)
};

type OrderData = {
  contact: ContactInfo; // Контактные данные
  delivery: DeliveryInfo; // Информация о доставке
  products: ProductItem[]; // Список товаров
  totalPrice: number; // Итоговая стоимость заказа
};

type FeedbackData = {
  username: string; // Имя пользователя
  email: string; // Электронная почта
  phone: string; // Номер телефона
  message: string; // Сообщение пользователя
};

export function createHtmlMessageForOrder(data: OrderData) {
  const { contact, delivery, products, totalPrice } = data;

  // Формируем список товаров
  const productsList = products
    .map(
      (item) => `
      <b>${item.name}</b>
      Количество: ${item.count}
      Цена за единицу: ${item.price} руб.
      Общая стоимость: ${item.totalPrice} руб.
    `
    )
    .join("\n");

  const fullName =
    contact?.fullName
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const email =
    contact?.email
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const address =
    delivery?.address
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const comment =
    delivery?.comment
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  // Формируем итоговый текст
  const message = `
      ✳️<b>Контактные данные:</b>✳️
      Имя: ${fullName}
      Телефон: ${contact.phone}
      Email: ${email}
  
      <b>Доставка:</b>
      Адрес: ${address}
      Комментарий: ${comment} 
  
      <b>Товары:</b>
      ${productsList}
  
      <b>Итоговая стоимость:</b>
      ${totalPrice} руб.
    `;

  return message;
}

export function createHtmlMessageForFeedback(data: FeedbackData) {
  const { username, email, phone, message } = data;

  // Экранируем специальные символы для безопасного отображения в HTML
  const safeUsername =
    username
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const safeEmail =
    email
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const safePhone =
    phone
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  const safeMessage =
    message
      ?.replace(/&/g, "&amp;")
      ?.replace(/</g, "&lt;")
      ?.replace(/>/g, "&gt;") || "";

  // Формируем итоговый текст
  const feedbackMessage = `
    ‼️<b>Форма обратной связи</b>‼️
    
    <b>Данные пользователя:</b>
    Имя: ${safeUsername}
    Телефон: ${safePhone}
    Email: ${safeEmail}

    <b>Сообщение:</b>
    ${safeMessage}
  `;

  return feedbackMessage;
}
