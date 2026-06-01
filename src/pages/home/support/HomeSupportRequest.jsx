import React, { useState } from 'react'
import RootLayout from '../../../layout/RootLayout'
import SupportRequestForm from '../../../components/support/SupportRequestForm'
import { FaHeadset, FaCheckCircle, FaClock, FaLightbulb, FaShieldAlt, FaComment } from 'react-icons/fa'

const HomeSupportRequest = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const supportCategories = [
        {
            icon: <FaLightbulb className="text-yellow-500" />,
            title: "General Inquiries",
            description: "Questions about our services, features, or company"
        },
        {
            icon: <FaComment className="text-blue-500" />,
            title: "Booking Assistance",
            description: "Help with making or modifying your bookings"
        },
        {
            icon: <FaShieldAlt className="text-green-500" />,
            title: "Technical Support",
            description: "Issues with the website, app, or your account"
        },
        {
            icon: <FaClock className="text-purple-500" />,
            title: "Refunds & Cancellations",
            description: "Help with canceling tickets or processing refunds"
        }
    ];

       return (
        <RootLayout>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 py-10 md:py-16 lg:py-24">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 md:mb-4">
                            How Can We <span className="text-primary">Help You?</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
                            Our support team is here to assist you with any questions or concerns
                        </p>
                        <div className="flex justify-center">
                            <a href="#support-form" className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-primary text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base">
                                Submit a Request
                                <svg className="h-4 w-4 md:h-5 md:w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Categories Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="mb-8 md:mb-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">How We Can Assist You</h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                        Our dedicated support team is ready to help you with any issues or questions you might have
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {supportCategories.map((category, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 md:p-6 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="bg-gray-50 rounded-full h-12 w-12 md:h-14 md:w-14 flex items-center justify-center mb-3 md:mb-4">
                                {category.icon}
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{category.title}</h3>
                            <p className="text-sm md:text-base text-gray-600">{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Request Form Section */}
            <div id="support-form" className="bg-gray-50 py-10 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {isSubmitted ? (
                        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
                            <div className="p-6 md:p-8 lg:p-12">
                                <div className="text-center py-6 md:py-10">
                                    <div className="mx-auto flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 mb-4 md:mb-6">
                                        <FaCheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Thank You!</h3>
                                    <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto mb-6 md:mb-8">
                                        Your support request has been submitted successfully. Our team will get back to you as soon as possible, usually within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition duration-300 text-sm md:text-base"
                                    >
                                        <svg className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Submit Another Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Get In Touch With Us</h2>
                                <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                                    Fill out the form below and our team will address your concerns promptly
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-md overflow-hidden">
                                <div className="lg:w-1/3 bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8 text-white">
                                    <div className="h-full flex flex-col">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                                                <FaHeadset className="mr-3 h-5 w-5 md:h-6 md:w-6" />
                                                We're Here to Help
                                            </h3>
                                            <p className="mb-6 md:mb-8 opacity-90 text-sm md:text-base">
                                                Need assistance with your booking, have questions about our services, or facing any issues? Our support team is ready to help you.
                                            </p>
                                        </div>

                                        <div className="space-y-4 md:space-y-6 mt-auto">
                                            <div>
                                                <h4 className="font-semibold text-lg md:text-xl mb-2 md:mb-3">Why Choose Our Support?</h4>
                                                <ul className="space-y-2 md:space-y-3">
                                                    {[
                                                        "Fast response times",
                                                        "Expert assistance",
                                                        "Personalized solutions",
                                                        "24/7 support availability"
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-center text-sm md:text-base">
                                                            <svg className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                            </svg>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-3 md:pt-4 border-t border-white/20">
                                                <p className="font-medium text-sm md:text-base">Support Hours:</p>
                                                <p className="opacity-90 text-xs md:text-sm">Monday - Friday: 9AM - 8PM</p>
                                                <p className="opacity-90 text-xs md:text-sm">Weekends: 10AM - 6PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-2/3 p-2 sm:p-4 md:p-6">
                                    <SupportRequestForm
                                        onSuccess={() => setIsSubmitted(true)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Help Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Quick Self-Help Options</h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                        Find answers to common questions or explore our resources
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <a href="/faqs" className="block group">
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 md:p-6 transition-all duration-300 h-full flex flex-col items-center text-center">
                            <div className="bg-blue-50 rounded-full h-14 w-14 md:h-16 md:w-16 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-100 transition-colors">
                                <svg className="h-7 w-7 md:h-8 md:w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">FAQs</h3>
                            <p className="text-sm md:text-base text-gray-600 mb-4">Browse our frequently asked questions for quick answers to common concerns.</p>
                            <span className="text-primary font-medium mt-auto group-hover:underline text-sm md:text-base">View FAQs →</span>
                        </div>
                    </a>

                    <a href="/help-support" className="block group">
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 md:p-6 transition-all duration-300 h-full flex flex-col items-center text-center">
                            <div className="bg-blue-50 rounded-full h-14 w-14 md:h-16 md:w-16 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-100 transition-colors">
                                <svg className="h-7 w-7 md:h-8 md:w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Help Center</h3>
                            <p className="text-sm md:text-base text-gray-600 mb-4">Explore our comprehensive guides and documentation for detailed assistance.</p>
                            <span className="text-primary font-medium mt-auto group-hover:underline text-sm md:text-base">Visit Help Center →</span>
                        </div>
                    </a>

                    <a href="/contact" className="block group">
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 md:p-6 transition-all duration-300 h-full flex flex-col items-center text-center">
                            <div className="bg-blue-50 rounded-full h-14 w-14 md:h-16 md:w-16 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-100 transition-colors">
                                <svg className="h-7 w-7 md:h-8 md:w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Contact Us</h3>
                            <p className="text-sm md:text-base text-gray-600 mb-4">Reach out to our support team directly via phone, email, or live chat.</p>
                            <span className="text-primary font-medium mt-auto group-hover:underline text-sm md:text-base">Contact Support →</span>
                        </div>
                    </a>
                </div>
            </div>
        </RootLayout>
    )
}

export default HomeSupportRequest 