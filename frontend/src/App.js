import React from 'react'
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom'
import Homepage from './pages/Homepage'
import './App.css'
import Roompage from './pages/Roompage'
import { RoomContextProvider } from './context/RoomContext'
import SpotifyPage from './pages/SpotifyPage'


const App = () => {
  return (
    <BrowserRouter>
      <RoomContextProvider>
        <Routes>
          <Route path='/' element={<Homepage />}/>
          <Route path='/room' element={<Roompage />}/>
          <Route path='/auth' element={<SpotifyPage/>}/>
        </Routes>
      </RoomContextProvider>
    </BrowserRouter>
  )
}

export default App