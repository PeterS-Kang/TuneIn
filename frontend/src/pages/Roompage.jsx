import React, { useEffect, useState, useCallback } from 'react'
import { w3cwebsocket } from 'websocket'
import { json, Link } from 'react-router-dom'
import api from '../api/api'
import Player from '../components/Player'
import Search from '../components/Search'
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk'
import SpotifyWebApi from 'spotify-web-api-js'
import axios from 'axios'
import Chat from '../components/Chat'
import Users from '../components/Users'

const Roompage = () => {

    const name = sessionStorage.getItem("name")
    const code = sessionStorage.getItem("code")
    const userID = sessionStorage.getItem("userID")
    var SpotifyAPI = new SpotifyWebApi()
    


    const [authToken, setAuthToken] = useState()
    const [users, setUsers] = useState([])
    const [isHost, setIsHost] = useState()
    const [socketIO, setSocketIO] = useState()
    const [queue, setQueue] = useState([])
    const [currentSong, setCurrentSong] = useState()
    const [shouldUpdateUsersMusic, setShouldUpdateUsersMusic] = useState(false)
    const [isPausedByHost, setIsPausedByHost] = useState(false)
    const [chatLog, setChatLog] = useState([])

    useEffect(() => {
        SpotifyAPI.setAccessToken(authToken) 
    }, [authToken])

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
        if (shouldUpdateUsersMusic && isHost) {
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

            if (event === "users_updated") {
                getUsersInRoom()
                if (message.slice(message.indexOf(" ") + 1) === "has connected") {
                    setShouldUpdateUsersMusic(true)
                }
            }

            if (event === "update_user_music") {
                if (message !== "") {
                    if (!isHost) {
                        try {
                            const currentSongParsed = JSON.parse(data["currentSong"])
                            setCurrentSong(currentSongParsed)
                            const queue = JSON.parse(message)
                            setQueue(queue)
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
            }
            if (event === "toggle") {
                if (!isHost) {
                    if (message !== "" && message !== undefined) {
                        if (message.paused) {
                            setIsPausedByHost(true)
                        } else {
                            setIsPausedByHost(false)
                        }
                    }
                }
            }

            if (event === "update_user_queue") {
                if (!isHost) {
                    if (message !== "" && message !== undefined) {
                        const queue = JSON.parse(message)
                        setQueue(queue)
                    }
                }
            }

            if (event === "messageReceived") {
                const senderUserID = data["userID"]
                const senderName = data["name"]
                if (userID !== senderUserID) {
                    setChatLog((prevChatArray) => [senderName + ": " + message, ...prevChatArray]);
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
            let queue = await spotifyAPIRequest('https://api.spotify.com/v1/me/player/queue')
            let currentSong = await spotifyAPIRequest('https://api.spotify.com/v1/me/player/currently-playing')

            const jsonStringQueue = JSON.stringify(queue.queue)
            const jsonStringCurrentSong = JSON.stringify(currentSong)
            if (queue !== undefined) {
                socket.send(JSON.stringify({
                    event: "update_user_music",
                    message: jsonStringQueue,
                    currentSong: jsonStringCurrentSong
                }))
            }
        } catch (error) {
            console.log(error)
        }
    }, [queue])

    const getAuthToken = async () => {
        try {
          const params = {
            userID: userID,
          };

          const response = await api.get('/spotify/get-auth-token', { params });
          const authToken = response.data.token;
          setAuthToken(authToken);
          sessionStorage.setItem('authToken', authToken);
        } catch (error) {
          console.log(error);
        }
      };

    const spotifyAPIRequest = async(url) => {
        try {
            const authToken = sessionStorage.getItem("authToken")
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
            })

            return response.data
        } catch (error) {
            console.log(error)
        }
    }

      const sendMessage = (message) => {
        socketIO.send(JSON.stringify({
            event: "messageSent",
            message: message,
            userID: userID,
            name: name
        }))
      }
      

    const disconnect = () => {
        socketIO.close()
    }
    
    const getOAuthToken = useCallback(callback => callback(authToken), [authToken])

  if (authToken != null) {
    return (
    <WebPlaybackSDK
    initialDeviceName='TuneIn'
    getOAuthToken={getOAuthToken}
    volume={0.5}
    connectOnInitialized={true}>  
    <div className='border'>
        <div className='logo'>
            <Link className='logo-text' to="/" onClick={disconnect}>TuneIn</Link>
        </div>
        <div className='music'>
            <div className='music-wrapper'>
                <div className='left-panel'>
                    <Users code={code} users={users}/>
                    <Chat chatLog={chatLog} setChatLog={setChatLog} name={name} sendMessage={sendMessage}/>
                </div>
                <div className='music-listener'>
                    <Player socket={socketIO} isHost={isHost} currentSong={currentSong} SpotifyAPI={SpotifyAPI} isPausedByHost={isPausedByHost} />
                </div>
                <div className='music-queue-chat'>
                    <div className='queue'>
                        <Search queueFetched={queue} isHost={isHost} SpotifyAPI={SpotifyAPI} socket={socketIO} spotifyAPIRequest={spotifyAPIRequest}/>
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