import React, { useState, useEffect, useRef } from 'react'

const TogglrBtn = ({ buttonText, buttonTextHidden, children }) => {

    const [isVisble, setIsVisible] = useState(true);
    const toggleRef = useRef(null);

    const toggleVisibility = () => {
        setIsVisible(!isVisble);
    }

    // handle the clicks outside the toggle button
    const handleOutsides = (e) => {
        if (toggleRef.current && !toggleRef.current.contains(e.target)) {
            setIsVisible(false);
        }
    }

    useEffect(() => {
        // add event listener 
        document.addEventListener('mousedown', handleOutsides);
        return () => {
            // remove the event listener
            document.removeEventListener('mousedown', handleOutsides);
        }
    }, []);

    return (
        <div className='w-full h-auto' ref={toggleRef}>
            <button
            onClick={toggleVisibility}
                className={`w-fit px-4 py-2 border-2 bg-primary 
                ${isVisble ? "bg-primary text-neutral-50" : "boredr-primary bg-transparent text-primary"} rounded-lg transition-all`}
            >
                {isVisble ? buttonTextHidden : buttonText}
            </button>

            {isVisble && (
                <div className='mt-10 p-4 bg-neutral-50 border border-neutral-300 rounded-xl shadow-sm'>
                    {children}
                </div>
            )}

        </div>
    )
}

export default TogglrBtn
