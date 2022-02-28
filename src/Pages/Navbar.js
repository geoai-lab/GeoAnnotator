import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import '../CSS-files/Navbar.css'
import axios from "axios";
import Login from './Login';

export const Navbar = ({ children, isLogin ,OnLogin }) => {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
  
    useEffect(() => {
        showButton();
        axios({
            method: "POST",
            url: "/@me",
            withCredentials: true
        })
            .then((response) => {
                if (response.status == 200) {
                    console.log("login succesful")
                    alert("successfuly logged in")
                    OnLogin(true)

                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                    alert("Invalid credentials")
                    OnLogin(false)
                }
            })
    }, []);
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
 




    window.addEventListener('resize', showButton)
    const handleLoginPopup = () => {
        document.getElementById("myDropdown").classList.toggle("show")
    }
    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className='navbar-logo'>
                        GeoAnnotator for Disaster-related Location Descriptions&nbsp; <i className="fa-solid fa-earth-americas" />
                    </Link>
                    <div className='menu-icon' onClick={handleClick}>
                        <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                                Home
                            </Link>
                        </li>
                        <li className='nav-item'>
                            {isLogin && <Link to='/api' className='nav-links' onClick={closeMobileMenu}>
                                Annotate
                            </Link>}
                        </li>
                        <li className='nav-item'>
                            {isLogin && <Link to='/compare' className='nav-links' onClick={closeMobileMenu}>
                                Compare Annotations
                            </Link>}
                        </li>

                        <li className='nav-item'>
                            {isLogin ?
                                <Link to='/' className='nav-links' onClick={handleLogout}> 
                                    Logout
                                </Link> : <Link to='/' className='nav-links' onClick={handleLoginPopup}>
                                    Login
                                </Link>
                            }
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}

