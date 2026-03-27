const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const productService = require('./productService');

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

const SYSTEM_PROMPT = `You are a helpful shopping assistant for AzureShop.
You HAVE direct access to the product inventory. 
Use the 'search_products' tool whenever a user asks about what products are available, asks for a list, or needs specific recommendations.
IMPORTANT: 
1. If the 'search_products' tool returns results, they are 100% accurate and currently in stock. 
2. Report the results even if they only partially match the user's request. 
3. Mention prices and key features.
4. If asked to 'list all' products of a category, use the tool and report everything returned.
Categories available: Electronics, Clothing, Footwear.`;

// Define tools (functions) for the AI to call
const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for products in the store inventory by keywords or attributes like category, color, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query (e.g. 'black shirts', 'electronics')"
          }
        },
        required: ["query"]
      }
    }
  }
];

/**
 * Handle function calls from the AI
 */
async function handleToolCall(toolCall) {
  if (toolCall.function.name === 'search_products') {
    const args = JSON.parse(toolCall.function.arguments);
    console.log(`🤖 AI searching for: ${args.query}`);
    const results = await productService.searchProducts(args.query, { limit: 5 });
    
    // Simplify results for LLM context
    return results.map(p => ({
      name: p.name,
      price: p.price,
      category: p.category,
      rating: p.rating,
      description: p.description
    }));
  }
  return null;
}

/**
 * Send a chat message and get a reply from Azure OpenAI (GPT-4)
 */
async function getChatReply(userMessage, history = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];

    const deploymentId = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4';

    // 1. Initial request to OpenAI
    let response = await client.getChatCompletions(deploymentId, messages, { 
      maxTokens: 1000, 
      temperature: 0.3,
      tools: tools,
      toolChoice: "auto"
    });

    let choice = response.choices[0];
    
    // 2. Continuous Loop for Tool Calls (RAG)
    // Azure beta-12 uses choice.message.toolCalls
    while (choice.finishReason === 'tool_calls' || choice.message.toolCalls?.length > 0) {
      const toolCalls = choice.message.toolCalls;
      messages.push(choice.message); // Add the assistant's request to the messages array

      for (const toolCall of toolCalls) {
        const result = await handleToolCall(toolCall);
        messages.push({
          role: "tool",
          content: JSON.stringify(result),
          toolCallId: toolCall.id
        });
      }

      // Re-request with tool results
      response = await client.getChatCompletions(deploymentId, messages, { tools: tools });
      choice = response.choices[0];
    }

    return choice.message.content;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I'm having trouble accessing my systems right now. Please try again in a moment.";
  }
}

module.exports = { getChatReply };

