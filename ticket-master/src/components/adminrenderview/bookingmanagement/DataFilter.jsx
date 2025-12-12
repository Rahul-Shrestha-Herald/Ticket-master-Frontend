import React, { useState } from 'react';
import { TextField, Select, MenuItem, Button, InputAdornment, FormControl, InputLabel } from '@mui/material';
import { FaSearch, FaFilter, FaCalendarAlt, FaBus } from 'react-icons/fa';

const DataFilter = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    dateFilter,
    onDateFilterChange,
    busFilter,
    onBusFilterChange,
    buses,
    onResetFilters,
    filterOptions,
    dateRangeType,
    onDateRangeTypeChange,
    fromDate,
    onFromDateChange,
    toDate,
    onToDateChange
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <TextField
                    placeholder="Search by booking ID, passenger name, bus..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="md:w-1/3"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch className="text-gray-400" />
                            </InputAdornment>
                        )
                    }}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <FormControl className="w-full sm:w-40">
                        <InputLabel id="status-filter-label" size="small">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={statusFilter}
                            onChange={onStatusFilterChange}
                            label="Status"
                            size="small"
                            startAdornment={<FaFilter className="mr-2 text-gray-400" />}
                        >
                            {filterOptions.filter(option => option.value !== 'canceled').map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl className="w-full sm:w-40">
                        <InputLabel id="date-range-label" size="small">Date Range</InputLabel>
                        <Select
                            labelId="date-range-label"
                            id="date-range"
                            value={dateRangeType}
                            onChange={onDateRangeTypeChange}
                            label="Date Range"
                            size="small"
                            startAdornment={<FaCalendarAlt className="mr-2 text-gray-400" />}
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="this_week">This Week</MenuItem>
                            <MenuItem value="this_month">This Month</MenuItem>
                            <MenuItem value="upcoming">Upcoming</MenuItem>
                            <MenuItem value="manual">Manual Selection</MenuItem>
                        </Select>
                    </FormControl>

                    {dateRangeType === 'manual' && (
                        <>
                            <TextField
                                id="from-date"
                                label="From Date"
                                type="date"
                                value={fromDate}
                                onChange={onFromDateChange}
                                className="w-full sm:w-40"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                size="small"
                            />
                            <TextField
                                id="to-date"
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={onToDateChange}
                                className="w-full sm:w-40"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                size="small"
                            />
                        </>
                    )}

                    <FormControl className="w-full sm:w-40">
                        <InputLabel id="bus-filter-label" size="small">Bus</InputLabel>
                        <Select
                            labelId="bus-filter-label"
                            id="bus-filter"
                            value={busFilter}
                            onChange={onBusFilterChange}
                            label="Bus"
                            size="small"
                            startAdornment={<FaBus className="mr-2 text-gray-400" />}
                        >
                            <MenuItem value="all">All Buses</MenuItem>
                            {buses.map(bus => (
                                <MenuItem key={bus._id} value={bus._id}>
                                    {bus.busName} ({bus.busNumber})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onResetFilters}
                    size="small"
                    sx={{
                        borderColor: '#d1d5db',
                        color: '#4b5563',
                        '&:hover': {
                            borderColor: '#9ca3af',
                            backgroundColor: 'rgba(156, 163, 175, 0.04)'
                        }
                    }}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default DataFilter; 