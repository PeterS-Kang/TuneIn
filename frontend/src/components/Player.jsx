import React, { useCallback, useEffect, useState } from 'react'
import { useErrorState, usePlaybackState, usePlayerDevice, useWebPlaybackSDKReady, WebPlaybackSDK } from 'react-spotify-web-playback-sdk'
import PlayerController from './PlayerController'
import api from '../api/api'
import { StateConsumer } from './StateConsumer'

const Player = ({socket, isHost, currentSong, SpotifyAPI, isPausedByHost, isPausing, setIsPausing}) => {
    const playerDevice = usePlayerDevice()
    const errorState = useErrorState()
    const webPlaybackSDKReady = useWebPlaybackSDKReady()
    const playbackState = usePlaybackState(true, 100)
    const accessToken = sessionStorage.getItem("authToken")



    return (
        <>
            <PlayerController socket={socket} isHost={isHost} currentSong={currentSong} SpotifyAPI={SpotifyAPI} playerDevice={playerDevice} authToken={accessToken} webPlaybackSDKReady={webPlaybackSDKReady} isPausedByHost={isPausedByHost}/>
            <StateConsumer playerDevice={playerDevice} errorState={errorState} webPlaybackSDKReady={webPlaybackSDKReady} playbackState={playbackState} accessToken={accessToken}/>
        </>
    )
}

export default Player