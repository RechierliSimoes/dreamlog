from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from core.models import Dream


def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')


@login_required
def dashboard(request):
    dreams = Dream.objects.filter(user=request.user).order_by('-dreamed_at')
    return render(request, 'web/dashboard.html', {'dreams': dreams})


@login_required
def dream_create(request):
    if request.method == 'POST':
        description = request.POST.get('description', '').strip()
        mood = request.POST.get('mood', 'neutral')
        dreamed_at = request.POST.get('dreamed_at', timezone.now().date())

        if description:
            Dream.objects.create(
                user=request.user,
                description=description,
                mood=mood,
                dreamed_at=dreamed_at,
            )
            return redirect('dashboard')

    moods = Dream.MOOD_CHOICES
    today = timezone.now().date()
    return render(request, 'web/dream_create.html', {'moods': moods, 'today': today})


@login_required
def dream_detail(request, pk):
    dream = get_object_or_404(Dream, pk=pk, user=request.user)
    return render(request, 'web/dream_detail.html', {'dream': dream})
