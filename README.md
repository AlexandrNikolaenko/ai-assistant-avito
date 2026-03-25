# AI Assistant

Проект состоит из трёх сервисов:

* **Frontend** — клиентская часть (Vite + React)
* **Backend** — API (Node.js)
* **Ollama** — LLM сервис (модель `llama3`)

---

## Вариант 1: Локальный запуск без Docker (рекомендуется)

Можно запускать сервисы отдельно.

---

### 🟢 Frontend

```bash
npm i
npm run dev
```

или production-сборка:

```bash
npm i
npm run build
serve -s dist -l 80
```

---

### 🔵 Backend

```bash
npm i
npm run start
```

---

### 🧠 Ollama

Установка Ollama: https://ollama.com

Далее:

```bash
ollama pull llama3
ollama serve
```

---

### 📡 Доступ к Ollama

```
http://localhost:11434
```
---
## Вариант 2: Запуск через Docker (не рекомендуется из-за веса проекта)

### 1. Сборка и запуск

```bash
docker compose up --build
```

---

### 2. Доступ к сервисам

* Frontend: http://localhost
* Backend: http://localhost:5000
* Ollama API: http://localhost:11434

---

### 3. Взаимодействие сервисов внутри Docker

Backend должен обращаться к Ollama по адресу:

```
http://ollama:11434
```

---

### Первый запуск

При первом старте Ollama:

* автоматически скачивается модель `llama3`
* это может занять несколько минут

---
---
## Самостоятельно принятые решения

### Frontend

Было принято решение совместить 2 библиотеки:
Использовать MUI для карточек элементов и для пагинации из-за схожести с макетом и удобством использования
Остальная часть приложения написана с использованием AntDesign, исходя из схожести компонентов с макетом.


Также было принято решение построить приложение по архитектуре FSD, исходя из описания проекта, деление на 6 своев было подходящим.
Страницу редактирования объявления (/src/pages/AdsEditPage.tsx) было решено оставить в виде одной формы, вынеся в виджеты только опциональные характеристики в виду ограниченности по времени и сложной взаимосвязонности логики изменения состояний компонентов.


Изменение темы реализовать не успел при переходе на AntDesign. Поэтому остался только слой Redux для обработки изменения без возможности самой обработки на странице.

### Backend

Была добавлена обработка prefight запроса для устранения ошибки CORS в файле server.ts:

```
fastify.use((req, reply, next) => {
  reply.setHeader('Access-Control-Allow-Origin', '*');
  reply.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  reply.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    reply.statusCode = 204;
    return reply.end();
  }

  next();
});
```

Было принято решение дописать обработку сортировки по полю "price", так как сервер возвращал ответ со статусом 500:

Изменение валидации в файлу validation.ts:

```
sortColumn: z.enum<ItemSortColumn[]>(['title', 'createdAt', 'price']).optional(),
```

Добавление обработки поля в фале server.ts:

```
else if (sortColumn === 'price') {
  comparisonValue = item1.price - item2.price;
}
```