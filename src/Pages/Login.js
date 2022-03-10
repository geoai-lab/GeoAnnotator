import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Draggable from 'react-draggable';
import { Link } from 'react-router-dom'
import "../CSS-files/Login.css"
import Select from 'react-select'
export const Login = ({ children, OnLogin, projectNames,setCurrProject }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [createproject, setCreateproject] = useState(false);
  const [currentProject, setCurrLoginProject]  = useState();
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

    document.getElementById("myDropdown").classList.toggle("show")
    
  }, [])


  const logMeIn = (event) => {
    event.preventDefault()
    
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
   
          setCreateproject(false);
          OnLogin(true);
          setIsRegistering(false);
          if(createproject){
            navigate("/createproject");
          }
          else{
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

  const handleCreateProject = () =>{
    setCreateproject(true); 
    logMeIn(); 
    navigate("/createproject")

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
  const handleProjectSelection = (event) =>{
    setCurrProject(event.label)
    setCurrLoginProject(event.label)
  }
  return (


    <div id="myDropdown" className="dropdown-content">
      <div className='login-box'>
        <form className="login-form" onSubmit={logMeIn}>
          <h3>{isRegistering ? 'Register' : 'Login'}</h3>
          <input onChange={handleChange}
            type="email"
            text={isRegistering ? registerForm.email : loginForm.email}
            name="email"
            placeholder="Email"
            value={isRegistering ? registerForm.email : loginForm.email}
            required />
          <input onChange={handleChange}
            type="password"
            text={isRegistering ? registerForm.password : loginForm.password}
            name="password"
            placeholder="Password"
            value={isRegistering ? registerForm.password : loginForm.password}
            required />
          {isRegistering &&
            <div>
              <input onChange={handleChange}
                type="password"
                text={registerForm.retypepassword}
                name="retypepassword"
                placeholder="Confirm-Password"
                value={registerForm.retypepassword}
                required />
              <input onChange={handleChange}
                type="username"
                text={registerForm.username}
                name="username"
                placeholder="Username"
                value={registerForm.username}
                required />
            </div>}
          <div>
            Project:<Select
              options={projectNames } 
              onChange={handleProjectSelection} />

            <button type="secondary" onClick={HandleRegister} >{isRegistering ? 'Back to log-in' : 'New User'}</button>
            <button type="secondary" onClick={handleCreateProject}>Create a Project</button>
            <button type="primary" onClick={logMeIn}>Submit</button>
            
          </div>
        </form>

        {!isRegistering && <p>Forgot your password? <a href='/lostpassword'>Click Here!</a></p>}
      </div>
    </div>


  );
}

export default Login;
