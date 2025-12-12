import React, { useEffect } from 'react'
import { FaCircleCheck, FaPhone } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { QRCodeSVG } from 'qrcode.react';

import BusImg from "../../../../assets/bus.png"
import QrImg from "../../../../assets/QrImg.jpg"

const PassengerInvoice = ({ data }) => {
    // Add debugging to check what contact info we're receiving
    useEffect(() => {
        console.log('PassengerInvoice data received:', {
            busId: data?.busId,
            primaryContactNumber: data?.primaryContactNumber,
            secondaryContactNumber: data?.secondaryContactNumber,
            contactPhone: data?.contactPhone
        });
    }, [data]);

    // Format date to display in a readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Format time to display in 12-hour format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Join seat numbers with commas
    const formatSeats = (seats) => {
        if (!seats || !Array.isArray(seats)) return '';
        return seats.join(', ');
    };

    // Helper function to render the contact information
    const renderContactInfo = () => {
        // Log what we have to work with
        console.log('Contact info available:', {
            primaryContact: data?.primaryContactNumber,
            secondaryContact: data?.secondaryContactNumber,
            contactPhone: data?.contactPhone,
            busNumber: data?.busNumber
        });

        // use contactPhone if it exists and is not just the bus number
        if (data?.contactPhone && data?.contactPhone !== data?.busNumber) {
            return data.contactPhone;
        }

        // Use primaryContactNumber if available
        if (data?.primaryContactNumber) {
            if (data?.secondaryContactNumber) {
                return `${data.primaryContactNumber}, ${data.secondaryContactNumber}`;
            }
            return data.primaryContactNumber;
        }

        // Final fallback: no contact information available
        return "Contact information not available";
    };

    return (
        <div className='w-full md:col-span-4 rounded-xl md:rounded-3xl relative'>

            {/* Top bus detail */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-primary px-4 md:px-6 py-2 md:py-3 rounded-t-xl md:rounded-tl-3xl md:rounded-tr-none">
                <div className="flex items-center gap-x-2 md:gap-x-3">
                    <img src={BusImg} alt="bus img" className='w-auto h-8 md:h-12 object-cover object-center' />
                    <h1 className="text-base md:text-xl text-neutral-50 font-bold uppercase tracking-wider pt-1">
                        {data?.busName || 'Bus Name'}
                    </h1>
                </div>

                <div className="flex items-center gap-x-2 mt-1 sm:mt-0">
                    <p className="text-base md:text-xl text-neutral-50 font-bold">
                        <span className='text-sm md:text-lg'>(Bus No.)</span>
                        {data?.busNumber || 'Bus Number'}
                    </p>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-4 md:gap-8 items-center px-4 md:px-5 py-4 md:py-7 mb-10 md:mb-7">

                <div className="col-span-1 sm:col-span-4 space-y-2 md:space-y-3.5">

                    {/* Billno, seat and date */}
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between border-dashed border-b-2 border-neutral-200 pb-2 md:pb-3 gap-1">
                        <p className="text-sm md:text-base text-neutral-500 font-normal">
                            Bill No.: {data?.bookingId || data?.ticketId || data?.invoiceNumber || 'N/A'}
                        </p>
                        <p className="text-sm md:text-base text-neutral-500 font-normal">
                            NPR {data?.pricePerSeat > 0 ? data?.pricePerSeat : (data?.totalPrice / (data?.selectedSeats?.length || 1))} <span className='text-xs'>/seat</span>
                        </p>
                        <p className="text-sm md:text-base text-neutral-500 font-normal">
                            Date: {formatDate(data?.journeyDate) || 'N/A'}
                        </p>
                    </div>

                    {/* Passenger detail */}
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div className="space-y-1 md:space-y-1.5 w-full sm:w-auto">
                            <p className="text-sm md:text-base text-neutral-600 font-normal">
                                Name of Passenger:
                                <span className="font-medium"> {data?.passengerName || 'N/A'}</span>
                            </p>
                            <p className="text-sm md:text-base text-neutral-600 font-normal">
                                Total Seat No.:
                                <span className="font-medium"> {formatSeats(data?.selectedSeats) || 'N/A'}</span>
                            </p>
                            <p className="text-sm md:text-base text-neutral-600 font-normal">
                                Total No. of Passenger:
                                <span className="font-medium"> {data?.selectedSeats?.length || 0}</span>
                            </p>
                            <p className="text-sm md:text-base text-neutral-600 font-normal">
                                Pickup Point:
                                <span className="font-medium"> {data?.pickupPoint || 'N/A'}</span>
                            </p>
                            <p className="text-sm md:text-base text-neutral-600 font-normal">
                                Drop Point:
                                <span className="font-medium"> {data?.dropPoint || 'N/A'}</span>
                            </p>
                        </div>

                        <div className="space-y-3 md:space-y-4 flex items-center sm:items-center justify-center flex-col w-full sm:w-auto">
                            <div className="space-y-1 text-center">
                                <p className="text-sm md:text-base text-neutral-600 font-normal">
                                    Total Price:
                                </p>
                                <h1 className="text-lg md:text-xl text-neutral-600 font-bold">
                                    NPR {data?.totalPrice || 0}
                                </h1>
                            </div>

                            <div className="w-fit min-w-[80px] px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-green-100 border border-green-600 text-green-700 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2">
                                <FaCircleCheck className="text-green-700" size={12} />
                                <span className="whitespace-nowrap font-semibold">Bill Paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Route detail */}
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between border-dashed border-t-2 border-neutral-200 pt-2 md:pt-3 gap-1">
                        <p className="text-sm md:text-base text-neutral-600 font-normal">
                            {data?.fromLocation || 'From'}
                            <span className="text-neutral-400 px-2">-----</span>
                            {data?.toLocation || 'To'}
                        </p>
                        <p className="text-sm md:text-base text-neutral-600 font-normal">
                            Departure at {formatTime(data?.departureTime) || 'N/A'}
                        </p>
                        <p className="text-sm md:text-base text-neutral-600 font-normal">
                            Arrive at {formatTime(data?.arrivalTime) || 'N/A'}
                        </p>
                    </div>

                </div>

                <div className="col-span-1 border border-neutral-200 rounded-xl shadow-sm p-1 mx-auto sm:mx-0 w-full max-w-[150px] sm:max-w-none">
                    {data?.qrCodeData ? (
                        <QRCodeSVG
                            value={data.qrCodeData}
                            size={150}
                            level="M"
                            className="w-full aspect-square rounded-xl"
                            includeMargin={true}
                            bgColor={"#FFFFFF"}
                            fgColor={"#000000"}
                        />
                    ) : (
                        <img src={QrImg} alt="Qr Img" className="w-full aspect-square object-cover object-center rounded-xl" />
                    )}
                </div>

            </div>

            {/* Left button section */}
            <div className="w-full bg-primary absolute bottom-0 left-0 rounded-b-xl md:rounded-bl-3xl md:rounded-br-none flex flex-col sm:flex-row items-center justify-between px-3 md:px-5 py-1 md:py-1.5">
                <p className="text-[10px] md:text-xs text-neutral-100 font-light">
                    Note: Ticket is Non Refundable
                </p>
                <div className="flex items-center gap-x-1 md:gap-x-2">
                    <FaPhone className='w-2 h-2 md:w-3 md:h-3 text-neutral-100' />
                    <p className="text-xs md:text-sm text-neutral-100 font-light">
                        Operator Contact: {renderContactInfo().replace("Operator Contact: ", "")}
                    </p>
                </div>
            </div>

        </div>
    )
}

export default PassengerInvoice
