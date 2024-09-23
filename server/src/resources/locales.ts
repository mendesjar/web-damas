import * as dotenv from "dotenv";
dotenv.config();

export const locales = {
  port: process.env.PORT,
  urlBase: process.env.URL_BASE,
};
