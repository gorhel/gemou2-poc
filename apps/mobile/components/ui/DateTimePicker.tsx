'use client'

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput
} from 'react-native'

// Import conditionnel : uniquement sur iOS/Android
let RNDateTimePicker: any = null
if (Platform.OS !== 'web') {
  RNDateTimePicker = require('@react-native-community/datetimepicker').default
}

interface DateTimePickerComponentProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  minDate?: string
  placeholder?: string
  disabled?: boolean
}

/**
 * Composant DateTimePicker natif pour React Native
 * Affiche des pickers natifs iOS/Android pour la date et l'heure
 * 
 * @param label - Libellé du champ
 * @param value - Valeur au format ISO (YYYY-MM-DDTHH:MM)
 * @param onChange - Callback appelé lors du changement de valeur
 * @param required - Indique si le champ est requis
 * @param error - Message d'erreur à afficher
 * @param minDate - Date minimum au format ISO
 * @param placeholder - Placeholder quand aucune date n'est sélectionnée
 * @param disabled - Désactive le champ
 */
export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  minDate,
  placeholder = 'Sélectionner une date',
  disabled = false
}: DateTimePickerComponentProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (value) {
      const date = new Date(value)
      return isNaN(date.getTime()) ? new Date() : date
    }
    return new Date()
  })

  // Mettre à jour currentDate quand value change
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setCurrentDate(date)
      }
    }
  }, [value])

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Sur Android, fermer immédiatement le picker
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      
      // Conserver l'heure actuelle si elle existe
      if (value) {
        const oldDate = new Date(value)
        newDate.setHours(oldDate.getHours())
        newDate.setMinutes(oldDate.getMinutes())
      }
      
      setCurrentDate(newDate)
      
      // Formater et envoyer la valeur
      const isoString = formatDateToISO(newDate)
      onChange(isoString)
      
      // Sur iOS, fermer puis ouvrir automatiquement le time picker
      if (Platform.OS === 'ios') {
        setShowDatePicker(false)
        setTimeout(() => {
          setShowTimePicker(true)
        }, 300)
      } else {
        // Sur Android, ouvrir le time picker après la sélection de la date
        setTimeout(() => {
          setShowTimePicker(true)
        }, 100)
      }
    } else if (Platform.OS === 'ios') {
      // L'utilisateur a annulé sur iOS
      setShowDatePicker(false)
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    // Sur Android, fermer immédiatement le picker
    if (Platform.OS === 'android') {
      setShowTimePicker(false)
    }

    if (selectedTime) {
      const newDate = new Date(currentDate)
      newDate.setHours(selectedTime.getHours())
      newDate.setMinutes(selectedTime.getMinutes())
      
      setCurrentDate(newDate)
      
      // Formater et envoyer la valeur
      const isoString = formatDateToISO(newDate)
      onChange(isoString)
      
      // Sur iOS, fermer le picker
      if (Platform.OS === 'ios') {
        setShowTimePicker(false)
      }
    } else if (Platform.OS === 'ios') {
      // L'utilisateur a annulé sur iOS
      setShowTimePicker(false)
    }
  }

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const formatDisplayDate = (isoString: string) => {
    if (!isoString) return placeholder
    
    try {
      const date = new Date(isoString)
      if (isNaN(date.getTime())) return placeholder
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return placeholder
    }
  }

  const getMinimumDate = (): Date | undefined => {
    if (!minDate) return undefined
    try {
      const date = new Date(minDate)
      return isNaN(date.getTime()) ? undefined : date
    } catch {
      return undefined
    }
  }

  const hasValue = value && value.length > 0

  // Version WEB : Utiliser des inputs HTML5
  if (Platform.OS === 'web') {
    const [dateValue, setDateValue] = useState('')
    const [timeValue, setTimeValue] = useState('')

    useEffect(() => {
      if (value) {
        const [date, time] = value.split('T')
        setDateValue(date || '')
        setTimeValue(time || '')
      }
    }, [value])

    const handleWebDateChange = (date: string) => {
      setDateValue(date)
      if (date && timeValue) {
        onChange(`${date}T${timeValue}`)
      }
    }

    const handleWebTimeChange = (time: string) => {
      setTimeValue(time)
      if (dateValue && time) {
        onChange(`${dateValue}T${time}`)
      }
    }

    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        <View style={styles.webInputsContainer}>
          {/* Input Date pour Web */}
          <View style={styles.webInputWrapper}>
            <Text style={styles.webInputLabel}>Date</Text>
            <TextInput
              style={[styles.webInput, error && styles.inputError]}
              value={dateValue}
              onChangeText={handleWebDateChange}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#9ca3af"
              editable={!disabled}
            />
          </View>

          {/* Input Time pour Web */}
          <View style={styles.webInputWrapper}>
            <Text style={styles.webInputLabel}>Heure</Text>
            <TextInput
              style={[styles.webInput, error && styles.inputError]}
              value={timeValue}
              onChangeText={handleWebTimeChange}
              placeholder="HH:MM"
              placeholderTextColor="#9ca3af"
              editable={!disabled}
            />
          </View>
        </View>

        {/* Message d'aide pour le web */}
        {!error && hasValue && (
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              📅 {formatDisplayDate(value)}
            </Text>
          </View>
        )}

        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    )
  }

  // Version NATIVE (iOS/Android) : Utiliser les pickers natifs
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Bouton principal pour sélectionner la date */}
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          error && styles.buttonError
        ]}
        onPress={() => setShowDatePicker(true)}
        disabled={disabled}
      >
        <View style={styles.buttonContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📅</Text>
          </View>
          <Text style={[
            styles.buttonText,
            !hasValue && styles.placeholderText
          ]}>
            {formatDisplayDate(value)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bouton séparé pour modifier uniquement l'heure */}
      {hasValue && (
        <TouchableOpacity
          style={[styles.timeButton, disabled && styles.buttonDisabled]}
          onPress={() => setShowTimePicker(true)}
          disabled={disabled}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🕐</Text>
            </View>
            <Text style={styles.timeButtonText}>
              Modifier uniquement l'heure
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Message d'erreur */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Date Picker natif */}
      {showDatePicker && RNDateTimePicker && (
        <RNDateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={getMinimumDate()}
          locale="fr-FR"
        />
      )}

      {/* Time Picker natif */}
      {showTimePicker && RNDateTimePicker && (
        <RNDateTimePicker
          value={currentDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour={true}
          locale="fr-FR"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  required: {
    color: '#ef4444'
  },
  button: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 50
  },
  buttonDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6
  },
  buttonError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    fontSize: 18
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937'
  },
  placeholderText: {
    color: '#9ca3af'
  },
  timeButton: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  timeButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6
  },
  errorIcon: {
    fontSize: 14
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444'
  },
  // Styles spécifiques pour le Web
  webInputsContainer: {
    flexDirection: 'row',
    gap: 12
  },
  webInputWrapper: {
    flex: 1
  },
  webInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6
  },
  webInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1f2937'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  helpContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    padding: 10,
    marginTop: 8
  },
  helpText: {
    fontSize: 13,
    color: '#1e40af',
    textAlign: 'center'
  }
})
