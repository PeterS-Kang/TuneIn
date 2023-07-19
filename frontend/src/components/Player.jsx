import React, { useCallback, useState } from 'react'
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk'
import PlayerController from './PlayerController'
import api from '../api/api'
import { StateConsumer } from './StateConsumer'

const Player = ({socket, isHost}) => {

    return (
        <>
            <PlayerController socket={socket} isHost={isHost}/>
            <StateConsumer/>
        </>
    )
}

export default Player