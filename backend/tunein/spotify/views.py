from django.shortcuts import render, redirect
from dotenv import load_dotenv
from rest_framework.views import APIView, status
from requests import Request, post
from rest_framework.response import Response
from .util import update_or_create_user_tokens, is_spotify_authenticated, get_user_tokens, generate_unique_code, change_playback_device
import os

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# Create your views here.
class AuthURL(APIView):
    def get(self, request, format=None):
        userID = request.GET.get("userID")

        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'state': userID
            }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    userID = request.GET.get('state')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')

    update_or_create_user_tokens(userID, access_token, token_type, expires_in, refresh_token)

    return redirect('http://localhost:3000/room')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        userID = request.GET.get("userID")
        is_authenticated = is_spotify_authenticated(userID)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class GetAuthToken(APIView):
    def get(self, request, format=None):
        userID = request.GET.get("userID")
        token = get_user_tokens(userID)
        if (token):
            return Response({"token": token.access_token}, status=status.HTTP_200_OK)
        return Response({"Error": "token null"}, status=status.HTTP_400_BAD_REQUEST)

class GetUniqueCode(APIView):
    def get(self, request, format=None):
        name = request.GET.get("name")
        if (name != None):
            code = generate_unique_code(name)
            return Response({"code": code}, status=status.HTTP_200_OK)
        return Response({"Bad Request": "Name not found"}, status=status.HTTP_404_NOT_FOUND)

class SwitchPlayback(APIView):
    def get(self, request, format=None):
        userID = request.GET.get("userID")
        deviceID = request.GET.get("deviceID")
        if (userID and deviceID):
            response = change_playback_device(userID, deviceID)
            return Response({'Playback Changed': response}, status=status.HTTP_200_OK)
        return Response({"Bad Request": "Params not found"}, status=status.HTTP_404_NOT_FOUND)