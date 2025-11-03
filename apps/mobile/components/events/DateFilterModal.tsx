import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'

interface DateFilterModalProps {
  visible: boolean
  onClose: () => void
  startDate: Date | null
  endDate: Date | null
  onApply: (startDate: Date | null, endDate: Date | null) => void
}

export default function DateFilterModal({
  visible,
  onClose,
  startDate,
  endDate,
  onApply
}: DateFilterModalProps) {
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate)
  const [selectingStartDate, setSelectingStartDate] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (visible) {
      setTempStartDate(startDate)
      setTempEndDate(endDate)
      setSelectingStartDate(true)
      setCurrentMonth(startDate || new Date())
    }
  }, [visible, startDate, endDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const handleDateSelect = (date: Date) => {
    if (selectingStartDate) {
      setTempStartDate(date)
      setSelectingStartDate(false)
      // Si la date de fin est avant la nouvelle date de début, la réinitialiser
      if (tempEndDate && date > tempEndDate) {
        setTempEndDate(null)
      }
    } else {
      // Si on sélectionne une date de fin avant la date de début, inverser
      if (tempStartDate && date < tempStartDate) {
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
      } else {
        setTempEndDate(date)
      }
    }
  }

  const isDateInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const startOnly = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate())
    const endOnly = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate())
    return dateOnly >= startOnly && dateOnly <= endOnly
  }

  const isDateSelected = (date: Date) => {
    if (!tempStartDate && !tempEndDate) return false
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (tempStartDate) {
      const startOnly = new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate())
      if (dateOnly.getTime() === startOnly.getTime()) return true
    }
    
    if (tempEndDate) {
      const endOnly = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate())
      if (dateOnly.getTime() === endOnly.getTime()) return true
    }
    
    return false
  }

  const handleApply = () => {
    onApply(tempStartDate, tempEndDate)
    onClose()
  }

  const handleReset = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    setSelectingStartDate(true)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Non définie'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const days: React.ReactElement[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Jours de semaine
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const weekDayHeaders = weekDays.map(day => (
      <View key={day} style={styles.weekDayHeader}>
        <Text style={styles.weekDayText}>{day}</Text>
      </View>
    ))

    // Espaces vides avant le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />)
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isPast = date < today
      const isSelected = isDateSelected(date)
      const inRange = isDateInRange(date)

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            inRange && !isSelected && styles.dayCellInRange,
            isPast && styles.dayCellPast
          ]}
          onPress={() => !isPast && handleDateSelect(date)}
          disabled={isPast}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.dayTextSelected,
            inRange && !isSelected && styles.dayTextInRange,
            isPast && styles.dayTextPast
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      )
    }

    return (
      <View>
        <View style={styles.weekDayRow}>{weekDayHeaders}</View>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    )
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
            <Text style={styles.title}>📅 Filtrer par date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Selection Info */}
            <View style={styles.dateInfoContainer}>
              <View style={styles.dateInfoItem}>
                <Text style={styles.dateInfoLabel}>Date de début</Text>
                <Text style={[
                  styles.dateInfoValue,
                  !tempStartDate && styles.dateInfoValueEmpty
                ]}>
                  {formatDate(tempStartDate)}
                </Text>
              </View>
              <Text style={styles.dateInfoSeparator}>→</Text>
              <View style={styles.dateInfoItem}>
                <Text style={styles.dateInfoLabel}>Date de fin</Text>
                <Text style={[
                  styles.dateInfoValue,
                  !tempEndDate && styles.dateInfoValueEmpty
                ]}>
                  {formatDate(tempEndDate)}
                </Text>
              </View>
            </View>

            {/* Current Selection Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {selectingStartDate 
                  ? '👆 Sélectionnez la date de début'
                  : '👆 Sélectionnez la date de fin'}
              </Text>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            {renderCalendar()}
          </ScrollView>

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
                Appliquer
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
    maxHeight: '90%',
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
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  dateInfoItem: {
    flex: 1
  },
  dateInfoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  dateInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  dateInfoValueEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  dateInfoSeparator: {
    fontSize: 20,
    color: '#3b82f6',
    marginHorizontal: 12
  },
  statusContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 16
  },
  statusText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center'
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  monthButtonText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize'
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  weekDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4
  },
  dayCellSelected: {
    backgroundColor: '#3b82f6'
  },
  dayCellInRange: {
    backgroundColor: '#dbeafe'
  },
  dayCellPast: {
    opacity: 0.3
  },
  dayText: {
    fontSize: 14,
    color: '#1f2937'
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: 'bold'
  },
  dayTextInRange: {
    color: '#1e40af',
    fontWeight: '600'
  },
  dayTextPast: {
    color: '#9ca3af'
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

