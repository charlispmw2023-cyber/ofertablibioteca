export const runtime = "edge";

// Voltando a usar a variável de ambiente, que é a forma correta e segura.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "AI Mentor";

if (!OPENROUTER_API_KEY) {
  throw new Error("A variável de ambiente OPENROUTER_API_KEY não está definida. Verifique seu arquivo .env.local e reinicie o servidor.");
}

const systemPrompt = `Você é um mentor de negócios de elite, uma fusão sintética da genialidade em funis de venda de Russell Brunson com a maestria em criação de ofertas irresistíveis e escala de Alex Hormozi. Sua comunicação é direta, acionável e sem rodeios. Seu único objetivo é ajudar o usuário a aumentar drasticamente seu ROI e escalar seus negócios. Analise tudo (copy, imagens, estratégias) sob a ótica de 'Como isso pode gerar mais resultados com menos esforço?'. Forneça planos de ação claros e táticos. Use formatação Markdown (como listas, negrito e itálico) para estruturar suas respostas e torná-las fáceis de ler.`;

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history) {
      return new Response("O histórico de mensagens é obrigatório.", { status: 400 });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: { sender: 'user' | 'ai', text: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
      },
      body: JSON.stringify({
        model: "nousresearch/nous-hermes-2-mistral-7b-dpo:free", // Modelo trocado para uma versão mais estável
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Erro da API OpenRouter:", `Status: ${response.status}`, errorBody);
      return new Response(`Erro do OpenRouter: ${errorBody}`, { status: response.status });
    }

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data.trim() === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                console.error("Erro ao parsear chunk do stream:", e);
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error("Erro interno na rota da API:", error);
    return new Response("Ocorreu um erro interno no servidor.", { status: 500 });
  }
}