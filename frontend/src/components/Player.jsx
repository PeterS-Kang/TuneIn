import React, { useCallback, useState } from 'react'
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk'
import PlayerController from './PlayerController'
import api from '../api/api'
import { StateConsumer } from './StateConsumer'

const Player = () => {
    const userID = sessionStorage.getItem("userID")

    const AUTH_TOKEN = sessionStorage.getItem("authToken")
    const getOAuthToken = useCallback(callback => callback(AUTH_TOKEN), [])


    return (
        <WebPlaybackSDK
            initialDeviceName='Spotify Player'
            getOAuthToken={getOAuthToken}
            volume={0.5}
            connectOnInitialized={true}
        >
            <PlayerController/>
            <StateConsumer/>
        </WebPlaybackSDK>
    )
}

export default Player