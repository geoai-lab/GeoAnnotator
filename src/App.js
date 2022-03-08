import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import { Navbar } from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import Login from './Pages/Login';
import CreateProject from './Pages/CreateProject';
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import React, { useEffect, useState } from 'react';

function App() {

  const [loggedin, setIsLoggedin] = useState(false)
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState()
  useEffect(() => {
    fetch('/project+descriptions').then(response => {
      if (response.ok) {
        return response.json()
      }
    }).then(data => {
      var projectList = []
      for (var project of data) {
        projectList.push({ "label": project["project-name"] })
      }
      setProjects(projectList)

    }
    )
    axios({
      method: "POST",
      url: "/@me",
      withCredentials: true
    })
      .then((response) => {
        if (response.status == 200) {
          setIsLoggedin(true);

        }
      }).catch((error) => {
        if (error.response.status == 401) {
          setIsLoggedin(false);
        }
      })
     
  }, [loggedin])

  return (
    <div className="App">
      
      <Router>
        <Navbar isLogin={loggedin} OnLogin={setIsLoggedin} />
        {!loggedin && <Login isLogin={loggedin} OnLogin={setIsLoggedin} projectNames={projects} setCurrProject={setProject}/>}
        <Routes>
          <Route path='/' exact />
          <Route path="/logout" />
          <Route path='/createproject' element={<CreateProject />} />
          <Route path={"/api/:projectName"} element={<Submit_form/>} />
          <Route path='/compare' element={<Compare />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
