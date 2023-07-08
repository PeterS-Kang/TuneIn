import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/api'
import { RoomInfo } from '../context/RoomContext'

const SpotifyPage = () => {
  const name = sessionStorage.getItem("name")
  const [userID, setUserID] = useState()

  const authenticateSpotify = () => {
    const params = {
      name: name
    }

    
    api.get('/spotify/get-user-id', {params})
      .then((response) => {
        const userID = response.data.code
        sessionStorage.setItem("userID", userID)
        
        api.get('/spotify/is-authenticated', {params: {userID: userID}})
          .then((response) => {
            if (!response.data.status) {
              api.get('/spotify/get-auth-url', {params: {userID: userID}})
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