import React, { useState, useEffect } from 'react';
import { FaArrowUpLong, FaArrowDownLong } from 'react-icons/fa6';

const Filter = ({ className, buses, filteredBuses, loading, onFilterChange }) => {
    // Fixed list of amenities
    const fixedAmenities = [
        "Super AC",
        "Charging Port",
        "Internet/Wifi",
        "AC & Air Suspension",
        "Sleeper Seat",
        "Snacks",
        "2*2 VIP Sofa",
        "Cooler Fan",
        "LED TV",
        "Water Bottles"
    ];

    // State for selected amenities
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // State for sorting option
    const [sortOption, setSortOption] = useState(''); // '' for default, 'asc' for low to high, 'desc' for high to low

    // Track amenity counts for debugging
    const [amenityCounts, setAmenityCounts] = useState({});

    // Update amenity counts whenever filteredBuses changes
    useEffect(() => {
        if (filteredBuses && filteredBuses.length > 0) {
            // Calculate counts for all amenities
            const counts = {};
            fixedAmenities.forEach(amenity => {
                counts[amenity] = getFilteredAmenityCount(amenity);
            });

            setAmenityCounts(counts);
        }
    }, [filteredBuses]);

    useEffect(() => {
        if (buses && buses.length > 0) {
            fixedAmenities.forEach(amenity => {
                const count = getTotalAmenityCount(amenity);
            });
        }
    }, [buses]);

    useEffect(() => {
        if (selectedAmenities.length > 0 && filteredBuses && filteredBuses.length > 0) {
            selectedAmenities.forEach(amenity => {
                const count = getFilteredAmenityCount(amenity);
            });
        }
    }, [selectedAmenities, filteredBuses]);

    // Handle amenity selection
    const handleAmenityChange = (amenity) => {
        const updatedAmenities = selectedAmenities.includes(amenity)
            ? selectedAmenities.filter(item => item !== amenity)
            : [...selectedAmenities, amenity];

        setSelectedAmenities(updatedAmenities);
        applyFilters(updatedAmenities, sortOption);
    };

    // Handle sort option change
    const handleSortChange = (option) => {
        setSortOption(option);
        applyFilters(selectedAmenities, option);
    };

    // Apply all filters and sorting
    const applyFilters = (amenities, sort) => {
        if (onFilterChange) {
            onFilterChange({
                amenities: amenities,
                sortOption: sort
            });
        }
    };

    // Check if a bus has a specific amenity with improved matching
    const busHasAmenity = (bus, amenityToCheck) => {
        if (!bus.amenities || !Array.isArray(bus.amenities)) {
            return false;
        }

        const amenityLower = amenityToCheck.toLowerCase();

        return bus.amenities.some(busAmenity => {
            if (typeof busAmenity !== 'string') {
                return false;
            }

            const busAmenityLower = busAmenity.toLowerCase();

            // Try different matching strategies
            return busAmenityLower === amenityLower ||
                busAmenityLower.includes(amenityLower) ||
                amenityLower.includes(busAmenityLower);
        });
    };

    // Get total count of buses with a specific amenity from all buses
    const getTotalAmenityCount = (amenity) => {
        if (!buses || buses.length === 0) return 0;
        return buses.filter(bus => busHasAmenity(bus, amenity)).length;
    };

    // Get count of buses with a specific amenity from filtered buses
    const getFilteredAmenityCount = (amenity) => {
        if (!filteredBuses || filteredBuses.length === 0) return 0;
        return filteredBuses.filter(bus => busHasAmenity(bus, amenity)).length;
    };

    // Determine if we have any valid data to show
    const hasValidData = buses && buses.length > 0;

    return (
        <div className={`w-full ${className}`}>
            <h1 className="text-lg md:text-xl text-neutral-700 font-semibold mb-4">
                Apply Filters
            </h1>

            {/* Price Sorting Options */}
            <div className="w-full border border-neutral-300 rounded-xl p-3 md:p-4 space-y-3">
                <h1 className="text-base md:text-lg text-neutral-600 font-medium">
                    Sort by Price
                </h1>

                <div className="space-y-2">
                    <button
                        onClick={() => handleSortChange('asc')}
                        className={`w-full flex items-center justify-between p-2 rounded-lg ${sortOption === 'asc' ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'}`}
                    >
                        <span className="text-sm font-medium">Price: Low to High</span>
                        <FaArrowUpLong className="w-3 h-3 md:w-4 md:h-4" />
                    </button>

                    <button
                        onClick={() => handleSortChange('desc')}
                        className={`w-full flex items-center justify-between p-2 rounded-lg ${sortOption === 'desc' ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'}`}
                    >
                        <span className="text-sm font-medium">Price: High to Low</span>
                        <FaArrowDownLong className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
            </div>

            {/* Amenities Filter */}
            <div className="w-full border border-neutral-300 rounded-xl p-3 md:p-4 space-y-3">
                <h1 className="text-base md:text-lg text-neutral-600 font-medium">
                    Amenities
                </h1>

                <div className="space-y-2 md:space-y-2.5">
                    {fixedAmenities.map((amenity, index) => {
                        const totalCount = getTotalAmenityCount(amenity);
                        // Always use the current filtered count, regardless of selection state
                        const filteredCount = getFilteredAmenityCount(amenity);

                        // Check if this amenity has any matching buses
                        const hasMatchingBuses = totalCount > 0;

                        // Determine if this amenity is selected
                        const isSelected = selectedAmenities.includes(amenity);

                        return (
                            <div key={index} className="w-full flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`amenity-${index}`}
                                    checked={isSelected}
                                    onChange={() => handleAmenityChange(amenity)}
                                    className="h-3.5 w-3.5 border border-neutral-300 text-primary cursor-pointer"
                                    disabled={!hasMatchingBuses}
                                />
                                <label
                                    htmlFor={`amenity-${index}`}
                                    className={`text-xs md:text-sm font-normal cursor-pointer flex items-center justify-between w-full ${!hasMatchingBuses ? 'text-neutral-400' : isSelected ? 'text-primary' : 'text-neutral-600'
                                        }`}
                                >
                                    <span className="truncate mr-1">{amenity}</span>
                                    <span className={`text-xs flex-shrink-0 flex items-center bg-neutral-100 px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary/10' : ''
                                        }`}>
                                        {/* Always display the filtered count / total count format */}
                                        <span className={isSelected ? "text-primary font-medium" : "text-neutral-600"}>
                                            {filteredCount}
                                        </span>
                                        <span className="text-neutral-400">&nbsp;/&nbsp;</span>
                                        <span>{totalCount}</span>
                                    </span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Filter;
