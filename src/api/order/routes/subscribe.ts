export default {
  routes: [
    {
      // Path defined with a URL parameter
      method: "POST",
      path: "/subscribe",
      handler: "subscribe.newSubscribe",
    },
    {
      // Path defined with a regular expression
      method: "POST",
      path: "/feedback", // Only match when the first parameter contains 2 or 3 digits.
      handler: "subscribe.newFeedback",
    },
  ],
};
