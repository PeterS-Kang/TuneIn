from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated, GetAuthToken, GetUniqueCode, SwitchPlayback

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('get-auth-token', GetAuthToken.as_view()),
    path('get-user-id', GetUniqueCode.as_view()),
    path('switch-playback', SwitchPlayback.as_view())
]