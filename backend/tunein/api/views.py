from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room, User

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
            
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        
        return Response({'Bad Request': 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)

class GetRoomView(APIView):
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        code = request.GET.get('code')
        if (code != None):
            room = Room.objects.filter(code=code)
            if (len(room) > 0):
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host

                users_in_room = room[0].users.all()
                user_array = []

                for user in users_in_room:
                    user_array.append(user.name)

                data['users'] = user_array
                return Response(data, status=status.HTTP_200_OK)

            return Response({"Room Not Found": "Invalid Room Code"}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
    
class JoinRoomView(APIView):
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        code = request.GET.get('code')
        name = request.GET.get('name')

        user = User.objects.filter(name=name)
        user_to_add = None
        if (len(user) > 0):
            user_to_add = user[0]
        else:
            user_to_add = User(name=name)
            user_to_add.save()


        if (code != None and name != None):
            room = Room.objects.filter(code=code)
            if (len(room) > 0):
                print(1)
                users_in_room = room[0].users.all()
                user_exists = users_in_room.filter(name=name).exists()

                print(2)

                if not user_exists:
                    room[0].users.add(user_to_add)
                    room[0].save()
                
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host

                return Response(data, status=status.HTTP_200_OK)
            return Response({"Room Not Found": "Invalid Room Code"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Parameter not found"}, status=status.HTTP_400_BAD_REQUEST)