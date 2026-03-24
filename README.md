# AI Assistant

Проект состоит из трёх сервисов:

* **Frontend** — клиентская часть (Vite + React)
* **Backend** — API (Node.js)
* **Ollama** — LLM сервис (модель `llama3`)

---

## Вариант 1: Запуск через Docker (не рекомендуется из-за веса проекта)

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

## Вариант 2: Локальный запуск без Docker (рекомендуется)

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


