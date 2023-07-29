from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Room, User
from spotify.models import SpotifyToken
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.userID = self.scope['url_route']['kwargs']['userID']
        self.room_group_name = 'room_%s' % self.room_id
        #Join group

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        print(self.username)

        user = await self.create_user()
        room = await self.get_room()

        print(user)

        await self.add_user_to_room(room, user)
        await self.save_model(room)


        await self.channel_layer.group_send(self.room_group_name, 
            {
                'type': 'update_users',
                'event': 'users_updated',
                'message': self.username + ' has connected'
            }
        )



    async def disconnect(self, close_code):
        room = await self.get_room()
        user = await self.get_user()
        spotifyToken = await self.get_spotify_token()

        await self.remove_user(room, user)
        await self.save_model(room)
        user_count = await self.get_users_in_room(room)
        if (user_count == 0):
            await self.delete_instance_of_model(room)
            print("room deleted")
        await self.delete_instance_of_model(user)
        await self.delete_instance_of_model(spotifyToken)

        await self.channel_layer.group_send(self.room_group_name,
            {
                'type': 'update_users',
                'event': 'users_updated',
                'message': self.username + ' has disconnected'
            }
        )

        #Leave group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        response = json.loads(text_data)
        event = response.get("event", None)
        message = response.get("message", None)


        print("message", message)
        print("event", event)

        

        #Music state has been toggled(play/pause/skip/prev)
        if (event == "toggle"):
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'update_player',
                'message': message,
                "event": "toggle"
            })

        if (event == "update_user_music"):
            currentSong = response.get("currentSong")
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'update_player',
                'message': message,
                'event': event,
                'currentSong': currentSong
            })

        if (event == "update_user_queue"):
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'update_player',
                'message': message,
                'event': event,
            })

        if (event == "messageSent"):
            userID = response.get("userID")
            name = response.get('name')
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'update_chat',
                'message': message,
                'event': 'messageReceived',
                'userID': userID,
                'name': name
            })

        
        
    

    async def update_users(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))

    async def update_player(self, res):
        await self.send(text_data=json.dumps({
            "payload":res,
        }))
    
    async def update_chat(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))

    
    #methods to access models

    @database_sync_to_async
    def get_room(self):
        room = Room.objects.filter(code=self.room_id)
        if (room):
            return room[0]
        else:
            print("Error: Room not found")

    @database_sync_to_async
    def get_user(self):
        user = User.objects.filter(name=self.username)
        if (user):
            return user[0]
        else:
            print("Error: User not found")

    @database_sync_to_async
    def get_spotify_token(self):
        spotifyToken = SpotifyToken.objects.filter(user=self.userID)
        if (spotifyToken):
            return spotifyToken[0]
        else:
            print("Error: SpotifyToken not found")

    @database_sync_to_async
    def remove_user(self, room, user_to_remove):
        try:
            room.users.remove(user_to_remove)
        except:
            print("Error removing user from room")

    @database_sync_to_async
    def get_users_in_room(self, room):
        try:
            return room.users.count()
        except:
            print("Error getting users in room")

    @database_sync_to_async
    def save_model(self, model):
        try:
            model.save()
        except:
            print("Error saving model")

    @database_sync_to_async
    def delete_instance_of_model(self, model):
        try:
            model.delete()
        except:
            print("error deleting")
            

    @database_sync_to_async
    def create_user(self):
        user = User.objects.filter(name=self.username)
        if (len(user) > 0):
            user = user[0]
        else:
            user = User(name=self.username)
            user.save()
        return user

    @database_sync_to_async
    def add_user_to_room(self, room, user):
        try:
            room.users.add(user)
        except:
            print("error adding user")