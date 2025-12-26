import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { FaPlus, FaTrash, FaChair, FaSquare } from 'react-icons/fa';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';

const OperatorAddBus = () => {
    const { backendUrl } = useContext(OperatorAppContext);
    const navigate = useNavigate();

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

    // --- SEAT LAYOUT STATE ---
    // Default grid: 10 rows, 5 columns
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(5);
    const [seats, setSeats] = useState([]); // Array of { row, col, label, type: 'seat' | 'empty' }

    const toggleSeat = (r, c) => {
        const existingSeatIndex = seats.findIndex(s => s.row === r && s.col === c);
        if (existingSeatIndex > -1) {
            // Remove seat (make it empty)
            const newSeats = [...seats];
            newSeats.splice(existingSeatIndex, 1);
            setSeats(newSeats);
        } else {
            // Add seat
            const label = `${String.fromCharCode(65 + r)}${c + 1}`;
            setSeats([...seats, { row: r, col: c, label, type: 'seat' }]);
        }
    };

    const isSeat = (r, c) => seats.some(s => s.row === r && s.col === c);

    // --- REST OF THE LOGIC ---
    const defaultReservationPolicies = [
        "Please note that this ticket is non-refundable.",
        "Passengers are required to show their ticket at the time of boarding.",
        "Passengers are required to have their ticket printed or available on their mobile device.",
        "Passenger must be present at the boarding point at least 30 minutes before departure.",
        "Bus services may be cancelled or delayed due to unforeseen circumstances."
    ];
    const [selectedReservationPolicies, setSelectedReservationPolicies] = useState([]);
    const [extraReservationPolicies, setExtraReservationPolicies] = useState([]);

    const defaultAmenities = ["Super AC", "Charging Port", "Internet/Wifi", "AC & Air Suspension", "Sleeper Seat", "Snacks", "2*2 VIP Sofa", "Cooler Fan", "LED TV", "Water Bottles"];
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [extraAmenities, setExtraAmenities] = useState([]);

    const handleReservationPolicyChange = (policy) => {
        setSelectedReservationPolicies(prev => prev.includes(policy) ? prev.filter(item => item !== policy) : [...prev, policy]);
    };

    const handleAmenityChange = (amenity) => {
        setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]);
    };

    const [isUploading, setIsUploading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Validation
        if (seats.length === 0) {
            toast.error("Please design the seat layout. At least one seat is required.");
            return;
        }
        if (!bluebook || !roadPermit || !insurance) {
            toast.error("All legal documents are required.");
            return;
        }

        const allReservationPolicies = [...selectedReservationPolicies, ...extraReservationPolicies.filter(p => p.trim() !== '')];
        const allAmenities = [...selectedAmenities, ...extraAmenities.filter(a => a.trim() !== '')];

        const formData = new FormData();
        formData.append('busName', busName);
        formData.append('busNumber', busNumber);
        formData.append('primaryContactNumber', primaryContactNumber);
        formData.append('secondaryContactNumber', secondaryContactNumber);
        formData.append('busDescription', busDescription);
        formData.append('bluebook', bluebook);
        formData.append('roadPermit', roadPermit);
        formData.append('insurance', insurance);
        
        // Append Layout and arrays as JSON
        formData.append('seatLayout', JSON.stringify({ rows, cols, seats }));
        formData.append('reservationPolicies', JSON.stringify(allReservationPolicies));
        formData.append('amenities', JSON.stringify(allAmenities));

        try {
            setIsUploading(true);
            const { data } = await axios.post(`${backendUrl}/api/operator/bus/add`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success("Bus added and sent for verification.");
                navigate('/operator/bus-list'); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding bus");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <OperatorLayout>
            <div className="w-full px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Bus</h1>

                <form onSubmit={onSubmitHandler} className="space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Bus Name" value={busName} onChange={(e) => setBusName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                            <input type="text" placeholder="Bus Number" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                            <input type="tel" placeholder="Primary Contact" value={primaryContactNumber} onChange={(e) => setPrimaryContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                            <input type="tel" placeholder="Secondary Contact" value={secondaryContactNumber} onChange={(e) => setSecondaryContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <textarea placeholder="Bus Description" value={busDescription} onChange={(e) => setBusDescription(e.target.value)} className="w-full mt-4 px-4 py-2 border rounded-lg" rows="3" required />
                    </div>

                    {/* SEAT LAYOUT DESIGNER */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">Design Seat Layout</h2>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Rows:</span>
                                    <input type="number" min="1" max="15" value={rows} onChange={(e) => setRows(parseInt(e.target.value) || 1)} className="w-16 p-1 border rounded" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Cols:</span>
                                    <input type="number" min="1" max="6" value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 1)} className="w-16 p-1 border rounded" />
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 italic">Click on a grid cell to place or remove a seat. The front of the bus is at the top.</p>
                        
                        <div className="flex justify-center bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300">
                            <div className="inline-block bg-white p-6 rounded-t-[3rem] border-4 border-gray-400 shadow-xl relative">
                                {/* Steering Wheel Icon to indicate Front */}
                                <div className="absolute top-4 right-8 text-gray-400 text-2xl rotate-12">
                                    <FaSquare className="animate-pulse" />
                                    <span className="text-[10px] block">Driver</span>
                                </div>

                                <div 
                                    className="grid gap-3" 
                                    style={{ 
                                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                    }}
                                >
                                    {[...Array(rows)].map((_, r) => (
                                        [...Array(cols)].map((_, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                onClick={() => toggleSeat(r, c)}
                                                className={`
                                                    w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                                                    ${isSeat(r, c) 
                                                        ? 'bg-primary text-white shadow-md scale-105' 
                                                        : 'bg-gray-100 text-gray-300 hover:bg-gray-200 border-2 border-transparent'}
                                                `}
                                            >
                                                {isSeat(r, c) ? (
                                                    <>
                                                        <FaChair className="text-lg" />
                                                        <span className="text-[10px] font-bold">{String.fromCharCode(65 + r)}{c + 1}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px]">Empty</span>
                                                )}
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary rounded"></div> Seat</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 border rounded"></div> Gangway/Empty</div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Legal Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FileUpload label="Bluebook" file={bluebook} setFile={setBluebook} required />
                            <FileUpload label="Road Permit" file={roadPermit} setFile={setRoadPermit} required />
                            <FileUpload label="Insurance" file={insurance} setFile={setInsurance} required />
                        </div>
                    </div>

                    {/* Policies and Amenities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-6">Reservation Policies</h3>
                            <div className="space-y-3">
                                {defaultReservationPolicies.map((p, i) => (
                                    <CheckboxOption key={i} label={p} checked={selectedReservationPolicies.includes(p)} onChange={() => handleReservationPolicyChange(p)} />
                                ))}
                                {extraReservationPolicies.map((p, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input type="text" value={p} onChange={(e) => {
                                            const copy = [...extraReservationPolicies];
                                            copy[i] = e.target.value;
                                            setExtraReservationPolicies(copy);
                                        }} className="flex-1 p-2 border rounded" />
                                        <button type="button" onClick={() => setExtraReservationPolicies(extraReservationPolicies.filter((_, idx) => idx !== i))} className="text-red-500"><FaTrash /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setExtraReservationPolicies([...extraReservationPolicies, ''])} className="flex items-center gap-2 text-green-600 font-medium"><FaPlus /> Add Custom</button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-6">Bus Amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {defaultAmenities.map((a, i) => (
                                    <CheckboxOption key={i} label={a} checked={selectedAmenities.includes(a)} onChange={() => handleAmenityChange(a)} />
                                ))}
                            </div>
                            <button type="button" onClick={() => setExtraAmenities([...extraAmenities, ''])} className="mt-4 flex items-center gap-2 text-green-600 font-medium"><FaPlus /> Add Amenity</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pb-10">
                        <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={isUploading} className="px-8 py-3 bg-primary text-white rounded-lg shadow-lg hover:opacity-90 disabled:opacity-50">
                            {isUploading ? 'Adding Bus...' : 'Submit Bus for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </OperatorLayout>
    );
};

// Reusable Components
const FileUpload = ({ label, file, setFile, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium">{label}{required && '*'}</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary relative">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
            <p className="text-xs text-gray-500 truncate">{file ? file.name : 'Upload Document'}</p>
        </div>
    </div>
);

const CheckboxOption = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded text-primary" />
        <span className="text-sm text-gray-600">{label}</span>
    </label>
);

export default OperatorAddBus;


// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { OperatorAppContext } from '../../../../context/OperatorAppContext';
// import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
// import OperatorLayout from '../../../../layout/operator/OperatorLayout';

// const OperatorAddBus = () => {
//     const { backendUrl } = useContext(OperatorAppContext);

//     // Bus Basic Details
//     const [busName, setBusName] = useState('');
//     const [busNumber, setBusNumber] = useState('');
//     const [primaryContactNumber, setPrimaryContactNumber] = useState('');
//     const [secondaryContactNumber, setSecondaryContactNumber] = useState('');
//     const [busDescription, setBusDescription] = useState('');

//     // Mandatory Documents
//     const [bluebook, setBluebook] = useState(null);
//     const [roadPermit, setRoadPermit] = useState(null);
//     const [insurance, setInsurance] = useState(null);

//     // Reservation Policies
//     const defaultReservationPolicies = [
//         "Please note that this ticket is non-refundable.",
//         "Passengers are required to show their ticket at the time of boarding.",
//         "Passengers are required to have their ticket printed or available on their mobile device.",
//         "Passenger must be present at the boarding point at least 30 minutes before departure.",
//         "Bus services may be cancelled or delayed due to unforeseen circumstances."
//     ];
//     const [selectedReservationPolicies, setSelectedReservationPolicies] = useState([]);
//     const [extraReservationPolicies, setExtraReservationPolicies] = useState([]);

//     // Amenities
//     const defaultAmenities = [
//         "Super AC",
//         "Charging Port",
//         "Internet/Wifi",
//         "AC & Air Suspension",
//         "Sleeper Seat",
//         "Snacks",
//         "2*2 VIP Sofa",
//         "Cooler Fan",
//         "LED TV",
//         "Water Bottles"
//     ];
//     const [selectedAmenities, setSelectedAmenities] = useState([]);
//     const [extraAmenities, setExtraAmenities] = useState([]);

//     // Bus Images (optional)
//     const [busImageFront, setBusImageFront] = useState(null);
//     const [busImageBack, setBusImageBack] = useState(null);
//     const [busImageLeft, setBusImageLeft] = useState(null);
//     const [busImageRight, setBusImageRight] = useState(null);

//     // Checkbox handlers for default options
//     const handleReservationPolicyChange = (policy) => {
//         setSelectedReservationPolicies(prev =>
//             prev.includes(policy)
//                 ? prev.filter(item => item !== policy)
//                 : [...prev, policy]
//         );
//     };

//     const handleAmenityChange = (amenity) => {
//         setSelectedAmenities(prev =>
//             prev.includes(amenity)
//                 ? prev.filter(item => item !== amenity)
//                 : [...prev, amenity]
//         );
//     };

//     // Extra Reservation Policies handlers
//     const handleExtraReservationPolicyChange = (index, value) => {
//         const policies = [...extraReservationPolicies];
//         policies[index] = value;
//         setExtraReservationPolicies(policies);
//     };

//     const addExtraReservationPolicy = () => {
//         setExtraReservationPolicies([...extraReservationPolicies, '']);
//     };

//     const removeExtraReservationPolicy = (index) => {
//         setExtraReservationPolicies(prev => prev.filter((_, i) => i !== index));
//     };

//     // Extra Amenities handlers
//     const handleExtraAmenityChange = (index, value) => {
//         const amenities = [...extraAmenities];
//         amenities[index] = value;
//         setExtraAmenities(amenities);
//     };

//     const addExtraAmenity = () => {
//         setExtraAmenities([...extraAmenities, '']);
//     };

//     const removeExtraAmenity = (index) => {
//         setExtraAmenities(prev => prev.filter((_, i) => i !== index));
//     };

//     const navigate = useNavigate();

//     const handleClose = () => {
//         navigate(-1); // Go back to previous page
//     };

//     const [isUploading, setIsUploading] = useState(false);

//     // Custom Validation and Submission
//     const onSubmitHandler = async (e) => {
//         e.preventDefault();

//         if (!busName.trim()) {
//             toast.error("Bus Name is required.");
//             return;
//         }
//         if (!busNumber.trim()) {
//             toast.error("Bus Number is required.");
//             return;
//         }
//         if (!primaryContactNumber.trim()) {
//             toast.error("Primary Contact Number is required.");
//             return;
//         }
//         if (!busDescription.trim()) {
//             toast.error("Bus Description is required.");
//             return;
//         }
//         if (!bluebook) {
//             toast.error("Bluebook document is required.");
//             return;
//         }
//         if (!roadPermit) {
//             toast.error("Road Permit document is required.");
//             return;
//         }
//         if (!insurance) {
//             toast.error("Insurance document is required.");
//             return;
//         }

//         const allReservationPolicies = [
//             ...selectedReservationPolicies,
//             ...extraReservationPolicies.filter(policy => policy.trim() !== '')
//         ];
//         if (allReservationPolicies.length === 0) {
//             toast.error("At least one reservation policy is required.");
//             return;
//         }

//         const allAmenities = [
//             ...selectedAmenities,
//             ...extraAmenities.filter(amenity => amenity.trim() !== '')
//         ];
//         if (allAmenities.length === 0) {
//             toast.error("At least one amenity is required.");
//             return;
//         }

//         const formData = new FormData();
//         formData.append('busName', busName);
//         formData.append('busNumber', busNumber);
//         formData.append('primaryContactNumber', primaryContactNumber);
//         formData.append('secondaryContactNumber', secondaryContactNumber);
//         formData.append('busDescription', busDescription);
//         formData.append('bluebook', bluebook);
//         formData.append('roadPermit', roadPermit);
//         formData.append('insurance', insurance);

//         if (busImageFront) formData.append('busImageFront', busImageFront);
//         if (busImageBack) formData.append('busImageBack', busImageBack);
//         if (busImageLeft) formData.append('busImageLeft', busImageLeft);
//         if (busImageRight) formData.append('busImageRight', busImageRight);

//         formData.append('reservationPolicies', JSON.stringify(allReservationPolicies));
//         formData.append('amenities', JSON.stringify(allAmenities));

//         try {
//             setIsUploading(true);
//             const uploadToastId = toast.info("Uploading images, please wait...", { autoClose: false });

//             const { data } = await axios.post(
//                 `${backendUrl}/api/operator/bus/add`,
//                 formData,
//                 { headers: { 'Content-Type': 'multipart/form-data' } }
//             );

//             toast.dismiss(uploadToastId);
//             setIsUploading(false);

//             if (data.success) {
//                 toast.success("Bus added successfully and is under verification. This may take up to 24 hours. You'll receive an email once it's complete.");
//                 // Optionally reset or redirect
//             } else {
//                 toast.error(data.message);
//             }
//         } catch (error) {
//             toast.error(error.response?.data?.message || error.message);
//         }
//     };

//     return (
//         <OperatorLayout>
//             <div className="w-full px-4 py-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//                     <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Add New Bus</h1>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
//                     <form onSubmit={onSubmitHandler}>
//                         {/* Basic Details */}
//                         <div className="mb-8">
//                             <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic Details</h2>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Bus Name <span className="text-red-600">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={busName}
//                                         onChange={(e) => setBusName(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         placeholder="Enter bus name"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Bus Number <span className="text-red-600">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={busNumber}
//                                         onChange={(e) => setBusNumber(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         placeholder="Enter registration number"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Primary Contact <span className="text-red-600">*</span>
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         value={primaryContactNumber}
//                                         onChange={(e) => setPrimaryContactNumber(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         placeholder="Enter primary contact number"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Secondary Contact <span className="text-xs text-gray-500">(Optional)</span>
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         value={secondaryContactNumber}
//                                         onChange={(e) => setSecondaryContactNumber(e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         placeholder="Enter secondary contact number"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="mt-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Bus Description <span className="text-red-600">*</span>
//                                 </label>
//                                 <textarea
//                                     value={busDescription}
//                                     onChange={(e) => setBusDescription(e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                     placeholder="Enter bus description"
//                                     rows="3"
//                                     required
//                                 ></textarea>
//                             </div>
//                         </div>

//                         {/* Documents Section */}
//                         <div className="border-b pb-8">
//                             <h3 className="text-xl font-semibold text-gray-800 mb-6">Documents</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <FileUpload label="Bluebook" file={bluebook} setFile={setBluebook} required />
//                                 <FileUpload label="Road Permit" file={roadPermit} setFile={setRoadPermit} required />
//                                 <FileUpload label="Insurance" file={insurance} setFile={setInsurance} required />
//                             </div>
//                         </div>

//                         {/* Bus Images Section */}
//                         <div className="border-b pb-8 pt-4">
//                             <h3 className="text-xl font-semibold text-gray-800 mb-6">Bus Images</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                                 <FileUpload label="Front View" file={busImageFront} setFile={setBusImageFront} />
//                                 <FileUpload label="Back View" file={busImageBack} setFile={setBusImageBack} />
//                                 <FileUpload label="Left Side" file={busImageLeft} setFile={setBusImageLeft} />
//                                 <FileUpload label="Right Side" file={busImageRight} setFile={setBusImageRight} />
//                             </div>
//                         </div>

//                         {/* Reservation Policies & Amenities */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
//                             {/* Reservation Policies */}
//                             <div>
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-6">Reservation Policies</h3>
//                                 <div className="space-y-4">
//                                     {defaultReservationPolicies.map((policy, index) => (
//                                         <CheckboxOption
//                                             key={index}
//                                             label={policy}
//                                             checked={selectedReservationPolicies.includes(policy)}
//                                             onChange={() => handleReservationPolicyChange(policy)}
//                                         />
//                                     ))}
//                                     {/* Extra Reservation Policies */}
//                                     {extraReservationPolicies.map((policy, index) => (
//                                         <div key={`extra-policy-${index}`} className="flex items-center space-x-2">
//                                             <input
//                                                 type="text"
//                                                 value={policy}
//                                                 onChange={(e) => handleExtraReservationPolicyChange(index, e.target.value)}
//                                                 placeholder="Enter additional reservation policy"
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeExtraReservationPolicy(index)}
//                                                 className="flex items-center justify-center p-1 bg-red-100 text-red-500 rounded-md hover:bg-red-200 transition-colors"
//                                             >
//                                                 <FaTrash />
//                                             </button>
//                                         </div>
//                                     ))}
//                                     <button
//                                         type="button"
//                                         onClick={addExtraReservationPolicy}
//                                         className="flex items-center space-x-1 mt-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
//                                     >
//                                         <FaPlus />
//                                         <span>Add Reservation Policy</span>
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Amenities */}
//                             <div>
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-6">Bus Amenities</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {defaultAmenities.map((amenity, index) => (
//                                         <CheckboxOption
//                                             key={index}
//                                             label={amenity}
//                                             checked={selectedAmenities.includes(amenity)}
//                                             onChange={() => handleAmenityChange(amenity)}
//                                         />
//                                     ))}
//                                 </div>
//                                 <div className="mt-4 space-y-2">
//                                     {extraAmenities.map((amenity, index) => (
//                                         <div key={`extra-amenity-${index}`} className="flex items-center space-x-2">
//                                             <input
//                                                 type="text"
//                                                 value={amenity}
//                                                 onChange={(e) => handleExtraAmenityChange(index, e.target.value)}
//                                                 placeholder="Enter additional amenity"
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeExtraAmenity(index)}
//                                                 className="flex items-center justify-center p-1 bg-red-100 text-red-500 rounded-md hover:bg-red-200 transition-colors"
//                                             >
//                                                 <FaTrash />
//                                             </button>
//                                         </div>
//                                     ))}
//                                     <button
//                                         type="button"
//                                         onClick={addExtraAmenity}
//                                         className="flex items-center space-x-1 mt-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
//                                     >
//                                         <FaPlus />
//                                         <span>Add Amenity</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex flex-col md:flex-row gap-4 justify-end mt-8">
//                             <button
//                                 type="button"
//                                 onClick={handleClose}
//                                 className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isUploading}
//                                 className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
//                             >
//                                 {isUploading ? 'Uploading...' : 'Add Bus'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </OperatorLayout>
//     );
// };

// const FileUpload = ({ label, file, setFile, required }) => {
//     const [isDragging, setIsDragging] = useState(false);

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setIsDragging(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setIsDragging(false);
//         const droppedFiles = e.dataTransfer.files;
//         if (droppedFiles && droppedFiles[0]) {
//             const selectedFile = droppedFiles[0];
//             if (selectedFile.type.startsWith("image/")) {
//                 setFile(selectedFile);
//             } else {
//                 toast.error("Please upload a valid image file.");
//             }
//         }
//     };

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             if (selectedFile.type.startsWith("image/")) {
//                 setFile(selectedFile);
//             } else {
//                 toast.error("Please upload a valid image file.");
//             }
//         }
//     };

//     return (
//         <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//                 {label}
//                 {required && <span className="text-red-600 ml-1">*</span>}
//             </label>
//             <div
//                 className={`relative border-2 border-dashed ${isDragging ? "border-blue-500" : "border-gray-300"} rounded-lg h-32 flex items-center justify-center transition-colors`}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//             >
//                 <input
//                     type="file"
//                     onChange={handleFileChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 />
//                 <div className="text-center p-4 pointer-events-none">
//                     <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//                     </svg>
//                     <p className="text-sm text-gray-600 mt-1">
//                         {file ? file.name : 'Click or drag and drop to upload'}
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const CheckboxOption = ({ label, checked, onChange }) => (
//     <label className="flex items-center space-x-3 cursor-pointer group">
//         <input
//             type="checkbox"
//             checked={checked}
//             onChange={onChange}
//             className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 group-hover:border-red-500"
//         />
//         <span className="text-gray-700 group-hover:text-red-600">{label}</span>
//     </label>
// );

// export default OperatorAddBus;
