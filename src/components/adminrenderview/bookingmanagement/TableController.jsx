import React from 'react';
import { Button } from '@mui/material';
import { FaPlus, FaPrint, FaDownload } from 'react-icons/fa';

const TableController = ({ onRefresh, onExport, onPrint, canAdd = false, onAdd }) => {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-semibold">Booking Management</h2>
            </div>

            <div className="flex gap-2">
                {canAdd && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<FaPlus />}
                        onClick={onAdd}
                    >
                        New Booking
                    </Button>
                )}

                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<FaDownload />}
                    onClick={onExport}
                >
                    Export
                </Button>

                <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    startIcon={<FaPrint />}
                    onClick={onPrint}
                >
                    Print
                </Button>
            </div>
        </div>
    );
};

export default TableController; 