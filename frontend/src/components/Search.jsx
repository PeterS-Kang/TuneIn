import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'
import { usePlaybackState, usePlayerDevice } from 'react-spotify-web-playback-sdk'

const Search = ({queueFetched, isHost, SpotifyAPI, socket, spotifyAPIRequest}) => {
    const AUTH_TOKEN = sessionStorage.getItem("authToken")
    const device_id = sessionStorage.getItem("deviceID")
    const queueURL = 'https://api.spotify.com/v1/me/player/queue'

    const [searchResults, setSearchResults] = useState([])
    const [queue, setQueue] = useState([])
    const [isSearching, setSearching] = useState(false)
    
    const playbackState = usePlaybackState()

    useEffect(() => {
        const getMyQueue = async() => {
            const queue = await spotifyAPIRequest(queueURL)
            setQueue(queue.queue)
        }
        if (isHost) {
            getMyQueue()
        }
    }, [playbackState?.context.metadata.current_item])

    useEffect(() => {
        updateQueue()
    }, [queueFetched])

    const updateQueue = useCallback(() => {
        if (!isHost) {
            if (queueFetched.length !== 0) {
                console.log("queuefetched:", queueFetched)
                setQueue(queueFetched)
            }    
        }
    }, [queueFetched])

    const getMyQueue = () => {
        axios.get('https://api.spotify.com/v1/me/player/queue', {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
            },
        })
        .then((response) => {
            setQueue(response.data.queue)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const searchTracks = (e) => {
        const queryTerm = e.target.value
        if (queryTerm == "") {
            setSearchResults([])
            setSearching(false)
        } else {
            setSearching(true)
            SpotifyAPI.searchTracks(queryTerm, {limit: 5})
            .then((response) => {
                setSearchResults(response.tracks.items)
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    const addToQueue = (track) => {
        const options = {
            device_id: device_id
        }

        SpotifyAPI.queue(track.uri, {options})
            .then(async(response) => {
                console.log("added to queue")
                await spotifyAPIRequest(queueURL)
                const jsonStringQueue = JSON.stringify(queue)
                socket.send(JSON.stringify({
                    event: "update_user_queue",
                    message: jsonStringQueue,
                }))
            })
            .catch((error) => {
                console.log(error)
            })

    }


    
  return (
    <div>
        <div className='search-bar'>
            <input className='search-input-container' onChange={searchTracks} type='text' placeholder='Search for a track'></input>
        </div>
        { isSearching ? (
        <div className='search-results-container'>
            {searchResults.map((track, i) => {
                return (
                    <div className='search-box' onClick={() => {
                        if (isHost) {
                            addToQueue(track)
                            setSearching(false)
                        }}} 
                        key={i}>
                        <img className='img-box' src={track.album.images[0].url}/>
                        <h4 className='user-name'>{track.name}</h4>
                    </div>
                )
            })}
        </div>
        ) :
        (
        <div className='queue-container'>
            {queue.map((track, i) => {
                return (
                    <div className='queue-box' key={i}>
                        <img className='img-box' src={track.album.images[0].url}/>
                        <h4 className='user-name'>{track.name}</h4>
                    </div>
                )
            })}
        </div>
        )
        }
    </div>
  )
}

export default Search