import React, { useEffect, useState, useCallback } from 'react'
import { usePlayerDevice, useSpotifyPlayer, usePlaybackState } from 'react-spotify-web-playback-sdk'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import Song from './Song'
import axiosRetry from 'axios-retry'
import axios from 'axios'

const PlayerController = ({socket, isHost, currentSong, SpotifyAPI, playerDevice, authToken, webPlaybackSDKReady}) => {
    const player = useSpotifyPlayer()
    const playbackState = usePlaybackState()
    const deviceID = sessionStorage.getItem("deviceID")
    const [paused, setPaused] = useState(false)

    const handleToggle = () => {
        if (isHost) {
            setPaused((prevPaused) => {
                const newPaused = !prevPaused;
                console.log("handle toggle", newPaused);
                let data = {
                  event: "playToggle",
                  message: {
                    paused: newPaused,
                  },
                };
                socket.send(JSON.stringify(data));
                return newPaused;
              });
        }
      };

      const changeToCurrentSong = async (currentSong) => {
        try {
            const playbackEndpoint = 'https://api.spotify.com/v1/me/player/play?device_id=' + playerDevice?.device_id;
            console.log(currentSong)
            // Set the Authorization header with the access token
            const config = {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            };

            console.log("uri:", currentSong.item.uri)
            
            // Create the request body
            const requestBody = {
              uris: [currentSong.item.uri],
              position_ms: currentSong.progress_ms,
            };
            
            // Make the Axios request to start/resume playback
            const response = axios.put(playbackEndpoint, requestBody, config)
            console.log("success")
            console.log("resuming")

        } catch (error) {
            console.log(error)
        }
      }

      const getMyQueue = async () => {
        try {
          const authToken = sessionStorage.getItem("authToken")
          console.log('getMyqueue:', authToken);
          const response = await axios.get('https://api.spotify.com/v1/me/player/queue', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          console.log(response.data.queue)
          return(response.data.queue);
        } catch (error) {
          console.log(error);
        }
      };
      
      const updateSongForOthers = async(uri) => {
        if (isHost) {
            try {
                let queue = await getMyQueue()
                queue.shift()
                let currentSong = {
                    item: {
                        uri: uri
                    },
                    progress_ms: 0
                }
                const jsonStringQueue = JSON.stringify(queue)
                const jsonStringCurrentSong = JSON.stringify(currentSong)
                if (queue !== undefined) {
                    socket.send(JSON.stringify({
                        event: "update_user_music",
                        message: jsonStringQueue,
                        currentSong: jsonStringCurrentSong
                    }))
                }
            } catch (error) {

            }
        }
      }

    useEffect(() => {
        if (playbackState) {
            setPaused(playbackState.paused)
            console.log("paused", paused)
        }
    }, [])

    useEffect(() => {
        const play = async() => {
            if (!isHost) {
                if (player) {
                    if ((currentSong !== undefined) && (currentSong !== "") && (playerDevice?.device_id !== undefined)) {
                        console.log("playerController", currentSong)
                        await changeToCurrentSong(currentSong)
                    }
                    setPaused(false)
                }
            }
        }

        if (!isHost) {
            play()
        }
    }, [currentSong, player, playerDevice])


    if (player === null) {
        return null
    }
    if (playbackState === null) {
        return null
    }

  return (
    <div className='container'>
        <Song paused={paused}/>   
        <div className='music-listener-interface'>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} onClick={async() => {
                updateSongForOthers(playbackState?.context.metadata.previous_items[1].uri)
                await player.previousTrack()
                }} disabled={!isHost}>
                <SkipPreviousIcon/>
            </button>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} disabled={!isHost} onClick={(() => {
                player.togglePlay()
                handleToggle()
            })}>
                {paused ? <PlayArrowIcon/> : <PauseIcon/>}
            </button>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} onClick={async() => {
                await player.nextTrack()
                updateSongForOthers(playbackState?.context.metadata.next_items[0].uri)
                }}>
                <SkipNextIcon/>
            </button>
        </div>
    </div>
  )
}

export default PlayerController