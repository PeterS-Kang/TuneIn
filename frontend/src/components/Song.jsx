import React, { useEffect, useState, useCallback, useRef } from 'react'
import { usePlaybackState } from 'react-spotify-web-playback-sdk'


const Song = ({paused}) => {
    const playbackState = usePlaybackState()
    const spinnerRef = useRef(null)

    useEffect(() => {
        console.log(paused)
        try {
            spinnerRef.current.style.animationPlayState = paused ? 'paused': 'running'
        } catch (error) {
            console.log(error)
        }
    }, [paused])


  return (
    <div className='song-container'>
        <div className='disc-under'>
            <div ref={spinnerRef} className='disc'>
                <div className='disc-image'>
                    <img src={playbackState.context.metadata.current_item.images[0].url}/>
                </div>
            </div>
        </div>
        <div className='song-info'>
            <p className='now-playing__name'>
                {playbackState.track_window.current_track.name}
            </p>
            <p className='now-playing__artist'>
                {playbackState.track_window.current_track.artists[0].name}
            </p>
        </div>
    </div>
  )
}


export default Song