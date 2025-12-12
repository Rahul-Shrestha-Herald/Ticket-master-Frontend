import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { 
    FaPlus, 
    FaTrash, 
    FaTimes, 
    FaChair, 
    FaCouch, 
    FaExchangeAlt,
    FaGripVertical,
    FaRoad,
    FaDoorOpen
} from 'react-icons/fa';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';

// Sortable Seat Component
const SortableSeat = ({ seat, rowIndex, seatIndex, onSeatClick, onUpdateSeatType, onRemoveSeat, isDragging, isAisle = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: seat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
        cursor: isSortableDragging ? 'grabbing' : 'grab'
    };

    if (isAisle) {
        return (
            <div className="m-1 w-12 h-16 flex items-center justify-center">
                <div className="w-full h-8 bg-yellow-100 border-2 border-yellow-300 rounded flex items-center justify-center">
                    <FaRoad className="text-yellow-500 text-xs" />
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className={`m-1 p-2 rounded-lg flex flex-col items-center justify-center w-16 h-16 transition-all ${
                isDragging ? 'opacity-50' : ''
            } ${
                seat.isSelected 
                ? 'bg-blue-500 text-white' 
                : seat.isAvailable 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-400'
            }`}>
                {seat.isAvailable ? (
                    <>
                        <div className="flex items-center justify-between w-full">
                            <div 
                                className="cursor-grab hover:text-gray-200"
                                {...attributes}
                                {...listeners}
                            >
                                <FaGripVertical />
                            </div>
                            {seat.type === 'sleeper' ? (
                                <FaCouch className="text-xl" />
                            ) : (
                                <FaChair className="text-xl" />
                            )}
                            <div className="w-4"></div> {/* Spacer for alignment */}
                        </div>
                        <span className="text-xs mt-1">{seat.seatNumber}</span>
                        <span className="text-xs">₹{seat.price}</span>
                    </>
                ) : (
                    <>
                        <FaTimes className="text-xl text-gray-600" />
                        <span className="text-xs mt-1">Removed</span>
                    </>
                )}
            </div>
            
            {/* Seat Actions Menu */}
            <div className="absolute z-20 hidden group-hover:block bg-white shadow-lg rounded-lg p-2 mt-1 min-w-[120px]">
                <div className="text-xs font-medium mb-1">Seat Actions:</div>
                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={() => onSeatClick(rowIndex, seatIndex)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded flex items-center gap-1"
                    >
                        <FaExchangeAlt />
                        {seat.isSelected ? 'Deselect' : 'Select'}
                    </button>
                    <div className="border-t my-1"></div>
                    <div className="text-xs font-medium mb-1">Change Type:</div>
                    <button
                        type="button"
                        onClick={() => onUpdateSeatType(rowIndex, seatIndex, 'seater')}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Seater (₹800)
                    </button>
                    <button
                        type="button"
                        onClick={() => onUpdateSeatType(rowIndex, seatIndex, 'semi-sleeper')}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Semi-Sleeper (₹1200)
                    </button>
                    <button
                        type="button"
                        onClick={() => onUpdateSeatType(rowIndex, seatIndex, 'sleeper')}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Sleeper (₹1500)
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                        type="button"
                        onClick={() => onRemoveSeat(rowIndex, seatIndex)}
                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center gap-1"
                    >
                        <FaTrash />
                        Remove Seat
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sortable Row Component
const SortableRow = ({ 
    row, 
    rowIndex, 
    onRemoveRow, 
    onSeatClick, 
    onUpdateSeatType, 
    onRemoveSeat, 
    activeId,
    aislePosition = 2, // Default aisle after 2 seats (2-1 layout)
    seatsPerRow = 3
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `row-${rowIndex}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    // Split seats into left and right sections with aisle in between
    const leftSeats = row.slice(0, aislePosition);
    const rightSeats = row.slice(aislePosition);

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg"
        >
            {/* Row Drag Handle */}
            <div 
                className="w-8 text-center font-medium text-gray-600 flex items-center justify-center cursor-grab hover:text-blue-600"
                {...attributes}
                {...listeners}
            >
                <FaGripVertical className="mr-1" />
                <span>Row {rowIndex + 1}</span>
            </div>
            
            {/* Seats in the row with aisle in between */}
            <div className="flex-1 flex justify-center items-center">
                {/* Left side seats */}
                <div className="flex">
                    <SortableContext 
                        items={leftSeats.map(seat => seat.id)} 
                        strategy={horizontalListSortingStrategy}
                    >
                        {leftSeats.map((seat, seatIndex) => (
                            <SortableSeat
                                key={seat.id}
                                seat={seat}
                                rowIndex={rowIndex}
                                seatIndex={seatIndex}
                                onSeatClick={onSeatClick}
                                onUpdateSeatType={onUpdateSeatType}
                                onRemoveSeat={onRemoveSeat}
                                isDragging={activeId === seat.id}
                            />
                        ))}
                    </SortableContext>
                </div>
                
                {/* Aisle (non-draggable) */}
                <SortableSeat 
                    isAisle={true}
                    seat={{ id: `aisle-${rowIndex}` }}
                    rowIndex={rowIndex}
                    seatIndex={aislePosition}
                />
                
                {/* Right side seats */}
                <div className="flex">
                    <SortableContext 
                        items={rightSeats.map(seat => seat.id)} 
                        strategy={horizontalListSortingStrategy}
                    >
                        {rightSeats.map((seat, seatIndex) => (
                            <SortableSeat
                                key={seat.id}
                                seat={seat}
                                rowIndex={rowIndex}
                                seatIndex={aislePosition + seatIndex}
                                onSeatClick={onSeatClick}
                                onUpdateSeatType={onUpdateSeatType}
                                onRemoveSeat={onRemoveSeat}
                                isDragging={activeId === seat.id}
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
            
            {/* Remove Row Button */}
            <button
                type="button"
                onClick={() => onRemoveRow(rowIndex)}
                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 ml-2"
                title="Remove this row"
            >
                <FaTrash />
            </button>
        </div>
    );
};

const OperatorAddBus = () => {
    const { backendUrl } = useContext(OperatorAppContext);

    // Bus Basic Details
    const [busName, setBusName] = useState('');
    const [busNumber, setBusNumber] = useState('');
    const [primaryContactNumber, setPrimaryContactNumber] = useState('');
    const [secondaryContactNumber, setSecondaryContactNumber] = useState('');
    const [busDescription, setBusDescription] = useState('');

    // Mandatory Documents
    const [bluebook, setBluebook] = useState(null);
    const [roadPermit, setRoadPermit] = useState(null);
    const [insurance, setInsurance] = useState(null);

    // Reservation Policies & Amenities
    const defaultReservationPolicies = [
        "Please note that this ticket is non-refundable.",
        "Passengers are required to show their ticket at the time of boarding.",
        "Passengers are required to have their ticket printed or available on their mobile device.",
        "Passenger must be present at the boarding point at least 30 minutes before departure.",
        "Bus services may be cancelled or delayed due to unforeseen circumstances."
    ];
    const [selectedReservationPolicies, setSelectedReservationPolicies] = useState([]);
    const [extraReservationPolicies, setExtraReservationPolicies] = useState([]);

    const defaultAmenities = [
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
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [extraAmenities, setExtraAmenities] = useState([]);

    // Bus Features for seat layout
    const [busFeatures, setBusFeatures] = useState({
        totalRows: 0,
        seatsPerRow: 0,
        seatType: 'sleeper',
        layout: [],
        totalSeats: 0,
        aislePosition: 2, // Default aisle after 2 seats (for 2-1 or 2-2 layout)
        layoutType: '2-1' // '1-1', '2-1', '2-2', '2-3'
    });

    // Drag and drop state
    const [activeId, setActiveId] = useState(null);
    const [layoutHistory, setLayoutHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);

    // Configure sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Calculate aisle position based on layout type
    const getAislePosition = (layoutType) => {
        switch(layoutType) {
            case '1-1': return 1; // 1 seat, aisle, 1 seat
            case '2-1': return 2; // 2 seats, aisle, 1 seat
            case '2-2': return 2; // 2 seats, aisle, 2 seats
            case '2-3': return 2; // 2 seats, aisle, 3 seats
            default: return 2;
        }
    };

    // Calculate seats per row based on layout type
    const getSeatsPerRow = (layoutType) => {
        switch(layoutType) {
            case '1-1': return 2;
            case '2-1': return 3;
            case '2-2': return 4;
            case '2-3': return 5;
            default: return 3;
        }
    };

    // Save layout to history
    const saveToHistory = (layout) => {
        const newHistory = [...layoutHistory.slice(0, historyIndex + 1), JSON.stringify(layout)];
        setLayoutHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Calculate total seats from layout
    const calculateTotalSeats = (layout) => {
        return layout.reduce((total, row) => total + row.length, 0);
    };

    // Generate initial seat layout with aisle
    const generateSeatLayout = () => {
        const { totalRows, seatType, layoutType } = busFeatures;
        const seatsPerRow = getSeatsPerRow(layoutType);
        const aislePosition = getAislePosition(layoutType);
        
        if (totalRows <= 0) {
            toast.error("Please enter valid number of rows");
            return;
        }

        const layout = [];
        let seatNumber = 1;

        for (let row = 1; row <= totalRows; row++) {
            const rowSeats = [];
            for (let col = 1; col <= seatsPerRow; col++) {
                const seat = {
                    id: `seat-${Date.now()}-${row}-${col}-${Math.random()}`,
                    seatNumber: seatNumber.toString().padStart(2, '0'),
                    row: row,
                    column: col,
                    type: seatType,
                    isAvailable: true,
                    isSelected: false,
                    price: calculateSeatPrice(seatType),
                    position: col <= aislePosition ? 'left' : 'right'
                };
                rowSeats.push(seat);
                seatNumber++;
            }
            layout.push(rowSeats);
        }

        const newFeatures = {
            ...busFeatures,
            layout,
            seatsPerRow,
            aislePosition,
            totalSeats: totalRows * seatsPerRow
        };
        setBusFeatures(newFeatures);
        saveToHistory(layout);
    };

    const calculateSeatPrice = (type) => {
        switch(type) {
            case 'sleeper': return 1500;
            case 'semi-sleeper': return 1200;
            case 'seater': return 800;
            default: return 1000;
        }
    };

    // Update layout type
    const updateLayoutType = (layoutType) => {
        const seatsPerRow = getSeatsPerRow(layoutType);
        const aislePosition = getAislePosition(layoutType);
        
        setBusFeatures(prev => ({
            ...prev,
            layoutType,
            seatsPerRow,
            aislePosition
        }));
    };

    // Seat click handler
    const handleSeatClick = (rowIndex, seatIndex) => {
        const newLayout = [...busFeatures.layout];
        newLayout[rowIndex][seatIndex] = {
            ...newLayout[rowIndex][seatIndex],
            isSelected: !newLayout[rowIndex][seatIndex].isSelected
        };
        setBusFeatures(prev => ({
            ...prev,
            layout: newLayout
        }));
        saveToHistory(newLayout);
    };

    // Update seat type
    const updateSeatType = (rowIndex, seatIndex, newType) => {
        const newLayout = [...busFeatures.layout];
        newLayout[rowIndex][seatIndex] = {
            ...newLayout[rowIndex][seatIndex],
            type: newType,
            price: calculateSeatPrice(newType)
        };
        setBusFeatures(prev => ({
            ...prev,
            layout: newLayout
        }));
        saveToHistory(newLayout);
    };

    // Remove seat
    const removeSeat = (rowIndex, seatIndex) => {
        const newLayout = [...busFeatures.layout];
        const removedSeat = newLayout[rowIndex].splice(seatIndex, 1)[0];
        
        // Update seat numbers for the entire layout
        let seatNumber = 1;
        newLayout.forEach((row, rIdx) => {
            row.forEach((seat, sIdx) => {
                newLayout[rIdx][sIdx] = {
                    ...seat,
                    seatNumber: seatNumber.toString().padStart(2, '0'),
                    row: rIdx + 1,
                    column: sIdx + 1,
                    id: seat.id.includes('removed') ? seat.id : `seat-${Date.now()}-${rIdx + 1}-${sIdx + 1}-${Math.random()}`
                };
                seatNumber++;
            });
        });

        setBusFeatures(prev => ({
            ...prev,
            layout: newLayout,
            totalSeats: seatNumber - 1
        }));
        saveToHistory(newLayout);
        
        toast.info(`Seat ${removedSeat.seatNumber} removed`, {
            action: {
                label: 'Undo',
                onClick: () => {
                    const undoLayout = [...newLayout];
                    undoLayout[rowIndex].splice(seatIndex, 0, removedSeat);
                    
                    let seatNum = 1;
                    undoLayout.forEach((row, rIdx) => {
                        row.forEach((seat, sIdx) => {
                            undoLayout[rIdx][sIdx] = {
                                ...seat,
                                seatNumber: seatNum.toString().padStart(2, '0'),
                                row: rIdx + 1,
                                column: sIdx + 1
                            };
                            seatNum++;
                        });
                    });
                    
                    setBusFeatures(prev => ({
                        ...prev,
                        layout: undoLayout,
                        totalSeats: seatNum - 1
                    }));
                    saveToHistory(undoLayout);
                }
            }
        });
    };

    // Add row
    const addRow = () => {
        const newRow = [];
        let seatNumber = busFeatures.totalSeats + 1;
        const { seatsPerRow, seatType, aislePosition } = busFeatures;
        
        for (let col = 1; col <= seatsPerRow; col++) {
            const seat = {
                id: `seat-${Date.now()}-${busFeatures.totalRows + 1}-${col}-${Math.random()}`,
                seatNumber: seatNumber.toString().padStart(2, '0'),
                row: busFeatures.totalRows + 1,
                column: col,
                type: seatType,
                isAvailable: true,
                isSelected: false,
                price: calculateSeatPrice(seatType),
                position: col <= aislePosition ? 'left' : 'right'
            };
            newRow.push(seat);
            seatNumber++;
        }

        const newLayout = [...busFeatures.layout, newRow];
        setBusFeatures(prev => ({
            ...prev,
            totalRows: prev.totalRows + 1,
            layout: newLayout,
            totalSeats: prev.totalSeats + seatsPerRow
        }));
        saveToHistory(newLayout);
    };

    // Remove row
    const removeRow = (rowIndex) => {
        const newLayout = busFeatures.layout.filter((_, index) => index !== rowIndex);
        
        let seatNumber = 1;
        newLayout.forEach((row, rIdx) => {
            row.forEach((seat, sIdx) => {
                newLayout[rIdx][sIdx] = {
                    ...seat,
                    seatNumber: seatNumber.toString().padStart(2, '0'),
                    row: rIdx + 1,
                    column: sIdx + 1,
                    id: seat.id.includes('removed') ? seat.id : `seat-${Date.now()}-${rIdx + 1}-${sIdx + 1}-${Math.random()}`
                };
                seatNumber++;
            });
        });

        setBusFeatures(prev => ({
            ...prev,
            totalRows: prev.totalRows - 1,
            layout: newLayout,
            totalSeats: seatNumber - 1
        }));
        saveToHistory(newLayout);
    };

    // Drag and drop handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // If dragging a seat within a row
        if (activeId.includes('seat') && overId.includes('seat')) {
            let activeRowIndex = -1;
            let activeSeatIndex = -1;
            let overRowIndex = -1;
            let overSeatIndex = -1;

            busFeatures.layout.forEach((row, rowIndex) => {
                const seatIndex = row.findIndex(seat => seat.id === activeId);
                if (seatIndex !== -1) {
                    activeRowIndex = rowIndex;
                    activeSeatIndex = seatIndex;
                }

                const overSeatIndexInRow = row.findIndex(seat => seat.id === overId);
                if (overSeatIndexInRow !== -1) {
                    overRowIndex = rowIndex;
                    overSeatIndex = overSeatIndexInRow;
                }
            });

            // Only allow dragging within the same side (left or right of aisle)
            const activeSide = activeSeatIndex < busFeatures.aislePosition ? 'left' : 'right';
            const overSide = overSeatIndex < busFeatures.aislePosition ? 'left' : 'right';

            if (activeRowIndex === overRowIndex && activeRowIndex !== -1 && activeSide === overSide) {
                const newLayout = [...busFeatures.layout];
                const row = newLayout[activeRowIndex];
                newLayout[activeRowIndex] = arrayMove(row, activeSeatIndex, overSeatIndex);
                
                // Update seat columns
                newLayout[activeRowIndex].forEach((seat, index) => {
                    seat.column = index + 1;
                    seat.position = (index + 1) <= busFeatures.aislePosition ? 'left' : 'right';
                });

                setBusFeatures(prev => ({
                    ...prev,
                    layout: newLayout
                }));
                saveToHistory(newLayout);
            }
        }
        // If dragging a row
        else if (activeId.includes('row') && overId.includes('row')) {
            const activeRowIndex = parseInt(activeId.split('-')[1]);
            const overRowIndex = parseInt(overId.split('-')[1]);

            if (activeRowIndex !== overRowIndex) {
                const newLayout = arrayMove(busFeatures.layout, activeRowIndex, overRowIndex);
                
                newLayout.forEach((row, index) => {
                    row.forEach(seat => {
                        seat.row = index + 1;
                    });
                });

                setBusFeatures(prev => ({
                    ...prev,
                    layout: newLayout
                }));
                saveToHistory(newLayout);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Undo/Redo functionality
    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            const prevLayout = JSON.parse(layoutHistory[prevIndex]);
            setBusFeatures(prev => ({
                ...prev,
                layout: prevLayout,
                totalSeats: calculateTotalSeats(prevLayout)
            }));
        }
    };

    const handleRedo = () => {
        if (historyIndex < layoutHistory.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            const nextLayout = JSON.parse(layoutHistory[nextIndex]);
            setBusFeatures(prev => ({
                ...prev,
                layout: nextLayout,
                totalSeats: calculateTotalSeats(nextLayout)
            }));
        }
    };

    // Reset layout
    const resetLayout = () => {
        if (window.confirm('Are you sure you want to reset the layout? This cannot be undone.')) {
            setBusFeatures(prev => ({
                ...prev,
                layout: [],
                totalSeats: 0,
                totalRows: 0
            }));
            setLayoutHistory([]);
            setHistoryIndex(-1);
        }
    };

    // Other handlers (checkbox, extra policies, amenities) remain the same
    const handleReservationPolicyChange = (policy) => {
        setSelectedReservationPolicies(prev =>
            prev.includes(policy)
                ? prev.filter(item => item !== policy)
                : [...prev, policy]
        );
    };

    const handleAmenityChange = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(item => item !== amenity)
                : [...prev, amenity]
        );
    };

    const handleExtraReservationPolicyChange = (index, value) => {
        const policies = [...extraReservationPolicies];
        policies[index] = value;
        setExtraReservationPolicies(policies);
    };

    const addExtraReservationPolicy = () => {
        setExtraReservationPolicies([...extraReservationPolicies, '']);
    };

    const removeExtraReservationPolicy = (index) => {
        setExtraReservationPolicies(prev => prev.filter((_, i) => i !== index));
    };

    const handleExtraAmenityChange = (index, value) => {
        const amenities = [...extraAmenities];
        amenities[index] = value;
        setExtraAmenities(amenities);
    };

    const addExtraAmenity = () => {
        setExtraAmenities([...extraAmenities, '']);
    };

    const removeExtraAmenity = (index) => {
        setExtraAmenities(prev => prev.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        navigate(-1);
    };

    // Submit handler
    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!busName.trim()) {
            toast.error("Bus Name is required.");
            return;
        }
        if (!busNumber.trim()) {
            toast.error("Bus Number is required.");
            return;
        }
        if (!primaryContactNumber.trim()) {
            toast.error("Primary Contact Number is required.");
            return;
        }
        if (!busDescription.trim()) {
            toast.error("Bus Description is required.");
            return;
        }
        if (!bluebook) {
            toast.error("Bluebook document is required.");
            return;
        }
        if (!roadPermit) {
            toast.error("Road Permit document is required.");
            return;
        }
        if (!insurance) {
            toast.error("Insurance document is required.");
            return;
        }

        const allReservationPolicies = [
            ...selectedReservationPolicies,
            ...extraReservationPolicies.filter(policy => policy.trim() !== '')
        ];
        if (allReservationPolicies.length === 0) {
            toast.error("At least one reservation policy is required.");
            return;
        }

        const allAmenities = [
            ...selectedAmenities,
            ...extraAmenities.filter(amenity => amenity.trim() !== '')
        ];
        if (allAmenities.length === 0) {
            toast.error("At least one amenity is required.");
            return;
        }

        if (busFeatures.totalSeats === 0) {
            toast.error("Please configure the bus seat layout.");
            return;
        }

        const formData = new FormData();
        formData.append('busName', busName);
        formData.append('busNumber', busNumber);
        formData.append('primaryContactNumber', primaryContactNumber);
        formData.append('secondaryContactNumber', secondaryContactNumber);
        formData.append('busDescription', busDescription);
        formData.append('bluebook', bluebook);
        formData.append('roadPermit', roadPermit);
        formData.append('insurance', insurance);

        // Add seat layout data with aisle info
        formData.append('seatLayout', JSON.stringify({
            totalRows: busFeatures.totalRows,
            seatsPerRow: busFeatures.seatsPerRow,
            seatType: busFeatures.seatType,
            layout: busFeatures.layout,
            totalSeats: busFeatures.totalSeats,
            layoutType: busFeatures.layoutType,
            aislePosition: busFeatures.aislePosition
        }));

        formData.append('reservationPolicies', JSON.stringify(allReservationPolicies));
        formData.append('amenities', JSON.stringify(allAmenities));

        try {
            setIsUploading(true);
            const uploadToastId = toast.info("Adding bus, please wait...", { autoClose: false });

            const { data } = await axios.post(
                `${backendUrl}/api/operator/bus/add`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            toast.dismiss(uploadToastId);
            setIsUploading(false);

            if (data.success) {
                toast.success("Bus added successfully and is under verification. This may take up to 24 hours. You'll receive an email once it's complete.");
                setTimeout(() => {
                    navigate('/operator/buses');
                }, 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            setIsUploading(false);
        }
    };

    // return (
    //     <OperatorLayout>
    //         <div className="w-full px-4 py-6">
    //             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
    //                 <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Add New Bus</h1>
    //             </div>

    //             <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
    //                 <form onSubmit={onSubmitHandler}>
    //                     {/* Basic Details & Documents sections remain unchanged */}
    //                     {/* ... */}

    //                     {/* Seat Layout Configuration */}
    //                     <div className="border-b pb-8 pt-8">
    //                         <div className="flex justify-between items-center mb-6">
    //                             <h3 className="text-xl font-semibold text-gray-800">Bus Seat Layout Configuration</h3>
    //                             <div className="flex gap-2">
    //                                 <button
    //                                     type="button"
    //                                     onClick={handleUndo}
    //                                     disabled={historyIndex <= 0}
    //                                     className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
    //                                 >
    //                                     ↶ Undo
    //                                 </button>
    //                                 <button
    //                                     type="button"
    //                                     onClick={handleRedo}
    //                                     disabled={historyIndex >= layoutHistory.length - 1}
    //                                     className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
    //                                 >
    //                                     Redo ↷
    //                                 </button>
    //                             </div>
    //                         </div>
                            
    //                         {/* Configuration Controls */}
    //                         <div className="bg-gray-50 p-4 rounded-lg mb-6">
    //                             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
    //                                 <div>
    //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
    //                                         Total Rows
    //                                     </label>
    //                                     <input
    //                                         type="number"
    //                                         min="1"
    //                                         max="20"
    //                                         value={busFeatures.totalRows}
    //                                         onChange={(e) => setBusFeatures(prev => ({ ...prev, totalRows: parseInt(e.target.value) || 0 }))}
    //                                         className="w-full px-3 py-2 border border-gray-300 rounded-md"
    //                                         placeholder="e.g., 10"
    //                                     />
    //                                 </div>
    //                                 <div>
    //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
    //                                         Layout Type
    //                                     </label>
    //                                     <select
    //                                         value={busFeatures.layoutType}
    //                                         onChange={(e) => updateLayoutType(e.target.value)}
    //                                         className="w-full px-3 py-2 border border-gray-300 rounded-md"
    //                                     >
    //                                         <option value="2-1">2-1 (2 seats, aisle, 1 seat)</option>
    //                                         <option value="2-2">2-2 (2 seats, aisle, 2 seats)</option>
    //                                         <option value="1-1">1-1 (1 seat, aisle, 1 seat)</option>
    //                                         <option value="2-3">2-3 (2 seats, aisle, 3 seats)</option>
    //                                     </select>
    //                                 </div>
    //                                 <div>
    //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
    //                                         Seat Type
    //                                     </label>
    //                                     <select
    //                                         value={busFeatures.seatType}
    //                                         onChange={(e) => setBusFeatures(prev => ({ ...prev, seatType: e.target.value }))}
    //                                         className="w-full px-3 py-2 border border-gray-300 rounded-md"
    //                                     >
    //                                         <option value="seater">Seater</option>
    //                                         <option value="semi-sleeper">Semi-Sleeper</option>
    //                                         <option value="sleeper">Sleeper</option>
    //                                     </select>
    //                                 </div>
    //                                 <div className="flex items-end">
    //                                     <button
    //                                         type="button"
    //                                         onClick={generateSeatLayout}
    //                                         className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    //                                     >
    //                                         Generate Layout
    //                                     </button>
    //                                 </div>
    //                                 {busFeatures.layout.length > 0 && (
    //                                     <div className="flex items-end">
    //                                         <button
    //                                             type="button"
    //                                             onClick={resetLayout}
    //                                             className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    //                                             title="Reset Layout"
    //                                         >
    //                                             <FaTimes className="inline mr-2" />
    //                                             Reset
    //                                         </button>
    //                                     </div>
    //                                 )}
    //                             </div>
                                
    //                             <div className="flex gap-2">
    //                                 <button
    //                                     type="button"
    //                                     onClick={addRow}
    //                                     className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
    //                                 >
    //                                     <FaPlus /> Add Row
    //                                 </button>
    //                                 {busFeatures.layout.length > 0 && (
    //                                     <button
    //                                         type="button"
    //                                         onClick={() => removeRow(busFeatures.layout.length - 1)}
    //                                         className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
    //                                     >
    //                                         <FaTrash /> Remove Last Row
    //                                     </button>
    //                                 )}
    //                             </div>
    //                         </div>

    //                         {/* Layout Preview */}
    //                         {busFeatures.layout.length > 0 && (
    //                             <div className="mb-6">
    //                                 <div className="flex justify-between items-center mb-4">
    //                                     <h4 className="text-lg font-medium text-gray-700">
    //                                         Bus Layout Preview - Total Seats: {busFeatures.totalSeats}
    //                                     </h4>
    //                                     <div className="flex gap-4 text-sm">
    //                                         <div className="flex items-center gap-2">
    //                                             <div className="w-4 h-4 bg-green-500 rounded"></div>
    //                                             <span>Available</span>
    //                                         </div>
    //                                         <div className="flex items-center gap-2">
    //                                             <div className="w-4 h-4 bg-blue-500 rounded"></div>
    //                                             <span>Selected</span>
    //                                         </div>
    //                                         <div className="flex items-center gap-2">
    //                                             <div className="w-4 h-4 bg-gray-400 rounded"></div>
    //                                             <span>Removed</span>
    //                                         </div>
    //                                         <div className="flex items-center gap-2">
    //                                             <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
    //                                             <span>Aisle</span>
    //                                         </div>
    //                                     </div>
    //                                 </div>
                                    
    //                                 {/* Bus Front with Door */}
    //                                 <div className="flex justify-center mb-4">
    //                                     <div className="relative w-48 h-16 bg-gray-800 rounded-t-lg flex items-center justify-center">
    //                                         <div className="absolute left-4 w-8 h-12 bg-yellow-500 rounded flex items-center justify-center">
    //                                             <FaDoorOpen className="text-white text-lg" />
    //                                         </div>
    //                                         <span className="text-white font-bold text-lg">🚌 FRONT</span>
    //                                         <div className="absolute right-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
    //                                             <span className="text-gray-600 font-bold">🎯</span>
    //                                         </div>
    //                                     </div>
    //                                 </div>

    //                                 {/* Bus Layout Container with DnD */}
    //                                 <DndContext
    //                                     sensors={sensors}
    //                                     collisionDetection={closestCorners}
    //                                     onDragStart={handleDragStart}
    //                                     onDragEnd={handleDragEnd}
    //                                     onDragCancel={handleDragCancel}
    //                                 >
    //                                     <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
    //                                         <div className="flex justify-center">
    //                                             {/* Left Window */}
    //                                             <div className="w-10 bg-gradient-to-r from-gray-400 to-gray-300 m-2 rounded-lg shadow-inner"></div>
                                                
    //                                             {/* Seat Grid Container */}
    //                                             <div className="flex-1">
    //                                                 <div className="relative">
    //                                                     {/* Main Aisle */}
    //                                                     <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-full bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-2 border-r-2 border-yellow-300"></div>
                                                        
    //                                                     {/* Rows */}
    //                                                     <SortableContext 
    //                                                         items={busFeatures.layout.map((_, index) => `row-${index}`)}
    //                                                         strategy={verticalListSortingStrategy}
    //                                                     >
    //                                                         {busFeatures.layout.map((row, rowIndex) => (
    //                                                             <SortableRow
    //                                                                 key={`row-${rowIndex}`}
    //                                                                 row={row}
    //                                                                 rowIndex={rowIndex}
    //                                                                 onRemoveRow={removeRow}
    //                                                                 onSeatClick={handleSeatClick}
    //                                                                 onUpdateSeatType={updateSeatType}
    //                                                                 onRemoveSeat={removeSeat}
    //                                                                 activeId={activeId}
    //                                                                 aislePosition={busFeatures.aislePosition}
    //                                                                 seatsPerRow={busFeatures.seatsPerRow}
    //                                                             />
    //                                                         ))}
    //                                                     </SortableContext>
    //                                                 </div>
    //                                             </div>
                                                
    //                                             {/* Right Window */}
    //                                             <div className="w-10 bg-gradient-to-l from-gray-400 to-gray-300 m-2 rounded-lg shadow-inner"></div>
    //                                         </div>
                                            
    //                                         {/* Rear Door */}
    //                                         <div className="mt-8 flex justify-center">
    //                                             <div className="w-48 h-12 bg-gray-800 rounded-b-lg flex items-center justify-center relative">
    //                                                 <div className="absolute right-4 w-8 h-10 bg-yellow-500 rounded flex items-center justify-center">
    //                                                     <FaDoorOpen className="text-white text-lg" />
    //                                                 </div>
    //                                                 <span className="text-white text-sm">REAR EXIT</span>
    //                                             </div>
    //                                         </div>
                                            
    //                                         {/* Layout Summary */}
    //                                         <div className="mt-8 p-6 bg-white rounded-lg shadow">
    //                                             <h5 className="font-medium text-gray-700 mb-4 text-lg">Layout Configuration Summary</h5>
    //                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    //                                                 <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
    //                                                     <div className="text-3xl font-bold text-blue-700">{busFeatures.totalRows}</div>
    //                                                     <div className="text-sm text-blue-600 font-medium">Total Rows</div>
    //                                                 </div>
    //                                                 <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
    //                                                     <div className="text-3xl font-bold text-green-700">{busFeatures.totalSeats}</div>
    //                                                     <div className="text-sm text-green-600 font-medium">Total Seats</div>
    //                                                 </div>
    //                                                 <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
    //                                                     <div className="text-3xl font-bold text-purple-700">{busFeatures.seatsPerRow}</div>
    //                                                     <div className="text-sm text-purple-600 font-medium">Seats per Row</div>
    //                                                     <div className="text-xs text-purple-500 mt-1">({busFeatures.layoutType} layout)</div>
    //                                                 </div>
    //                                                 <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
    //                                                     <div className="text-3xl font-bold text-orange-700 capitalize">{busFeatures.seatType}</div>
    //                                                     <div className="text-sm text-orange-600 font-medium">Seat Type</div>
    //                                                     <div className="text-xs text-orange-500 mt-1">₹{calculateSeatPrice(busFeatures.seatType)}/seat</div>
    //                                                 </div>
    //                                             </div>
                                                
    //                                             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
    //                                                 <div className="text-sm text-gray-600">
    //                                                     <strong>Layout Details:</strong>
    //                                                     <ul className="mt-2 space-y-1">
    //                                                         <li>• Aisle positioned after {busFeatures.aislePosition} seat{busFeatures.aislePosition > 1 ? 's' : ''} on left side</li>
    //                                                         <li>• {busFeatures.seatsPerRow - busFeatures.aislePosition} seat{busFeatures.seatsPerRow - busFeatures.aislePosition > 1 ? 's' : ''} on right side of aisle</li>
    //                                                         <li>• Drag seats within same side (left/right) of aisle</li>
    //                                                         <li>• Drag rows up/down to reorder</li>
    //                                                     </ul>
    //                                                 </div>
    //                                             </div>
    //                                         </div>
    //                                     </div>
                                        
    //                                     <DragOverlay>
    //                                         {activeId && (
    //                                             <div className="opacity-90 transform scale-110">
    //                                                 {activeId.includes('seat') ? (
    //                                                     <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-xl flex flex-col items-center justify-center w-20 h-20 shadow-2xl">
    //                                                         <FaGripVertical className="mb-2 text-xl" />
    //                                                         <span className="text-xs font-bold">Dragging Seat</span>
    //                                                     </div>
    //                                                 ) : activeId.includes('row') ? (
    //                                                     <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-2xl">
    //                                                         <span className="font-bold">Dragging Row</span>
    //                                                     </div>
    //                                                 ) : null}
    //                                             </div>
    //                                         )}
    //                                     </DragOverlay>
    //                                 </DndContext>
    //                             </div>
    //                         )}
    //                     </div>

    //                     {/* Rest of the form remains unchanged */}
    //                     {/* ... */}

    //                     <div className="flex flex-col md:flex-row gap-4 justify-end mt-8">
    //                         <button
    //                             type="button"
    //                             onClick={handleClose}
    //                             className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
    //                         >
    //                             Cancel
    //                         </button>
    //                         <button
    //                             type="submit"
    //                             disabled={isUploading}
    //                             className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
    //                         >
    //                             {isUploading ? 'Adding Bus...' : 'Add Bus'}
    //                         </button>
    //                     </div>
    //                 </form>
    //             </div>
    //         </div>
    //     </OperatorLayout>
    // );
};

// FileUpload and CheckboxOption components remain the same as before

export default OperatorAddBus;