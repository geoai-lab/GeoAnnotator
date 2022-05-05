import logo from './logo.svg';
import './App.css';
import { Submit_form } from './Pages/Submit_form';
import { Navbar } from './Pages/Navbar'
import Home from './Pages/Home';
import { Compare } from './Pages/Compare';
import CreateProject from './Pages/CreateProject';
import { LoginRegistration } from './Pages/LoginRegistration';
import axios from "axios";
import Loading from './Pages/Loading';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { PopupMessage } from './Pages/PopupMessage';
/**
     * Main file component (Encompasses all children components)
    */
function App() {

  const [loggedin, setIsLoggedin] = useState(false) // state object if user is logged in or not
  const [projects, setProjects] = useState([]) // state object that contains the project lists
  
  const [projectName, setProjectName] = useState("") // state object that contains the current project name
  const [_username, set_UserName] = useState(""); // state that contains the current user that is logged in on the web application
  const [isLoading, setIsLoading] = useState(true); // state object for when to show loading object or not
  useEffect(() => {
    // Use effect on the server side to have session based authentication
    setIsLoading(true);
    axios({
      method: "GET",
      url: "/@me",
      withCredentials: true
    })
      .then((response) => {
        setIsLoading(false);
        if (response.status == 200) {
          setIsLoggedin(true);
          set_UserName(response.data.username)
          setProjectName(response.data.projectName)
          setIsLoading(false);
        }
        if(response.status == 401){
          alert("login error");
          
        }
       
      }).then( setIsLoading(false));
     
  }, [loggedin])
  
  if(isLoading){
    // if use effect did not recieve any data .
    return(<Loading/>);
  }
  return (
    <div className="App">
       <PopupMessage />
      <Router>
        <Navbar isLogin={loggedin} OnLogin={setIsLoggedin} _username={_username} CurProjectName={projectName}/>
       
        <Routes>
          
          {!isLoading && !loggedin && <Route path='/' element={<LoginRegistration setLogin={setIsLoggedin}/>} exact />}
          <Route path="/" element={<Home/>}/>
          <Route path="/logout" />
          <Route path='/createproject' element={<CreateProject />} />
          <Route path={"/api/:tweetid"} element={<Submit_form />} />
          <Route path={"/api/"} element={<Submit_form />} />
          <Route path='/compare' element={<Compare />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
