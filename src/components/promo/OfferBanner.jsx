import React, { useState, useEffect } from 'react';
import { FaTag, FaBusAlt, FaTicketAlt, FaCoins, FaTimes, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { MdOutlineTrackChanges, MdSpeed } from 'react-icons/md';
import { IoCopyOutline, IoCheckmark } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// Each card gets its own exclusive pool — they will NEVER show the same ad
const CARD_POOLS = [
    // Card 0 — deals & offers
    [
        {
            badge: 'Limited Offer',
            icon: <FaTag className="text-primary text-xs" />,
            iconBg: 'bg-primary/20',
            accent: 'from-primary to-red-400',
            headline: '20% OFF',
            sub: 'on your next bus ticket booking',
            code: 'TM2025',
            cta: null,
            note: 'Valid for new bookings only.'
        },
        {
            badge: 'First Booking',
            icon: <FaTicketAlt className="text-purple-400 text-xs" />,
            iconBg: 'bg-purple-400/20',
            accent: 'from-purple-400 to-purple-600',
            headline: 'Free E-Ticket',
            sub: 'PDF receipt sent to your email instantly',
            code: 'FIRSTRIDE',
            cta: null,
            note: 'Valid for first-time users only.'
        },
        {
            badge: 'Weekend Deal',
            icon: <FaTag className="text-rose-400 text-xs" />,
            iconBg: 'bg-rose-400/20',
            accent: 'from-rose-400 to-pink-500',
            headline: 'Flat Rs. 50 Off',
            sub: 'on weekend bookings this month',
            code: 'WEEKEND50',
            cta: null,
            note: 'Sat & Sun bookings only.'
        },
    ],
    // Card 1 — features & tracking
    [
        {
            badge: 'New Feature',
            icon: <MdOutlineTrackChanges className="text-blue-400 text-xs" />,
            iconBg: 'bg-blue-400/20',
            accent: 'from-blue-400 to-blue-600',
            headline: 'Live Tracking',
            sub: 'Track your bus in real-time on the map',
            code: null,
            cta: { label: 'Try Now →', path: '/live-tracking' },
            note: 'Enter your Booking ID to start.'
        },
        {
            badge: 'Fast Booking',
            icon: <MdSpeed className="text-cyan-400 text-xs" />,
            iconBg: 'bg-cyan-400/20',
            accent: 'from-cyan-400 to-sky-500',
            headline: 'Book in 60s',
            sub: 'Search, pick a seat & pay instantly',
            code: null,
            cta: { label: 'Book Now →', path: '/bus-tickets' },
            note: 'Hundreds of routes across Nepal.'
        },
        {
            badge: '24/7 Support',
            icon: <FaHeadset className="text-indigo-400 text-xs" />,
            iconBg: 'bg-indigo-400/20',
            accent: 'from-indigo-400 to-violet-500',
            headline: 'Always Here',
            sub: 'Our support team is available round the clock',
            code: null,
            cta: { label: 'Contact Us →', path: '/contact' },
            note: 'Chat, call or email anytime.'
        },
    ],
    // Card 2 — rewards & trust
    [
        {
            badge: 'Earn Rewards',
            icon: <FaCoins className="text-amber-400 text-xs" />,
            iconBg: 'bg-amber-400/20',
            accent: 'from-amber-400 to-yellow-500',
            headline: 'TM Points',
            sub: 'Earn 5% back on every booking',
            code: null,
            cta: { label: 'Learn More →', path: '/tm-points' },
            note: '100 pts = Rs. 10 discount.'
        },
        {
            badge: 'Safe Travel',
            icon: <FaShieldAlt className="text-emerald-400 text-xs" />,
            iconBg: 'bg-emerald-400/20',
            accent: 'from-emerald-400 to-green-600',
            headline: 'Verified Buses',
            sub: 'All operators are KYC verified & insured',
            code: null,
            cta: { label: 'Browse Tickets →', path: '/bus-tickets' },
            note: 'Your safety is our priority.'
        },
        {
            badge: 'Easy Refund',
            icon: <FaBusAlt className="text-teal-400 text-xs" />,
            iconBg: 'bg-teal-400/20',
            accent: 'from-teal-400 to-cyan-500',
            headline: 'Hassle-Free',
            sub: 'Instant e-ticket & easy cancellation',
            code: null,
            cta: { label: 'View Policy →', path: '/terms-conditions' },
            note: 'Terms & conditions apply.'
        },
    ],
];

const CARD_CONFIG = [
    { interval: 10000, transition: 'slide-left' },
    { interval: 10000, transition: 'slide-up' },
    { interval: 10000, transition: 'slide-right' },
];

const useCardCycle = (pool, interval, transition) => {
    const [index, setIndex] = useState(0);
    const [anim, setAnim] = useState('visible');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setAnim('exit');
            setTimeout(() => {
                setIndex(prev => (prev + 1) % pool.length);
                setAnim('enter');
                setTimeout(() => setAnim('visible'), 50);
            }, 320);
        }, interval);
        return () => clearInterval(t);
    }, [interval, pool.length]);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStyle = () => {
        if (anim === 'visible') return { opacity: 1, transform: 'translate(0,0)' };
        const exits = {
            'slide-left':  { opacity: 0, transform: 'translateX(-28px)' },
            'slide-right': { opacity: 0, transform: 'translateX(28px)' },
            'slide-up':    { opacity: 0, transform: 'translateY(-28px)' },
        };
        const enters = {
            'slide-left':  { opacity: 0, transform: 'translateX(28px)' },
            'slide-right': { opacity: 0, transform: 'translateX(-28px)' },
            'slide-up':    { opacity: 0, transform: 'translateY(28px)' },
        };
        return anim === 'exit' ? exits[transition] : enters[transition];
    };

    return { ad: pool[index], style: getStyle(), copied, handleCopy };
};

const PromoCard = ({ cardIndex }) => {
    const navigate = useNavigate();
    const { interval, transition } = CARD_CONFIG[cardIndex];
    const pool = CARD_POOLS[cardIndex];
    const { ad, style, copied, handleCopy } = useCardCycle(pool, interval, transition);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return <div />;

    return (
        <div
            style={{ ...style, transition: 'opacity 320ms ease, transform 320ms ease' }}
            className="relative rounded-2xl overflow-hidden border border-black/10 shadow-xl backdrop-blur-xl bg-white/20"
        >
            <div className={`h-1.5 w-full bg-gradient-to-r ${ad.accent}`} />

            <button
                onClick={() => setDismissed(true)}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-colors z-10"
            >
                <FaTimes className="text-[10px]" />
            </button>

            <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${ad.iconBg} flex items-center justify-center shrink-0`}>
                        {ad.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-700 uppercase tracking-widest">
                        {ad.badge}
                    </span>
                </div>

                <div>
                    <p className="text-2xl font-extrabold text-neutral-900 leading-tight">{ad.headline}</p>
                    <p className="text-xs text-neutral-600 mt-1 leading-snug">{ad.sub}</p>
                </div>

                {ad.code && (
                    <div className="bg-black/5 border border-black/10 rounded-xl px-4 py-2 flex items-center justify-between gap-2">
                        <div>
                            <p className="text-[10px] text-neutral-500 leading-none mb-0.5">Promo Code</p>
                            <p className="text-sm font-bold text-neutral-800 tracking-widest">{ad.code}</p>
                        </div>
                        <button
                            onClick={() => handleCopy(ad.code)}
                            className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center text-neutral-600 transition-colors shrink-0"
                        >
                            {copied ? <IoCheckmark className="text-xs text-green-600" /> : <IoCopyOutline className="text-xs" />}
                        </button>
                    </div>
                )}

                {ad.cta && (
                    <button
                        onClick={() => navigate(ad.cta.path)}
                        className="w-full py-2 rounded-xl bg-black/10 hover:bg-black/15 border border-black/10 text-xs font-semibold text-neutral-800 transition-colors"
                    >
                        {ad.cta.label}
                    </button>
                )}

                <p className="text-[10px] text-neutral-500 leading-relaxed">{ad.note}</p>
            </div>
        </div>
    );
};

const OfferBanner = () => (
    <div className="w-full grid grid-cols-3 gap-4">
        <PromoCard cardIndex={0} />
        <PromoCard cardIndex={1} />
        <PromoCard cardIndex={2} />
    </div>
);

export default OfferBanner;
