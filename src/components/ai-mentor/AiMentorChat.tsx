"use client";

import { useState } from "react";
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

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessages: Message[] = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    // Placeholder for AI response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          text: "Esta é uma resposta simulada. A integração com o modelo de IA será feita na próxima fase.",
          sender: "ai",
        },
      ]);
    }, 1000);
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl">Mentor IA</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <ScrollArea className="flex-grow h-96 pr-4">
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
                  <p className="text-sm">{msg.text}</p>
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
            placeholder="Pergunte ao seu mentor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}