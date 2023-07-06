from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Room, User
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
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

        await self.remove_user(room, user)
        await self.save_model(room)
        await self.delete_instance_of_model(user)

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
        pass
    

    async def update_users(self, res):
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
    def remove_user(self, room, user_to_remove):
        room.users.remove(user_to_remove)

    @database_sync_to_async
    def save_model(self, model):
        model.save()

    @database_sync_to_async
    def delete_instance_of_model(self, model):
        model.delete()

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
        room.users.add(user)