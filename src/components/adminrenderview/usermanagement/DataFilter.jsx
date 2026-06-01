import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const DataFilter = ({
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterChange,
  filterOptions,
  placeholder,
  icon
}) => {
  // Ensure filterOptions is an array before mapping
  const filterOptionsArray = Array.isArray(filterOptions) ? filterOptions : [
    { value: 'all', label: 'All' }
  ];

  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
          value={searchQuery}
          onChange={onSearchChange}
        />
        {icon && <FaSearch className="absolute left-3 top-3 text-gray-400" />}
      </div>

      <div className="flex items-center gap-2">
        <FaFilter className="text-gray-500" />
        <select
          value={selectedFilter}
          onChange={onFilterChange}
          className={`px-4 py-2 border rounded-md ${icon ? 'pl-10' : ''}`}
        >
          {filterOptionsArray.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => { }} // Handled through useEffect in parent
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
};

export default DataFilter;