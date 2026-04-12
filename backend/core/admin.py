from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Dream


@admin.register(Dream)
class DreamAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'mood', 'dreamed_at', 'created_at']
    list_filter = ['mood', 'dreamed_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['dream_image_preview']

    def dream_image_preview(self, obj):
        if obj.generated_images:
            return mark_safe(f'<img src="{obj.generated_images[0]}" width="400" />')
        return "Nenhuma imagem gerada ainda."

    dream_image_preview.short_description = "Imagem Gerada"
