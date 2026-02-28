from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone


@require_http_methods(["GET"])
def keep_session_alive(request):
    if request.user.is_authenticated:
        request.session.modified = True

    return JsonResponse({
        "status": "session_updated",
        "is_authenticated": request.user.is_authenticated,
        "timestamp": timezone.now().isoformat(),
    })
