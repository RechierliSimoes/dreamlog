from rest_framework import serializers
from core.models import Dream


class DreamSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Dream
        fields = [
            'id', 'user', 'title', 'description', 'mood',
            'characters', 'scenarios', 'emotions', 'dream_objects',  # <-- atualizado
            'ai_summary', 'generated_images',
            'dreamed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'characters', 'scenarios', 'emotions', 'dream_objects',  # <-- atualizado
            'ai_summary', 'generated_images',
            'created_at', 'updated_at',
        ]
