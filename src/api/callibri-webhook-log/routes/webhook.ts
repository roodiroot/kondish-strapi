export default {
  routes: [
    {
      method: "POST",
      path: "/webhook-log",
      handler: "webhook-log.createLog",
    },
  ],
};
