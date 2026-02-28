from django.urls import path

from .views import keep_session_alive


urlpatterns = [
    path('keep-alive', keep_session_alive, name='keep_session_alive'),
]
