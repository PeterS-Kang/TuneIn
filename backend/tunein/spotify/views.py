from django.shortcuts import render, redirect
from dotenv import load_dotenv
from rest_framework.views import APIView, status
from requests import Request, post
from rest_framework.response import Response
from .util import update_or_create_user_tokens, is_spotify_authenticated
import os

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# Create your views here.
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        redirect_to = request.GET.get('redirect_to')
        print(REDIRECT_URI)
        print(CLIENT_ID)

        print("redirectto", redirect_to)

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'state': redirect_to
            }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    print(1)
    code = request.GET.get('code')
    redirect_to = request.GET.get('state')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    print(2)

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')

    print(3)

    print(redirect_to)

    if not request.session.exists(request.session.session_key):
        request.session.create()

    print(4)

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    print(5)
    print("redirect_to", redirect_to)

    if redirect_to == 'host':
        return redirect('http://localhost:3000/host')
    elif redirect_to == 'join':
        return redirect('http://localhost:3000/join')
    else:
        return redirect('http://localhost:3000')

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)