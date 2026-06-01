import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTicketAlt, FaSignOutAlt, FaCoins, FaHome, FaBusAlt, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { FaX, FaArrowRight, FaUser } from "react-icons/fa6";
import { RiMenu3Line } from 'react-icons/ri';
import { MdAdminPanelSettings } from 'react-icons/md';
import { UserAppContext } from '../../context/UserAppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import NotificationBell from '../notifications/NotificationBell';

const navItems = [
    { label: "Home",          link: "/",              icon: <FaHome size={17} /> },
    { label: "Tickets",       link: "/bus-tickets",   icon: <FaBusAlt size={17} /> },
    { label: "About",         link: "/about",         icon: <FaInfoCircle size={17} /> },
    { label: "Live Tracking", link: "/live-tracking", icon: <FaMapMarkerAlt size={17} /> },
    { label: "Operator",      link: "/operator",      icon: <MdAdminPanelSettings size={17} /> },
];

const Navbar = () => {
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(UserAppContext);

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
            if (data.success) { setIsLoggedin(false); setUserData(false); }
            setDrawerOpen(false);
            navigate('/');
        } catch (e) { toast.error(e.message); }
    };

    const go = (path) => { setDrawerOpen(false); setDropdownOpen(false); navigate(path); };

    // Close desktop dropdown on outside click
    useEffect(() => {
        const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setDropdownOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Scroll hide/show
    useEffect(() => {
        let last = 0;
        const h = () => {
            const cur = window.scrollY;
            setIsVisible(!(cur > last && cur > 60));
            last = cur;
            setScrollY(cur);
        };
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    // Lock body when drawer open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const active = (link) => location.pathname === link;

    return (
        <>
            {/* ─── Top bar ──────────────────────────────────────────── */}
            <nav className={`w-full h-16 fixed top-0 left-0 px-4 md:px-7 lg:px-16 z-50
                transition-transform duration-300 backdrop-blur-md
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}
                ${scrollY > 50 ? 'bg-white/95 shadow-sm' : 'bg-white/10'}`}
            >
                <div className="h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                        Ticket Master
                    </Link>

                    {/* Desktop nav links */}
                    <ul className="hidden md:flex items-center gap-8 text-base font-medium text-neutral-600">
                        {navItems.map(item => (
                            <li key={item.link}>
                                <Link to={item.link}
                                    className={`transition-colors hover:text-primary ${active(item.link) ? 'text-primary font-semibold' : ''}`}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop right */}
                    <div className="hidden md:flex items-center gap-3">
                        {userData ? (
                            <>
                                <NotificationBell />
                                <div ref={profileRef} className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(o => !o)}
                                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden"
                                    >
                                        {userData.profilePicture
                                            ? <img src={userData.profilePicture} alt="" className="w-full h-full object-cover" />
                                            : userData.name[0].toUpperCase()}
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-50">
                                            <button onClick={() => go('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                                                <FaUser size={12} className="text-neutral-400" /> Profile
                                            </button>
                                            <button onClick={() => go('/bookings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                                                <FaTicketAlt size={12} className="text-neutral-400" /> Bookings
                                            </button>
                                            <button onClick={() => go('/tm-points')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                                                <FaCoins size={12} className="text-amber-500" /> TM Points
                                                {userData.tmPoints > 0 && <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-1.5 rounded-full">{userData.tmPoints}</span>}
                                            </button>
                                            <div className="mx-3 my-1 border-t border-neutral-100" />
                                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                <FaSignOutAlt size={12} /> Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <button onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
                                Log In <FaArrowRight size={11} />
                            </button>
                        )}
                    </div>

                    {/* Mobile right — bell + hamburger */}
                    <div className="flex md:hidden items-center gap-1">
                        {userData && <NotificationBell />}
                        <button onClick={() => setDrawerOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-neutral-700">
                            <RiMenu3Line size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Overlay ──────────────────────────────────────────── */}
            <div
                onClick={() => setDrawerOpen(false)}
                className={`fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-sm
                    transition-opacity duration-300
                    ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* ─── Drawer ───────────────────────────────────────────── */}
            <aside className={`fixed top-0 right-0 h-full w-[78vw] max-w-[300px] bg-white z-50 md:hidden
                flex flex-col shadow-2xl
                transition-transform duration-300 ease-in-out
                ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-6 pb-4">
                    <span className="text-lg font-bold text-primary">Menu</span>
                    <button onClick={() => setDrawerOpen(false)}
                        className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
                        <FaX size={11} />
                    </button>
                </div>

                {/* User card */}
                {userData && (
                    <div className="mx-4 mb-2 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0 overflow-hidden">
                            {userData.profilePicture
                                ? <img src={userData.profilePicture} alt="" className="w-full h-full object-cover" />
                                : userData.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-neutral-800 truncate">{userData.name}</p>
                            <p className="text-xs text-neutral-400 truncate">{userData.email}</p>
                        </div>
                        {userData.tmPoints > 0 && (
                            <span className="shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                {userData.tmPoints} pts
                            </span>
                        )}
                    </div>
                )}

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                    {navItems.map(item => (
                        <Link key={item.link} to={item.link} onClick={() => setDrawerOpen(false)}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                ${active(item.link)
                                    ? 'bg-primary text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100'}`}
                        >
                            <span className={active(item.link) ? 'text-white' : 'text-neutral-400'}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}

                    {userData && (
                        <>
                            <div className="pt-2 pb-1 px-4">
                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Account</p>
                            </div>
                            <button onClick={() => go('/profile')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
                                <FaUser size={15} className="text-neutral-400" /> Profile
                            </button>
                            <button onClick={() => go('/bookings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
                                <FaTicketAlt size={15} className="text-neutral-400" /> My Bookings
                            </button>
                            <button onClick={() => go('/tm-points')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
                                <FaCoins size={15} className="text-amber-400" /> TM Points
                            </button>
                        </>
                    )}
                </nav>

                {/* Footer action */}
                <div className="px-4 py-5 border-t border-neutral-100">
                    {userData ? (
                        <button onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                            <FaSignOutAlt size={13} /> Log Out
                        </button>
                    ) : (
                        <button onClick={() => { navigate('/login'); setDrawerOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Log In <FaArrowRight size={12} />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Navbar;
