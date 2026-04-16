# 🌙 DreamLog

DreamLog é um app para registro e visualização de sonhos com IA. O usuário descreve o que sonhou, e a IA extrai os elementos principais (personagens, cenários, emoções, objetos) e gera automaticamente uma imagem artística do sonho.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Django + Django REST Framework |
| Banco de dados | PostgreSQL + pgvector |
| Fila assíncrona | Celery + Redis |
| LLM (análise) | Groq API (Llama 3.3 70B) |
| Geração de imagem | Hugging Face Inference (FLUX.1-schnell) |
| Frontend web | Django Templates + TailwindCSS |
| App mobile | React Native + Expo |
| Infra local | Docker Compose |

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- Docker Desktop
- Expo Go (no celular)

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/dreamlog.git
cd dreamlog
```

### 2. Suba o banco e o Redis

```bash
docker compose up -d
```

### 3. Configure o backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env  # preencha as variáveis
python manage.py migrate
python manage.py createsuperuser
```

### 4. Rode o Django

```bash
python manage.py runserver 0.0.0.0:8000
```

### 5. Rode o Celery (novo terminal)

```bash
cd backend
.venv\Scripts\activate
celery -A config worker --loglevel=info --pool=solo
```

### 6. Rode o app mobile

```bash
cd mobile
npx expo start
```

Escaneie o QR code com o **Expo Go** no celular (mesma rede Wi-Fi).

## Variáveis de ambiente

```env
DEBUG=True
SECRET_KEY=sua-chave-secreta
DATABASE_URL=postgres://dreamlog:dreamlog@localhost:5432/dreamlog
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=
HUGGINGFACE_API_KEY=
```

## Estrutura do projeto