import React from 'react';
import RootLayout from '../../../layout/RootLayout';
import { FiSearch } from 'react-icons/fi';
import { HiOutlineTicket } from 'react-icons/hi';
import { MdPayment } from 'react-icons/md';
import { FaBusAlt } from 'react-icons/fa';

const steps = [
    {
        icon: <FiSearch className="w-7 h-7 text-primary" />,
        title: 'Search Routes',
        desc: 'Enter your origin, destination and travel date to find available buses.'
    },
    {
        icon: <HiOutlineTicket className="w-7 h-7 text-primary" />,
        title: 'Choose Your Seat',
        desc: 'Pick your preferred seat from the interactive bus layout.'
    },
    {
        icon: <MdPayment className="w-7 h-7 text-primary" />,
        title: 'Pay Securely',
        desc: 'Complete your booking with Khalti in just a few taps.'
    },
    {
        icon: <FaBusAlt className="w-7 h-7 text-primary" />,
        title: 'Board & Travel',
        desc: 'Show your e-ticket and enjoy a comfortable journey.'
    }
];

const HowItWorks = () => {
    return (
        <section className="py-16 md:py-24 bg-white">
            <RootLayout className="px-4 md:px-0 space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest">Simple Process</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">
                        Book a Ticket in <span className="text-primary">4 Easy Steps</span>
                    </h2>
                    <p className="text-neutral-500 max-w-xl mx-auto text-sm md:text-base">
                        No queues, no hassle — your seat is just a few clicks away.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Connecting line — desktop only */}
                    <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-primary/20 z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center gap-4">
                            {/* Step number + icon */}
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow">
                                    {i + 1}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-neutral-800 mb-1">{step.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </RootLayout>
        </section>
    );
};

export default HowItWorks;
