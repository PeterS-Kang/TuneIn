import React from 'react'
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom'
import Homepage from './pages/Homepage'
import './App.css'
import Roompage from './pages/Roompage'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />}/>
        <Route path='/room' element={<Roompage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App