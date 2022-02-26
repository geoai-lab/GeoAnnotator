import React, {useState,useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import './Navbar.css'


function Navbar(){
    const [click, setClick] = useState(false); 
    const [button, setButton] = useState(true); 
    const handleClick = () => {
        setClick(!click); 
    }
    const closeMobileMenu = () => {
        setClick(false)
    }
    const showButton = () => {
        if(window.innerWidth <= 960){
            setButton(false);
        }else{
            setButton(true);
        }
    }; 
    useEffect(() => {
        showButton();
      }, []);
    window.addEventListener('resize', showButton)

    return(
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className='navbar-logo'>
                    GeoAnnotator for Disaster-related Location Descriptions&nbsp; <i className="fa-solid fa-earth-americas" /> 
                    </Link>
                    <div className='menu-icon' onClick={handleClick}>
                        <i className={click? 'fas fa-times' : 'fas fa-bars' } />
                    </div>
                    <ul className={click? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                                Home
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/api' className='nav-links' onClick={closeMobileMenu}>
                                Annotate
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/compare' className='nav-links' onClick={closeMobileMenu}>
                                Compare Annotations 
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/logout' className='nav-links' onClick={closeMobileMenu}>
                                Logout 
                            </Link>
                        </li>
                    </ul>
                    {button && <Button buttonStyle='btn--outline'>Sign UP</Button>}
                </div>
            </nav>
        </>
    )
}

export default Navbar 