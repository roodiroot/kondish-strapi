export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/auth/check-jwt",
      handler: "check-jwt.index",
    },
  ],
};
