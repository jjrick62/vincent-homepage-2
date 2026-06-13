FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY app/blog/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY app /app

EXPOSE 8066

CMD ["uvicorn", "blog.server:app", "--host", "0.0.0.0", "--port", "8066"]
