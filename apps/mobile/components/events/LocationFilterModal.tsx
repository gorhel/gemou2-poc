import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../../lib'

interface LocationFilterModalProps {
  visible: boolean
  onClose: () => void
  selectedCities: string[]
  onApply: (cities: string[]) => void
}

export default function LocationFilterModal({
  visible,
  onClose,
  selectedCities,
  onApply
}: LocationFilterModalProps) {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCities)

  useEffect(() => {
    if (visible) {
      loadCities()
      setTempSelected(selectedCities)
    }
  }, [visible, selectedCities])

  const loadCities = async () => {
    try {
      setLoading(true)
      
      // Récupérer toutes les villes uniques depuis les événements
      const { data, error } = await supabase
        .from('events')
        .select('location')
        .not('location', 'is', null)

      if (error) throw error

      // Extraire les villes uniques et les trier
      const uniqueCities = Array.from(
        new Set(data.map(event => event.location.trim()).filter(Boolean))
      ).sort()

      setCities(uniqueCities)
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCity = (city: string) => {
    setTempSelected(prev => {
      if (prev.includes(city)) {
        return prev.filter(c => c !== city)
      }
      return [...prev, city]
    })
  }

  const handleApply = () => {
    onApply(tempSelected)
    onClose()
  }

  const handleReset = () => {
    setTempSelected([])
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📍 Filtrer par lieu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Chargement des villes...</Text>
              </View>
            ) : cities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune ville disponible</Text>
              </View>
            ) : (
              <ScrollView style={styles.citiesList} showsVerticalScrollIndicator={false}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityItem,
                      tempSelected.includes(city) && styles.cityItemSelected
                    ]}
                    onPress={() => toggleCity(city)}
                  >
                    <Text style={[
                      styles.cityText,
                      tempSelected.includes(city) && styles.cityTextSelected
                    ]}>
                      {city}
                    </Text>
                    {tempSelected.includes(city) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Appliquer {tempSelected.length > 0 && `(${tempSelected.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280'
  },
  citiesList: {
    flex: 1,
    paddingTop: 16
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8
  },
  cityItemSelected: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  cityText: {
    fontSize: 16,
    color: '#1f2937'
  },
  cityTextSelected: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  checkmark: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
})

