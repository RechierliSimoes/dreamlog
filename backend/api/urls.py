from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DreamViewSet, dream_status, login_view, transcribe_dream

router = DefaultRouter()
router.register(r'dreams', DreamViewSet, basename='dream')

urlpatterns = [
    path('', include(router.urls)),
    path('dreams/<int:pk>/status/', dream_status, name='dream-status'),
    path('auth/login/', login_view, name='login'),
    path('dreams/transcribe/', transcribe_dream, name='transcribe'),
]
