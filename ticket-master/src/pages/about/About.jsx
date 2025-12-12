import React from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'
import { FaBus, FaMobile, FaUserShield, FaHeadset } from 'react-icons/fa'

const About = () => {
  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Banner */}
      <TopLayout
        bgImg="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
        title="About ticket master"
      />

      {/* Main Content */}
      <RootLayout className="space-y-16 w-full">

        {/* Mission Section */}
        <section className="w-full">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-base md:text-lg text-gray-600">
              At ticket master, we're on a mission to revolutionize bus travel in Nepal by creating
              the most convenient, reliable, and user-friendly ticket booking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Who We Are</h3>
              <p className="text-gray-600">
                ticket master is Nepal's premier online bus ticket booking platform, founded in 2021 with a vision
                to transform the way people book and manage their bus travel. We connect passengers with bus operators
                across the country, making travel planning seamless and stress-free.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What We Believe</h3>
              <p className="text-gray-600">
                We believe that bus travel should be accessible, convenient, and enjoyable for everyone.
                By leveraging technology to simplify the booking process, we're creating more opportunities
                for people to explore Nepal's beautiful destinations while supporting local transportation businesses.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 bg-gray-50 rounded-2xl">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose ticket master</h2>
            <p className="text-base md:text-lg text-gray-600">
              Experience the benefits of Nepal's most trusted bus ticket booking platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FaBus className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Extensive Routes</h3>
              <p className="text-gray-600 text-sm">
                Book tickets for hundreds of routes across Nepal, from major cities to remote destinations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FaMobile className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Easy Booking</h3>
              <p className="text-gray-600 text-sm">
                Simple, fast booking process with instant confirmation and secure digital tickets.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FaUserShield className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Multiple secure payment options with Khalti integration for safe transactions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FaHeadset className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated customer support team available around the clock to assist with your booking needs.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  ticket master was born from a simple yet powerful idea: to eliminate the hassle of bus ticket booking in Nepal.
                  After experiencing the frustration of long queues, uncertain availability, and lack of information firsthand,
                  our founders were inspired to create a solution.
                </p>
                <p>
                  Starting with just a handful of routes and operators in 2021, we've grown rapidly to become Nepal's
                  most comprehensive bus ticket booking platform. Today, we partner with hundreds of bus operators
                  across the country, serving thousands of travelers daily.
                </p>
                <p>
                  Our journey continues as we expand our services, improve our technology, and find new ways to make
                  bus travel more convenient, reliable, and enjoyable for everyone in Nepal.
                </p>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <img
                src="https://www.vivaanadventure.com/wp-content/uploads/2020/01/Tourist-Bus-Hire-in-Kathmandu%E2%80%8B-1.jpg"
                alt="Bus journey in Nepal"
                className="w-full h-auto rounded-xl shadow-md"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-primary rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Hassle-Free Bus Travel?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the convenience of booking bus tickets online with ticket master.
          </p>
          <a href="/bus-tickets" className="inline-block bg-white text-primary font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition duration-300">
            Book Your Journey Now
          </a>
        </section>
      </RootLayout>
    </div>
  )
}

export default About
