import React, { useState, useEffect } from 'react';
import { FaChair, FaPlus, FaMinus, FaTrash, FaEdit, FaTimes, FaUndo } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import { toast } from 'react-toastify';

/**
 * SeatLayoutDesigner – Fully customizable bus seat layout
 * Operators can add/remove rows, columns, and individual seats
 */
const SeatLayoutDesigner = ({ initialLayout, onLayoutChange }) => {
  // Start with empty layout - operators build from scratch
  const [seats, setSeats] = useState(initialLayout?.seats || []);
  const [rows, setRows] = useState(initialLayout?.rows || 5);
  const [cols, setCols] = useState(initialLayout?.cols || 11);
  const [editingSeat, setEditingSeat] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({
        rows,
        cols,
        seats,
        layoutType: 'custom',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seats, rows, cols]);

  const getSeatAtPosition = (row, col) => {
    return seats.find((s) => s.row === row && s.col === col);
  };

  // Generate unique seat ID (use label as ID for simplicity)
  const generateSeatId = (label) => {
    return label;
  };

  // Generate next available seat label
  const generateNextLabel = () => {
    if (seats.length === 0) return 'A1';
    
    // Get all existing labels and sort them
    const existingLabels = seats.map(s => s.label).sort();
    
    // Find the next available label
    let rowIndex = 0;
    let seatNumber = 1;
    
    while (true) {
      const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, ...
      const label = `${rowLetter}${seatNumber}`;
      
      if (!existingLabels.includes(label)) {
        return label;
      }
      
      seatNumber++;
      if (seatNumber > 20) { // Max 20 seats per row
        seatNumber = 1;
        rowIndex++;
      }
      
      if (rowIndex > 25) { // Max 26 rows (A-Z)
        return `SEAT${seats.length + 1}`;
      }
    }
  };

  // Add a seat at specific position
  const addSeat = (row, col) => {
    const existingSeat = getSeatAtPosition(row, col);
    if (existingSeat) {
      toast.warning('Seat already exists at this position');
      return;
    }

    // Generate next available label
    const label = generateNextLabel();

    const newSeat = {
      seatId: label, // Use label as ID
      label: label,
      row: row,
      col: col,
      status: 'available',
    };

    setSeats([...seats, newSeat]);
    toast.success(`Seat ${label} added`);
  };

  // Remove a seat
  const removeSeat = (seatId) => {
    const seat = seats.find(s => s.seatId === seatId);
    if (window.confirm(`Remove seat ${seat?.label}?`)) {
      setSeats(seats.filter(s => s.seatId !== seatId));
      toast.success('Seat removed');
    }
  };

  // Toggle seat status
  const toggleSeatStatus = (seatId) => {
    setSeats(seats.map((seat) =>
      seat.seatId === seatId
        ? { ...seat, status: seat.status === 'available' ? 'damaged' : 'available' }
        : seat
    ));
  };

  // Start editing seat label
  const startEditSeat = (seat) => {
    setEditingSeat(seat.seatId);
    setEditLabel(seat.label);
  };

  // Save edited seat label
  const saveEditedSeat = () => {
    if (!editLabel.trim()) {
      toast.error('Seat label cannot be empty');
      return;
    }

    const labelExists = seats.some(
      (s) => s.label === editLabel.trim() && s.seatId !== editingSeat
    );
    if (labelExists) {
      toast.error('This seat label already exists');
      return;
    }

    setSeats(seats.map((seat) =>
      seat.seatId === editingSeat ? { ...seat, label: editLabel.trim() } : seat
    ));
    setEditingSeat(null);
    setEditLabel('');
    toast.success('Seat label updated');
  };

  // Add row
  const addRow = () => {
    if (rows >= 20) {
      toast.warning('Maximum 20 rows allowed');
      return;
    }
    setRows(rows + 1);
    toast.success('Row added');
  };

  // Remove row
  const removeRow = () => {
    if (rows <= 1) {
      toast.warning('At least 1 row required');
      return;
    }

    // Remove seats in the last row
    const seatsToRemove = seats.filter(s => s.row === rows - 1);
    if (seatsToRemove.length > 0) {
      if (!window.confirm(`This will remove ${seatsToRemove.length} seat(s) from the last row. Continue?`)) {
        return;
      }
      setSeats(seats.filter(s => s.row < rows - 1));
    }

    setRows(rows - 1);
    toast.success('Row removed');
  };

  // Add column
  const addColumn = () => {
    if (cols >= 15) {
      toast.warning('Maximum 15 columns allowed');
      return;
    }
    setCols(cols + 1);
    toast.success('Column added');
  };

  // Remove column
  const removeColumn = () => {
    if (cols <= 1) {
      toast.warning('At least 1 column required');
      return;
    }

    // Remove seats in the last column
    const seatsToRemove = seats.filter(s => s.col === cols - 1);
    if (seatsToRemove.length > 0) {
      if (!window.confirm(`This will remove ${seatsToRemove.length} seat(s) from the last column. Continue?`)) {
        return;
      }
      setSeats(seats.filter(s => s.col < cols - 1));
    }

    setCols(cols - 1);
    toast.success('Column removed');
  };

  // Reset to empty layout
  const resetLayout = () => {
    if (window.confirm('Reset layout? This will remove all seats.')) {
      setSeats([]);
      setRows(5);
      setCols(11);
      toast.success('Layout reset');
    }
  };

  // Clear all seats
  const clearAllSeats = () => {
    if (window.confirm('Remove all seats? You can add them back individually.')) {
      setSeats([]);
      toast.success('All seats cleared');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">Customize Your Bus Layout</p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Click empty cells to add seats</li>
          <li>• Click seats to toggle Available/Damaged status</li>
          <li>• Right-click seats to edit labels or delete</li>
          <li>• Use +/- buttons to add/remove rows and columns</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Row and Column Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Rows: {rows}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removeRow}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaMinus /> Remove Row
              </button>
              <button
                type="button"
                onClick={addRow}
                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> Add Row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Columns: {cols}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removeColumn}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaMinus /> Remove Column
              </button>
              <button
                type="button"
                onClick={addColumn}
                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> Add Column
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetLayout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaUndo /> Reset Layout
          </button>
          <button
            type="button"
            onClick={clearAllSeats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaTrash /> Clear All Seats
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-gray-400 bg-white flex items-center justify-center">
              <FaChair className="text-gray-600 text-xs" />
            </div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-orange-400 bg-white flex items-center justify-center">
              <FaChair className="text-orange-600 text-xs" />
            </div>
            <span className="text-gray-700">Damaged/Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center">
              <FaPlus className="text-gray-400 text-xs" />
            </div>
            <span className="text-gray-700">Empty (Click to add seat)</span>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 overflow-x-auto">
        <div className="inline-flex flex-col gap-4 min-w-max">
          {/* Top section: Driver at front right */}
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-xs font-semibold text-gray-600 mb-2">Front of Bus</p>
            </div>
            {/* Driver position - front right */}
            <div className="flex flex-col justify-center items-center px-6 py-3 bg-gray-100 rounded-lg border-2 border-gray-300">
              <GiSteeringWheel className="text-3xl text-red-600 mb-1" />
              <span className="text-xs font-semibold text-gray-600">Driver</span>
            </div>
          </div>

          {/* Horizontal divider */}
          <div className="h-px bg-gray-300 w-full"></div>

          {/* Seat grid */}
          <div className="flex flex-col gap-2">
            {[...Array(rows)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2">
                {[...Array(cols)].map((_, colIndex) => {
                  const seat = getSeatAtPosition(rowIndex, colIndex);

                  if (seat) {
                    const isDamaged = seat.status === 'damaged';

                    return (
                      <div key={`${rowIndex}-${colIndex}`} className="relative group">
                        <button
                          type="button"
                          onClick={() => toggleSeatStatus(seat.seatId)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            startEditSeat(seat);
                          }}
                          className={`
                            w-12 h-12 rounded border-2 flex flex-col items-center justify-center
                            text-xs font-bold transition-all duration-150
                            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${isDamaged
                              ? 'border-orange-400 bg-white text-orange-600 hover:bg-orange-50 focus:ring-orange-400'
                              : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400'
                            }
                          `}
                          title={`${seat.label} - ${isDamaged ? 'Damaged' : 'Available'}\nClick: Toggle status\nRight-click: Edit/Delete`}
                        >
                          <FaChair className={`text-xs mb-0.5 ${isDamaged ? 'text-orange-600' : 'text-gray-600'}`} />
                          <span>{seat.label}</span>
                        </button>

                        {/* Quick action buttons on hover */}
                        <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditSeat(seat);
                            }}
                            className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg"
                            title="Edit label"
                          >
                            <FaEdit className="text-[8px]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSeat(seat.seatId);
                            }}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                            title="Delete seat"
                          >
                            <FaTrash className="text-[8px]" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Empty cell - click to add seat
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      onClick={() => addSeat(rowIndex, colIndex)}
                      className="w-12 h-12 rounded border-2 border-dashed border-gray-300 bg-gray-50 
                               hover:border-gray-400 hover:bg-gray-100 transition-all duration-150
                               flex items-center justify-center group"
                      title="Click to add seat"
                    >
                      <FaPlus className="text-gray-400 group-hover:text-gray-600 text-xs" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Back of bus indicator */}
          <div className="text-center">
            <p className="text-xs text-gray-500">Back of Bus</p>
          </div>
        </div>
      </div>

      {/* Seat Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Seat Summary</h3>
          <span className="text-sm text-gray-600">Total: {seats.length} seats</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-gray-600 text-xs mb-1">Available</p>
            <p className="text-lg font-bold text-green-600">
              {seats.filter(s => s.status === 'available').length}
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-gray-600 text-xs mb-1">Damaged/Unavailable</p>
            <p className="text-lg font-bold text-orange-600">
              {seats.filter(s => s.status === 'damaged').length}
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-gray-600 text-xs mb-1">Grid Size</p>
            <p className="text-lg font-bold text-blue-600">
              {rows} × {cols}
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-gray-600 text-xs mb-1">Occupancy</p>
            <p className="text-lg font-bold text-purple-600">
              {((seats.length / (rows * cols)) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Seat List */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Seats ({seats.length})</h3>
        {seats.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No seats added yet. Click on the grid to add seats.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto">
            {seats.map((seat) => (
              <button
                key={seat.seatId}
                type="button"
                onClick={() => toggleSeatStatus(seat.seatId)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  startEditSeat(seat);
                }}
                className={`
                  px-2 py-1.5 rounded text-xs font-semibold transition-colors
                  ${seat.status === 'damaged'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }
                `}
                title={`${seat.label} - Row ${seat.row + 1}, Col ${seat.col + 1}\nClick: Toggle status\nRight-click: Edit`}
              >
                {seat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Seat Modal */}
      {editingSeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Seat</h3>
              <button
                type="button"
                onClick={() => {
                  setEditingSeat(null);
                  setEditLabel('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Label
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A1, B5, C2"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveEditedSeat();
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const seat = seats.find(s => s.seatId === editingSeat);
                    if (seat) {
                      removeSeat(seat.seatId);
                      setEditingSeat(null);
                      setEditLabel('');
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSeat(null);
                    setEditLabel('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedSeat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatLayoutDesigner;
