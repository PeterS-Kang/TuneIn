import React, { useEffect, useState } from 'react'
import { client, w3cwebsocket } from 'websocket'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import api from '../api/api'
const Roompage = () => {

    const [users, setUsers] = useState([])
    const [guestCanPause, setGuestCanPause] = useState()
    const [votesToSkip, setVotesToSkip] = useState()
    const [isHost, setIsHost] = useState()

    const location = useLocation()

    useEffect(() => {
        getRoomDetails()
        connect()
    }, [])

    const connect = () => {
        const socket = new w3cwebsocket('ws://localhost:8000/ws/room/' + location.state.code + "/" + location.state.name + "/")

        //handle connection open
        socket.onopen = () => {
            console.log('Websocket client connected')
        }

        socket.onmessage = (res) => {
            let data = JSON.parse(res.data)
            data = data["payload"]
            let event = data["event"]
            let message = data["message"]
            console.log(message)

            switch (event) {
                case "users_updated":
                    getUsersInRoom()
            }
            console.log('Received:', message.data)
        }

        return () => {
            socket.close()
        }
    }

    const getRoomDetails = () => {
        const params = {
            code: location.state.code
        }

        api.get('/api/get-room', {params})
            .then((response) => {
                setUsers(response.data.users)
                setIsHost(response.data.host)
                setGuestCanPause(response.data.guest_can_pause)
                setVotesToSkip(response.data.votes_to_skip)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getUsersInRoom = () => {
        const params = {
            code: location.state.code
        }

        api.get('/api/get-users', {params})
            .then((response) => {
                console.log(response.data.users)
                setUsers(response.data.users)
            })
    }

  return (
    <div className='border'>
        <div className='logo'>
            <Link className='logo-text' to="/">TuneIn</Link>
        </div>
        <div className='music'>
            <div className='music-wrapper'>
                <div className='users'>
                    {users.map((user) => {
                        return (
                            <div className='user-box' key={user}>
                                <h4 className='user-name'>
                                    {user}
                                </h4>
                            </div>
                        )
                    })}
                </div>
                <div className='music-listener'>
                    <div className='music-listener-interface'>
                        <div className='song-name'>
                            <h2>Song name</h2>
                        </div>
                        <div className='song-tools'>
                            <button>skip left</button>
                            <button>Play</button>
                            <button>skip right</button>
                        </div>
                        <div className='song-progress'>

                        </div>
                    </div>

                </div>
                <div className='music-queue-chat'>
                    <div className='queue'>

                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}


export default Roompage