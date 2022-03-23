import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import '../CSS-files/Navbar.css'
import axios from "axios";
import Login from './Login';
import { useParams } from "react-router-dom";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
export const Navbar = ({ children, isLogin, OnLogin, _username }) => {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

    let { projectName } = useParams();

    const handleClick = () => {
        setClick(!click);
    }
    const closeMobileMenu = () => {
        setClick(false)
    }
    const handleLogout = () => {
        axios({
            method: "POST",
            url: "/logout",
        })
            .then((response) => {
                alert("Successful logout")

                OnLogin(false)
            }).catch((error) => {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            })
        setClick(false)

    }
    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
        }
    };



    const SubMenu = ({ data, id }) => {

        return (
            <ul id={id} className="nav__submenu">
                {data.map(iter =>
                    <li className="nav__submenu-item ">
                        <Link to={iter.link} className='nav-links' onClick={iter.function} >{iter.label}</Link>
                    </li>
                )}
            </ul>
        );
    }




    return (
        <>
            <div class="col-md-12">
                <nav className='navbar navbar-default navbar-fixed-top'>
                    <div className="navbar-container">
                        <div className="d-inline-flex p-2">
                            <Link to={"/"} className='navbar-logo'>
                                GeoAnnotator for Disaster-related Location Descriptions&nbsp; <i className="fa-solid fa-earth-americas" />
                            </Link>
                        </div>
                        <div className='menu-icon' onClick={handleClick}>
                            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                        </div>
                        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                            <li className='nav-item'>
                                {isLogin && <Link to={'/api'} className='nav-links' onClick={closeMobileMenu}>
                                    Annotate
                                </Link>}
                            </li>
                            <li className='nav-item'>
                                {isLogin && <Link to={'/compare'} className='nav-links' onClick={closeMobileMenu}>
                                    Compare Annotations
                                </Link>}
                            </li>
                            <ul className='nav-item'>
                                {isLogin && <li className='nav-links' onClick={closeMobileMenu}>
                                    Project
                                    <SubMenu id="submenu1" data={[{ label: "Create a Project", link: "/createproject", function: null },
                                    { label: "Select Project", link: "/api", function: null }]} />
                                </li>}

                            </ul>
                            <ul className='nav-item'>
                                {isLogin &&

                                    <li className='nav-links'>
                                        {"Welcome, " + _username}
                                        <SubMenu id="submenu2" data={[{ label: "logout", link: "/", "function": handleLogout },
                                        { label: "settings", link: "/", "function": null }]} />
                                    </li>}


                            </ul>
                        </ul>
                    </div>
                </nav>
            </div>
        </>
    )
}

