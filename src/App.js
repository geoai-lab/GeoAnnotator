import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import {Navbar} from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import Login from './Pages/Login';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import React, { useEffect, useState } from 'react';
function App() {

  const [loggedin, isLoggedin] = useState(false)
  const ShowMe = () => {
    return(
      <h1>ME SUCCESSFUL</h1>
    )
  }
  return (
    <div className="App">
      <Router>
      <Navbar/>
      <Login/>
      <Routes>
          <Route path='/' exact element={<Home/>}/>
          <Route path='/@me' exact element={<ShowMe/>}/>
          <Route path="/logout" />
          <Route path='/api' element={<Submit_form/>} /> 
          <Route path='/compare' element={<Compare/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
