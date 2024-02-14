import { handleRequest } from "./handlerEntry.js";

export default {
  async fetch(request, env, context) {
    try {
      return await handleRequest(request, env, context);
    } catch (e) {
      var resp = {
        message: "Error -> " + e,
        stack: e.stack,
      };
      return new Response(JSON.stringify(resp), {
        status: 500,
      });
    }
  }
}