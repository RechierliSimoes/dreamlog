from django.db import models
from django.contrib.auth.models import User


class Dream(models.Model):
    MOOD_CHOICES = [
        ('peaceful', 'Tranquilo'),
        ('exciting', 'Animado'),
        ('scary', 'Assustador'),
        ('sad', 'Triste'),
        ('confusing', 'Confuso'),
        ('neutral', 'Neutro'),
    ]

    STATUS_CHOICES = [
        ('processing', 'Processando'),
        ('done', 'Concluído'),
        ('error', 'Erro'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dreams')
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, default='neutral')

    # Elementos extraídos pela IA
    characters = models.JSONField(default=list, blank=True)
    scenarios = models.JSONField(default=list, blank=True)
    emotions = models.JSONField(default=list, blank=True)
    dream_objects = models.JSONField(default=list, blank=True)
    ai_summary = models.TextField(blank=True)

    # Imagens geradas
    generated_images = models.JSONField(default=list, blank=True)  # lista de URLs

    dreamed_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-dreamed_at']

    def __str__(self):
        return f"{self.user.username} — {self.title or 'Sem título'} ({self.dreamed_at})"
