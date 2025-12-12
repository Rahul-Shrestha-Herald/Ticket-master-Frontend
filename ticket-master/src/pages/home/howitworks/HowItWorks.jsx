import React from 'react';
import RootLayout from '../../../layout/RootLayout';
import { MdPayment } from 'react-icons/md';
import { HiOutlineTicket } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { FaBusAlt } from 'react-icons/fa';

const HowItWorks = () => {
    return (
        <RootLayout className="space-y-10 px-4 md:px-0">
            {/* Title */}
            <div className="w-full flex flex-col items-center justify-center text-center space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-neutral-800 font-bold">
                    How It <span className="text-primary">Works</span>
                </h2>
                <p className="text-neutral-600 max-w-2xl text-sm md:text-base">
                    Book your bus tickets in just a few simple steps and enjoy a hassle-free journey
                </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Step 1 */}
                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-neutral-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -translate-y-6 translate-x-6 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                        <FiSearch className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Search Routes</h3>
                    <p className="text-neutral-600 text-sm">Enter your destination, date of travel, and find available buses</p>
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-tr-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center text-sm font-bold">1</div>
                </div>

                {/* Step 2 */}
                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-neutral-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -translate-y-6 translate-x-6 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                        <HiOutlineTicket className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Choose Seats</h3>
                    <p className="text-neutral-600 text-sm">Select your preferred seats from the available options</p>
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-tr-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center text-sm font-bold">2</div>
                </div>

                {/* Step 3 */}
                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-neutral-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -translate-y-6 translate-x-6 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                        <MdPayment className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Secure Payment</h3>
                    <p className="text-neutral-600 text-sm">Complete your booking with our secure payment options</p>
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-tr-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center text-sm font-bold">3</div>
                </div>

                {/* Step 4 */}
                <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-neutral-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -translate-y-6 translate-x-6 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                        <FaBusAlt className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Travel Comfortably</h3>
                    <p className="text-neutral-600 text-sm">Receive e-tickets and enjoy your comfortable journey</p>
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-tr-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center text-sm font-bold">4</div>
                </div>
            </div>
        </RootLayout>
    );
};

export default HowItWorks; 