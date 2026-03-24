#!/bin/sh

# Запускаем ollama в фоне
ollama serve &

# Ждём пока API станет доступен
echo "Waiting for Ollama to start..."
sleep 5

# Скачиваем модель (если нет)
echo "Pulling model..."
ollama pull llama3

# Держим контейнер активным
wait