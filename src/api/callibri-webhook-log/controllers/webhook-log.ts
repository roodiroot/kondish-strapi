import { Context } from "koa";

const s = (v) => (v === undefined || v === null ? null : String(v));

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

      leadId: s(payload.lid_id),
      clientCallibriId: s(payload.crm_client_id),

      clientPhone: s(payload.phone),
      clientName: s(payload.name),
      region: s(payload.region),

      callType: s(payload.name_type),
      callStatus: s(payload.call_status),

      waitDurationSec:
        talk !== null && total !== null ? Math.max(total - talk, 0) : null,
      talkDurationSec: talk,

      recordUrl: s(payload.link_download),
      trackingUrl: s(payload.track_url),

      substitutionChannelId: s(payload.channel_id),
      substitutionChannelName: s(payload.name_channel),
      substitutionNumber: s(payload.dst),

      landingPage: s(payload.landing_page),
      trafficSource: s(payload.source),
      trafficType: s(payload.traffic_type),
      keywords: s(payload.query),

      utmSource: s(payload.utm_source),
      utmMedium: s(payload.utm_medium),
      utmCampaign: s(payload.utm_campaign),

      callDate: s(payload.date),
    };

    const existed = await strapi
      .documents("api::callibri-webhook-log.callibri-webhook-log")
      .findMany({
        filters: { callId: { $eq: s(callId) } },
        limit: 1,
      });

    let saved;
    if (existed?.length) {
      saved = await strapi
        .documents("api::callibri-webhook-log.callibri-webhook-log")
        .update({
          documentId: existed[0].documentId,
          data,
          status: "published",
        });
    } else {
      saved = await strapi
        .documents("api::callibri-webhook-log.callibri-webhook-log")
        .create({
          data,
          status: "published",
        });

      const tw = await strapi
        .service("api::callibri-webhook-log.callibri-webhook-log")
        .createCallInCrmByDocumentId(saved.documentId);
    }

    ctx.body = { ok: true, callId: s(callId), documentId: saved.documentId };
  },
};
