import React from 'react'
import Hero from './hero/Hero'
import Services from './services/Services'
import HowItWorks from './howitworks/HowItWorks'
import TopSearch from './topsearch/TopSearch'
import HomeSupportRequest from './support/HomeSupportRequest'

const Home = () => {
     return (
        <div className='space-y-8 sm:space-y-12 md:space-y-16 w-full min-h-screen pb-10 md:pb-16'>
            {/* Hero */}
            <Hero />

            {/* How It Works */}
            <HowItWorks />

            {/* Services */}
            <Services />

            {/* Top Search */}
            {/* <TopSearch /> */}

            {/* Support Request */}
            <HomeSupportRequest />
        </div>
    )
}

export default Home
