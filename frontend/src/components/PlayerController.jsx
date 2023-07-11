import React, { useEffect, useState } from 'react'
import { usePlayerDevice, useSpotifyPlayer, usePlaybackState } from 'react-spotify-web-playback-sdk'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import Song from './Song'

const PlayerController = () => {
    const player = useSpotifyPlayer()
    const playbackState = usePlaybackState()
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        if (playbackState) {
            setPaused(playbackState.paused)
        }
    }, [playbackState?.paused])

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
            <button className='btn-spotify' onClick={() => player.previousTrack()}>
                <SkipPreviousIcon/>
            </button>
            <button className='btn-spotify' onClick={() => player.togglePlay()}>
                {paused ? <PlayArrowIcon/> : <PauseIcon/>}
            </button>
            <button className='btn-spotify' onClick={() => player.nextTrack()}>
                <SkipNextIcon/>
            </button>
        </div>

    </div>
  )
}

export default PlayerController