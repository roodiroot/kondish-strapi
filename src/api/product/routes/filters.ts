export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/products/filter",
      handler: "filters.getFilters",
    },
  ],
};
