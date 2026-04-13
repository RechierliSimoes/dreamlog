from celery import shared_task


@shared_task
def analyze_dream_task(dream_id: int):
    from core.models import Dream
    from ai.services import extract_dream_elements, generate_dream_image

    try:
        instance = Dream.objects.get(pk=dream_id)
        print(f"[TASK] Analisando sonho {dream_id}...")

        elements = extract_dream_elements(instance.description)
        print(f"[TASK] Elementos extraídos: {elements}")

        print(f"[TASK] Gerando imagem para sonho {dream_id}...")
        image_base64 = generate_dream_image(elements)

        generated_images = [image_base64] if image_base64 else []

        Dream.objects.filter(pk=dream_id).update(
            title=elements.get('title', ''),
            characters=elements.get('characters', []),
            scenarios=elements.get('scenarios', []),
            emotions=elements.get('emotions', []),
            dream_objects=elements.get('dream_objects', []),
            ai_summary=elements.get('ai_summary', ''),
            generated_images=generated_images,
            status='done',
        )
        print(f"[TASK] Sonho {dream_id} processado com sucesso.")

    except Exception:
        import traceback
        print(f"[TASK ERROR] Erro ao processar sonho {dream_id}:")
        traceback.print_exc()
        Dream.objects.filter(pk=dream_id).update(status='error')
