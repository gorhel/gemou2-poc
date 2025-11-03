'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocations, LocationOption } from '../../hooks/useLocations';

export interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, quarter?: string, city?: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  label = 'Localisation',
  error,
  required = false,
}) => {
  const [search, setSearch] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Utiliser le hook pour récupérer les localisations depuis Supabase
  const { locations, loading, searchLocations } = useLocations();

  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Rechercher les localisations quand l'utilisateur tape
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search && search.length >= 2) {
        searchLocations(search);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [search, searchLocations]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: LocationOption) => {
    setSearch(option.label);
    // Passer le district comme quarter et city
    onChange(option.label, option.district, option.city);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onChange(newValue);
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => search && setShowDropdown(locations.length > 0)}
          placeholder="Ex: Le Moufia, Saint-Denis"
          className={`
            w-full px-4 py-3 border rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
          `}
        />
        
        {/* Icône de localisation */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown avec suggestions */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Recherche...
            </div>
          ) : locations.length > 0 ? (
            locations.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {option.postal_code && (
                      <span className="text-xs text-gray-500 ml-2">({option.postal_code})</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Aucun résultat trouvé
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}

      {!error && search && (
        <p className="mt-1 text-xs text-gray-500">
          Localisation à La Réunion
        </p>
      )}
    </div>
  );
};

