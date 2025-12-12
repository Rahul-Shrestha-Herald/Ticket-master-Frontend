import React, { useRef, useEffect, useState, useContext } from 'react'
import TopLayout from '../../../layout/toppage/TopLayout'
import RootLayout from '../../../layout/RootLayout'
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './companyinvoice/CompanyInvoice';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { UserAppContext } from '../../../context/UserAppContext';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

const Invoice = () => {
  const invoiceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(UserAppContext);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [busContactInfo, setBusContactInfo] = useState({
    primaryContactNumber: null,
    secondaryContactNumber: null
  });
  const [contactInfoFetched, setContactInfoFetched] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);

        // Check if we have ticket ID and paymentVerified flag from location state
        if (location.state?.ticketId && location.state?.paymentVerified) {
          // Use the invoice data from location state if available
          if (location.state?.invoiceData) {
            setInvoiceData(location.state.invoiceData);
            generateQrCodeData(location.state.invoiceData);
            setLoading(false);
            return;
          }

          // Fetch invoice data if not available in location state
          const ticketId = location.state.ticketId;
          console.log(`Fetching invoice for ticket ID: ${ticketId}`);
          try {
            const response = await axios.get(`${backendUrl}/api/payment/invoice/${ticketId}`);

            if (response.data.success) {
              console.log('Invoice data fetched successfully', response.data);
              setInvoiceData(response.data.data || response.data.invoiceData); // Handle both data formats
              generateQrCodeData(response.data.data || response.data.invoiceData);
            } else {
              console.error('API returned error:', response.data);
              setError(response.data.message || 'Failed to fetch invoice data.');
              toast.error(response.data.message || 'Failed to fetch invoice data.');
            }
          } catch (apiError) {
            console.error('API request error:', apiError);
            if (apiError.response) {
              console.error('Error response:', apiError.response.data);
              setError(`${apiError.response.data.message || 'Error fetching invoice'} (${apiError.response.status})`);
              toast.error(`${apiError.response.data.message || 'Error fetching invoice'} (${apiError.response.status})`);
            } else {
              setError('Network error while fetching invoice. Please try again.');
              toast.error('Network error while fetching invoice. Please try again.');
            }
          }
        }
        // Check if we have a ticket ID in localStorage (for cases when user refreshes the page)
        else if (localStorage.getItem('ticketId') && localStorage.getItem('paymentVerified') === 'true') {
          const ticketId = localStorage.getItem('ticketId');
          console.log(`Fetching invoice for ticket ID from localStorage: ${ticketId}`);
          try {
            const response = await axios.get(`${backendUrl}/api/payment/invoice/${ticketId}`);

            if (response.data.success) {
              console.log('Invoice data fetched successfully from localStorage flow', response.data);
              setInvoiceData(response.data.data || response.data.invoiceData); // Handle both data formats
              generateQrCodeData(response.data.data || response.data.invoiceData);
            } else {
              console.error('API returned error (localStorage flow):', response.data);
              setError(response.data.message || 'Failed to fetch invoice data.');
              toast.error(response.data.message || 'Failed to fetch invoice data.');
            }
          } catch (apiError) {
            console.error('API request error (localStorage flow):', apiError);
            if (apiError.response) {
              console.error('Error response:', apiError.response.data);
              setError(`${apiError.response.data.message || 'Error fetching invoice'} (${apiError.response.status})`);
              toast.error(`${apiError.response.data.message || 'Error fetching invoice'} (${apiError.response.status})`);
            } else {
              setError('Network error while fetching invoice. Please try again.');
              toast.error('Network error while fetching invoice. Please try again.');
            }
          }
        }
        // No verified payment or ticket ID found
        else {
          setError('No valid ticket found. Please complete your payment first.');
          toast.error('No valid ticket found. Please complete your payment first.');

          // Redirect after a short delay
          setTimeout(() => {
            navigate('/bus-tickets');
          }, 3000);
        }
      } catch (error) {
        console.error('Error in invoice fetch process:', error);
        setError('Failed to fetch invoice data. Please try again later.');
        toast.error('Failed to fetch invoice data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [location.state, backendUrl, navigate]);

  // Add a useEffect to fetch bus contact details if they're not already available
  useEffect(() => {
    const fetchBusContactInfo = async () => {
      // Check if we have invoiceData
      if (!invoiceData || contactInfoFetched) {
        return;
      }

      // Skip if we already have contact info
      if (invoiceData.primaryContactNumber) {
        console.log('Contact information already available, skipping fetch');
        setContactInfoFetched(true);
        return;
      }

      setLoading(true);
      try {
        console.log('Attempting to fetch bus contact information...');
        setContactInfoFetched(true); // Mark as fetched to prevent infinite loop

        // First approach: Try to use busId if available
        if (invoiceData.busId) {
          console.log(`Fetching by busId: ${invoiceData.busId}`);
          try {
            const response = await axios.get(`${backendUrl}/api/bus/${invoiceData.busId}`);

            if (response.data) {
              console.log('Bus contact info fetched by ID:', response.data);
              updateInvoiceWithContactInfo(response.data);
              setLoading(false);
              return;
            }
          } catch (idError) {
            console.log('Error fetching by ID, will try alternate method:', idError.message);
          }
        }

        // Second approach: Try to find by direct bus ID lookup without auth
        if (invoiceData.busId) {
          try {
            // Try a direct request that bypasses authentication
            const directResponse = await axios.get(`${backendUrl}/api/bus/details/${invoiceData.busId}`);

            if (directResponse.data) {
              console.log('Bus contact info fetched by direct ID lookup:', directResponse.data);
              updateInvoiceWithContactInfo(directResponse.data);
              setLoading(false);
              return;
            }
          } catch (directError) {
            console.log('Error with direct lookup, will try search:', directError.message);
          }
        }

        // Third approach: Try search by name and number
        if (invoiceData.busName && invoiceData.busNumber) {
          try {
            console.log(`Fetching buses with name: ${invoiceData.busName} and number: ${invoiceData.busNumber}`);
            const response = await axios.get(`${backendUrl}/api/bus/search`, {
              params: {
                busName: invoiceData.busName,
                busNumber: invoiceData.busNumber
              }
            });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              console.log(`Found bus by name/number: ${response.data[0]._id}`);
              updateInvoiceWithContactInfo(response.data[0]);
              setLoading(false);
              return;
            }
          } catch (searchError) {
            console.log('Error with search method:', searchError.message);
          }
        }

        // Fourth approach: Hardcode contact info based on bus name/number pattern
        // This is a last resort fallback to ensure customers have some way to contact
        console.log('Using fallback contact info based on bus details');

        // Create some basic fallback contact info for the customer to use
        setInvoiceData(prevData => ({
          ...prevData,
          primaryContactNumber: prevData.busNumber || "Contact operator",
          contactPhone: prevData.busNumber || "Contact operator"
        }));

        console.log('Failed to find bus contact information, using fallback');
      } catch (error) {
        console.error('Error fetching bus contact information:', error);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to update invoice data with contact info
    const updateInvoiceWithContactInfo = (busData) => {
      console.log('Updating invoice with contact info:', busData);

      const primaryContactNumber = busData.primaryContactNumber || null;
      const secondaryContactNumber = busData.secondaryContactNumber || null;

      // Create formatted contact phone string
      const contactPhone = primaryContactNumber
        ? (secondaryContactNumber ? `${primaryContactNumber}, ${secondaryContactNumber}` : primaryContactNumber)
        : null;

      // Update invoice data with contact information
      const updatedInvoiceData = {
        ...invoiceData,
        busId: busData._id || invoiceData.busId,
        primaryContactNumber,
        secondaryContactNumber,
        contactPhone
      };

      // Update the state
      setInvoiceData(updatedInvoiceData);

      // Also update the QR code with the new contact information
      generateQrCodeData(updatedInvoiceData);

      setBusContactInfo({
        primaryContactNumber,
        secondaryContactNumber
      });

      console.log('Updated invoice data with contact info');
    };

    fetchBusContactInfo();
  }, [invoiceData, backendUrl, contactInfoFetched]);

  // Generate QR code data from invoice data
  const generateQrCodeData = (data) => {
    if (!data) return;

    // Get operator contact information from the data, but DON'T use bus number as fallback
    const operatorContact = data.primaryContactNumber || data.contactPhone || 'N/A';
    const operatorContactWithSecondary = data.secondaryContactNumber
      ? `${operatorContact}, ${data.secondaryContactNumber}`
      : operatorContact;

    console.log('QR Code Data - Operator Contact:', {
      primaryContactNumber: data.primaryContactNumber,
      secondaryContactNumber: data.secondaryContactNumber,
      contactPhone: data.contactPhone,
      operatorContactWithSecondary
    });

    // Create a simpler ticket information string with key details
    const qrData = `Booking ID: ${data.bookingId || 'N/A'}
Passenger: ${data.passengerName || 'N/A'}
Passenger Contact: ${data.passengerPhone || 'N/A'}${data.alternatePhone ? `, ${data.alternatePhone}` : ''}
Journey: ${data.fromLocation || 'N/A'} to ${data.toLocation || 'N/A'}
Date: ${data.journeyDate ? new Date(data.journeyDate).toLocaleDateString() : 'N/A'}
Bus Name: ${data.busName || 'N/A'}
Bus No.: ${data.busNumber || 'N/A'}
Operator Contact: ${operatorContactWithSecondary}
Departure at: ${data.departureTime || 'N/A'}
Arrive at: ${data.arrivalTime || 'N/A'}
Seats: ${Array.isArray(data.selectedSeats) ? data.selectedSeats.join(', ') : data.selectedSeats || 'N/A'}
Price per Seat: NPR ${data.pricePerSeat || (data.totalPrice && data.selectedSeats?.length ? Math.round(data.totalPrice / data.selectedSeats.length) : 0)}
Total Price: NPR ${data.totalPrice || 0}
Pickup: ${data.pickupPoint || 'N/A'}
Drop: ${data.dropPoint || 'N/A'}
Status: Paid`;

    // Use the formatted string directly instead of JSON
    setQrCodeData(qrData);
  };

  const handleDownload = async () => {
    if (invoiceRef.current === null) return;

    try {
      // Convert the invoice to an image
      const dataUrl = await toPng(invoiceRef.current);

      // download the image
      download(dataUrl, "Bus Ticket Invoice.png");
    } catch (error) {
      console.error("Error while downloading the invoice", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className='w-full space-y-12 pb-16'>
        <TopLayout
          bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
          title={"Collecting your invoice"}
        />
        <RootLayout className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="large" />
            <p className="text-sm md:text-lg text-neutral-700">Loading your invoice...</p>
          </div>
        </RootLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full space-y-12 pb-16'>
        <TopLayout
          bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
          title={"Invoice Error"}
        />
        <RootLayout className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-4 p-5 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-md">
            <div className="text-red-500 text-5xl md:text-6xl">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-red-600">Invoice Not Available</h2>
            <p className="text-base md:text-lg text-neutral-600">{error}</p>
            <button
              onClick={() => navigate('/bus-tickets')}
              className="w-full h-10 md:h-12 text-sm md:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Bus Tickets
            </button>
          </div>
        </RootLayout>
      </div>
    );
  }

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
        title={"Collect your invoice"}
      />

      <RootLayout className="space-y-8 md:space-y-12 w-full pb-8 md:pb-16">
        <div className="w-full flex items-center justify-center px-2 md:px-0">
          {/* Invoice card */}
          <div
            ref={invoiceRef} //refere to the invoice card
            className="w-full md:w-[90%] grid grid-cols-1 md:grid-cols-5 bg-white rounded-xl md:rounded-3xl border border-neutral-200 shadow-sm relative"
          >
            {/* Left side for passenger */}
            <PassengerInvoice data={{
              ...invoiceData,
              qrCodeData: qrCodeData,
              // Ensure contact information is available in the data
              primaryContactNumber: invoiceData?.primaryContactNumber || busContactInfo.primaryContactNumber,
              secondaryContactNumber: invoiceData?.secondaryContactNumber || busContactInfo.secondaryContactNumber,
              contactPhone: invoiceData?.contactPhone || (busContactInfo.primaryContactNumber ?
                (busContactInfo.secondaryContactNumber ?
                  `${busContactInfo.primaryContactNumber}, ${busContactInfo.secondaryContactNumber}` :
                  busContactInfo.primaryContactNumber) :
                null)
            }} />

            {/* Cut circles - only visible on desktop */}
            <div className="hidden md:block absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />
            <div className="hidden md:block absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />

            {/* Right side for company */}
            <CompanyInvoice data={{ ...invoiceData, qrCodeData: qrCodeData }} />
          </div>
        </div>

        {/* Download Invoice card button */}
        <div className="w-full flex justify-center items-center px-4 md:px-0">
          <button
            onClick={handleDownload}
            className="w-full md:w-fit px-4 md:px-8 h-10 md:h-14 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary text-neutral-50 font-bold text-sm md:text-lg rounded-lg flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
            Download Invoice
          </button>
        </div>
      </RootLayout>
    </div>
  )
}

export default Invoice