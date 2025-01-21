import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
    return (
        <div className="mb-4">
            <div className="input-group">
                <span className="input-group-text">
                    <i className="material-symbols-outlined">search</i>
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    );
};