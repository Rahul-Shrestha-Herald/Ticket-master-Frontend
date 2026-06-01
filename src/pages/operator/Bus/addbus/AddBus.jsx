import React, { useState, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { FaPlus, FaTrash, FaCalendarAlt, FaRoute } from 'react-icons/fa';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';
import SeatLayoutDesigner from '../../../../components/operator/SeatLayoutDesigner';

const OperatorAddBus = () => {
    const { backendUrl } = useContext(OperatorAppContext);
    const navigate = useNavigate();

    // Bus Basic Details
    const [busName, setBusName] = useState('');
    const [busNumber, setBusNumber] = useState('');
    const [primaryContactNumber, setPrimaryContactNumber] = useState('');
    const [primaryContactError, setPrimaryContactError] = useState('');
    const [secondaryContactNumber, setSecondaryContactNumber] = useState('');
    const [secondaryContactError, setSecondaryContactError] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContactNumber, setDriverContactNumber] = useState('');
    const [driverContactError, setDriverContactError] = useState('');
    const [busDescription, setBusDescription] = useState('');

    // Bus images (min 2 required)
    const [busImageFront, setBusImageFront] = useState(null);
    const [busImageBack, setBusImageBack] = useState(null);
    const [busImageLeft, setBusImageLeft] = useState(null);
    const [busImageRight, setBusImageRight] = useState(null);

    // Mandatory Documents
    const [bluebook, setBluebook] = useState(null);
    const [roadPermit, setRoadPermit] = useState(null);
    const [insurance, setInsurance] = useState(null);

    // --- SEAT LAYOUT STATE ---
    const [seatLayout, setSeatLayout] = useState({
        rows: 10,
        cols: 5,
        seats: [],
        layoutType: 'custom'
    });

    // Handle layout change from designer
    const handleLayoutChange = useCallback((layout) => {
        setSeatLayout(layout);
    }, []);

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

    const validatePhone = (val) => /^\d{10}$/.test(val.replace(/\s/g, ''));

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Contact number validation
        if (!validatePhone(primaryContactNumber)) {
            toast.error("Primary contact number must be exactly 10 digits.");
            return;
        }
        if (secondaryContactNumber && !validatePhone(secondaryContactNumber)) {
            toast.error("Secondary contact number must be exactly 10 digits.");
            return;
        }
        if (driverContactNumber && !validatePhone(driverContactNumber)) {
            toast.error("Driver contact number must be exactly 10 digits.");
            return;
        }

        // Minimum 2 bus photos required
        const uploadedImages = [busImageFront, busImageBack, busImageLeft, busImageRight].filter(Boolean);
        if (uploadedImages.length < 2) {
            toast.error("Please upload at least 2 bus photos.");
            return;
        }

        // Validation
        if (!seatLayout.seats || seatLayout.seats.length === 0) {
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
        formData.append('driverName', driverName);
        formData.append('driverContactNumber', driverContactNumber);
        formData.append('busDescription', busDescription);
        formData.append('bluebook', bluebook);
        formData.append('roadPermit', roadPermit);
        formData.append('insurance', insurance);
        if (busImageFront) formData.append('busImageFront', busImageFront);
        if (busImageBack)  formData.append('busImageBack',  busImageBack);
        if (busImageLeft)  formData.append('busImageLeft',  busImageLeft);
        if (busImageRight) formData.append('busImageRight', busImageRight);
        
        // Append Layout and arrays as JSON
        formData.append('seatLayout', JSON.stringify(seatLayout));
        formData.append('reservationPolicies', JSON.stringify(allReservationPolicies));
        formData.append('amenities', JSON.stringify(allAmenities));

        try {
            setIsUploading(true);
            const { data } = await axios.post(`${backendUrl}/api/operator/bus/add`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success("Bus added and sent for verification.");
                navigate('/operator/buses'); 
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
            <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Bus</h1>
                <p className="text-sm text-gray-500 mb-6">Fill in bus details, design the seat layout, and upload documents.</p>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* Card: Bus details */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">Bus details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Bus Name"
                                value={busName}
                                onChange={(e) => setBusName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Bus Number"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow"
                                required
                            />
                            <div className="space-y-1">
                                <input
                                    type="tel"
                                    placeholder="Primary Contact (10 digits) *"
                                    value={primaryContactNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setPrimaryContactNumber(v);
                                        setPrimaryContactError(v.length > 0 && v.length !== 10 ? 'Must be exactly 10 digits' : '');
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow ${primaryContactError ? 'border-red-400' : 'border-gray-300'}`}
                                    required
                                />
                                {primaryContactError && <p className="text-xs text-red-500 pl-1">{primaryContactError}</p>}
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="tel"
                                    placeholder="Secondary Contact (10 digits, optional)"
                                    value={secondaryContactNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setSecondaryContactNumber(v);
                                        setSecondaryContactError(v.length > 0 && v.length !== 10 ? 'Must be exactly 10 digits' : '');
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow ${secondaryContactError ? 'border-red-400' : 'border-gray-300'}`}
                                />
                                {secondaryContactError && <p className="text-xs text-red-500 pl-1">{secondaryContactError}</p>}
                            </div>
                            <input
                                type="text"
                                placeholder="Driver Name (optional)"
                                value={driverName}
                                onChange={(e) => setDriverName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow"
                            />
                            <div className="space-y-1">
                                <input
                                    type="tel"
                                    placeholder="Driver Contact (10 digits, optional)"
                                    value={driverContactNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setDriverContactNumber(v);
                                        setDriverContactError(v.length > 0 && v.length !== 10 ? 'Must be exactly 10 digits' : '');
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow ${driverContactError ? 'border-red-400' : 'border-gray-300'}`}
                                />
                                {driverContactError && <p className="text-xs text-red-500 pl-1">{driverContactError}</p>}
                            </div>
                        </div>
                        <textarea
                            placeholder="Bus Description"
                            value={busDescription}
                            onChange={(e) => setBusDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow mt-4 min-h-[80px] resize-y"
                            rows={3}
                            required
                        />
                    </section>

                    {/* Card: Seat layout (horizontal bus view) */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">Seat layout</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Design the bus layout. Click a seat to add or remove it; click again to mark as unavailable (red) so users cannot book it.
                        </p>
                        <SeatLayoutDesigner initialLayout={seatLayout} onLayoutChange={handleLayoutChange} />
                    </section>

                    {/* Card: Legal documents */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FileUpload label="Bluebook" file={bluebook} setFile={setBluebook} required />
                            <FileUpload label="Road Permit" file={roadPermit} setFile={setRoadPermit} required />
                            <FileUpload label="Insurance" file={insurance} setFile={setInsurance} required />
                        </div>
                    </section>

                    {/* Card: Bus images (min 2 required) */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Bus photos <span className="text-red-500">*</span></h3>
                        <p className="text-sm text-gray-500 mb-4">Upload at least 2 photos of your bus. Front and back are recommended.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <BusImageUpload label="Front" required file={busImageFront} setFile={setBusImageFront} />
                            <BusImageUpload label="Back"  required file={busImageBack}  setFile={setBusImageBack} />
                            <BusImageUpload label="Left"  file={busImageLeft}  setFile={setBusImageLeft} />
                            <BusImageUpload label="Right" file={busImageRight} setFile={setBusImageRight} />
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                            {[busImageFront, busImageBack, busImageLeft, busImageRight].filter(Boolean).length} / 4 photos uploaded
                            {[busImageFront, busImageBack, busImageLeft, busImageRight].filter(Boolean).length < 2 && (
                                <span className="text-red-500 ml-2">— minimum 2 required</span>
                            )}
                        </p>
                    </section>

                    {/* Card: Bus schedule (info + link) */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-500" /> Bus schedule
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            After adding this bus, create routes and add schedules (route, departure/arrival time, date, price) from the Manage Schedules page.
                        </p>
                        <Link
                            to="/operator/bus-schedules"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <FaRoute /> Go to Manage Schedules
                        </Link>
                    </section>

                    {/* Card: Policies and amenities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation policies</h3>
                            <div className="space-y-3">
                                {defaultReservationPolicies.map((p, i) => (
                                    <CheckboxOption key={i} label={p} checked={selectedReservationPolicies.includes(p)} onChange={() => handleReservationPolicyChange(p)} />
                                ))}
                                {extraReservationPolicies.map((p, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={p}
                                            onChange={(e) => {
                                                const copy = [...extraReservationPolicies];
                                                copy[i] = e.target.value;
                                                setExtraReservationPolicies(copy);
                                            }}
                                            className="w-full flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-shadow"
                                        />
                                        <button type="button" onClick={() => setExtraReservationPolicies(extraReservationPolicies.filter((_, idx) => idx !== i))} className="p-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors" aria-label="Remove"><FaTrash /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setExtraReservationPolicies([...extraReservationPolicies, ''])} className="flex items-center gap-2 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"><FaPlus /> Add custom</button>
                            </div>
                        </section>
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 transition-shadow hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bus amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {defaultAmenities.map((a, i) => (
                                    <CheckboxOption key={i} label={a} checked={selectedAmenities.includes(a)} onChange={() => handleAmenityChange(a)} />
                                ))}
                            </div>
                            <button type="button" onClick={() => setExtraAmenities([...extraAmenities, ''])} className="mt-4 flex items-center gap-2 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"><FaPlus /> Add amenity</button>
                        </section>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 pb-10">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isUploading} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-sm hover:opacity-90 disabled:opacity-50 transition-all">
                            {isUploading ? 'Adding bus…' : 'Submit bus for approval'}
                        </button>
                    </div>
                </form>
            </div>
        </OperatorLayout>
    );
};

// Reusable components
const BusImageUpload = ({ label, file, setFile, required }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <div className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative
            ${file ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 bg-gray-50/50'}`}
            style={{ aspectRatio: '4/3' }}
        >
            <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
                <img
                    src={URL.createObjectURL(file)}
                    alt={label}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                    <span className="text-2xl text-gray-300">📷</span>
                    <p className="text-xs text-gray-400 text-center">Click to upload</p>
                </div>
            )}
        </div>
    </div>
);

const FileUpload = ({ label, file, setFile, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50/50 transition-colors relative">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
            <p className="text-xs text-gray-500 truncate">{file ? file.name : 'Upload document'}</p>
        </div>
    </div>
);

const CheckboxOption = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded text-primary focus:ring-2 focus:ring-primary/30" />
        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
    </label>
);

export default OperatorAddBus;
