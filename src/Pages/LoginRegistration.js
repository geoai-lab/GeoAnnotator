import React from 'react';
import '../CSS-files/LoginRegistration.css';
import ReactCardFlip from 'react-card-flip';
import { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { SelectProject } from './SelectProject';
import * as util from './Util.js';
/**
     * Component of the Login/Registration page
     * This component handles a form where the user can either login, or register a new account 
     * @param {setLogin} setFunction id used for the CSS styling of this component object 
     */
export const LoginRegistration = ({ onLogin, setLogin, setUsername }) => {
    const [isRegistering, setIsRegistering] = useState(false); //To know if a user is presently logged in or registering, utilize this state object.
    const [currentProject, setCurrLoginProject] = useState(); // This state object contains the name of the current project that the user selected (i.g. what the user selected from the list of project names in the project table)
    const [popupmessageOpen, setPopupmessageOpen] = useState(false);
    const navigate = useNavigate(); // navigate object (i.g. navigate("/createproject") ==> redirects you to the /createproject website). Function is similar to <a href="{link}"/>
    const [loginForm, setloginForm] = useState({ // when isRegistering==False this will contain the login data
        email: "",
        password: ""
    })
    const [registerForm, setregisterForm] = useState({ // when isRegistering==True this will contain the registration data
        email: "",
        password: "",
        retypepassword: "",
        username: ""
    })
    const HandleRegister = (event) => {
        event.preventDefault();
        setIsRegistering((data) => !data);
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
    const handleSubmit = (isCreating) => {
        console.log(currentProject);
        if(!currentProject && !isRegistering){
            util.ToggleMessage("error","Please Choose a project");
            return; 
        }
        axios({
            method: "POST",
            url: isRegistering ? "/register" : "/login",
            withCredentials: true,
            data: !isRegistering ? {
                email: loginForm.email,
                password: loginForm.password,
                project: currentProject
            } : {
                email: registerForm.email,
                password: registerForm.password,
                retypepassword: registerForm.retypepassword,
                username: registerForm.username,
                project: currentProject
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    if (isRegistering) {
                        util.ToggleMessage("success","Registration Successful");
                        navigate("/")
                        return;
                    }
                    util.ToggleMessage("success","Log-In Successful");
                    setLogin(true);
                    if (isCreating) {
                        navigate("/createproject");
                    }
                    else {
                        navigate('/api')
                    }
                }

            }).catch((error) => {
                if (error.response.status == 401) {
                    util.ToggleMessage("error",error.response.data.error);
                }
                else if (error.response.status == 409) {
                    util.ToggleMessage("error",error.response.data.error);
              
                }
            })

        setloginForm(({
            email: "",
            password: ""
        }))
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
   
    return (
        <>
           
            <div class="row" style={{ "top": "50px", "left": "40%", "position": "absolute" }}>
                <div class="col-md-12">
                    <div class="d-flex justify-content-center">
                        <SelectProject onSubmit={handleSubmit} setProjectName={setCurrLoginProject} />
                        <ReactCardFlip isFlipped={isRegistering} flipDirection="horizontal">
                            <div key="front" class="wrapping">
                                <div class="logo"> <img src="https://www.freepnglogos.com/uploads/twitter-logo-png/twitter-bird-symbols-png-logo-0.png" alt="" /> </div>
                                <div class="text-center mt-4 name"> Tweet Annotator </div>
                                <form class="p-3 mt-3">
                                    <div class="form-field d-flex align-items-center"> <span class="fa-solid fa-envelope"></span> <input class="no-autofill-bkg" type="email" name="email" id="userName" placeholder="Email" onChange={handleChange}
                                        text={loginForm.email} value={loginForm.email} required /> </div>

                                    <div class="form-field d-flex align-items-center"> <span class="fas fa-key"></span> <input onChange={handleChange} type="password" name="password" id="pwd" placeholder="Password"
                                        text={loginForm.password} value={loginForm.password} required /> </div>
                                    <button id="login-button" class="btn mt-3" data-target="#exampleModal" data-toggle="modal" onClick={(e) => {
                                        e.preventDefault();
                                    }}>Login</button>

                                </form>
                                <div class="text-center fs-6"> <a href="#">Forget password?</a> or <a href="#" onClick={HandleRegister}>Sign up</a> </div>
                            </div>
                            <div key="back" class="wrapping">
                                <div class="logo"> <img src="https://www.freepnglogos.com/uploads/twitter-logo-png/twitter-bird-symbols-png-logo-0.png" alt="" /> </div>
                                <div class="text-center mt-4 name"> Register </div>
                                <form class="p-3 mt-3">
                                    <div class="form-field d-flex align-items-center"> <span class="fa-solid fa-envelope"></span> <input onChange={handleChange} type="email" name="email" id="userName" placeholder="Email"
                                        text={registerForm.email} value={registerForm.email} required /> </div>

                                    <div class="form-field d-flex align-items-center"> <span class="fa-solid fa-user"></span> <input onChange={handleChange} type="username" name="username" id="username" placeholder="Username"
                                        text={registerForm.username} value={registerForm.username} required /> </div>
                                    <div class="form-field d-flex align-items-center"> <span class="fas fa-key"></span> <input onChange={handleChange} type="password" name="password" id="pwd" placeholder="Password"
                                        text={registerForm.password} value={registerForm.password} required /> </div>
                                    <div class="form-field d-flex align-items-center"> <span class="fas fa-key"></span> <input onChange={handleChange} type="password" name="retypepassword" id="repwd" placeholder="Retype-Password"
                                        text={registerForm.retypepassword} value={registerForm.retypepassword} /> </div>
                                    <button id="login-button" class="btn btn-secondary" onClick={(e) => {
                                        HandleRegister(e);
                                        handleSubmit(false);
                                    }}>Register</button>
                                </form>
                                <div class="text-center fs-6"><a href="#" onClick={HandleRegister}>Login?</a> </div>
                            </div>

                        </ReactCardFlip>
                    </div>
                </div>
            </div>

        </>


    )
}


