/**
 * callibri-webhook-log service
 */

import { factories } from "@strapi/strapi";

type LeadType = "call" | "feedback";
type TwentyTypeCustom = "CALL" | "FEEDBACK";

const mapType: Record<LeadType, TwentyTypeCustom> = {
  call: "CALL",
  feedback: "FEEDBACK",
};

const FALLBACK_PHONE = {
  primaryPhoneCallingCode: "+7",
  primaryPhoneCountryCode: "RU",
  primaryPhoneNumber: "0000000000",
};

const assertEnv = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
};

const normalizePhoneForCrm = (raw) => {
  if (!raw || typeof raw !== "string") {
    return FALLBACK_PHONE;
  }

  let digits = raw.replace(/\D/g, "");

  if (digits.length < 7) {
    return FALLBACK_PHONE;
  }

  // РФ: 11 цифр и начинается с 7 или 8
  if (
    digits.length === 11 &&
    (digits.startsWith("7") || digits.startsWith("8"))
  ) {
    return {
      primaryPhoneCallingCode: "+7",
      primaryPhoneCountryCode: "RU",
      primaryPhoneNumber: digits.slice(1),
    };
  }

  // РФ: 10 цифр (без кода)
  if (digits.length === 10) {
    return {
      primaryPhoneCallingCode: "+7",
      primaryPhoneCountryCode: "RU",
      primaryPhoneNumber: digits,
    };
  }

  // EU/прочее: 9–12 цифр — считаем, что это "номер без кода"
  if (digits.length >= 9 && digits.length <= 12) {
    return {
      primaryPhoneCallingCode: "+7",
      primaryPhoneCountryCode: "RU",
      primaryPhoneNumber: digits,
    };
  }

  // всё остальное — мусор
  return FALLBACK_PHONE;
};

const withTimeout = async (promise, ms, onTimeoutMsg) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(onTimeoutMsg || "timeout"), ms);

  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(t);
  }
};

export default factories.createCoreService(
  "api::callibri-webhook-log.callibri-webhook-log",
  ({ strapi }) => ({
    async createCallInCrmByDocumentId(documentId) {
      if (!documentId) throw new Error("documentId is required");

      const baseUrl = assertEnv("TWENTY_BASE_URL").replace(/\/$/, "");
      const token = assertEnv("TWENTY_API_TOKEN");

      const uid = "api::callibri-webhook-log.callibri-webhook-log";
      const call = await strapi.documents(uid).findOne({ documentId });

      if (!call) throw new Error(`Call not found: ${documentId}`);

      // Твой дедуп/идентификатор
      const callId = call?.callId || documentId;

      const phoneParts = normalizePhoneForCrm(call.clientPhone);

      if (!phoneParts.primaryPhoneNumber) {
        throw new Error("clientPhone is empty - cannot create call in CRM");
      }

      const payload = {
        name: `Callibri call #${callId}`,
        phone: {
          primaryPhoneNumber: phoneParts.primaryPhoneNumber,
          primaryPhoneCallingCode: phoneParts.primaryPhoneCallingCode,
          primaryPhoneCountryCode: phoneParts.primaryPhoneCountryCode,
          additionalPhones: [],
        },
        externalcallid: callId,
        status: callId?.callStatus || "no status",
        talkdurationsec: String(call?.talkDurationSec || "0"),
        recordurl: call?.recordUrl || "",
        source: call?.utmSource || "",
        typeCustom: mapType[call.type],
        userName: call?.userName || null,
        userComment: call?.userComment || null,
        userEmail: call?.userEmail || null,
      };

      const url = `${baseUrl}/rest/calls`;

      const resJson = await withTimeout(
        async (signal) => {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
            signal,
          });

          const text = await res.text();
          let json;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            json = { raw: text };
          }

          if (!res.ok) {
            const err = new Error(`CRM error ${res.status}`);
            Object.assign(err, { details: json });
            throw err;
          }

          return json;
        },
        10_000,
        "CRM request timeout"
      );

      return resJson;
    },
  })
);
