import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/api'
import { RoomInfo } from '../context/RoomContext'

const SpotifyPage = () => {
  const name = sessionStorage.getItem("name")
  const userID = sessionStorage.getItem("userID")

  const authenticateSpotify = () => {
    const params = {
      userID: userID
    }

    
    api.get('/spotify/is-authenticated', {params})
      .then((response) => {
        if (!response.data.status) {
          api.get('/spotify/get-auth-url', {params})
            .then((response) => {
              window.location.replace(response.data.url)
            })
            .catch((error) => {
              console.log(error)
            })
          }
        })
        .catch((error) => {
          console.log(error)
        })
  }
  

  useEffect(() => {
    authenticateSpotify()
  })

}

export default SpotifyPage