import React from 'react';
import { IoMdCheckboxOutline } from 'react-icons/io';

const Amenities = ({ amenities }) => {
  return (
    <div className='col-span-1 md:col-span-3 w-full'>
      <div className="w-full space-y-2 md:space-y-3">
        <h1 className="text-base md:text-lg text-neutral-600 font-medium text-start">
          Bus Amenities
        </h1>
        {amenities && amenities.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <IoMdCheckboxOutline className='w-4 h-4 md:w-5 md:h-5 text-green-500' />
                <p className="text-sm md:text-base text-neutral-700 font-normal">
                  {amenity}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs md:text-sm text-neutral-500 font-normal">No amenities available.</p>
        )}
      </div>
    </div>
  );
};

export default Amenities;
