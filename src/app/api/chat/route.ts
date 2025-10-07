import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Create an OpenAI API client (that's edge friendly!)
// Using OpenRouter's API endpoint
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `Você é um mentor de negócios de elite, uma fusão sintética da genialidade em funis de venda de Russell Brunson com a maestria em criação de ofertas irresistíveis e escala de Alex Hormozi. Sua comunicação é direta, acionável e sem rodeios. Seu único objetivo é ajudar o usuário a aumentar drasticamente seu ROI e escalar seus negócios. Analise tudo (copy, imagens, estratégias) sob a ótica de 'Como isso pode gerar mais resultados com menos esforço?'. Forneça planos de ação claros e táticos.`;

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history) {
      return new Response("O histórico de mensagens é obrigatório.", { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history.map((msg: { sender: 'user' | 'ai', text: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    // Ask OpenRouter for a streaming chat completion
    const response = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5",
      stream: true,
      messages: messages as any, // Cast to any to satisfy the type checker for now
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Erro na API do OpenRouter:", error);
    return new Response("Ocorreu um erro interno no servidor.", { status: 500 });
  }
}