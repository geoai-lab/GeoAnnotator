import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import { Navbar } from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import Login from './Pages/Login';
import CreateProject from './Pages/CreateProject';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import React, { useEffect, useState } from 'react';

function App() {

  const [loggedin, setIsLoggedin] = useState(false)
  const [projects, setProjects] = useState([])
  useEffect(() => {
    fetch('/project+descriptions').then(response => {
      if (response.ok) {
        return response.json()
      }
    }).then(data => {
      var projectList = []
      for (var project of data) {
        projectList.push({"project-name": project["project-name"], "geo_json": JSON.parse(project.geo_json) })
      }
      setProjects(projectList)

    }
    )
  }, [])

  return (
    <div className="App">
      <Router>
        <Navbar isLogin={loggedin} OnLogin={setIsLoggedin} />

        <Routes>
          <Route path='/' exact element={<Login isLogin={loggedin} OnLogin={setIsLoggedin} projectNames={projects.map(project => project["project-name"])} />} />
          <Route path="/logout" />
          <Route path='/createproject' element={<CreateProject />} />
          <Route path='/api' element={<Submit_form />} />
          <Route path='/compare' element={<Compare />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
