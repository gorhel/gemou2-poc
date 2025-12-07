/**
 * Composant LocationAutocomplete pour React Native
 * Autocomplétion des localisations depuis la table locations
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import { useLocations, LocationOption } from '../../hooks/useLocations'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, district?: string, city?: string) => void
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  label = 'Localisation',
  error,
  required = false,
  placeholder = 'Ex: Le Moufia, Saint-Denis'
}: LocationAutocompleteProps) {
  const [search, setSearch] = useState(value)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSelectionMade, setIsSelectionMade] = useState(false)
  const [lastSelectedLabel, setLastSelectedLabel] = useState<string | null>(null)
  const { locations, loading, searchLocations } = useLocations()
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Si value change depuis l'extérieur (par exemple lors du chargement initial)
    // et qu'on n'a pas fait de sélection récente, mettre à jour search
    // Si on vient de faire une sélection, garder l'affichage du format complet
    if (!isSelectionMade) {
      // Si on avait un label sélectionné et que value correspond à une partie de ce label, garder le label
      if (lastSelectedLabel && value && lastSelectedLabel.includes(value)) {
        // Garder le label complet si value fait partie du dernier label sélectionné
        return
      }
      setSearch(value)
      setLastSelectedLabel(null)
    }
  }, [value, isSelectionMade, lastSelectedLabel])

  // Rechercher avec debounce
  useEffect(() => {
    // Ne pas rechercher si une sélection vient d'être faite
    if (isSelectionMade) {
      return
    }

    // Ne pas rechercher si le dropdown est fermé
    if (!showDropdown) {
      return
    }

    const delayDebounceFn = setTimeout(() => {
      if (search && search.length >= 2 && showDropdown && !isSelectionMade) {
        searchLocations(search)
      } else if (!search || search.length < 2) {
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, searchLocations, showDropdown, isSelectionMade])

  const handleSelect = (option: LocationOption) => {
    // Marquer qu'une sélection a été faite pour éviter les recherches automatiques
    setIsSelectionMade(true)
    
    // Stocker le label complet pour l'affichage
    const selectedValue = option.label
    setSearch(selectedValue)
    setLastSelectedLabel(selectedValue)
    onChange(selectedValue, option.district, option.city)
    
    // Fermer le dropdown immédiatement
    setShowDropdown(false)
    inputRef.current?.blur() // Fermer le clavier
    
    // Réinitialiser le flag après un court délai pour permettre les futures recherches
    setTimeout(() => {
      setIsSelectionMade(false)
    }, 1000)
  }

  const handleInputChange = (text: string) => {
    // Réinitialiser le flag de sélection si l'utilisateur modifie manuellement
    if (isSelectionMade) {
      setIsSelectionMade(false)
    }
    
    setSearch(text)
    onChange(text)
    // Ouvrir le dropdown si l'utilisateur tape (plus de 2 caractères)
    if (text && text.length >= 2) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleFocus = () => {
    // Réinitialiser le flag de sélection au focus
    setIsSelectionMade(false)
    
    if (search.length >= 2) {
      // Rechercher si on a déjà du texte
      searchLocations(search)
      setShowDropdown(true)
    }
  }

  const handleBlur = () => {
    // Petit délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  const renderItem = ({ item }: { item: LocationOption }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItemContent}>
        <Text style={styles.locationIcon}>📍</Text>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationText}>{item.label}</Text>
          {item.postal_code && (
            <Text style={styles.postalCode}>({item.postal_code})</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, error && styles.inputError]}
            value={search}
            onChangeText={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.inputIcon}>📍</Text>
        </View>

        {/* Dropdown absolu sous le champ */}
        {showDropdown && (
          <View style={styles.dropdownContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>Recherche...</Text>
              </View>
            ) : locations.length > 0 ? (
              <ScrollView
                style={styles.dropdown}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {locations.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationText}>{item.label}</Text>
                        {item.postal_code && (
                          <Text style={styles.postalCode}>({item.postal_code})</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!error && search && !showDropdown && (
        <Text style={styles.helpText}>Localisation à La Réunion</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1
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
  inputWrapper: {
    position: 'relative',
    zIndex: 1
  },
  inputContainer: {
    position: 'relative'
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    color: '#1f2937'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 20
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000
  },
  dropdown: {
    maxHeight: 250
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 12
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  locationText: {
    fontSize: 14,
    color: '#1f2937'
  },
  postalCode: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center'
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280'
  }
})

