from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from dotenv import load_dotenv
from requests import post, put, get
import random
import string
import os

load_dotenv()
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(userID):
    user_tokens = SpotifyToken.objects.filter(user=userID)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def update_or_create_user_tokens(userID, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(userID)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.refresh_token = refresh_token

        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=userID, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()

def is_spotify_authenticated(userID):
    tokens = get_user_tokens(userID)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(userID)
        return True
    return False

def refresh_spotify_token(userID):
    refresh_token = get_user_tokens(userID).refresh_token
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant-type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(userID, access_token, token_type, expires_in, refresh_token)

def generate_unique_code(name):
    length = 10
    code = None

    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        code = name + code
        if SpotifyToken.objects.filter(user=code).count() == 0:
            break
    
    return code

def execute_spotify_api_request(userID, endpoint, params=None, post_=False, put_=False):
    tokens = get_user_tokens(userID)
    print(tokens.access_token)
    print(tokens)
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}
    
    if post_:
        print(1)
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        print(2)
        put(BASE_URL + endpoint, headers=headers)
    
    response = get(BASE_URL + endpoint, params=params, headers=headers)
    try:
        print(response.json())
        return response.json()
    except:
        return {'Error': 'Issue with request'}

def change_playback_device(userID, deviceID):
    params = {
        'device_ids': deviceID,
        'play': 'true'
    }
    return execute_spotify_api_request(userID, "player", params, put_=True)

def get_available_devices(userID):
    return execute_spotify_api_request(userID, "player/devices")