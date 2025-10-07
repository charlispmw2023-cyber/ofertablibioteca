import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:3000", // Replace with your actual site URL in production
    "X-Title": "AI Mentor", // Replace with your actual site name in production
  },
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
        role: "system" as const,
        content: systemPrompt,
      },
      ...history.map((msg: { sender: 'user' | 'ai', text: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    const result = await streamText({
      model: openrouter("google/gemini-flash-1.5"),
      messages,
    });

    return result.toAIStreamResponse();

  } catch (error) {
    console.error("Erro na API do OpenRouter:", error);
    return new Response("Ocorreu um erro interno no servidor.", { status: 500 });
  }
}