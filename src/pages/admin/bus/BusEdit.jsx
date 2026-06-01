// When there's a file change, create a preview and store file for upload
const handleFileChange = (e, position) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a blob URL for local preview only - not for storage
    const previewUrl = URL.createObjectURL(file);

    // Keep track of the file object for upload
    setFileUpload(prev => ({
        ...prev,
        [position]: file
    }));

    // Only update the preview in the formData, not the actual storage URL
    setFormData(prev => ({
        ...prev,
        images: {
            ...prev.images,
            [position]: previewUrl // This is just for preview, the actual URL will be set after upload
        }
    }));
};

// When the form is submitted, upload the files and then save the bus
const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        // Initialize images with the current values from selectedBus
        // This ensures we keep the original Google Drive URLs for images that weren't changed
        let updatedImages = {
            front: selectedBus.images?.front || '',
            back: selectedBus.images?.back || '',
            left: selectedBus.images?.left || '',
            right: selectedBus.images?.right || ''
        };

        // Similarly, initialize documents with current values
        let updatedDocuments = {
            billbook: selectedBus.documents?.billbook || '',
            insurance: selectedBus.documents?.insurance || '',
            route: selectedBus.documents?.route || '',
            license: selectedBus.documents?.license || ''
        };

        // Upload any new image files
        for (const position of Object.keys(fileUpload)) {
            if (fileUpload[position]) {
                const formData = new FormData();
                formData.append('file', fileUpload[position]);

                // Upload the file to get a Google Drive URL
                const res = await axios.post(`${backendUrl}/api/upload/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // If upload was successful, update the URL to the Google Drive URL
                if (res.data.success && res.data.driveUrl) {
                    updatedImages[position] = res.data.driveUrl;
                } else {
                    toast.error(`Failed to upload ${position} image`);
                }
            }
        }

        // Same process for document uploads
        for (const docType of Object.keys(docUpload)) {
            if (docUpload[docType]) {
                const formData = new FormData();
                formData.append('file', docUpload[docType]);

                const res = await axios.post(`${backendUrl}/api/upload/document`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.data.success && res.data.driveUrl) {
                    updatedDocuments[docType] = res.data.driveUrl;
                } else {
                    toast.error(`Failed to upload ${docType} document`);
                }
            }
        }

        // Now create the final data for the bus with the updated image and document URLs
        const busData = {
            ...formData,
            images: updatedImages,
            documents: updatedDocuments
        };

        // Update the bus with the new data
        const response = await axios.put(`${backendUrl}/api/bus/${selectedBus._id}`, busData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast.success('Bus updated successfully');

            // Update formData with the new Drive URLs for consistency in the UI
            setFormData(prev => ({
                ...prev,
                images: updatedImages,
                documents: updatedDocuments
            }));

            // Reset file uploads
            setFileUpload({});
            setDocUpload({});
            navigate('/admin/bus');
        } else {
            toast.error(response.data.message || 'Failed to update bus');
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occurred while updating the bus');
    } finally {
        setIsSubmitting(false);
    }
}; 