'use client'

import React, { useState, useEffect } from 'react'

interface DateTimePickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  minDate?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Composant DateTimePicker pour sélectionner une date et une heure
 * Utilise des inputs natifs HTML5 date et time pour une meilleure UX
 * 
 * @param label - Libellé du champ
 * @param value - Valeur au format ISO (YYYY-MM-DDTHH:MM)
 * @param onChange - Callback appelé lors du changement de valeur
 * @param required - Indique si le champ est requis
 * @param error - Message d'erreur à afficher
 * @param minDate - Date minimum au format ISO
 * @param placeholder - Placeholder pour les champs vides
 * @param disabled - Désactive le champ
 * @param className - Classes CSS supplémentaires
 */
export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  minDate,
  placeholder,
  disabled = false,
  className = ''
}: DateTimePickerProps) {
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')

  // Extraire date et heure de la valeur ISO
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        // Format YYYY-MM-DD pour l'input date
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        setDateValue(`${year}-${month}-${day}`)

        // Format HH:MM pour l'input time
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        setTimeValue(`${hours}:${minutes}`)
      }
    }
  }, [value])

  // Combiner date et heure et appeler onChange
  const handleDateChange = (newDate: string) => {
    setDateValue(newDate)
    if (newDate && timeValue) {
      onChange(`${newDate}T${timeValue}`)
    } else if (newDate) {
      // Si pas d'heure, mettre 00:00 par défaut
      onChange(`${newDate}T00:00`)
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    if (dateValue && newTime) {
      onChange(`${dateValue}T${newTime}`)
    }
  }

  const getMinDate = () => {
    if (minDate) return minDate.split('T')[0]
    return undefined
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sélecteur de date */}
        <div className="relative">
          <label htmlFor="date-input" className="sr-only">Date</label>
          <input
            id="date-input"
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getMinDate()}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-2.5 
              border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              transition-colors
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            placeholder={placeholder}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Sélecteur d'heure */}
        <div className="relative">
          <label htmlFor="time-input" className="sr-only">Heure</label>
          <input
            id="time-input"
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled || !dateValue}
            required={required}
            className={`
              w-full px-4 py-2.5 
              border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              transition-colors
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
            `}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Message d'aide */}
      {!error && dateValue && !timeValue && (
        <p className="text-sm text-blue-600 mt-1">
          💡 Sélectionnez une heure pour votre événement
        </p>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Récapitulatif de la date/heure sélectionnée */}
      {dateValue && timeValue && !error && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>
            {new Date(`${dateValue}T${timeValue}`).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )}
    </div>
  )
}

