export default {
  async fetch(request, env) {
    // 1. Ensure the request is a POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed. Please send a POST request.", { status: 405 });
    }

    try {
      // 2. Extract only the prompt from the request body
      const { prompt } = await request.json();

      if (!prompt) {
        return Response.json({ error: "No prompt provided" }, { status: 400 });
      }

      // 3. Define the specific Gemma model path
      const modelName = "@cf/google/gemma-7b-it";

      // 4. Execute the AI request
      const response = await env.AI.run(modelName, {
        prompt: prompt
      });

      // 5. Return the AI generation result
      return Response.json({
        model: modelName,
        result: response
      });

    } catch (err) {
      return Response.json({ 
        error: "Internal Server Error", 
        message: err.message 
      }, { status: 500 });
    }
  }
};
