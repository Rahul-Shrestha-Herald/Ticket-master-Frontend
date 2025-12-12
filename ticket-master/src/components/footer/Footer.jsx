import React from 'react'
import RootLayout from '../../layout/RootLayout'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaYoutube, FaPhone, FaTiktok, FaTwitter } from 'react-icons/fa6'
import { TiLocation } from "react-icons/ti";
import { MdEmail } from "react-icons/md";
import KhaltiImg from "../../assets/Khalti.png"

const Footer = () => {
//    return (
//         <div className='w-full h-auto bg-neutral-950 py-12'>

//             <RootLayout className="space-y-10">

//                 {/* Footer other Content */}
//                 <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
//                     <div className="col-span-1 md:col-span-2 space-y-8 md:pr-10 pr-0">
//                         <div className="space-y-3">
//                             {/* Logo */}
//                             <Link to="/" className='text-4xl md:text-6xl text-primary font-bold'>
//                                 Ticket Master
//                             </Link>

//                             {/* description */}
//                             <p className="text-sm text-neutral-500 font-normal">
//                                  Ticket Master is Nepal's leading online bus ticket booking platform, making travel easier, faster, and more convenient. Book your tickets effortlessly, choose from various routes, and enjoy a hassle-free journey with secure payments and 24/7 support.
//                             </p>
//                         </div>

//                         {/* Social Links */}
//                         <div className="w-full flex items-center gap-x-5">
//                             <a
//                                 href="https://instagram.com"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500"
//                             >
//                                 <FaInstagram className='w-5 h-5 text-neutral-500 hover:text-white' />
//                             </a>

//                             <a
//                                 href="https://facebook.com"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500"
//                             >
//                                 <FaFacebook className='w-5 h-5 text-neutral-500 hover:text-white' />
//                             </a>

//                             <a
//                                 href="https://youtube.com"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500"
//                             >
//                                 <FaYoutube className='w-5 h-5 text-neutral-500 hover:text-white' />
//                             </a>

//                             <a
//                                 href="https://twitter.com"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500"
//                             >
//                                 <FaTwitter className='w-5 h-5 text-neutral-500 hover:text-white' />
//                             </a>
//                         </div>

//                     </div>

//                     <div className="col-span-1 space-y-5">
//                         <h1 className="text-lg text-neutral-100 font-semibold">
//                             Quick Links
//                         </h1>

//                         <div className="space-y-2">
//                             <Link to="/about" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 About Us
//                             </Link>

//                             <Link to="/bus-tickets" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Buy Ticket
//                             </Link>

//                             <Link to="/operator" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Be a Operator
//                             </Link>

//                             <Link to="/login" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Log in
//                             </Link>
//                         </div>
//                     </div>

//                     <div className="col-span-1 space-y-5">
//                         <h1 className="text-lg text-neutral-100 font-semibold">
//                             Contact Us
//                         </h1>

//                         <div className="space-y-3 mt-5">
//                             <p className="flex items-center gap-2 text-base text-neutral-500">
//                                 <MdEmail className="text-lg" /> info@ticketmaster.com
//                             </p>

//                             <p className="flex items-center gap-2 text-base text-neutral-500">
//                                 <FaPhone className="text-lg" /> +977 1234567890
//                             </p>

//                             <p className="flex items-center gap-2 text-base text-neutral-500">
//                                 <TiLocation className="text-lg" /> Kathmandu, Nepal
//                             </p>
//                         </div>
//                     </div>

//                     <div className="col-span-1 space-y-5">
//                         <h1 className="text-lg text-neutral-100 font-semibold">
//                             Support Links
//                         </h1>

//                         <div className="space-y-2">
//                             <Link to="/privacy-policy" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Privacy Policy
//                             </Link>

//                             <Link to="/terms-conditions" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Terms & Conditions
//                             </Link>

//                             <Link to="/help-support" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Help & Support
//                             </Link>

//                             <Link to="/contact" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 Contact Us
//                             </Link>

//                             <Link to="/faqs" className='block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300'>
//                                 FAQs
//                             </Link>
//                         </div>
//                     </div>

//                 </div>

//                 {/* Seperator */}
//                 <div className="w-full h-px bg-neutral-800/50" />

//                 {/* Copyright */}
//                 <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
//                     <p className="text-sm text-neutral-600 font-normal">
//                         Copyright &copy; 2025. All rights reserved.
//                     </p>

//                     <div className="flex items-center gap-x-5">
//                         <h1 className="text-sm text-neutral-500 font-normal">
//                             Payment Partner
//                         </h1>
//                         <img src={KhaltiImg} alt="" className="w-fit h-9 object-contain object-center" />
//                     </div>
//                 </div>

//             </RootLayout>

//         </div>
//     )
}

export default Footer
