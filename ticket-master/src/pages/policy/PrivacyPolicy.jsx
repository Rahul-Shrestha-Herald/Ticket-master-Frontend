import React from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'

const PrivacyPolicy = () => {
    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Banner */}
            <TopLayout
                bgImg="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
                title="Privacy Policy"
            />

            {/* Main Content */}
            <RootLayout className="w-full">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-10">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-500 mb-8">Last Updated: April 3, 2025</p>

                        <p className="mb-6">
                            ticket master ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
                            and safeguard your information when you visit our website, use our mobile application, or use our services.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information</h3>
                        <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Register for an account</li>
                            <li>Book a ticket</li>
                            <li>Make a payment</li>
                            <li>Contact our customer support</li>
                            <li>Sign up for our newsletter</li>
                            <li>Participate in promotions or surveys</li>
                        </ul>

                        <p className="mb-4">This information may include:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Billing and payment information</li>
                            <li>Travel preferences and history</li>
                            <li>Any other information you choose to provide</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
                        <p className="mb-4">
                            When you access our website or mobile application, we may automatically collect certain information, including:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Device information (type, operating system, browser)</li>
                            <li>IP address</li>
                            <li>Usage data (pages visited, time spent)</li>
                            <li>Location data (with your permission)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">How We Use Your Information</h2>
                        <p className="mb-4">We may use the information we collect for various purposes, including to:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Process ticket bookings and payments</li>
                            <li>Create and manage your account</li>
                            <li>Provide customer support</li>
                            <li>Send administrative information, updates, and promotional content</li>
                            <li>Improve our services and user experience</li>
                            <li>Analyze usage patterns and preferences</li>
                            <li>Detect and prevent fraud</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Disclosure of Your Information</h2>
                        <p className="mb-4">We may share your information with third parties in certain situations:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li><strong>Bus Operators:</strong> To fulfill your booking, we share necessary information with the relevant bus operators.</li>
                            <li><strong>Service Providers:</strong> We may share information with third-party vendors who provide services on our behalf (payment processors, hosting providers, analytics services).</li>
                            <li><strong>Business Transfers:</strong> If we're involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights, privacy, safety, or property.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Your Rights and Choices</h2>
                        <p className="mb-4">You have certain rights regarding your personal information:</p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Access, update, or delete your personal information through your account settings</li>
                            <li>Opt-out of receiving promotional communications</li>
                            <li>Request information about our data practices</li>
                            <li>Object to certain processing of your information</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Data Security</h2>
                        <p className="mb-6">
                            We implement appropriate technical and organizational measures to protect your personal information.
                            However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot
                            guarantee absolute security.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Children's Privacy</h2>
                        <p className="mb-6">
                            Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                            information from children under 13.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Changes to This Privacy Policy</h2>
                        <p className="mb-6">
                            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated
                            "Last Updated" date. We encourage you to review this Privacy Policy periodically.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Contact Us</h2>
                        <p className="mb-6">
                            If you have questions or concerns about this Privacy Policy or our practices, please contact us at:
                        </p>
                        <div className="mb-6">
                            <p>Email: privacy@ticket master.com</p>
                            <p>Phone: +977 1234567890</p>
                            <p>Address: Kathmandu, Nepal</p>
                        </div>
                    </div>
                </div>
            </RootLayout>
        </div>
    )
}

export default PrivacyPolicy 