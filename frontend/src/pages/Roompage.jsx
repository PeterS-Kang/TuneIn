import React, { useEffect, useState, useCallback } from 'react'
import { w3cwebsocket } from 'websocket'
import { json, Link } from 'react-router-dom'
import api from '../api/api'
import Player from '../components/Player'
import Search from '../components/Search'
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk'
import axios from 'axios'

const Roompage = () => {

    const name = sessionStorage.getItem("name")
    const code = sessionStorage.getItem("code")
    const userID = sessionStorage.getItem("userID")
    const [authToken, setAuthToken] = useState()
    const [users, setUsers] = useState([])
    const [isHost, setIsHost] = useState()
    const [socketIO, setSocketIO] = useState()
    const [queue, setQueue] = useState([])
    const [timestamp, setTimestamp] = useState(0) 
    const [shouldUpdateUsersMusic, setShouldUpdateUsersMusic] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    userID: userID,
                }

                const response = await api.get('/spotify/get-auth-token', {params})
                const authToken = response.data.token
                setAuthToken(authToken)
                sessionStorage.setItem('authToken', authToken)
            } catch(error) {
                console.log(error)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        getRoomDetails()
        connect()
    }, [])

    useEffect(() => {
        if (shouldUpdateUsersMusic) {
            updateNewUsersMusic(socketIO)
            setShouldUpdateUsersMusic(false)
        }
    }, [shouldUpdateUsersMusic, socketIO])

    const connect = () => {
        const socket = new w3cwebsocket('ws://localhost:8000/ws/room/' + code + "/" + name + "/" + userID + "/")
        setSocketIO(socket)
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

            if (event === "users_updated") {
                getUsersInRoom()
                if (message.slice(message.indexOf(" ") + 1) === "has connected") {
                    setShouldUpdateUsersMusic(true)
                }
            }

            if (event === "update_user_music") {
                if (message !== undefined) {
                    try {
                        console.log("abc", message)
                        const queue = JSON.parse(message)
                        setQueue(queue)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }

        return () => {
            socket.close()
        }
    }

    const getRoomDetails = () => {
        const params = {
            code: code,
            userID: userID
        }
        api.get('/api/get-room', {params})
            .then((response) => {
                setUsers(response.data.users)

                setIsHost(() => response.data.host === userID)
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
                setUsers(response.data.users)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const updateNewUsersMusic = useCallback(async(socket) => {
        try {
            await getAuthToken()
            let queue = await getMyQueue()
            let timestamp = await getCurrentTimestamp()

            console.log(queue)
            console.log(timestamp)

            const jsonString = JSON.stringify(queue)
            if (queue !== undefined) {
                socket.send(JSON.stringify({
                    event: "update_user_music",
                    message: jsonString,
                    time: timestamp
                }))
            }
        } catch (error) {
            console.log(error)
        }
    }, [queue, timestamp])

    const getAuthToken = async () => {
        try {
          const params = {
            userID: userID,
          };

          console.log("userID",userID)
          const response = await api.get('/spotify/get-auth-token', { params });
          const authToken = response.data.token;
          console.log("getAuthtoken:", authToken)
          setAuthToken(authToken);
          sessionStorage.setItem('authToken', authToken);
        } catch (error) {
          console.log(error);
        }
      };
      
      const getMyQueue = async () => {
        try {
          const authToken = sessionStorage.getItem("authToken")
          console.log('getMyqueue:', authToken);
          const response = await axios.get('https://api.spotify.com/v1/me/player/queue', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          return(response.data.queue.map((track) => track.uri));
        } catch (error) {
          console.log(error);
        }
      };
      
      const getCurrentTimestamp = async () => {
        try {
            const authToken = sessionStorage.getItem("authToken")
            console.log("getcurrenttime:", authToken)
          const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          console.log(response.data.timestamp);
          return(response.data.timestamp);
        } catch (error) {
          console.log(error);
        }
      };
      

    const disconnect = () => {
        socketIO.close()
    }
    
    const getOAuthToken = useCallback(callback => callback(authToken), [authToken])

  if (authToken != null) {
    return (
    <WebPlaybackSDK
    initialDeviceName='Spotify Player'
    getOAuthToken={getOAuthToken}
    volume={0.5}
    connectOnInitialized={true}>  
    <div className='border'>
        <div className='logo'>
            <Link className='logo-text' to="/" onClick={disconnect}>TuneIn</Link>
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
                    <Player socket={socketIO} isHost={isHost} queue={queue}/>
                </div>
                <div className='music-queue-chat'>
                    <div className='queue'>
                        <Search queueFetched={queue} isHost={isHost}/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </WebPlaybackSDK>  
  )
}
}


export default Roompage