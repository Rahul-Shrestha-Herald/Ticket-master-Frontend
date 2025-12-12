import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';
import { FaX, FaArrowRight, FaUser } from "react-icons/fa6";
import { UserAppContext } from '../../context/UserAppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

    const [scrollPosition, setScrollPosition] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOpenedByClick, setDropdownOpenedByClick] = useState(false);
    const profileDropdownRef = useRef(null);

    const navigate = useNavigate()
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(UserAppContext)

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`)
            data.success && setIsLoggedin(false)
            data.success && setUserData(false)
            setDropdownOpen(false)
            navigate('/')
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Navbar items
    const navItems = [
        { label: "Home", link: "/" },
        { label: "Tickets", link: "/bus-ticket" },
        { label: "About", link: "/abou" },
        { label: "Live Tracking", link: "/live-trackin" },
        { label: "Operator", link: "/operator" }
    ]

    //Handle click open
    const handleOpen = () => {
        setOpen(!open)
        // Close dropdown when toggling navbar
        setDropdownOpen(false);
    }

    //Handle click open
    const handleClose = () => {
        setOpen(false);
        // Close dropdown when closing navbar
        setDropdownOpen(false);
    }

    // Handle dropdown toggle
    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (!dropdownOpen) {
            // If dropdown is closed, open it and mark it as clicked
            setDropdownOpen(true);
            setDropdownOpenedByClick(true);
        } else if (!dropdownOpenedByClick) {
            // If dropdown is open due to hover (not click), set it to clicked mode
            setDropdownOpenedByClick(true);
        } else {
            // If dropdown is open due to previous click, close it
            setDropdownOpen(false);
            setDropdownOpenedByClick(false);
        }
    };

    // Navigate to profile and close dropdown
    const navigateToPage = (path) => {
        setDropdownOpen(false);
        handleClose();
        navigate(path);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
                setDropdownOpenedByClick(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    //To make the navbar sticky and the hide when scrolling up and showing when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollState = window.scrollY;

            //Determine visibility of the navbar based on scroll position
            if (currentScrollState > scrollPosition && currentScrollState > 50) {
                setIsVisible(false); //Hide the navbar when scrolling up
            }
            else {
                setIsVisible(true); //Show the navber when scrolling up and at top
            }

            setScrollPosition(currentScrollState);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPosition]);

    // Add overlay when navbar is open
    useEffect(() => {
        if (open) {
            document.body.classList.add('overflow-hidden');
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black/30 z-40';
            overlay.id = 'navbar-overlay';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
                handleClose();
            });
        } else {
            document.body.classList.remove('overflow-hidden');
            const overlay = document.getElementById('navbar-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
            const overlay = document.getElementById('navbar-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        };
    }, [open]);

    return (
        <nav className={`w-full h-[8ch] fixed top-0 left-0 lg:px-16 md:px-7 sm:px-7 px-4 backdrop-blur-lg transition-transform duration-300 z-50 
        ${isVisible ? "translate-y-0" : "-translate-y-full"} 
        ${scrollPosition > 50 ? "bg-neutral-300/90" : "bg-neutral-100/10"}`}>
            <div className="w-fill h-full flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className='text-3xl md:text-4xl text-primary font-bold'>
                    ticket master
                </Link>

                {/* Hamburger menu */}
                <div className="w-fit md:hidden flex items-center justify-center cursor-pointer text-primary" onClick={handleOpen}>
                    {open
                        ?
                        <FaX className='w-6 h-6' />
                        :
                        <FaBars className='w-6 h-6' />
                    }
                </div>

                {/* Nav links and button */}
                <div className={`${open
                    ?
                    "flex absolute top-[8ch] left-0 w-full h-auto md:relative z-50 animate-fadeDown"
                    :
                    "hidden"} flex-1 md:flex flex-col md:flex-row md:gap-14 gap-0 md:items-center items-start md:p-0 py-4 px-0 justify-end md:bg-transparent bg-white border md:border-transparent border-primary/20 md:shadow-none shadow-lg rounded-b-xl`}>

                    {/* Nav links */}
                    <ul className="list-none flex md:items-center items-start flex-wrap md:flex-row flex-col md:gap-8 gap-0 w-full md:w-auto text-lg text-neutral-600 font-medium">
                        {navItems.map((item, ind) => (
                            <li key={ind} onClick={handleClose} className="w-full md:w-auto">
                                <Link
                                    to={item.link}
                                    className='md:hover:text-primary md:ease-in-out md:duration-300 w-full block py-4 px-4 md:p-0 border-b md:border-b-0 border-primary/20 md:hover:bg-transparent hover:bg-primary/5 transition-colors'
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {userData ?
                        <div
                            ref={profileDropdownRef}
                            onClick={toggleDropdown}
                            onMouseEnter={() => {
                                if (!dropdownOpenedByClick) {
                                    setDropdownOpen(true);
                                }
                            }}
                            onMouseLeave={() => {
                                if (!dropdownOpenedByClick) {
                                    setDropdownOpen(false);
                                }
                            }}
                            className='w-10 h-10 flex justify-center items-center rounded-full bg-primary text-white relative group mx-4 md:mx-0 mt-4 md:mt-0 cursor-pointer'
                        >
                            {userData.name[0].toUpperCase()}
                            <div className={`absolute md:top-0 md:right-0 top-full left-0 md:left-auto z-20 text-black rounded md:pt-10 pt-2 w-32 ${dropdownOpen ? 'block' : 'hidden'}`}>
                                <ul className='list-none m-0 p-2 bg-gray-100 text-sm shadow-lg rounded'
                                    onClick={(e) => e.stopPropagation()}>
                                    <li onClick={() => navigateToPage('/profile')} className='py-2 px-4 hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-2'>
                                        <FaUser size={12} />
                                        Profile
                                    </li>
                                    <li onClick={() => navigateToPage('/bookings')} className='py-2 px-4 hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-2'>
                                        <FaTicketAlt size={12} />
                                        Bookings
                                    </li>
                                    <li onClick={logout} className='py-2 px-4 hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center gap-2'>
                                        <FaSignOutAlt size={12} />
                                        Log Out
                                    </li>
                                </ul>
                            </div>
                        </div>

                        // Button
                        : <div className="flex items-center justify-center w-full md:w-auto px-4 md:px-0 mt-4 md:mt-0 pb-4 md:pb-0">
                            <button onClick={() => {
                                navigate('/login');
                                handleClose();
                            }}
                                className='flex items-center justify-center gap-2 md:w-fit w-full md:px-4 px-6 md:py-1 py-3 hover:bg-transparent bg-primary border border-primary hover:border-primary md:rounded-full rounded-xl text-base font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                                Log In
                                <FaArrowRight />
                            </button>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar
