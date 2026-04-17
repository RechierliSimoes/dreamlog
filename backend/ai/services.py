import json
from groq import Groq
from django.conf import settings
import requests
import base64
import io
from huggingface_hub import InferenceClient


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


def generate_dream_image(dream_data: dict) -> str | None:
    """
    Recebe os elementos do sonho e retorna a imagem em base64.
    """
    characters = ', '.join(dream_data.get('characters', []))
    scenarios = ', '.join(dream_data.get('scenarios', []))
    objects = ', '.join(dream_data.get('dream_objects', []))
    emotions = ', '.join(dream_data.get('emotions', []))

    prompt = (
        f"A vivid dream scene: {scenarios}. "
        f"Characters: {characters}. "
        f"Objects: {objects}. "
        f"Mood: {emotions}. "
        f"Dreamlike, surreal, cinematic lighting, highly detailed, fantasy art."
    )

    client = InferenceClient(
        provider="auto",
        api_key=settings.HUGGINGFACE_API_KEY,
    )

    image = client.text_to_image(
        prompt=prompt,
        model="black-forest-labs/FLUX.1-schnell",
    )

    # image é um objeto PIL.Image — convertemos para base64
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{image_base64}"


def transcribe_audio(audio_file) -> str:
    """
    Recebe um arquivo de áudio e retorna a transcrição em texto.
    """
    transcription = client.audio.transcriptions.create(
        file=audio_file,
        model="whisper-large-v3",
        language="pt",
        response_format="text",
    )
    return transcription
