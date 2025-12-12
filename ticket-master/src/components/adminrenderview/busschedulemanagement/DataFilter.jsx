import React from 'react';
import { FaSearch } from 'react-icons/fa';

const DataFilter = ({
  searchQuery,
  onSearchChange,
  placeholder
}) => {
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
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
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
