import React from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'

const TermsConditions = () => {
    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Banner */}
            <TopLayout
                bgImg="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
                title="Terms & Conditions"
            />

            {/* Main Content */}
            <RootLayout className="w-full">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-10">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-500 mb-8">Last Updated: April 3, 2025</p>

                        <p className="mb-6">
                            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the
                            ticket master website or mobile application (the "Service") operated by ticket master ("us", "we", or "our").
                        </p>

                        <p className="mb-6">
                            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                            These Terms apply to all visitors, users, and others who access or use the Service.
                        </p>

                        <p className="mb-8">
                            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms,
                            you may not access the Service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Accounts</h2>
                        <p className="mb-6">
                            When you create an account with us, you must provide accurate, complete, and up-to-date information.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p className="mb-6">
                            You are responsible for safeguarding the password used to access the Service and for any activities or actions under your password.
                            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Booking and Cancellation Policy</h2>
                        <p className="mb-4">
                            When you book a ticket through our Service, you agree to the following:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Ticket confirmations are subject to payment confirmation.</li>
                            <li>Tickets are non-transferable and valid only for the specified date, time, route, and passenger.</li>
                            <li>Valid identification may be required when boarding the bus.</li>
                            <li>Bus operators have the right to deny boarding if ticket or identification details do not match.</li>
                        </ul>

                        <p className="mb-4">
                            Cancellation policy:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Cancellations made 24 hours or more before departure: 75% refund of ticket price.</li>
                            <li>Cancellations made between 12-24 hours before departure: 50% refund of ticket price.</li>
                            <li>Cancellations made less than 12 hours before departure: No refund.</li>
                            <li>Refunds may take 5-7 business days to process.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Service Availability and Accuracy</h2>
                        <p className="mb-6">
                            We strive to provide accurate information regarding bus schedules, routes, and availability. However, we cannot guarantee
                            absolute accuracy of all information provided. Bus operators may occasionally change schedules, routes, or prices without notice.
                            In such cases, we will make reasonable efforts to inform affected users.
                        </p>
                        <p className="mb-6">
                            Our Service may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control.
                            We do not guarantee uninterrupted access to our Service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. User Conduct</h2>
                        <p className="mb-4">
                            While using our Service, you agree not to:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Use the Service in any way that violates applicable laws or regulations.</li>
                            <li>Attempt to gain unauthorized access to any portion of the Service or any systems or networks connected to the Service.</li>
                            <li>Engage in any activity that interferes with or disrupts the Service.</li>
                            <li>Use the Service to transmit any material that contains viruses, trojan horses, or other harmful code.</li>
                            <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity.</li>
                            <li>Collect or store personal data about other users without their consent.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Limitation of Liability</h2>
                        <p className="mb-6">
                            ticket master and its suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Your access to or use of or inability to access or use the Service;</li>
                            <li>Any conduct or content of any third party on the Service;</li>
                            <li>Any content obtained from the Service; and</li>
                            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Changes</h2>
                        <p className="mb-6">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material,
                            we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change
                            will be determined at our sole discretion.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Contact Us</h2>
                        <p className="mb-6">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="mb-6">
                            <p>Email: terms@ticket master.com</p>
                            <p>Phone: +977 1234567890</p>
                            <p>Address: Kathmandu, Nepal</p>
                        </div>
                    </div>
                </div>
            </RootLayout>
        </div>
    )
}

export default TermsConditions 