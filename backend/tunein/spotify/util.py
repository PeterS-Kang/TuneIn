from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from dotenv import load_dotenv
from requests import post
import os

load_dotenv()
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')


def get_user_tokens(session_id):
    print("g1")
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    print("g2")
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.refresh_token = refresh_token

        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()

def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now:
            refresh_spotify_token(session_id)
        return True
    return False

def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant-type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)
