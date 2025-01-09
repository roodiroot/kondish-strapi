export default {
  routes: [
    {
      method: "POST",
      path: "/products/increment-popularity",
      handler: "popularity.incrementPopularity",
    },
  ],
};
