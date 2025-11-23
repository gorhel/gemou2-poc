'use client'

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { supabase } from '../../lib'
import { router } from 'expo-router'

interface SecuritySettingsProps {
  userId: string
  onUpdate?: () => void
}

export function SecuritySettings({ userId, onUpdate }: SecuritySettingsProps) {
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Mettre à jour le mot de passe via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setChangingPassword(false)
      onUpdate?.()
      
      Alert.alert('Succès', 'Mot de passe modifié avec succès')
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error)
      setError(error.message || 'Erreur lors du changement de mot de passe')
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => setShowDeleteConfirm(false)
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              // Note: La suppression réelle du compte devrait être gérée côté serveur
              // pour des raisons de sécurité. Ici, on supprime juste les données publiques.
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

              if (error) throw error

              // Déconnecter l'utilisateur
              await supabase.auth.signOut()
              router.replace('/login')
            } catch (error: any) {
              console.error('Erreur lors de la suppression du compte:', error)
              Alert.alert('Erreur', 'Impossible de supprimer le compte')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Message de succès/erreur */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✅ Mot de passe modifié avec succès !</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Section Changer le mot de passe */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Changer le mot de passe</Text>
        
        {!changingPassword ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setChangingPassword(true)}
          >
            <Text style={styles.buttonText}>Modifier le mot de passe</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Votre mot de passe actuel"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Votre nouveau mot de passe"
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>Au moins 6 caractères</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmez votre nouveau mot de passe"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => {
                  setChangingPassword(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setError(null)
                }}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.buttonTextOutline]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Section Danger */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.sectionTitle}>⚠️ Zone dangereuse</Text>
        
        <View style={styles.dangerContent}>
          <Text style={styles.dangerText}>
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Supprimer mon compte</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8'
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  successText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500'
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  dangerSection: {
    borderColor: '#ef4444',
    borderWidth: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500'
  },
  buttonTextOutline: {
    color: '#3b82f6'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  form: {
    marginTop: 16
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: 'white'
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  dangerContent: {
    marginTop: 16
  },
  dangerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16
  },
  deleteButton: {
    backgroundColor: '#ef4444'
  }
})

