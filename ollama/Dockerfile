FROM ollama/ollama

# Копируем скрипт запуска
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Открываем порт
EXPOSE 11434

# Переопределяем запуск
ENTRYPOINT ["/entrypoint.sh"]