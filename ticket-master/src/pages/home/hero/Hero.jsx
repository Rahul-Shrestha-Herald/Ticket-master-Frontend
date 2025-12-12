import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Search from './search/Search';
import RootLayout from '../../../layout/RootLayout';
import '../../../css/BusAnimator.css';
import busImage from '../../../assets/Bus Animator/bus.png';
import wheelImage from '../../../assets/Bus Animator/wheel.png';
import roadImage from '../../../assets/Bus Animator/road.jpg';
import skyImage from '../../../assets/Bus Animator/sky.jpg';
import cityImage from '../../../assets/Bus Animator/city.png';

const Hero = () => {
  const navigate = useNavigate();

  const handleSearchResults = (results) => {
    navigate('/bus-tickets', { state: { results } });
  };

  const variants = {
    hidden: { opacity: 0, y: -800 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className='w-full relative min-h-[100vh] md:h-screen overflow-x-hidden'
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <div className="hero" style={{ backgroundImage: `url(${skyImage})` }}>
        <div className="highway" style={{ backgroundImage: `url(${roadImage})` }}></div>
        <div className="city" style={{ backgroundImage: `url(${cityImage})` }}></div>
        <div className="bus">
          <img src={busImage} alt="Bus" />
          <div className="wheel">
            <img src={wheelImage} className="frontwheel" alt="Front Wheel" />
            <img src={wheelImage} className="backwheel" alt="Back Wheel" />
          </div>
        </div>
      </div>

      <RootLayout className="absolute top-0 left-0 w-full h-full pt-16 md:py-[9ch] bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 flex items-start md:items-center justify-start text-center flex-col gap-6 md:gap-9 px-4 md:px-0">
        <div className="space-y-2 md:space-y-3 mt-6 md:mt-0">
          <motion.p
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-base md:text-lg text-neutral-500 font-medium"
          >
             Ticket Master – Easy Online Bus Ticket Booking
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 1.85, ease: "easeOut" }}
            className="text-3xl md:text-5xl text-neutral-800 font-bold capitalize px-2"
          >
            Book Your Next Journey With Us
          </motion.h1>
        </div>

        <Search setSearchResults={handleSearchResults} />
      </RootLayout>
    </motion.div>
  );
};

export default Hero;
