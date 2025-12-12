import React, { useState, useEffect, useContext } from 'react'
import PaymentMethod from '../../checkout/passengerdata/payment/PaymentMethod'
import '../../../../../css/PassengerData.css'
import { UserAppContext } from '../../../../../context/UserAppContext'
import { CheckoutContext } from '../Checkout'
import axios from 'axios'
import { toast } from 'react-toastify'

const PassengerData = () => {
  const { backendUrl } = useContext(UserAppContext);
  const { bookingData, checkoutData, updateCheckoutData } = useContext(CheckoutContext);
  const [loading, setLoading] = useState(false);

  const { busId, selectedSeats, date } = bookingData || {};

  // Handle input changes
  const handleInputChange = (field, value) => {
    updateCheckoutData({ [field]: value });
  };

  if (loading) {
    return (
      <div className='w-full col-span-4 py-4 space-y-6'>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full col-span-1 md:col-span-4 py-4 space-y-6'>
      <h1 className="text-xl text-neutral-700 font-semibold">
        Passenger Information
      </h1>

      <div className="space-y-5 md:space-y-7">
        <div className="w-full space-y-2">
          <label htmlFor="fullname" className='text-sm text-neutral-500 font-medium'>Full Name</label>
          <input
            type="text"
            value={checkoutData.passengerName}
            onChange={(e) => handleInputChange('passengerName', e.target.value)}
            placeholder="eg. Roshan Shah"
            className="w-full h-11 md:h-14 px-3 md:px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-sm md:text-base text-neutral-600 font-normal placeholder:text-neutral-400"
            onInput={(e) => e.target.value = e.target.value.replace(/[0-9]/g, '')}
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="email" className='text-sm text-neutral-500 font-medium'>Email Address</label>
          <input
            type="email"
            value={checkoutData.passengerEmail}
            onChange={(e) => handleInputChange('passengerEmail', e.target.value)}
            placeholder='eg. roshan@gmail.com'
            className="w-full h-11 md:h-14 px-3 md:px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-sm md:text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="phone" className='text-sm text-neutral-500 font-medium'>Phone Number</label>
          <input
            type="number"
            value={checkoutData.passengerPhone}
            onChange={(e) => handleInputChange('passengerPhone', e.target.value)}
            placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-11 md:h-14 px-3 md:px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-sm md:text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="altphone" className='text-sm text-neutral-500 font-medium'>Alternate Phone Number (Optional)</label>
          <input
            type="number"
            value={checkoutData.alternatePhone}
            onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
            placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-11 md:h-14 px-3 md:px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-sm md:text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Payment Method */}
      <PaymentMethod />
    </div>
  )
}

export default PassengerData
