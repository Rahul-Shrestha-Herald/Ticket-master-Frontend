import React from 'react';
import RootLayout from '../../../layout/RootLayout';
import { FaCheckCircle } from 'react-icons/fa';

const points = [
    'Real-time seat availability updated instantly',
    'Khalti-powered secure and fast payments',
    'Live GPS bus tracking on OpenStreetMap',
    'PDF e-ticket sent directly to your email',
    'Flexible pickup and drop point selection',
    'Dedicated support team available 24/7',
];

const WhyChooseUs = () => {
    return (
        <section className="py-16 md:py-24 bg-white">
            <RootLayout className="px-4 md:px-0">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Left: text */}
                    <div className="flex-1 space-y-6">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Why Us</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 leading-tight">
                                Nepal's Smartest Way to <span className="text-primary">Book Bus Tickets</span>
                            </h2>
                            <p className="text-neutral-500 text-sm md:text-base leading-relaxed">
                                Ticket Master is built for travelers who value their time. No phone calls, no counters — just open the app, pick your seat, and go.
                            </p>
                        </div>

                        <ul className="space-y-3">
                            {points.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm md:text-base text-neutral-700">
                                    <FaCheckCircle className="text-primary mt-0.5 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: stat cards */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-sm lg:max-w-none">
                        {[
                            { value: '50+', label: 'Routes Available' },
                            { value: '200+', label: 'Daily Departures' },
                            { value: '10K+', label: 'Happy Travelers' },
                            { value: '99%', label: 'On-Time Rate' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center hover:bg-primary/10 transition-colors duration-300"
                            >
                                <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
                                <p className="text-sm text-neutral-600 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </RootLayout>
        </section>
    );
};

export default WhyChooseUs;
