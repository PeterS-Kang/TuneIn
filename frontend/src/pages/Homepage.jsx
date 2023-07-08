import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import { RoomInfo } from '../context/RoomContext'


const Homepage = () => {
  let navigate = useNavigate()

  const [code, setCode] = useState()
  const [name, setName] = useState()

  const handleCodeChange = (e) => {
    e.preventDefault()
    let code = e.target.value
    code = code.toUpperCase()
    setCode(code)
    sessionStorage.setItem("code", code)
    console.log(code)
  }

  const handleNameChange = (e) => {
    e.preventDefault()
    let name = e.target.value
    setName(name)
    sessionStorage.setItem("name", name)
    console.log(name)
  }

  const joinRoom = () => {
    const params = {
      code: code,
      name: name
    }

    console.log(code)

    api.get('/api/join-room', {params})
      .then((response) => {
        console.log(response.data)
        navigate("/auth")
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const createRoom = () => {
    const params = {
      name: name,
      guest_can_pause: true,
      votes_to_skip: 1
    }



    api.post('/api/create-room', {params})
      .then((response) => {
        console.log(response.data)
        sessionStorage.setItem("code", response.data.code)
        navigate("/auth")
      })
      .catch((error) => {
        console.log(error)
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
          <div className='panel'>
            <div className='input-container'>
              <input className='input-name' spellCheck='false' autoComplete='off' maxLength='20' placeholder='Please Enter your Name' onChange={handleNameChange}></input>
            </div>
            <div className='input-container'>
              <input className='input-code' spellCheck='false' autoComplete='off' maxLength='6' placeholder='Please Enter the Room Code' onChange={handleCodeChange}></input>
            </div>
            <div className='buttons'>
                <button className='button join' onClick={joinRoom}>Join Room</button>
            </div>
            <h3 className='text'>or</h3>
            <div className='buttons'>
                <button className='button' onClick={createRoom}>Create a Private Room</button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Homepage