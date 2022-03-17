import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Draggable from 'react-draggable';
import { Link } from 'react-router-dom'
import "../CSS-files/Login.css"
import ReactCardFlip from 'react-card-flip';
import Select from 'react-select'
import { Card } from 'react-bootstrap';
export const Login = ({ children, OnLogin, projectNames, setCurrProject }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentProject, setCurrLoginProject] = useState();
  const [isFlipped, setIsFlipped] = useState(false)
  const navigate = useNavigate();
  const [loginForm, setloginForm] = useState({
    email: "",
    password: ""
  })
  const [registerForm, setregisterForm] = useState({
    email: "",
    password: "",
    retypepassword: "",
    username: ""
  })

  useEffect(() => {

    document.getElementById("myDropdown").classList.toggle("show");

    var loginbutton = document.getElementById("loginbutton");
    loginbutton.style.borderBottom = "rgb(106, 73, 0) 3px solid";
    loginbutton.style.transition = "all .2s ease-in-out";
    loginbutton.style.transform = "scale(1.1)";
    loginbutton.style.cursor = "default";
    var loginbutton = document.getElementById("registerbutton2");
    loginbutton.style.borderBottom = "rgb(106, 73, 0) 3px solid";
    loginbutton.style.transition = "all .2s ease-in-out";
    loginbutton.style.transform = "scale(1.1)";
    loginbutton.style.cursor = "default";
  }, [])


  const logMeIn = (onSubmit) => {

    axios({
      method: "POST",
      url: isRegistering ? "/register" : "/login",
      withCredentials: true,
      data: !isRegistering ? {
        email: loginForm.email,
        password: loginForm.password
      } : {
        email: registerForm.email,
        password: registerForm.password,
        retypepassword: registerForm.retypepassword,
        username: registerForm.username
      }
    })
      .then((response) => {
        if (response.status == 200) {
          console.log("login succesful");
          isRegistering ? alert("successful on registering") : alert("successfuly logged in");
          OnLogin(true);

          if (!onSubmit) {
            navigate("/createproject");
          }
          else {
            navigate('/api/project_name=' + currentProject)
          }
        }

      }).catch((error) => {
        if (error.response.status == 401) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          alert("Invalid credentials")
          OnLogin(false);
        }
        else if (error.response.status == 409) {
          alert(error.response.data)
        }
      })

    setloginForm(({
      email: "",
      password: ""
    }))
  }

  const handleCreateProject = () => {
    logMeIn(false);


  }
  function handleChange(event) {
    const { value, name } = event.target
    if (!isRegistering) {
      setloginForm(prevNote => ({
        ...prevNote, [name]: value
      })
      )
    } else {
      setregisterForm(prevNote => ({
        ...prevNote, [name]: value
      })
      )
    }

  }


  const handleClick = () => {
    document.getElementById("myDropdown").classList.toggle("show")
  }

  const HandleRegister = (event) => {
    event.preventDefault()

    setIsRegistering((data) => {
      return (!data);
    })



  }
  const handleProjectSelection = (event) => {
    setCurrProject(event.label)
    setCurrLoginProject(event.label)
  }

  return (

    <>
      <div id="myDropdown" className="dropdown-content">
        <div className='login-box'>
          <ReactCardFlip isFlipped={isRegistering} flipDirection="horizontal">
            <form key="front" className="login-form">
              <div id="choosing_title">
                <span id="loginbutton" >
                  Login
                </span>
                <span id="registerbutton" onClick={HandleRegister}>
                  Register
                </span>
              </div>
              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-envelope"></i>
                <input onChange={handleChange}
                  id="forminput"
                  type="email"
                  text={loginForm.email}
                  name="email"
                  placeholder="Email"
                  value={loginForm.email}
                  required />
              </div>
              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-lock"></i>
                <input onChange={handleChange}
                  id="forminput"
                  type="password"
                  text={loginForm.password}
                  name="password"
                  placeholder="Password"
                  value={loginForm.password}
                  required />
              </div>

              <div id="projectbuttonsection">
                <Select
                  id="selectBar"
                  options={projectNames}
                  onChange={handleProjectSelection}
                  placeholder="Select a project" />
              </div>

            </form>
            <form key="back" className="login-form" >
              <div id="choosing_title">
                <span id="loginbutton2" onClick={HandleRegister}>
                  Login
                </span>
                <span id="registerbutton2" >
                  Register
                </span>
              </div>
              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-envelope"></i>
                <input onChange={handleChange}
                  id="forminput"
                  type="email"
                  text={registerForm.email}
                  name="email"
                  placeholder="Email"
                  value={registerForm.email}
                  required />
              </div>
              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-lock"></i>
                <input onChange={handleChange}
                  id="forminput"
                  type="password"
                  text={registerForm.password}
                  name="password"
                  placeholder="Password"
                  value={registerForm.password}
                  required />
              </div>

              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-lock"></i>
                <input id="forminput" onChange={handleChange}
                  type="password"
                  text={registerForm.retypepassword}
                  name="retypepassword"
                  placeholder="Confirm-Password"
                  value={registerForm.retypepassword}
                  required />
              </div>
              <div style={{ display: "inline-block" }}>
                <i class="fa-solid fa-user"></i>
                <input id="forminput" onChange={handleChange}
                  type="username"
                  text={registerForm.username}
                  name="username"
                  placeholder="Username"
                  value={registerForm.username}
                  required />
              </div>

              <div id="projectbuttonsection">
                <Select
                  id="selectBar"
                  options={projectNames}
                  onChange={handleProjectSelection}
                  placeholder="Select a project" />
              </div>
            </form>

          </ReactCardFlip>
          <div id="wrapper">
            <div class="button-css-3" id="button-3"
              onClick={ ()=> handleCreateProject()}>
              <div id="circle"></div>
              <a >Create Project</a>
            </div>
            <div class="button-css-3" id="button-3"
              onClick={ () => logMeIn(true)}>
              <div id="circle"></div>
              <a>Login</a>
            </div>
          
          </div>
        </div>
      </div>


    </>

  );
}

export default Login;
