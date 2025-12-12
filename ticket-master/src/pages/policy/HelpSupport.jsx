import React, { useState } from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import SupportRequestForm from '../../components/support/SupportRequestForm'
import { toast } from 'react-toastify'

const HelpSupport = () => {
    const [activeTab, setActiveTab] = useState('contact')

    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Banner */}
            <TopLayout
                bgImg="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop"
                title="Help & Support"
            />

            {/* Main Content */}
            <RootLayout className="space-y-10 w-full">

                {/* Page Introduction */}
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">How Can We Help You?</h2>
                    <p className="text-gray-600">
                        We're here to make your bus booking experience as smooth as possible.
                        Browse our help topics or contact our support team for assistance.
                    </p>
                </div>

                {/* Tabs */}
                <div className="w-full">
                    <div className="flex flex-wrap border-b border-gray-200 mb-8">
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`px-5 py-3 text-sm font-medium rounded-t-lg ${activeTab === 'contact'
                                ? 'bg-primary text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Contact Us
                        </button>
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`px-5 py-3 text-sm font-medium rounded-t-lg ${activeTab === 'form'
                                ? 'bg-primary text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Support Request
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                        {/* Contact Us Tab */}
                        {activeTab === 'contact' && (
                            <div className="space-y-10">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Our Support Team</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Contact Card 1 */}
                                    <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition duration-300">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaPhone className="text-primary text-xl rotate-90" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-2">Phone Support</h4>
                                        <p className="text-gray-600 mb-4">Available 24/7 for urgent issues</p>
                                        <a href="tel:+9771234567890" className="text-primary font-medium hover:underline">
                                            +977 1234567890
                                        </a>
                                    </div>

                                    {/* Contact Card 2 */}
                                    <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition duration-300">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaEnvelope className="text-primary text-xl" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-2">Email Support</h4>
                                        <p className="text-gray-600 mb-4">Response within 24 hours</p>
                                        <a href="mailto:support@ticket master.com" className="text-primary font-medium hover:underline">
                                            support@ticket master.com
                                        </a>
                                    </div>

                                    {/* Contact Card 3 - Modified to WhatsApp */}
                                    <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition duration-300">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaWhatsapp className="text-primary text-xl" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-2">WhatsApp Chat</h4>
                                        <p className="text-gray-600 mb-4">Available 9 AM - 8 PM NPT</p>
                                        <a
                                            href="https://wa.me/9771234567890"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary font-medium hover:underline"
                                        >
                                            Start Chat
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-12 border-t border-gray-200 pt-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Visit Our Office</h3>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-gray-800 mb-2">Main Office - Kathmandu</h4>
                                            <p className="text-gray-600">
                                                ticket master Headquarters<br />
                                                123 Travel Street<br />
                                                Kathmandu, Nepal<br /><br />
                                                <span className="font-medium">Hours:</span> Mon-Fri: 9 AM - 6 PM
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-gray-800 mb-2">Branch Office - Pokhara</h4>
                                            <p className="text-gray-600">
                                                ticket master Branch<br />
                                                45 Lakeside Road<br />
                                                Pokhara, Nepal<br /><br />
                                                <span className="font-medium">Hours:</span> Mon-Fri: 9 AM - 6 PM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Support Request Tab */}
                        {activeTab === 'form' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-6">Submit a Support Request</h3>
                                <p className="text-gray-600 mb-6">
                                    Complete the form below and our support team will get back to you as soon as possible.
                                </p>

                                <SupportRequestForm
                                    onSuccess={() => toast.success("Thank you for reaching out! We'll get back to you soon.")}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQ Banner */}
                <div className="w-full bg-gray-50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Need More Information?</h3>
                        <p className="text-gray-600">
                            Check our comprehensive FAQ section for detailed answers to common questions.
                        </p>
                    </div>
                    <a href="/faqs" className="mt-4 md:mt-0 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition duration-300">
                        View FAQs
                    </a>
                </div>
            </RootLayout>
        </div>
    )
}

export default HelpSupport 