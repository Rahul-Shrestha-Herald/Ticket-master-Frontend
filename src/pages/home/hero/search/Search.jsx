import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TbArrowsExchange } from 'react-icons/tb';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { UserAppContext } from '../../../../context/UserAppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Search = ({ setSearchResults }) => {
  const { backendUrl } = useContext(UserAppContext);
  const navigate = useNavigate();
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  // Fetch suggestions for the "From" input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (fromValue) {
        axios
          .get(`${backendUrl}/api/search/routes?query=${fromValue}`)
          .then((response) => {
            const routes = Array.isArray(response.data) ? response.data : [];
            const locationsSet = new Set();
            routes.forEach((route) => {
              if (route.from && route.from.toLowerCase().includes(fromValue.toLowerCase())) {
                locationsSet.add(route.from);
              }
              if (route.to && route.to.toLowerCase().includes(fromValue.toLowerCase())) {
                locationsSet.add(route.to);
              }
              if (Array.isArray(route.pickupPoints)) {
                route.pickupPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(fromValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
              if (Array.isArray(route.dropPoints)) {
                route.dropPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(fromValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
            });
            setFromSuggestions(Array.from(locationsSet));
          })
          .catch((error) => {
            setFromSuggestions([]);
          });
      } else {
        setFromSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fromValue, backendUrl]);

  // Fetch suggestions for the "To" input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (toValue) {
        axios
          .get(`${backendUrl}/api/search/routes?query=${toValue}`)
          .then((response) => {
            const routes = Array.isArray(response.data) ? response.data : [];
            const locationsSet = new Set();
            routes.forEach((route) => {
              if (route.from && route.from.toLowerCase().includes(toValue.toLowerCase())) {
                locationsSet.add(route.from);
              }
              if (route.to && route.to.toLowerCase().includes(toValue.toLowerCase())) {
                locationsSet.add(route.to);
              }
              if (Array.isArray(route.pickupPoints)) {
                route.pickupPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(toValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
              if (Array.isArray(route.dropPoints)) {
                route.dropPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(toValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
            });
            setToSuggestions(Array.from(locationsSet));
          })
          .catch((error) => {
            setToSuggestions([]);
          });
      } else {
        setToSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [toValue, backendUrl]);

  // When a suggestion is clicked, update the corresponding input
  const handleFromSuggestionClick = (location) => {
    setFromValue(location);
    setFromSuggestions([]);
  };

  const handleToSuggestionClick = (location) => {
    setToValue(location);
    setToSuggestions([]);
  };

  // Date functions
  const setToday = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    setDate(today.toISOString().split('T')[0]);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);
    setDate(tomorrow.toISOString().split('T')[0]);
  };

  // Submit handler for search
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate that all fields have values
    if (!fromValue.trim() || !toValue.trim() || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check that the entered date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Date cannot be in the past");
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/search/bus?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}&date=${date}`
      );

      if (!response.data || response.data.length === 0) {
        toast.info("No buses found");
      } else {
        toast.success("Buses found!");
      }

      // Navigate to the bus-tickets page with query parameters
      navigate(`/bus-tickets?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}&date=${date}`);
    } catch (error) {
      toast.error("No buses found");
    }
  };

  // Custom styles for date input to ensure consistent appearance
  const style = document.createElement('style');
  style.textContent = `
    /* Calendar icon styling for all devices */
    input[type="date"] {
      position: relative;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    
    /* WebKit browsers */
    input[type="date"]::-webkit-calendar-picker-indicator {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%23757575" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
      width: 16px;
      height: 16px;
      cursor: pointer;
      opacity: 1;
      display: block;
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
    }
    
    /* Hide default dropdown arrow and clear buttons */
    input[type="date"]::-webkit-inner-spin-button,
    input[type="date"]::-webkit-clear-button {
      display: none;
      -webkit-appearance: none;
      margin: 0;
    }
    
    /* Firefox */
    input[type="date"]::-moz-calendar-picker-indicator {
      opacity: 1;
    }
    
    /* Microsoft Edge and IE */
    input[type="date"]::-ms-clear,
    input[type="date"]::-ms-reveal {
      display: none;
    }
    
    /* For mobile specifically - override browser defaults */
    @media (max-width: 767px) {
      input[type="date"] {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%23757575" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
        background-repeat: no-repeat;
        background-position: right 5px center;
        background-size: 16px 16px;
      }
      
      input[type="date"]:focus {
        border-color: #ff6b6b;
        outline: none;
        box-shadow: 0 0 0 1px #ff6b6b;
      }
    }
  `;

  // Inject the style when component mounts
  useEffect(() => {
    document.head.appendChild(style);
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-3 md:p-5 relative"
    >
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-5 justify-between">
        {/* From and To Input Section */}
        <div className="w-full md:w-[60%] flex flex-col md:flex-row items-center gap-4 md:gap-5 relative">
          {/* From Input */}
          <div className="w-full md:w-1/2 relative">
            <div className="h-12 md:h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-3 md:px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="From"
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                onFocus={() => setIsFromFocused(true)}
                onBlur={() => setTimeout(() => setIsFromFocused(false), 100)}
              />
              <FaMapMarkerAlt className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for From input */}
            {isFromFocused && fromSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {fromSuggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleFromSuggestionClick(location)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* To Input */}
          <div className="w-full md:w-1/2 relative">
            <div className="h-12 md:h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-3 md:px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="To"
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                onFocus={() => setIsToFocused(true)}
                onBlur={() => setTimeout(() => setIsToFocused(false), 100)}
              />
              <FaMapMarkerAlt className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for To input */}
            {isToFocused && toSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {toSuggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleToSuggestionClick(location)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Exchange Button - Mobile: below inputs, Desktop: between inputs */}
          <button className="md:absolute relative top-auto md:top-1/2 left-auto md:left-1/2 transform md:-translate-x-1/2 md:-translate-y-1/2 w-10 h-10 md:w-11 md:h-6 rounded-full flex items-center justify-center bg-primary mx-auto md:mx-0 hidden md:flex">
            <TbArrowsExchange className="w-5 h-5 md:w-6 md:h-6 text-neutral-50" />
          </button>
        </div>

        {/* Date & Search Button Section */}
        <div className="flex flex-col md:flex-row md:h-14 gap-4 md:gap-2 w-full md:w-auto">
          <div className="flex space-x-2 justify-between md:justify-start">
            <button onClick={setToday} className="px-3 py-2 md:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-400 text-sm md:text-base flex-1 md:flex-none">
              Today
            </button>
            <button onClick={setTomorrow} className="px-3 py-2 md:py-1 bg-green-500 text-white rounded-lg hover:bg-green-400 text-sm md:text-base flex-1 md:flex-none">
              Tomorrow
            </button>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 md:w-36 h-10 md:h-auto px-2 border border-neutral-300 bg-white/70 text-sm md:text-base rounded-lg appearance-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full md:w-auto h-12 md:h-auto px-5 py-3 md:py-0 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center font-medium space-x-2"
          >
            <FaSearch className="w-4 h-4" />
            <span className="text-sm md:text-base">Search</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Search;
