import json
from groq import Groq
from django.conf import settings


client = Groq(api_key=settings.GROQ_API_KEY)


def extract_dream_elements(description: str) -> dict:
    """
    Recebe o relato do sonho e retorna os elementos extraídos pela IA.
    """
    prompt = f"""Você é um assistente especializado em análise de sonhos.
Analise o seguinte relato de sonho e extraia os elementos principais.

Relato:
{description}

Responda APENAS com um JSON válido, sem explicações, sem blocos markdown, no seguinte formato:
{{
    "title": "título criativo e curto para o sonho (máximo 8 palavras)",
    "characters": ["lista de personagens ou entidades presentes"],
    "scenarios": ["lista de cenários ou ambientes"],
    "emotions": ["lista de emoções sentidas"],
    "dream_objects": ["lista de objetos relevantes"],
    "ai_summary": "resumo interpretativo do sonho em 2-3 frases"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    raw = response.choices[0].message.content.strip()

    # Remove blocos markdown se o modelo os incluir
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw)
