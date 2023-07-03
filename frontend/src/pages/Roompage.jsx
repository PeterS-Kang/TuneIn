import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import api from '../api/api'
const Roompage = () => {

    const [users, setUsers] = useState([])
    const [guestCanPause, setGuestCanPause] = useState()
    const [votesToSkip, setVotesToSkip] = useState()
    const [isHost, setIsHost] = useState()

    const location = useLocation()
    console.log(location.state)

    useEffect(() => {
        getRoomDetails()
    }, [users.length])

    const getRoomDetails = () => {
        console.log(location.state)
        const params = {
            code: location.state
        }

        api.get('/api/get-room', {params})
            .then((response) => {
                console.log(response.data)
                const user_arr = response.data.users
                setUsers(user_arr)
                console.log(users)
                setIsHost(response.data.host)
                setGuestCanPause(response.data.guest_can_pause)
                setVotesToSkip(response.data.votes_to_skip)
            })
            .catch((error) => {
                console.log(error)
            })
    }
    

  return (
    <div className='border'>
        <div className='logo'>
            <Link className='logo-text' to="/">TuneIn</Link>
        </div>
        <div className='music'>
            <div className='music-wrapper'>
                <div className='users'>
                    {users.map((user) => {
                        return (
                            <div className='user-box'>
                                <h4 className='user-name'>
                                    {user}
                                </h4>
                            </div>
                        )
                    })}
                </div>
                <div className='music-listener'>
                    <div className='music-listener-interface'>
                        <div className='song-name'>
                            <h2>Song name</h2>
                        </div>
                        <div className='song-tools'>
                            <button>skip left</button>
                            <button>Play</button>
                            <button>skip right</button>
                        </div>
                        <div className='song-progress'>

                        </div>
                    </div>

                </div>
                <div className='music-queue-chat'>
                    <div className='queue'>

                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}


export default Roompage