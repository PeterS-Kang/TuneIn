import React from 'react'
import api from '../api/api'
import {Link} from 'react-router-dom'

const Homepage = () => {

    const authenticateSpotifyHost = () => {
        const params = {
          redirect_to: "host"
        }
    
        api.get('/spotify/is-authenticated', {params})
          .then((response) => {
            if (!response.data.status) {
              api.get('/spotify/get-auth-url', {params})
                .then((response) => {
                  window.location.replace(response.data.url)
                })
            }
          })
      }

      const authenticateSpotifyJoin = () => {
        const params = {
          redirect_to: "join"
        }
    
        api.get('/spotify/is-authenticated', {params})
          .then((response) => {
            if (!response.data.status) {
              api.get('/spotify/get-auth-url', {params})
                .then((response) => {
                  window.location.replace(response.data.url)
                })
            }
          })
      }

  return (
    <div className='border'>
        <div className='title-container'>
            <div className='title'>
                <h1 className='title-text'>TuneIn</h1>
            </div>
        </div>
        <div className='content'>
            <div className='buttons'>
                <button className='button' onClick={authenticateSpotifyHost}>Create Room</button>
                <button className='button' onClick={authenticateSpotifyJoin}>Join Room</button>
            </div>
        </div>
    </div>
  )
}

export default Homepage