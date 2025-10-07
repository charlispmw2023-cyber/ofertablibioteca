export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "AI Mentor";

if (!OPENROUTER_API_KEY) {
  throw new Error("A variável de ambiente OPENROUTER_API_KEY não está definida.");
}

const systemPrompt = `Você é um mentor de negócios de elite, uma fusão sintética da genialidade em funis de venda de Russell Brunson com a maestria em criação de ofertas irresistíveis e escala de Alex Hormozi. Sua comunicação é direta, acionável e sem rodeios. Seu único objetivo é ajudar o usuário a aumentar drasticamente seu ROI e escalar seus negócios. Analise tudo (copy, imagens, estratégias) sob a ótica de 'Como isso pode gerar mais resultados com menos esforço?'. Forneça planos de ação claros e táticos.`;

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

    const requestBody = {
      model: "mistralai/mistral-7b-instruct:free",
      messages: messages,
      stream: true,
    };

    console.log("Enviando requisição para o OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Resposta recebida do OpenRouter com status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Erro detalhado da API OpenRouter:", errorBody);
      // Retorna o erro exato do OpenRouter para o cliente para depuração
      return new Response(`Erro do OpenRouter: ${errorBody}`, { status: 500 });
    }

    // Se a resposta for bem-sucedida, processa o stream
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
          if (done) break;
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
                // Ignora erros de parseamento de JSON em chunks incompletos
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

  } catch (error: any) {
    console.error("Erro crítico na rota da API:", error);
    return new Response(error.message || "Ocorreu um erro interno no servidor.", { status: 500 });
  }
}