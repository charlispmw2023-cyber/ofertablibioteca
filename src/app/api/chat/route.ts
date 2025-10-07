import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

// Aponta para a API do OpenRouter usando a biblioteca oficial
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "AI Mentor",
  },
});

const systemPrompt = `Você é um mentor de negócios de elite, uma fusão sintética da genialidade em funis de venda de Russell Brunson com a maestria em criação de ofertas irresistíveis e escala de Alex Hormozi. Sua comunicação é direta, acionável e sem rodeios. Seu único objetivo é ajudar o usuário a aumentar drasticamente seu ROI e escalar seus negócios. Analise tudo (copy, imagens, estratégias) sob a ótica de 'Como isso pode gerar mais resultados com menos esforço?'. Forneça planos de ação claros e táticos.`;

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history) {
      return new Response("O histórico de mensagens é obrigatório.", { status: 400 });
    }

    // Constrói o histórico de mensagens no formato correto
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((msg: { sender: 'user' | 'ai', text: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    // Chama a IA usando a função segura e robusta da biblioteca
    const result = await streamText({
      model: openrouter("mistralai/mistral-7b-instruct:free"),
      messages,
    });

    // Retorna a resposta em streaming de forma segura
    return result.toAIStreamResponse();

  } catch (error: any) {
    console.error("Erro na API do OpenRouter:", error);
    // Retorna uma mensagem de erro mais detalhada no corpo da resposta
    return new Response(error.message || "Ocorreu um erro interno no servidor.", { status: 500 });
  }
}