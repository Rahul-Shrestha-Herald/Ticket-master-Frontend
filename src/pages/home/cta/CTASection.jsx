import React from 'react';
import { useNavigate } from 'react-router-dom';
import RootLayout from '../../../layout/RootLayout';
import { FaArrowRight, FaHeadset } from 'react-icons/fa';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-16 md:py-24 bg-neutral-50">
            <RootLayout className="px-4 md:px-0">
                <div className="bg-primary rounded-3xl px-8 py-14 md:py-20 text-center text-white space-y-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full" />

                    <div className="relative z-10 space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Ready to Travel?</p>
                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Book Your Seat Today
                        </h2>
                        <p className="text-white/80 max-w-lg mx-auto text-sm md:text-base">
                            Thousands of travelers book with Ticket Master every day. Join them and experience the easiest way to travel across Nepal.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/bus-tickets')}
                            className="flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-neutral-100 transition-colors duration-300 shadow-lg"
                        >
                            Search Buses <FaArrowRight />
                        </button>
                        <button
                            onClick={() => navigate('/help-support')}
                            className="flex items-center gap-2 border border-white/50 text-white font-medium px-8 py-3 rounded-full hover:bg-white/10 transition-colors duration-300"
                        >
                            <FaHeadset /> Contact Support
                        </button>
                    </div>
                </div>
            </RootLayout>
        </section>
    );
};

export default CTASection;
