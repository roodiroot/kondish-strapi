export default {
  myJob: {
    task: ({ strapi }) => {
      // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
      console.log("CRON");
    },
    options: {
      rule: "* * * * *",
    },
  },
};
