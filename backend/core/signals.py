from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Dream
from ai.services import extract_dream_elements


@receiver(post_save, sender=Dream)
def analyze_dream_on_create(sender, instance, created, **kwargs):
    if not created:
        return

    print(f"[SIGNAL] Analisando sonho {instance.pk}...")

    try:
        elements = extract_dream_elements(instance.description)
        print(f"[SIGNAL] Elementos extraídos: {elements}")

        Dream.objects.filter(pk=instance.pk).update(
            title=elements.get('title', ''),
            characters=elements.get('characters', []),
            scenarios=elements.get('scenarios', []),
            emotions=elements.get('emotions', []),
            dream_objects=elements.get('dream_objects', []),
            ai_summary=elements.get('ai_summary', ''),
        )
        print(f"[SIGNAL] Sonho {instance.pk} atualizado com sucesso.")

    except Exception as e:
        import traceback
        print(f"[SIGNAL ERROR] Erro ao analisar sonho {instance.pk}:")
        traceback.print_exc()
