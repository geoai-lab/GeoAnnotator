import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import '../CSS-files/Navbar.css'
import axios from "axios";
import { useParams } from "react-router-dom";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { SelectProject } from './SelectProject';
import * as util from "./Util.js";
import { useNavigate } from "react-router-dom";
import { DeleteProject } from './DeleteProject';
/**
     * Component Navigation Bar 
     * @param {boolean} isLogin determines if a user is logged in within the web application 
     * @param {string} _username Username of the user that is currently logged in  
     * @param {function} OnLogin function passed down that changes whether a user logs in or logs out
     * @param {string} CurProjectName String that contains the current project name. 
     */
export const Navbar = ({ children, isLogin, OnLogin, _username, CurProjectName }) => {
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState(); 
 
    const handleLogout = () => {
        /*
        * event that handles when a user logs out 
        */
        axios({
            method: "POST",
            url: "/logout",
        })
            .then((response) => {
                util.ToggleMessage("success", "Successful logout")
                OnLogin(false)
            }).catch((error) => {
                if (error.response) {
                    util.ToggleMessage("error", "Error in logout")
                }
            })

    }
    const handleSubmitSelectProject = () => {
        /*
        * event that handles when tries to select a new project
        */
        axios({
            method: "POST",
            url: "/handleProject/select",
            withCredentials: true,
            data: {}
        })
    }
    const handleDeleteProjects = () =>{
        /*
        * event that handles when tries to delete a project
        */
        axios({
            method: "POST",
            url: "/handleProject/delete",
            withCredentials: true,
            data: {}
        })
    }   
    return (
        <>
            <DeleteProject onSubmit={handleDeleteProjects} CurProjectName={CurProjectName}/>
            <SelectProject id="navbarSelection" onSubmit={handleSubmitSelectProject} setProjectName={setProjectName} addCreate={false}/>
            <div class="col-md-12" id="navigation-bar">
                <nav className="navbar navbar-expand-lg navbar-light" style={{ "background-color": "#83aeb8" }}>
                    <a class="navbar-brand" href="/" id="navTitle"> GeoAnnotator for Disaster-related tweets&nbsp;   <i className="fa-solid fa-earth-americas" /></a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown" style={{ "padding-right": "15px" }}>
                        <ul className="navbar-nav" id="menu-items">
                            <li className='nav-item'>
                                {isLogin && <a class="nav-link" style={{ "cursor": "pointer" }} onClick={() => {
                                    navigate("/api/any")
                                }}>Annotate </a>}
                            </li>
                            <li className='nav-item'>
                                {isLogin && <a class="nav-link" style={{ "cursor": "pointer" }} onClick={() => {
                                    navigate("/compare")
                                }}>Compare Annotations </a>}
                            </li>
                            <li className="nav-item dropdown">
                                {isLogin &&
                                    <a class="nav-link dropdown-toggle" style={{ "cursor": "pointer" }} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        Project
                                    </a>
                                }
                                <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                    <a class="dropdown-item" style={{ "cursor": "pointer" }} onClick={() => {
                                        navigate("/createproject")
                                    }}>Create a Project</a>
                                    <a class="dropdown-item" style={{ "cursor": "pointer" }} data-target="#deleteModal" data-toggle="modal">Delete a Project</a>
                                     <a class="dropdown-item" style={{ "cursor": "pointer" }} data-target="#navbarSelection" data-toggle="modal">Select a Project</a>
                                </div>


                            </li>
                            <li className="nav-item dropdown">
                                {isLogin &&
                                    <a class="nav-link dropdown-toggle" style={{ "cursor": "pointer" }} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        {"Welcome, " + _username}
                                    </a>
                                }
                                <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                    <a class="dropdown-item" href="/" onClick={handleLogout}>Logout</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </>
    )
}

