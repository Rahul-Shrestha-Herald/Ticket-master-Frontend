import React from 'react'
import RootLayout from '../../layout/RootLayout'
import TopLayout from '../../layout/toppage/TopLayout'
import SupportRequestForm from '../../components/support/SupportRequestForm'
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaClock,
    FaFacebookSquare,
    FaTwitterSquare,
    FaInstagramSquare,
    FaWhatsapp
} from 'react-icons/fa'

const ContactInfoCard = ({ icon, title, details, isLink = false, linkHref = '#' }) => (
    <div className="flex items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                {icon}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">{title}</h3>
            {Array.isArray(details) ? (
                <ul className="space-y-1">
                    {details.map((detail, index) => (
                        <li key={index} className="text-gray-600">
                            {isLink ? (
                                <a href={linkHref + detail.replace(/\s+/g, '')} className="hover:text-primary transition-colors">
                                    {detail}
                                </a>
                            ) : (
                                detail
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">
                    {isLink ? (
                        <a href={linkHref + details.replace(/\s+/g, '')} className="hover:text-primary transition-colors">
                            {details}
                        </a>
                    ) : (
                        details
                    )}
                </p>
            )}
        </div>
    </div>
);

const Contact = () => {
    return (

        <div className='w-full space-y-12 pb-16'>
            <TopLayout
                bgImg="https://itineraryplans.com/wp-content/uploads/2023/12/Itinerary-Plans_Contact-Us.jpg"
                title="Contact Us"
            />
            <RootLayout>
                {/* Contact Information Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">We'd Love To Hear From You</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Have questions about our services or need assistance with your booking?
                                Our friendly team is here to help you.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ContactInfoCard
                                icon={<FaPhoneAlt className="h-5 w-5" />}
                                title="Phone"
                                details={["+977-01-4567890", "+977-9876543210"]}
                                isLink={true}
                                linkHref="tel:"
                            />

                            <ContactInfoCard
                                icon={<FaEnvelope className="h-5 w-5" />}
                                title="Email"
                                details={["support@ticket master.com", "info@ticketmaster.com"]}
                                isLink={true}
                                linkHref="mailto:"
                            />

                            <ContactInfoCard
                                icon={<FaClock className="h-5 w-5" />}
                                title="Business Hours"
                                details={[
                                    "Monday - Friday: 9AM - 8PM",
                                    "Saturday: 10AM - 6PM",
                                    "Sunday: Closed"
                                ]}
                            />
                        </div>

                        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 md:p-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <FaMapMarkerAlt className="text-primary mr-3" />
                                        Our Offices
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Kathmandu (Head Office)</h4>
                                            <p className="text-gray-600 mb-4">
                                                New Baneshwor, Kathmandu<br />
                                                Near Everest Bank<br />
                                                Nepal
                                            </p>
                                            <a href="https://maps.google.com/?q=New+Baneshwor+Kathmandu"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary font-medium hover:underline inline-flex items-center">
                                                View on map
                                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                </svg>
                                            </a>
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Pokhara Office</h4>
                                            <p className="text-gray-600 mb-4">
                                                Lakeside, Pokhara<br />
                                                Near Fewa Lake<br />
                                                Nepal
                                            </p>
                                            <a href="https://maps.google.com/?q=Lakeside+Pokhara"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary font-medium hover:underline inline-flex items-center">
                                                View on map
                                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                </svg>
                                            </a>
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Chitwan Office</h4>
                                            <p className="text-gray-600 mb-4">
                                                Narayanghat, Chitwan<br />
                                                Main Chowk<br />
                                                Nepal
                                            </p>
                                            <a href="https://maps.google.com/?q=Narayanghat+Chitwan"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary font-medium hover:underline inline-flex items-center">
                                                View on map
                                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-96 bg-gray-200">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4523970483996!2d85.33619931506106!3d27.69383738279636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a06c2eaf9%3A0xc5670a9173e161de!2sNew%20Baneshwor%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1626345400956!5m2!1sen!2snp"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="ticket master Office Location"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
                                <p className="text-lg text-gray-600">
                                    Fill out the form below and our team will get back to you as soon as possible
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                                <div className="p-1 md:p-6">
                                    <SupportRequestForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Connect With Us Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect With Us</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Follow us on social media for the latest updates, promotions, and travel tips
                            </p>
                        </div>

                        <div className="flex justify-center space-x-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 text-blue-600 hover:bg-blue-600 hover:text-white">
                                <FaFacebookSquare className="w-8 h-8" />
                            </a>

                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 text-blue-400 hover:bg-blue-400 hover:text-white">
                                <FaTwitterSquare className="w-8 h-8" />
                            </a>

                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white">
                                <FaInstagramSquare className="w-8 h-8" />
                            </a>

                            <a href="https://wa.me/9779876543210" target="_blank" rel="noopener noreferrer"
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 text-green-500 hover:bg-green-500 hover:text-white">
                                <FaWhatsapp className="w-8 h-8" />
                            </a>
                        </div>
                    </div>
                </section>
            </RootLayout>
        </div>
    )
}

export default Contact 