import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaBusAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';
import { IoCopyOutline, IoCheckmark } from 'react-icons/io5';
import { MdOutlineTrackChanges } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const ADS = [
    {
        badge: 'Limited Offer',
        icon: <FaTag className="text-primary text-[10px]" />,
        iconBg: 'bg-primary/20',
        accent: 'from-primary via-red-400 to-primary',
        headline: '20% OFF',
        sub: 'on your next bus ticket booking',
        code: 'TM2025',
        cta: null,
        note: 'Apply at checkout. Valid for new bookings only.'
    },
    {
        badge: 'New Feature',
        icon: <MdOutlineTrackChanges className="text-blue-500 text-xs" />,
        iconBg: 'bg-blue-100',
        accent: 'from-blue-400 via-blue-500 to-blue-400',
        headline: 'Live Tracking',
        sub: 'Track your bus in real-time on the map',
        code: null,
        cta: { label: 'Try Now →', path: '/live-tracking' },
        note: 'Enter your Booking ID to get started.'
    },
    {
        badge: 'Easy Booking',
        icon: <FaBusAlt className="text-green-600 text-[10px]" />,
        iconBg: 'bg-green-100',
        accent: 'from-green-400 via-emerald-500 to-green-400',
        headline: 'Book in 60s',
        sub: 'Search, pick a seat & pay instantly',
        code: null,
        cta: { label: 'Book Now →', path: '/bus-tickets' },
        note: 'Hundreds of routes across Nepal.'
    },
    {
        badge: 'First Booking',
        icon: <FaTicketAlt className="text-purple-500 text-[10px]" />,
        iconBg: 'bg-purple-100',
        accent: 'from-purple-400 via-purple-500 to-purple-400',
        headline: 'Free E-Ticket',
        sub: 'PDF receipt sent to your email instantly',
        code: 'FIRSTRIDE',
        cta: null,
        note: 'Valid for first-time users only.'
    }
];

const INTERVAL = 5000; // ms per ad

const PromoPopup = () => {
    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState(0);
    const [slideDir, setSlideDir] = useState(''); // 'in' | 'out-left' | 'out-right'
    const [copied, setCopied] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const navigate = useNavigate();

    // Initial appearance delay
    useEffect(() => {
        const t = setTimeout(() => { setVisible(true); setSlideDir('in'); }, 1500);
        return () => clearTimeout(t);
    }, []);

    // Auto-rotate ads
    useEffect(() => {
        if (dismissed) return;
        const t = setInterval(() => {
            goTo((current + 1) % ADS.length, 'forward');
        }, INTERVAL);
        return () => clearInterval(t);
    }, [dismissed, current]);

    const goTo = (next, direction = 'forward') => {
        setSlideDir(direction === 'forward' ? 'out-left' : 'out-right');
        setTimeout(() => {
            setCurrent(next);
            setCopied(false);
            setVisible(true);
            setDismissed(false);
            setSlideDir(direction === 'forward' ? 'in-right' : 'in-left');
        }, 280);
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDotClick = (i) => {
        if (i === current) return;
        goTo(i, i > current ? 'forward' : 'backward');
    };

    const slideClass = {
        'in':        'opacity-100 translate-x-0',
        'in-right':  'opacity-100 translate-x-0',
        'in-left':   'opacity-100 translate-x-0',
        'out-left':  'opacity-0 -translate-x-8',
        'out-right': 'opacity-0 translate-x-8',
        '':          'opacity-0 translate-x-8',
    }[slideDir] ?? 'opacity-0 translate-x-8';

    const ad = ADS[current];

    if (!visible) return null;

    return (
        <div className="fixed bottom-8 left-6 z-50 w-[480px] overflow-hidden">
        <div className={`transition-all duration-300 ${slideClass}`}>
            <div className="relative rounded-2xl overflow-hidden border border-white/30 shadow-xl backdrop-blur-md bg-white/25">
                {/* Accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${ad.accent} transition-all duration-500`} />

                {/* Close */}
                <button
                    onClick={() => setDismissed(true) || setVisible(false)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-neutral-700 transition-colors"
                >
                    <FaTimes className="text-xs" />
                </button>

                <div className="px-5 pt-5 pb-4 space-y-3">
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${ad.iconBg} flex items-center justify-center`}>
                            {ad.icon}
                        </div>
                        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">{ad.badge}</span>
                    </div>

                    {/* Headline */}
                    <div>
                        <p className="text-3xl font-extrabold text-neutral-800 leading-tight">{ad.headline}</p>
                        <p className="text-sm text-neutral-600 mt-1">{ad.sub}</p>
                    </div>

                    {/* Promo code */}
                    {ad.code && (
                        <div className="bg-white/40 border border-white/50 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-[11px] text-neutral-500 leading-none mb-1">Promo Code</p>
                                <p className="text-lg font-bold text-neutral-800 tracking-widest">{ad.code}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(ad.code)}
                                className="w-9 h-9 rounded-lg bg-white/40 hover:bg-white/60 flex items-center justify-center text-neutral-600 transition-colors shrink-0"
                                title="Copy code"
                            >
                                {copied
                                    ? <IoCheckmark className="text-base text-green-600" />
                                    : <IoCopyOutline className="text-base" />
                                }
                            </button>
                        </div>
                    )}

                    {/* CTA button */}
                    {ad.cta && (
                        <button
                            onClick={() => navigate(ad.cta.path)}
                            className="w-full py-2.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 text-sm font-semibold text-neutral-700 transition-colors"
                        >
                            {ad.cta.label}
                        </button>
                    )}

                    {/* Fine print */}
                    <p className="text-xs text-neutral-500 leading-relaxed">{ad.note}</p>

                    {/* Dot indicators */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                        {ADS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleDotClick(i)}
                                className={`rounded-full transition-all duration-300 ${
                                    i === current
                                        ? 'w-5 h-2 bg-primary'
                                        : 'w-2 h-2 bg-neutral-400/50 hover:bg-neutral-400'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default PromoPopup;
