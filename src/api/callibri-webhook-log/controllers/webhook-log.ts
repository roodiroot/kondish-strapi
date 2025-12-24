import { Context } from "koa";
import { toCallType } from "../../../utils/toCallType";

const s = (v) => (v === undefined || v === null ? null : String(v));

const truncate = (value: unknown, max = 255): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return String(value);
  return value.length > max ? value.slice(0, max) : value;
};

const toIntOrNull = (v) => {
  if (v === undefined || v === null) return null;
  const str = String(v).trim();
  if (!str) return null;
  const n = Number(str);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export default {
  async createLog(ctx: Context) {
    const payload = ctx.request.body || {};

    const callId = payload?.conversations_number;

    if (!callId) {
      ctx.status = 400;
      ctx.body = { ok: false, error: "No conversations_number (callId)" };
      return;
    }

    const talk = toIntOrNull(payload.billsec);
    const total = toIntOrNull(payload.duration);

    const data = {
      rawPayload: payload,

      callId: s(callId),
      substitutionChannelId: s(payload.channel_id),
      type: toCallType("call"),

      leadId: s(payload.lid_id),
      clientCallibriId: s(payload.crm_client_id),

      clientPhone: s(payload.phone),
      clientName: truncate(s(payload.name)),
      region: s(payload.region),

      callType: s(payload.name_type),
      callStatus: s(payload.call_status),

      waitDurationSec:
        talk !== null && total !== null ? Math.max(total - talk, 0) : null,
      talkDurationSec: talk,

      recordUrl: truncate(s(payload.link_download)),
      trackingUrl: truncate(s(payload.track_url)),

      substitutionChannelName: truncate(s(payload.name_channel)),
      substitutionNumber: s(payload.dst),

      landingPage: truncate(s(payload.landing_page)),
      trafficSource: truncate(s(payload.source)),
      trafficType: truncate(s(payload.traffic_type)),
      keywords: truncate(s(payload.query)),

      utmSource: truncate(s(payload.utm_source)),
      utmMedium: truncate(s(payload.utm_medium)),
      utmCampaign: truncate(s(payload.utm_campaign)),

      callDate: s(payload.date),
    };

    const saved = await strapi
      .documents("api::callibri-webhook-log.callibri-webhook-log")
      .create({
        data,
        status: "published",
      });

    strapi.log.info("Create call");

    setImmediate(async () => {
      try {
        await strapi
          .service("api::callibri-webhook-log.callibri-webhook-log")
          .createCallInCrmByDocumentId(saved.documentId);
        strapi.log.info("SRM Push");

        await strapi
          .documents("api::callibri-webhook-log.callibri-webhook-log")
          .update({
            documentId: saved.documentId,
            data: {
              crmStatus: "success",
            },
            status: "published",
          });
        strapi.log.info("Strapi update");
      } catch (e) {
        strapi.log.error("CRM create failed", e);
        await strapi
          .documents("api::callibri-webhook-log.callibri-webhook-log")
          .update({
            documentId: saved.documentId,
            data: {
              crmStatus: "failed",
              crmLastError: String(e?.message ?? e),
            },
            status: "published",
          });
      }
    });

    ctx.body = { ok: true, callId: s(callId), documentId: saved.documentId };
  },
};
