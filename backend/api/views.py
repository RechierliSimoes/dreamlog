from rest_framework import viewsets, permissions
from core.models import Dream
from .serializers import DreamSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.parsers import MultiPartParser
from ai.services import transcribe_audio


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


@api_view(['POST'])
@permission_classes([])  # público
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    return Response({'error': 'Credenciais inválidas'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def transcribe_dream(request):
    audio = request.FILES.get('audio')
    if not audio:
        return Response({'error': 'Nenhum arquivo de áudio enviado.'}, status=400)

    try:
        text = transcribe_audio(audio)
        return Response({'transcription': text})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
