import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'

interface PlayersFilterModalProps {
  visible: boolean
  onClose: () => void
  maxPlayers: number | null
  onApply: (maxPlayers: number | null) => void
}

const PLAYER_OPTIONS = [
  { value: 2, label: '2 joueurs' },
  { value: 4, label: '4 joueurs' },
  { value: 6, label: '6 joueurs' },
  { value: 8, label: '8 joueurs' },
  { value: 10, label: '10 joueurs' },
  { value: 15, label: '15 joueurs' },
  { value: 20, label: '20 joueurs' },
  { value: 30, label: '30 joueurs' },
  { value: 50, label: '50+ joueurs' }
]

export default function PlayersFilterModal({
  visible,
  onClose,
  maxPlayers,
  onApply
}: PlayersFilterModalProps) {
  const [tempSelected, setTempSelected] = useState<number | null>(maxPlayers)

  useEffect(() => {
    if (visible) {
      setTempSelected(maxPlayers)
    }
  }, [visible, maxPlayers])

  const handleSelect = (value: number) => {
    setTempSelected(value === tempSelected ? null : value)
  }

  const handleApply = () => {
    onApply(tempSelected)
    onClose()
  }

  const handleReset = () => {
    setTempSelected(null)
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
            <Text style={styles.title}>👥 Filtrer par nombre de joueurs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Afficher les événements avec au maximum :
            </Text>

            {/* Current Selection */}
            {tempSelected && (
              <View style={styles.currentSelectionContainer}>
                <Text style={styles.currentSelectionLabel}>Sélection actuelle :</Text>
                <Text style={styles.currentSelectionValue}>
                  Événements avec ≤ {tempSelected} {tempSelected === 1 ? 'participant' : 'participants'}
                </Text>
              </View>
            )}

            <ScrollView 
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsListContent}
            >
              {PLAYER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    tempSelected === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radio,
                      tempSelected === option.value && styles.radioSelected
                    ]}>
                      {tempSelected === option.value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionText,
                        tempSelected === option.value && styles.optionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        Événements avec {option.value} {option.value === 1 ? 'participant' : 'participants'} maximum
                      </Text>
                    </View>
                  </View>
                  <View style={styles.playerIconsContainer}>
                    {Array.from({ length: Math.min(option.value, 5) }).map((_, i) => (
                      <Text key={i} style={styles.playerIcon}>👤</Text>
                    ))}
                    {option.value > 5 && (
                      <Text style={styles.morePlayersText}>+{option.value - 5}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                Appliquer {tempSelected && `(≤ ${tempSelected})`}
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
    color: '#1f2937',
    flex: 1,
    paddingRight: 12
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
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16
  },
  currentSelectionContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  currentSelectionLabel: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4
  },
  currentSelectionValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600'
  },
  optionsList: {
    flex: 1
  },
  optionsListContent: {
    paddingBottom: 16
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  optionItemSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  radioSelected: {
    borderColor: '#3b82f6'
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6'
  },
  optionTextContainer: {
    flex: 1
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 2
  },
  optionTextSelected: {
    color: '#1e40af',
    fontWeight: '600'
  },
  optionDescription: {
    fontSize: 12,
    color: '#6b7280'
  },
  playerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  playerIcon: {
    fontSize: 14,
    marginLeft: -4
  },
  morePlayersText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 4
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






