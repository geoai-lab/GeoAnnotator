import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import {Navbar} from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import Login from './Pages/Login';
import CreateProject from './Pages/CreateProject';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import React, { useEffect, useState } from 'react';
function App() {

  const [loggedin, setIsLoggedin] = useState(false)
 

  return (
    <div className="App">
      <Router>
      <Navbar isLogin={loggedin} OnLogin={setIsLoggedin}/>
      <Login isLogin={loggedin} OnLogin={setIsLoggedin}/>
      <Routes>
          <Route path='/' exact element={<Home/>}/>
          <Route path="/logout" />
          <Route path='/createproject' element={<CreateProject/>}/>
          <Route path='/api' element={<Submit_form/>} /> 
          <Route path='/compare' element={<Compare/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
