"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  text: string;
  sender: "user" | "ai";
}

export function AiMentorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Olá! Sou seu mentor de IA, com a expertise de Russell Brunson e Alex Hormozi. Como posso te ajudar a escalar seus resultados hoje?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const scrollableView = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollableView) {
      scrollableView.scrollTop = scrollableView.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error("A resposta não contém um corpo.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";
      
      setMessages(prev => [...prev, { text: "", sender: "ai" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        aiResponseText += decoder.decode(value, { stream: true });
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            lastMessage.text = aiResponseText;
            return [...prev.slice(0, -1), lastMessage];
        });
      }

    } catch (error) {
      console.error("Erro ao buscar resposta da IA:", error);
      setMessages(prev => [...prev, { text: "Desculpe, ocorreu um erro. Verifique sua chave de API e tente novamente.", sender: "ai" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl">Mentor IA</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <ScrollArea className="flex-grow h-96 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}{isLoading && msg.sender === 'ai' && index === messages.length - 1 ? '...' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button variant="outline" size="icon" disabled>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder={isLoading ? "Mentor está digitando..." : "Pergunte ao seu mentor..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}