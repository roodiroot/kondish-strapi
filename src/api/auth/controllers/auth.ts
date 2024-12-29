/**
 * auth controller
 */
import { Context } from "koa";
import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::auth.auth");
