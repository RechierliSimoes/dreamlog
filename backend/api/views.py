from rest_framework import viewsets, permissions
from core.models import Dream
from .serializers import DreamSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dream_status(request, pk):
    dream = get_object_or_404(Dream, pk=pk, user=request.user)
    return Response({'status': dream.status})

class DreamViewSet(viewsets.ModelViewSet):
    serializer_class = DreamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Cada usuário vê apenas os próprios sonhos
        return Dream.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
