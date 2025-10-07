import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY || "";

if (!API_KEY) {
  throw new Error("A variável de ambiente GOOGLE_API_KEY não está definida.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: `Você é um mentor de negócios de elite, uma fusão sintética da genialidade em funis de venda de Russell Brunson com a maestria em criação de ofertas irresistíveis e escala de Alex Hormozi. Sua comunicação é direta, acionável e sem rodeios. Seu único objetivo é ajudar o usuário a aumentar drasticamente seu ROI e escalar seus negócios. Analise tudo (copy, imagens, estratégias) sob a ótica de 'Como isso pode gerar mais resultados com menos esforço?'. Forneça planos de ação claros e táticos. Não use formatação markdown, use quebras de linha simples para separar os parágrafos.`,
});

async function run(chatHistory: { text: string; sender: 'user' | 'ai' }[]) {
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory.slice(0, -1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
  });

  const lastMessage = chatHistory[chatHistory.length - 1];
  const result = await chat.sendMessageStream(lastMessage.text);
  
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        controller.enqueue(new TextEncoder().encode(chunkText));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(req: Request) {
  try {
    const { history } = await req.json();
    if (!history) {
        return new Response("O histórico de mensagens é obrigatório.", { status: 400 });
    }
    return await run(history);
  } catch (error) {
    console.error("Erro na API de chat:", error);
    return new Response("Ocorreu um erro interno no servidor.", { status: 500 });
  }
}