import React, { useEffect, useState } from 'react'
import SpotifyWebApi from 'spotify-web-api-js'

const Search = () => {
    const AUTH_TOKEN = sessionStorage.getItem("authToken")
    var spotifyAPI = new SpotifyWebApi()

    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        spotifyAPI.setAccessToken(AUTH_TOKEN) 
    }, [AUTH_TOKEN])

    const searchTracks = (e) => {
        const queryTerm = e.target.value
        if (queryTerm == "") {
            setSearchResults([])
        }
        spotifyAPI.searchTracks(queryTerm, {limit: 5})
            .then((response) => {
                setSearchResults(response.tracks.items)
                console.log(response.tracks.items)
            })
            .catch((error) => {
                console.log(error)
            })
    }


    
  return (
    <div>
        <input onChange={searchTracks}></input>
        {searchResults.map((track) => {
            return (
                <div className='user-box'>
                    <img className='img-box' src={track.album.images[0].url}/>
                    <h4 className='user-name'>{track.name}</h4>
                </div>
            )
        })}
    </div>
  )
}

export default Search