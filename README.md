# Viral Content Studio

Сайт-генератор вирусного контента: карусели Instagram, посты Telegram, сторис и продающие тексты (письма, лендинги, прогревочные посты). Работает на React + Vite, генерация через Claude API.

Ключ Anthropic хранится на сервере (backend-прокси) и **не** попадает в браузер.

## Структура

- `src/App.jsx` — приложение (интерфейс + логика генерации).
- `api/generate.js` — serverless-функция Vercel, проксирует запросы к Claude API с серверным ключом.
- `vite.config.js` — сборка + dev-прокси `/api/generate` для локального запуска.

## Локальный запуск

1. Установить зависимости:
   ```bash
   npm install
   ```
2. Создать файл `.env` из примера и вставить свой ключ Anthropic:
   ```bash
   cp .env.example .env
   # затем открыть .env и вписать ANTHROPIC_API_KEY=sk-ant-...
   ```
   Ключ берётся в консоли: https://console.anthropic.com/
3. Запустить дев-сервер:
   ```bash
   npm run dev
   ```
   Открыть адрес, который покажет Vite (обычно http://localhost:5173).

Локально путь `/api/generate` обслуживает встроенный dev-прокси из `vite.config.js` — отдельный сервер поднимать не нужно.

## Деплой на Vercel

1. Залить репозиторий на GitHub (ветка с этим кодом).
2. На https://vercel.com → **Add New → Project** → выбрать репозиторий.
3. Vercel сам определит Vite (сборка `vite build`, папка `dist`). Менять ничего не нужно.
4. В **Settings → Environment Variables** добавить переменную:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
5. Нажать **Deploy**. Функция `api/generate.js` подхватится автоматически.

После деплоя фронтенд и `/api/generate` работают на одном домене — ключ остаётся только на сервере.

## Смена модели

Модель задаётся в `src/App.jsx`:
```js
const MODEL = "claude-sonnet-4-6";
```
Sonnet — оптимален по цене/скорости для потокового контента. Можно поменять на другую доступную модель Claude при желании.

## Проверка сборки

```bash
npm run build
```
Собранный сайт кладётся в `dist/`.
