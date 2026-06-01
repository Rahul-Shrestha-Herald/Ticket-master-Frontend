import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserAppContext } from '../../context/UserAppContext';
import { FaBell, FaTicketAlt, FaCoins, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { MdPayment, MdCampaign, MdClose, MdDoneAll } from 'react-icons/md';
import { IoNotificationsOff } from 'react-icons/io5';

const TYPE_META = {
    booking: { icon: <FaTicketAlt className="text-blue-500" />,  bg: 'bg-blue-50',    dot: 'bg-blue-500' },
    payment: { icon: <MdPayment className="text-green-500" />,   bg: 'bg-green-50',   dot: 'bg-green-500' },
    points:  { icon: <FaCoins className="text-amber-500" />,     bg: 'bg-amber-50',   dot: 'bg-amber-500' },
    promo:   { icon: <MdCampaign className="text-primary" />,    bg: 'bg-red-50',     dot: 'bg-primary' },
    system:  { icon: <FaCheckCircle className="text-neutral-500" />, bg: 'bg-neutral-50', dot: 'bg-neutral-400' },
};

const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const { backendUrl, isLoggedin } = useContext(UserAppContext);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!isLoggedin) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/user/notifications`);
            if (data.success) {
                setNotifications(data.notifications);
                setUnread(data.unreadCount);
            }
        } catch (_) {}
        finally { setLoading(false); }
    };

    // Poll every 30s
    useEffect(() => {
        fetchNotifications();
        const t = setInterval(fetchNotifications, 30000);
        return () => clearInterval(t);
    }, [isLoggedin]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
        if (!open) fetchNotifications();
    };

    const handleClick = async (n) => {
        if (!n.isRead) {
            await axios.patch(`${backendUrl}/api/user/notifications/${n._id}/read`);
            setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
            setUnread(u => Math.max(0, u - 1));
        }
        if (n.link) { setOpen(false); navigate(n.link); }
    };

    const handleMarkAll = async () => {
        await axios.patch(`${backendUrl}/api/user/notifications/read-all`);
        setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
        setUnread(0);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await axios.delete(`${backendUrl}/api/user/notifications/${id}`);
        setNotifications(prev => prev.filter(x => x._id !== id));
        setUnread(prev => {
            const n = notifications.find(x => x._id === id);
            return n && !n.isRead ? Math.max(0, prev - 1) : prev;
        });
    };

    const handleClearAll = async () => {
        await axios.delete(`${backendUrl}/api/user/notifications`);
        setNotifications([]);
        setUnread(0);
    };

    if (!isLoggedin) return null;

    return (
        <div ref={panelRef} className="relative">
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                aria-label="Notifications"
            >
                <FaBell className="text-neutral-700 text-lg" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <FaBell className="text-primary" />
                            <h3 className="font-semibold text-neutral-800 text-sm">Notifications</h3>
                            {unread > 0 && (
                                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unread} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    className="text-xs text-neutral-500 hover:text-primary flex items-center gap-1 transition-colors"
                                    title="Mark all read"
                                >
                                    <MdDoneAll size={14} /> All read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                    title="Clear all"
                                >
                                    <FaTrash size={11} /> Clear
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors ml-1">
                                <MdClose size={18} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-50">
                        {loading && notifications.length === 0 ? (
                            <div className="py-12 flex justify-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-14 flex flex-col items-center gap-3 text-neutral-400">
                                <IoNotificationsOff size={36} className="opacity-40" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const meta = TYPE_META[n.type] || TYPE_META.system;
                                return (
                                    <div
                                        key={n._id}
                                        onClick={() => handleClick(n)}
                                        className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group
                                            ${n.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-blue-50/40 hover:bg-blue-50/70'}`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            {meta.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm leading-snug ${n.isRead ? 'text-neutral-700 font-normal' : 'text-neutral-900 font-semibold'}`}>
                                                    {n.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {!n.isRead && <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />}
                                                    <button
                                                        onClick={(e) => handleDelete(e, n._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all"
                                                    >
                                                        <MdClose size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-neutral-100 text-center">
                            <button
                                onClick={() => { setOpen(false); navigate('/bookings'); }}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                View all bookings →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
