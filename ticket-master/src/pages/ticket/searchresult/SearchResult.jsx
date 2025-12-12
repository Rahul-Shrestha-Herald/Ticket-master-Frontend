import React, { useState, useEffect, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa6';
import { GrRefresh } from 'react-icons/gr';
import axios from 'axios';
import { UserAppContext } from '../../../context/UserAppContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const SearchResult = forwardRef((props, ref) => {
  const { backendUrl } = useContext(UserAppContext);
  const location = useLocation();

  // Parse query parameters from the URL (if any)
  const searchParams = new URLSearchParams(location.search);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const dateParam = searchParams.get('date');

  const [originalData, setOriginalData] = useState([]); // Keep the original data
  const [dataToShow, setDataToShow] = useState([]);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    amenities: [],
    sortOption: ''
  });

  // Format tickets for Filter component
  const ticketsForFilter = useMemo(() => {
    // Ensure only return valid amenities data
    if (!originalData || originalData.length === 0) {
      return [];
    }

    try {
      return originalData.map(ticket => ({
        amenities: Array.isArray(ticket.bus?.amenities)
          ? ticket.bus.amenities.filter(amenity =>
            typeof amenity === 'string' && amenity.trim() !== ''
          )
          : []
      }));
    } catch (error) {
      return [];
    }
  }, [originalData]);

  // Format filtered tickets for Filter component to show accurate counts
  const filteredTicketsForFilter = useMemo(() => {
    // Ensure only return valid amenities data
    if (!dataToShow || dataToShow.length === 0) {
      return [];
    }

    try {
      return dataToShow.map(ticket => ({
        amenities: Array.isArray(ticket.bus?.amenities)
          ? ticket.bus.amenities.filter(amenity =>
            typeof amenity === 'string' && amenity.trim() !== ''
          )
          : []
      }));
    } catch (error) {
      return [];
    }
  }, [dataToShow]);

  // Expose methods and data to parent component via ref
  useImperativeHandle(ref, () => ({
    handleFilterChange,
    ticketsForFilter,
    filteredTicketsForFilter,
    loading
  }));

  // When the search parameters change (or on mount), fetch the ticket data.
  useEffect(() => {
    fetchTicketData(true);
  }, [fromParam, toParam, dateParam]);

  const fetchTicketData = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // Build the query string. If search parameters are provided, add them.
      const params = new URLSearchParams();
      params.append("skip", reset ? 0 : skip);
      params.append("limit", limit);
      if (fromParam) params.append("from", fromParam);
      if (toParam) params.append("to", toParam);
      if (dateParam) params.append("date", dateParam);

      const response = await axios.get(
        `${backendUrl}/api/search/busdata?${params.toString()}`
      );
      const fetchedData = response.data;
      if (fetchedData.length === 0) {
        toast.info("No more buses available");
        setHasMore(false);
      } else {
        if (reset) {
          setOriginalData(fetchedData);
          setDataToShow(fetchedData);
          setSkip(limit);
          setHasMore(true);
        } else {
          const newCombinedData = [...originalData, ...fetchedData];
          setOriginalData(newCombinedData);

          // Apply current filters to the combined data
          const filteredData = applyFilters(newCombinedData, filters);
          setDataToShow(filteredData);
          setSkip(prev => prev + limit);
        }
      }
    } catch (error) {
      toast.error("Error fetching bus data");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to the data
  const applyFilters = (data, currentFilters) => {
    let filteredData = [...data];

    // Filter by amenities
    if (currentFilters.amenities && currentFilters.amenities.length > 0) {
      filteredData = filteredData.filter(ticket => {
        if (!ticket.bus || !ticket.bus.amenities || !Array.isArray(ticket.bus.amenities)) {
          return false;
        }

        // Check if the bus has all selected amenities
        return currentFilters.amenities.every(selectedAmenity => {
          const selectedAmenityLower = selectedAmenity.toLowerCase();

          return ticket.bus.amenities.some(busAmenity => {
            if (typeof busAmenity !== 'string') {
              return false;
            }

            const busAmenityLower = busAmenity.toLowerCase();

            // Try different matching strategies for more accurate results
            return busAmenityLower === selectedAmenityLower ||
              busAmenityLower.includes(selectedAmenityLower) ||
              selectedAmenityLower.includes(busAmenityLower);
          });
        });
      });
    }

    // Sort by price
    if (currentFilters.sortOption) {
      filteredData.sort((a, b) => {
        const priceA = a.route?.price || 0;
        const priceB = b.route?.price || 0;

        if (currentFilters.sortOption === 'asc') {
          return priceA - priceB;
        } else if (currentFilters.sortOption === 'desc') {
          return priceB - priceA;
        }
        return 0;
      });
    }

    return filteredData;
  };

  // Handle filter changes from Filter component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const filteredData = applyFilters(originalData, newFilters);
    setDataToShow(filteredData);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-10 pt-4 sm:pt-11">
      <div className="space-y-4 sm:space-y-6">
        {dataToShow && dataToShow.length > 0 ? (
          dataToShow.map((ticket, index) => (
            <TicketCard
              key={index}
              busId={ticket.bus?._id}
              icon={FaBus}
              busName={ticket.bus?.busName || "Unknown Bus"}
              routeFrom={`${ticket.route?.from || "Origin"} (${ticket.route?.pickupPoints?.join(", ") || ""})`}
              routeTo={`${ticket.route?.to || "Destination"} (${ticket.route?.dropPoints?.join(", ") || ""})`}
              arrivalTime={ticket.fromTime}
              departureTime={ticket.toTime}
              price={ticket.route?.price || 0}
              date={ticket.scheduleDateStr || new Date().toISOString().split('T')[0]}
              availableSeats={
                ticket.seats?.dates?.[ticket.scheduleDateStr]
                  ? ticket.seats?.dates?.[ticket.scheduleDateStr].available?.length
                  : ticket.seats?.global?.available?.length || 0
              }
              amenities={ticket.bus?.amenities || []}
            />
          ))
        ) : (
          <p className="text-center text-neutral-600">No buses to display</p>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => fetchTicketData(false)}
            disabled={loading}
            className="flex items-center justify-center gap-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-600"
          >
            <GrRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
});

export default SearchResult;