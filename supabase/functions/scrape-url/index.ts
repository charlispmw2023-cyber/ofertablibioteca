// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      throw new Error("A URL é obrigatória");
    }

    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Falha ao buscar a URL: ${response.statusText}`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Falha ao analisar o documento HTML");
    }

    const title = doc.querySelector("title")?.textContent || "";
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

    return new Response(
      JSON.stringify({ title, imageUrl: ogImage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});