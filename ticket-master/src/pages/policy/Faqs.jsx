import React, { useState } from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa'

const Faqs = () => {
    const [activeCategory, setActiveCategory] = useState('general')
    const [expandedFaqs, setExpandedFaqs] = useState({})
    const [searchQuery, setSearchQuery] = useState('')

    // FAQ categories
    const categories = [
        { id: 'general', name: 'General' },
        { id: 'booking', name: 'Booking Process' },
        { id: 'payment', name: 'Payment & Pricing' },
        { id: 'cancellation', name: 'Cancellation & Refunds' },
        { id: 'account', name: 'Account & Profile' },
        { id: 'technical', name: 'Technical Issues' }
    ]

    // FAQ data
    const faqData = {
        general: [
            {
                question: 'What is ticket master?',
                answer: 'ticket master is Nepal\'s leading online bus ticket booking platform. We connect passengers with bus operators across the country, making it easy to search, compare, and book bus tickets online.'
            },
            {
                question: 'How do I contact customer support?',
                answer: 'You can contact our customer support team via phone at +977 1234567890, email at support@ticket master.com, or through the live chat feature on our website. Our support team is available 24/7 for urgent matters.'
            },
            {
                question: 'Is ticket master available on mobile devices?',
                answer: 'Yes, ticket master is optimized for mobile browsers, and we also have dedicated apps available for both Android and iOS devices. You can download our app from the Google Play Store or Apple App Store.'
            },
            {
                question: 'Which bus operators are available on ticket master?',
                answer: 'We partner with hundreds of bus operators across Nepal, covering all major routes and destinations. Our platform includes operators ranging from standard to deluxe and luxury services.'
            }
        ],
        booking: [
            {
                question: 'How do I book a bus ticket on ticket master?',
                answer: 'Booking a ticket is simple. Enter your travel details (from, to, date), select a bus from the available options, choose your seats, fill in passenger details, make the payment, and receive your e-ticket via email and SMS.'
            },
            {
                question: 'Can I book tickets for someone else?',
                answer: 'Yes, you can book tickets for friends, family members, or anyone else. Just make sure to enter their correct details during the booking process, as these details will be verified during boarding.'
            },
            {
                question: 'How far in advance can I book tickets?',
                answer: 'Most bus operators allow bookings up to 90 days in advance, though this may vary depending on the specific operator and route. We recommend booking early for popular routes and travel dates, especially during holidays and festivals.'
            },
            {
                question: 'Is seat selection available?',
                answer: 'Yes, ticket master provides interactive seating layouts that allow you to select specific seats based on availability. You can see which seats are available, which are booked, and choose according to your preference.'
            }
        ],
        payment: [
            {
                question: 'What payment methods are accepted?',
                answer: 'We accept payments via Khalti, credit/debit cards, and other popular digital wallets in Nepal. All payments are processed through secure payment gateways to ensure your financial information is protected.'
            },
            {
                question: 'Is there any additional fee for booking tickets online?',
                answer: 'ticket master charges a small convenience fee for each booking, which is clearly displayed before you complete your payment. The convenience fee varies based on the ticket price and payment method used.'
            },
            {
                question: 'I was charged but didn\'t receive a ticket confirmation. What should I do?',
                answer: 'If you\'ve been charged but haven\'t received a confirmation, please don\'t worry. First, check your email (including spam folder) and SMS. If you still don\'t see a confirmation, contact our customer support with your payment details, and we\'ll assist you promptly.'
            },
            {
                question: 'Are there any discounts available?',
                answer: 'Yes, we regularly offer promotional discounts and seasonal offers. Additionally, we have special discounts for students, senior citizens, and frequent travelers. Check our website or app for current promotions before booking.'
            }
        ],
        cancellation: [
            {
                question: 'What is the cancellation policy?',
                answer: 'Our cancellation policy depends on the bus operator and how close to departure you cancel. Generally, cancellations made 24+ hours before departure receive a 75% refund, 12-24 hours receive 50%, and less than 12 hours receive no refund. Specific policies are displayed during booking.'
            },
            {
                question: 'How do I cancel my ticket?',
                answer: 'To cancel a ticket, log into your account, go to "My Bookings," select the booking you wish to cancel, and click on "Cancel Ticket." Follow the prompts to complete the cancellation process.'
            },
            {
                question: 'How long does it take to process refunds?',
                answer: 'Refunds are typically processed within 5-7 business days, depending on your payment method and bank. The refund amount will be credited back to the original payment method used for booking.'
            },
            {
                question: 'Can I get a full refund if the operator cancels the trip?',
                answer: 'Yes, if the bus operator cancels the trip, you are entitled to a full refund, including any convenience fees. We will notify you about the cancellation and process the refund automatically.'
            }
        ],
        account: [
            {
                question: 'Do I need to create an account to book tickets?',
                answer: 'While it\'s possible to book as a guest, we recommend creating an account for a better experience. With an account, you can manage bookings, access e-tickets, get faster checkout, and view your booking history.'
            },
            {
                question: 'How do I reset my password?',
                answer: 'To reset your password, click on "Login," then "Forgot Password." Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
            },
            {
                question: 'Can I update my profile information?',
                answer: 'Yes, you can update your profile information by logging into your account and navigating to the "Profile" or "Account Settings" section. Here you can update your name, contact information, and other details.'
            },
            {
                question: 'How can I view my booking history?',
                answer: 'To view your booking history, log into your account and go to "My Bookings" or "Booking History." This section displays all your past and upcoming bookings, with options to view details, download e-tickets, or cancel eligible bookings.'
            }
        ],
        technical: [
            {
                question: 'The website/app is not working. What should I do?',
                answer: 'If you\'re experiencing technical issues, try refreshing the page, clearing your browser cache, or restarting the app. If problems persist, try using a different browser or device. Contact our support team if issues continue.'
            },
            {
                question: 'Why am I unable to select certain seats?',
                answer: 'Seats may be unavailable for selection if they\'ve already been booked by other passengers, are reserved for pickup along the route, or are temporarily held in another user\'s session. Try selecting different seats or refreshing the page.'
            },
            {
                question: 'The payment page is not loading. What can I do?',
                answer: 'If the payment page isn\'t loading, check your internet connection, try a different browser, or clear your browser cache. If the issue persists, please contact our support team with details about the error you\'re experiencing.'
            },
            {
                question: 'My e-ticket has a QR code. How is this used?',
                answer: 'The QR code on your e-ticket contains your booking information. Bus operators may scan this code to verify your booking at boarding time. You can display the e-ticket on your mobile device or print it for scanning.'
            }
        ]
    }

    // Toggle FAQ expansion
    const toggleFaq = (categoryId, index) => {
        setExpandedFaqs(prev => ({
            ...prev,
            [`${categoryId}-${index}`]: !prev[`${categoryId}-${index}`]
        }))
    }

    // Filter FAQs based on search query
    const filteredFaqs = Object.entries(faqData).reduce((acc, [category, faqs]) => {
        if (searchQuery) {
            const filtered = faqs.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (filtered.length > 0) {
                acc[category] = filtered
            }
        } else {
            acc[category] = faqs
        }
        return acc
    }, {})

    return (
        <div className='w-full space-y-12 pb-16 pt-5 md:pt-0'>
            {/* Top Banner */}
            <TopLayout
                bgImg="https://images.unsplash.com/photo-1579389082947-e54d8e911928?q=80&w=2070&auto=format&fit=crop"
                title="Frequently Asked Questions"
                className="mt-16 md:mt-0"
            />

            {/* Main Content */}
            <RootLayout className="space-y-10 w-full">

                {/* Search */}
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Search for your question..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="w-full">
                    {searchQuery ? (
                        // Search Results
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Search Results: {Object.values(filteredFaqs).flat().length} matches found
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {Object.entries(filteredFaqs).map(([category, faqs]) => (
                                    faqs.map((faq, index) => (
                                        <div key={`search-${category}-${index}`} className="p-6">
                                            <button
                                                className="flex justify-between items-start w-full text-left"
                                                onClick={() => toggleFaq(category, index)}
                                            >
                                                <h3 className="text-lg font-medium text-gray-900 pr-10">{faq.question}</h3>
                                                <span className="ml-6 flex-shrink-0">
                                                    {expandedFaqs[`${category}-${index}`] ? (
                                                        <FaChevronUp className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <FaChevronDown className="h-5 w-5 text-gray-500" />
                                                    )}
                                                </span>
                                            </button>
                                            {expandedFaqs[`${category}-${index}`] && (
                                                <div className="mt-4 text-base text-gray-600">
                                                    <p>{faq.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ))}

                                {Object.values(filteredFaqs).flat().length === 0 && (
                                    <div className="p-6 text-center">
                                        <p className="text-gray-500">No results found. Try a different search term.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Category View
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Category Tabs */}
                            <div className="md:w-1/4">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                                        <h3 className="font-medium text-gray-800">Categories</h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                className={`block w-full text-left px-4 py-3 ${activeCategory === category.id
                                                    ? 'bg-primary/5 text-primary font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setActiveCategory(category.id)}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* FAQ List */}
                            <div className="md:w-3/4">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {categories.find(c => c.id === activeCategory)?.name || 'General'} Questions
                                        </h2>
                                    </div>

                                    <div className="divide-y divide-gray-200">
                                        {faqData[activeCategory].map((faq, index) => (
                                            <div key={`faq-${index}`} className="p-6">
                                                <button
                                                    className="flex justify-between items-start w-full text-left"
                                                    onClick={() => toggleFaq(activeCategory, index)}
                                                >
                                                    <h3 className="text-lg font-medium text-gray-900 pr-10">{faq.question}</h3>
                                                    <span className="ml-6 flex-shrink-0">
                                                        {expandedFaqs[`${activeCategory}-${index}`] ? (
                                                            <FaChevronUp className="h-5 w-5 text-primary" />
                                                        ) : (
                                                            <FaChevronDown className="h-5 w-5 text-gray-500" />
                                                        )}
                                                    </span>
                                                </button>
                                                {expandedFaqs[`${activeCategory}-${index}`] && (
                                                    <div className="mt-4 text-base text-gray-600">
                                                        <p>{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Still Have Questions Banner */}
                <div className="w-full bg-primary/5 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Still Have Questions?</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        If you couldn't find the answer to your question, our support team is here to help.
                        Reach out to us through any of the following channels.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="/help-support" className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition duration-300">
                            Contact Support
                        </a>
                        <a href="mailto:support@ticket master.com" className="px-6 py-3 bg-white text-primary border border-primary font-medium rounded-lg hover:bg-gray-50 transition duration-300">
                            Email Us
                        </a>
                    </div>
                </div>
            </RootLayout>
        </div>
    )
}

export default Faqs 