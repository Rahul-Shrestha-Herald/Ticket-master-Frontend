import React from 'react'
import Hero from './hero/Hero'
import HowItWorks from './howitworks/HowItWorks'
import Services from './services/Services'
import WhyChooseUs from './whychooseus/WhyChooseUs'
import CTASection from './cta/CTASection'

const Home = () => {
    return (
        <div className='w-full min-h-screen'>
            <Hero />
            <HowItWorks />
            <Services />
            <WhyChooseUs />
            <CTASection />
        </div>
    )
}

export default Home
