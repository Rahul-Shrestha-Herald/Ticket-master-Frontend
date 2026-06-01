import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import RootLayout from '../../../layout/RootLayout';
import TopLayout from '../../../layout/toppage/TopLayout';
import { FaCoins, FaArrowUp, FaArrowDown, FaTicketAlt } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';

const TMPoints = () => {
    const { backendUrl, userData } = useContext(UserAppContext);
    const navigate = useNavigate();
    const [tmPoints, setTmPoints] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/tm-points`);
                if (data.success) {
                    setTmPoints(data.tmPoints);
                    setHistory(data.history);
                }
            } catch (err) {
                toast.error('Failed to load TM Points');
            } finally {
                setLoading(false);
            }
        };
        fetchPoints();
    }, [backendUrl]);

    // 100 pts = Rs. 10
    const cashValue = ((tmPoints / 100) * 10).toFixed(2);

    return (
        <div className="w-full space-y-12 pb-16">
            <TopLayout
                bgImg="https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"
                title="TM Points"
            />

            <RootLayout className="space-y-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Balance card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-1 bg-gradient-to-br from-primary to-red-700 rounded-2xl p-6 text-white shadow-lg flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                    <FaCoins />
                                    <span>TM Points Balance</span>
                                </div>
                                <p className="text-5xl font-extrabold tracking-tight">{tmPoints.toLocaleString()}</p>
                                <p className="text-white/70 text-sm">≈ Rs. {cashValue} redeemable value</p>
                                <div className="mt-2 bg-white/20 rounded-xl px-4 py-2 text-xs text-white/90">
                                    100 TM Points = Rs. 10 discount
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-2 gap-5">
                                <StatCard
                                    icon={<FaArrowUp className="text-green-500" />}
                                    label="Total Earned"
                                    value={history.filter(h => h.type === 'earn').reduce((s, h) => s + h.points, 0)}
                                    bg="bg-green-50"
                                />
                                <StatCard
                                    icon={<FaArrowDown className="text-red-500" />}
                                    label="Total Redeemed"
                                    value={history.filter(h => h.type === 'redeem').reduce((s, h) => s + h.points, 0)}
                                    bg="bg-red-50"
                                />
                                <StatCard
                                    icon={<FaTicketAlt className="text-blue-500" />}
                                    label="Bookings with Points"
                                    value={history.filter(h => h.type === 'earn').length}
                                    suffix="trips"
                                    bg="bg-blue-50"
                                />
                                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 flex flex-col gap-2">
                                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">How it works</p>
                                    <ul className="text-sm text-neutral-600 space-y-1">
                                        <li>• Earn 5% of ticket price as points</li>
                                        <li>• 100 pts = Rs. 10 discount</li>
                                        <li>• Redeem at checkout</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* History */}
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                                <MdHistory className="text-primary text-xl" />
                                <h2 className="font-semibold text-neutral-800">Points History</h2>
                            </div>

                            {history.length === 0 ? (
                                <div className="py-16 text-center text-neutral-400">
                                    <FaCoins className="text-4xl mx-auto mb-3 opacity-30" />
                                    <p>No points activity yet. Book a ticket to start earning!</p>
                                    <button
                                        onClick={() => navigate('/bus-tickets')}
                                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                                    >
                                        Browse Tickets
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {history.map((item) => (
                                        <HistoryRow key={item._id} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </RootLayout>
        </div>
    );
};

const StatCard = ({ icon, label, value, suffix = 'pts', bg }) => (
    <div className={`${bg} border border-neutral-200 rounded-2xl p-5 flex flex-col gap-2`}>
        <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-3xl font-bold text-neutral-800">
            {value.toLocaleString()} <span className="text-base font-normal text-neutral-400">{suffix}</span>
        </p>
    </div>
);

const HistoryRow = ({ item }) => {
    const isEarn = item.type === 'earn';
    return (
        <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isEarn ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isEarn
                        ? <FaArrowUp className="text-green-600 text-sm" />
                        : <FaArrowDown className="text-red-500 text-sm" />
                    }
                </div>
                <div>
                    <p className="text-sm font-medium text-neutral-800">{item.description}</p>
                    <p className="text-xs text-neutral-400">{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className={`font-bold text-base ${isEarn ? 'text-green-600' : 'text-red-500'}`}>
                    {isEarn ? '+' : '-'}{item.points} pts
                </p>
                <p className="text-xs text-neutral-400">Balance: {item.balanceAfter} pts</p>
            </div>
        </div>
    );
};

export default TMPoints;
