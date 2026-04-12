from django.contrib import admin
from .models import Dream


@admin.register(Dream)
class DreamAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'mood', 'dreamed_at', 'created_at']
    list_filter = ['mood', 'dreamed_at']
    search_fields = ['title', 'description', 'user__username']
