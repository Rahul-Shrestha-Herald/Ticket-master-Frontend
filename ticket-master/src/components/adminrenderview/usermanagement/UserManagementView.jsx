import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import DataFilter from './DataFilter';
import TableController from './TableController';

const UserManagementView = ({
    selectedTable,
    columns,
    rows,
    searchQuery,
    statusFilter,
    onSearchChange,
    onFilterChange,
    onTableChange
}) => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <TableController
                title="User Management"
                headerComponent={
                    <select
                        value={selectedTable}
                        onChange={onTableChange}
                        className="px-4 py-2 border rounded-md"
                    >
                        <option value="users">Users</option>
                        <option value="operators">Operators</option>
                    </select>
                }
            >
                <DataFilter
                    searchQuery={searchQuery}
                    selectedFilter={statusFilter}
                    onSearchChange={onSearchChange}
                    onFilterChange={onFilterChange}
                    filterOptions={[
                        { value: 'all', label: 'All Statuses' },
                        { value: 'verified', label: 'Verified' },
                        { value: 'unverified', label: 'Unverified' }
                    ]}
                    placeholder={`Search ${selectedTable}...`}
                />
            </TableController>

            <div className="h-[600px] w-full">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection={false}
                    getRowId={(row) => row._id}
                    disableSelectionOnClick
                    components={{
                        NoRowsOverlay: () => (
                            <div className="flex h-full w-full items-center justify-center">
                                No data available
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
};

export default UserManagementView;