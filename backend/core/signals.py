from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Dream
from ai.services import extract_dream_elements, generate_dream_image
from ai.tasks import analyze_dream_task


@receiver(post_save, sender=Dream)
def analyze_dream_on_create(sender, instance, created, **kwargs):
    if not created:
        return

    analyze_dream_task.delay(instance.pk)
    print(f"[SIGNAL] Analisando sonho {instance.pk}...")

    try:
        # 1. Extrai elementos com IA
        elements = extract_dream_elements(instance.description)
        print(f"[SIGNAL] Elementos extraídos: {elements}")

        # 2. Gera imagem com base nos elementos
        print(f"[SIGNAL] Gerando imagem para sonho {instance.pk}...")
        image_base64 = generate_dream_image(elements)

        generated_images = []
        if image_base64:
            generated_images = [image_base64]
            print(f"[SIGNAL] Imagem gerada com sucesso.")
        else:
            print(f"[SIGNAL] Falha na geração da imagem.")

        # 3. Atualiza o sonho com tudo
        Dream.objects.filter(pk=instance.pk).update(
            title=elements.get('title', ''),
            characters=elements.get('characters', []),
            scenarios=elements.get('scenarios', []),
            emotions=elements.get('emotions', []),
            dream_objects=elements.get('dream_objects', []),
            ai_summary=elements.get('ai_summary', ''),
            generated_images=generated_images,
        )
        print(f"[SIGNAL] Sonho {instance.pk} atualizado com sucesso.")

    except Exception as e:
        import traceback
        print(f"[SIGNAL ERROR] Erro ao analisar sonho {instance.pk}:")
        traceback.print_exc()
