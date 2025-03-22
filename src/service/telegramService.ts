const telegramBotKey = process.env.BOT_TOKEN;
const chat_id = process.env.GROUP_ID;

export const sendNotification = async (
  text: string,
  parse_mode = "HTML"
): Promise<{ ok: boolean }> => {
  const endpoint = `https://api.telegram.org/bot${telegramBotKey}/sendMessage`;
  const response = await makePostRequest(endpoint, {
    text,
    parse_mode,
    chat_id,
  });
  if (!response) {
    return null;
  }
  return response;
};

const makePostRequest = async (
  url: string,
  details: {
    text: string;
    parse_mode: string;
    chat_id: string | number | undefined;
  }
): Promise<{ ok: boolean | null }> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });
  if (!response) {
    return null;
  }
  return (await response.json()) as Promise<{ ok: boolean }>;
};
