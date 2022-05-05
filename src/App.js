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

function App() {

  const [loggedin, setIsLoggedin] = useState(false)
  const [projects, setProjects] = useState([])
  
  const [projectName, setProjectName] = useState("")
  const [_username, set_UserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
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
