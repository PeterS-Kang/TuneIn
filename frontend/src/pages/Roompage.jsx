import React, { useEffect, useState } from 'react'
import { client, w3cwebsocket } from 'websocket'
import { Link, useNavigate} from 'react-router-dom'
import api from '../api/api'
import Player from '../components/Player'
import Search from '../components/Search'

const Roompage = () => {

    const name = sessionStorage.getItem("name")
    const code = sessionStorage.getItem("code")
    const userID = sessionStorage.getItem("userID")
    const [authToken, setAuthToken] = useState()
    const [users, setUsers] = useState([])
    const [guestCanPause, setGuestCanPause] = useState()
    const [votesToSkip, setVotesToSkip] = useState()
    const [isHost, setIsHost] = useState()
    const [socketIO, setSocketIO] = useState()

    useEffect(() => {
        getRoomDetails()
        connect()
    }, [])

    useEffect(() => {
        getAuthToken()
    }, [authToken])

    const connect = () => {
        const socket = new w3cwebsocket('ws://localhost:8000/ws/room/' + code + "/" + name + "/" + userID + "/")
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
                    break
            }
            console.log('Received:', message.data)
        }

        setSocketIO(socket)

        return () => {
            socket.close()
        }
    }


    const getRoomDetails = () => {
        const params = {
            code: code
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
            code: code
        }

        api.get('/api/get-users', {params})
            .then((response) => {
                console.log(response.data.users)
                setUsers(response.data.users)
            })
    }

    const getAuthToken = () => {
        const params = {
            userID: userID
        }
        api.get('/spotify/get-auth-token', {params})
            .then((response) => {
                setAuthToken(response.data.token)
                sessionStorage.setItem("authToken", response.data.token)
            })
            .catch((error) => {
                console.log(error)
            })
    }

  if (authToken != null) {
    return (
    <div className='border'>
        <div className='logo'>
            <Link className='logo-text' to="/">TuneIn</Link>
        </div>
        <div className='music'>
            <div className='music-wrapper'>
                <div className='users'>
                    <div className='user-box'>
                        <h4 className='user-name'>
                            Room: {code}
                        </h4>
                    </div>
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
                    <Player/>
                </div>
                <div className='music-queue-chat'>
                    <div className='queue'>
                        <Search/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
}


export default Roompage