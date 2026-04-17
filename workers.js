const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // replace with your frontend origin if needed
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const { method } = request;

    // Handle preflight request
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Allow only POST requests
    if (method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const { prompt } = await request.json();

      const result = await env.AI.run(
        "@cf/google/gemma-4-26b-a4b-it",
        { prompt }
      );

      return new Response(JSON.stringify({ result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (err) {
      return new Response("Bad Request", {
        status: 400,
        headers: corsHeaders,
      });
    }
  },
};
