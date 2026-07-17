import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// В проде запрос /api/generate обслуживает serverless-функция Vercel (api/generate.js).
// Для локального `npm run dev` этот же путь обслуживает dev-middleware ниже,
// который читает ANTHROPIC_API_KEY из .env и проксирует запрос в Anthropic.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "dev-api-generate",
        configureServer(server) {
          server.middlewares.use("/api/generate", (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "Метод не поддерживается" }));
              return;
            }

            const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("content-type", "application/json");
              res.end(
                JSON.stringify({
                  error: "ANTHROPIC_API_KEY не задан. Создай файл .env и добавь ключ (см. .env.example).",
                })
              );
              return;
            }

            let body = "";
            req.on("data", (chunk) => (body += chunk));
            req.on("end", async () => {
              try {
                const { model, max_tokens, system, messages } = JSON.parse(body || "{}");
                const upstream = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                  },
                  body: JSON.stringify({
                    model: model || "claude-sonnet-4-6",
                    max_tokens: max_tokens || 1500,
                    system,
                    messages,
                  }),
                });
                const text = await upstream.text();
                res.statusCode = upstream.status;
                res.setHeader("content-type", "application/json");
                res.end(text);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ error: e?.message || "Ошибка прокси" }));
              }
            });
          });
        },
      },
    ],
  };
});
