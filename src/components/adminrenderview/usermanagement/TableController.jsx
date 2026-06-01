import React from 'react';

const TableController = ({ title, children, headerComponent }) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {headerComponent}
      </div>
      {children}
    </div>
  );
};

export default TableController;