import React from 'react';
import '../CSS-files/LoginRegistration.css';
import ReactCardFlip from 'react-card-flip';
import { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { SelectProject } from './SelectProject';
export const LoginRegistration = ({ onLogin, setLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [currentProject, setCurrLoginProject] = useState();
    const [changeOpening, setChangeOpening] = useState(false);
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
    const inputE1 = useRef(null);
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
        console.log(isRegistering);
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
                    console.log("login succesful");
                    setLogin(true);
                    isRegistering ? alert("successful on registering") : alert("successfuly logged in");
                    if (isCreating) {
                        navigate("/createproject");
                    }
                    else {
                        navigate('/api')
                    }
                }

            }).catch((error) => {
                if (error.response.status == 401) {
                    alert("Wrong Password or Email")
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
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
            <div class="row">
                <div class="col-md-12">
                    <div class="d-flex justify-content-center">
                        <SelectProject setChanger={setChangeOpening} changeOpen={changeOpening} onSubmit={handleSubmit} setProjectName={setCurrLoginProject} />
                        <ReactCardFlip isFlipped={isRegistering} flipDirection="horizontal">
                            <div key="front" class="wrapping">
                                <div class="logo"> <img src="https://www.freepnglogos.com/uploads/twitter-logo-png/twitter-bird-symbols-png-logo-0.png" alt="" /> </div>
                                <div class="text-center mt-4 name"> Tweet Annotator </div>
                                <form class="p-3 mt-3">
                                    <div class="form-field d-flex align-items-center"> <span class="fa-solid fa-envelope"></span> <input class="no-autofill-bkg" type="email" name="email" id="userName" placeholder="Email" onChange={handleChange}
                                        text={loginForm.email} value={loginForm.email} required /> </div>

                                    <div class="form-field d-flex align-items-center"> <span class="fas fa-key"></span> <input onChange={handleChange} type="password" name="password" id="pwd" placeholder="Password"
                                        text={loginForm.password} value={loginForm.password} required /> </div>
                                    <button id="login-button" class="btn mt-3" onClick={(e) => {
                                        e.preventDefault();
                                        setChangeOpening(true);
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
                                    <button id="login-button" class="btn mt-3" onClick={(e) => {
                                        e.preventDefault();
                                        setChangeOpening(true);
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


