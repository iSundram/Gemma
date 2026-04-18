const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

async function handleInvalidMethod() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: corsHeaders,
  });
}

function extractResponse(raw) {
  return (
    raw?.response ??
    raw?.choices?.[0]?.message?.content ??
    raw?.choices?.[0]?.text ??
    ""
  );
}

export default {
  async fetch(request, env) {
    const { method } = request;

    if (method === "OPTIONS") {
      return handleOptions();
    }

    if (method !== "POST") {
      return handleInvalidMethod();
    }

    try {
      const body = await request.json();
      const userPrompt = (body?.prompt || "").trim();

      if (!userPrompt) {
        return new Response(
          JSON.stringify({ error: "Prompt is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const raw = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
        messages: [
          {
            role: "system",
            content: "You are Gemma, a helpful AI assistant. Give direct, natural answers.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 180,
        temperature: 0.3,
        top_p: 0.9,
      });

      const text = extractResponse(raw);

      return new Response(
        JSON.stringify({ result: { response: text.trim() } }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: "Bad Request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
