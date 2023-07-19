import React, { useEffect, useState } from 'react'
import { usePlayerDevice, useSpotifyPlayer, usePlaybackState } from 'react-spotify-web-playback-sdk'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import Song from './Song'
import { Slider } from '@mui/material'

const PlayerController = ({socket, isHost}) => {
    const player = useSpotifyPlayer()
    const playbackState = usePlaybackState()
    const [paused, setPaused] = useState(true)

    useEffect(() => {
        if (playbackState) {
            setPaused(playbackState.paused)
            console.log("paused", paused)
        }
    }, [])

    useEffect(() => {
        if (!isHost) {
            if (player) {
                player.resume()
                setPaused(false)
            }
        }
    })

    if (player === null) {
        return null
    }
    if (playbackState === null) {
        return null
    }

    const handleToggle = () => {
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
      };

  return (
    <div className='container'>
        <Song paused={paused}/>   
        <div className='music-listener-interface'>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} onClick={() => player.previousTrack()} disabled={!isHost}>
                <SkipPreviousIcon/>
            </button>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} disabled={!isHost} onClick={(() => {
                player.togglePlay()
                handleToggle()
            })}>
                {paused ? <PlayArrowIcon/> : <PauseIcon/>}
            </button>
            <button className={isHost ? 'btn-spotify btn-spotify-active' : 'btn-spotify'} onClick={() => player.nextTrack()}>
                <SkipNextIcon/>
            </button>
        </div>
    </div>
  )
}

export default PlayerController