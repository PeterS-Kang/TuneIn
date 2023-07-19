import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'
import { usePlaybackState, usePlayerDevice } from 'react-spotify-web-playback-sdk'
import SpotifyWebApi from 'spotify-web-api-js'

const Search = ({queueFetched, isHost}) => {
    const AUTH_TOKEN = sessionStorage.getItem("authToken")
    var spotifyAPI = new SpotifyWebApi()
    const device_id = sessionStorage.getItem("deviceID")

    const [searchResults, setSearchResults] = useState([])
    const [queue, setQueue] = useState([])
    const [isSearching, setSearching] = useState(false)
    
    const playbackState = usePlaybackState()

    useEffect(() => {
        spotifyAPI.setAccessToken(AUTH_TOKEN) 
    }, [AUTH_TOKEN])

    useEffect(() => {
        getMyQueue()
    }, [playbackState])

    useEffect(() => {
        updateQueue()
    }, [queueFetched])

    const updateQueue = useCallback(() => {
        if (!isHost) {
            if (queueFetched.length !== 0) {
                console.log("queuefetched:", queueFetched)
                if (queueFetched.length !== 0) {
                    for (let i = 0; i < queueFetched.length; i++) {
                        setTimeout(() => {
                            addToQueue({uri: queueFetched[i]})
                            console.log("added to queue:", queueFetched[i])
                        }, 0.3 * (i + 1))
                    }
                }
            }
        }
    }, [queueFetched])



    // const updateQueueList = async(track) => {
    //     try {

    //         console.log(AUTH_TOKEN)
    //         const response = await axios.post('https://api.spotify.com/v1/me/player/queue', {},{
    //             headers: {
    //                 Authorization: `Bearer BQBg3UtGUs_XJgp7ajjrNpBdLNMsS-g4sNALkA26P58h0ZO2h8DP31ELmU5ScUhufn-OGf_fwB7rfRQH1o6Mvlj9XFYd-WRGuY6UE_ZuhV9XRfoF5MPYBhaXl_v4J6K-YDic0rsPcXeiUW-6dogj2exkEhYurwisnFLTmiJ_jR-Fg2CwCqRyEPcu-77ZdU7G04D5_P_baoLQVmQGTzs001RyNw6hODI`
    //             },
    //             params: {
    //                 uri: track,
    //             }
    //     })
    //         console.log("added to queue")
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

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
            spotifyAPI.searchTracks(queryTerm, {limit: 5})
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
        spotifyAPI.queue(track.uri, {options})
            .then((response) => {
                console.log("added to queue")
                getMyQueue()
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
                    <div className='search-box' onClick={() => addToQueue(track)} key={i}>
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