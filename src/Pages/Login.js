import { useState } from 'react';
import axios from "axios";
import "../CSS-files/Login.css"
import CreatableSelect from "react-select/creatable";
function Login(props) {

  const [loginForm, setloginForm] = useState({
    email: "",
    password: ""
  })
  

  const logMeIn = (event) => {
    axios({
      method: "POST",
      url: "/login",
      withCredentials: true,
      data: {
        email: loginForm.email,
        password: loginForm.password
      }
    })
      .then((response) => {
        if (response.status == 200) {
          console.log("login succesful")
          alert("successfuly logged in")
        }
      }).catch((error) => {
        if (error.response.status == 401) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          alert("Invalid credentials")
        }
      })

    setloginForm(({
      email: "",
      password: ""
    }))

    event.preventDefault()
  }

  function handleChange(event) {
    const { value, name } = event.target
    setloginForm(prevNote => ({
      ...prevNote, [name]: value
    })
    )
  }

  const handleClick = () => {
    document.getElementById("myDropdown").classList.toggle("show")
  }
  return (

   
      <div id="myDropdown" className="dropdown-content">
        <div className='login-box'>
          <form className="login-form">
            <input onChange={handleChange}
              type="email"
              text={loginForm.email}
              name="email"
              placeholder="Email"
              value={loginForm.email} />
            <input onChange={handleChange}
              type="password"
              text={loginForm.password}
              name="password"
              placeholder="Password"
              value={loginForm.password} />
            Project:<CreatableSelect
              options={["default"]}
              noOptionsMessage={() => null}
              promptTextCreator={() => false}
              formatCreateLabel={() => undefined} />
            <button >Create New Project</button>
            <button >New User</button>
            <button onClick={logMeIn}>Submit</button>
            <a href='/lostpassword'>Lost your password ?</a>
          </form>
        </div>
      </div>
   
  );
}

export default Login;
