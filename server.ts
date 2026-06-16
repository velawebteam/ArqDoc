import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim() || "" });

// OpenRouter helper
async function callOpenRouter(model: string, messages: any[], systemInstruction?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenRouter API Key missing");

  const fullMessages = [];
  if (systemInstruction) {
    fullMessages.push({ role: "system", content: systemInstruction });
  }
  fullMessages.push(...messages);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-OpenRouter-Title": "Architecture SaaS Platform",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: fullMessages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check and environment log
  app.get("/api/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY || "";
    const orKey = process.env.OPENROUTER_API_KEY || "";
    res.json({ 
      status: "ok", 
      hasApiKey: key.length > 0,
      hasOpenRouterKey: orKey.length > 0,
      apiKeyLength: key.length,
      model_metadata: "v1beta",
      nodeEnv: process.env.NODE_ENV,
      port: PORT
    });
  });

  // API Route for document generation
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;

      if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Nenhuma chave API configurada (GEMINI_API_KEY ou OPENROUTER_API_KEY). Verifique em 'Settings > Secrets'." });
      }

      if (!prompt) {
        return res.status(400).json({ error: "O prompt é obrigatório." });
      }

      // Prioritize OpenRouter if key is available
      if (process.env.OPENROUTER_API_KEY) {
        const orModels = [
          "google/gemma-2-9b-it:free",
          "mistralai/pixtral-12b",
          "openai/gpt-4o-mini",
          "google/gemini-2.0-flash-001"
        ];

        for (const modelName of orModels) {
          try {
            console.log(`[AI] Tentativa com OpenRouter (${modelName})`);
            const text = await callOpenRouter(modelName, [{ role: "user", content: prompt }], systemInstruction);
            if (text) {
              console.log(`[AI] Sucesso com OpenRouter (${modelName})`);
              return res.json({ text: text, modelUsed: `openrouter/${modelName}` });
            }
          } catch (orErr: any) {
            console.error(`[AI] Erro no OpenRouter (${modelName}):`, orErr.message);
          }
        }
      }

      // Fallback to Gemini list
      const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest",
        "gemini-3-flash-preview"
      ];

      let lastError: any = null;
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI] Tentativa com modelo Gemini: ${modelName}`);
          const response = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || undefined,
              temperature: 0.7,
              topP: 0.95,
            },
          });

          if (response && response.text) {
            console.log(`[AI] Sucesso com o modelo Gemini: ${modelName}`);
            return res.json({ text: response.text, modelUsed: modelName });
          }
          throw new Error("A IA retornou uma resposta sem conteúdo de texto.");
        } catch (err: any) {
          console.error(`[AI] Erro no modelo Gemini ${modelName}: [Status ${err.status}] ${err.message}`);
          lastError = err;
          continue;
        }
      }

      // Final fallback if all failed
      console.error("[AI] Falha crítica: nenhum modelo respondeu com sucesso.");
      const status = lastError?.status || 500;
      
      return res.status(status).json({ 
        error: lastError?.message || "Não foi possível gerar o documento com os modelos disponíveis.",
        status: status,
        suggestion: "Experimente configurar uma chave OpenRouter se o Gemini continuar a falhar com erro 403."
      });
    } catch (error: any) {
      console.error("[AI] Erro inesperado:", error);
      res.status(500).json({ error: error.message || "Ocorreu um erro interno imprevisto." });
    }
  });

  // API Route for style analysis
  app.post("/api/analyze-style", async (req, res) => {
    try {
      const { contents } = req.body;

      if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Falta a configuração da API Key." });
      }

      const combinedText = contents.join('\n\n').slice(0, 30000); 
      
      const prompt = `
        Analise o estilo de escrita destes documentos de arquitetura e resuma o perfil em JSON.
        TEXTO:
        ${combinedText}
        
        ESTRUTURA JSON OBRIGATÓRIA:
        {
          "tone": { "formality": "high", "sentenceLength": "medium", "paragraphSize": "regular", "voice": "active" },
          "vocabulary": { "technicalExpressions": [], "preferredWording": [], "recurringPhrases": [] },
          "structure": { "sectionNaming": [], "numberingStyle": "", "headingStyle": "" },
          "legal": { "responsibilityClauses": [], "exclusionClauses": [] },
          "confidenceScore": 85
        }
        Retorne APENAS o JSON válido.
      `;

      if (process.env.OPENROUTER_API_KEY) {
        const orModels = [
          "google/gemma-2-9b-it:free",
          "openai/gpt-4o-mini"
        ];
        for (const modelName of orModels) {
          try {
            const text = await callOpenRouter(modelName, [{ role: "user", content: prompt }]);
            if (text) return res.json({ text: text });
          } catch (e: any) {
            console.error(`[STYLE] OpenRouter ${modelName} falhou:`, e.message);
          }
        }
      }

      const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
      for (const modelName of modelsToTry) {
        try {
          const response = await genAI.models.generateContent({
            model: modelName,
            contents: prompt
          });
          if (response && response.text) return res.json({ text: response.text });
        } catch (err: any) {
          console.error(`[STYLE] Modelo ${modelName} falhou:`, err.message);
        }
      }
      
      res.status(500).json({ error: "Não foi possível analisar o estilo." });
    } catch (error: any) {
      console.error("[STYLE] Erro crítico:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
