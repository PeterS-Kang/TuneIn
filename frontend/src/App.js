import React from 'react'
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom'
import Homepage from './pages/Homepage'
import './App.css'
import Hostpage from './pages/Hostpage'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />}/>
        <Route path='/host' element={<Hostpage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App