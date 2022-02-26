import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import Navbar from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import React from 'react';
function App() {
  return (
    <div className="App">
      <Router>
      <Navbar />
        <Routes>
          <Route path='/' exact element={<Home/>}/>
          <Route path='/api' element={<Submit_form/>} /> 
          <Route path='/compare' element={<Compare/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
