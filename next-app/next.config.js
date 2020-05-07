require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  env: {
    API_URL: process.env.API_URL,
  },
};
