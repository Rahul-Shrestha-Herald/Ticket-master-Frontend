import React from 'react';
import RootLayout from '../../../layout/RootLayout';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { PiHeadsetFill } from 'react-icons/pi';
import { MdOutlineTrackChanges, MdAirlineSeatReclineExtra } from 'react-icons/md';
import { GiPathDistance } from 'react-icons/gi';
import { HiOutlineTicket } from 'react-icons/hi';

const services = [
    {
        icon: <RiSecurePaymentLine className="w-7 h-7 text-primary" />,
        title: 'Secure Payment',
        desc: 'Pay safely via Khalti with end-to-end encrypted transactions every time.'
    },
    {
        icon: <MdOutlineTrackChanges className="w-7 h-7 text-primary" />,
        title: 'Live Bus Tracking',
        desc: 'Track your bus in real-time on a map and know exactly when it arrives.'
    },
    {
        icon: <MdAirlineSeatReclineExtra className="w-7 h-7 text-primary" />,
        title: 'Seat Selection',
        desc: 'Pick your preferred seat from an interactive layout before you book.'
    },
    {
        icon: <HiOutlineTicket className="w-7 h-7 text-primary" />,
        title: 'Instant E-Ticket',
        desc: 'Get a PDF receipt and e-ticket delivered to your email right after payment.'
    },
    {
        icon: <GiPathDistance className="w-7 h-7 text-primary" />,
        title: 'Wide Route Network',
        desc: 'Connecting major cities and towns across Nepal with multiple daily departures.'
    },
    {
        icon: <PiHeadsetFill className="w-7 h-7 text-primary" />,
        title: '24/7 Support',
        desc: 'Our support team is always available to help you with bookings and queries.'
    }
];

const Services = () => {
    return (
        <section className="py-16 md:py-24 bg-neutral-50">
            <RootLayout className="px-4 md:px-0 space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest">What We Offer</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">
                        Everything You Need for a <span className="text-primary">Smooth Journey</span>
                    </h2>
                    <p className="text-neutral-500 max-w-xl mx-auto text-sm md:text-base">
                        From booking to boarding, we've got every step covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex gap-4 items-start"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-neutral-800 mb-1">{s.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </RootLayout>
        </section>
    );
};

export default Services;
