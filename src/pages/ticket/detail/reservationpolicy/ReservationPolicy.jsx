import React from 'react';

const ReservationPolicy = ({ policies }) => {
  return (
    <div className='col-span-1 md:col-span-4 w-full md:border-l md:border-neutral-300 md:pl-5 mt-6 md:mt-0'>
      <div className="w-full space-y-2 md:space-y-3 text-left">
        <h1 className="text-base md:text-lg text-neutral-600 font-medium text-start">
          Reservation Policies
        </h1>
        {policies && policies.length > 0 ? (
          <ul className="w-full list-disc list-outside space-y-1.5 md:space-y-2.5 px-4">
            {policies.map((policy, index) => (
              <li key={index} className="text-xs md:text-sm text-neutral-500 font-normal">
                {policy}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs md:text-sm text-neutral-500 font-normal">No reservation policies available.</p>
        )}
      </div>
    </div>
  );
};

export default ReservationPolicy;
