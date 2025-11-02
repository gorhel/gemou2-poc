import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native'
import { router } from 'expo-router'

// Import des composants UI
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import {
  LoadingSpinner,
  LoadingCard,
  Skeleton,
  SkeletonCard,
  SkeletonTable
} from '../components/ui/Loading'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Toggle } from '../components/ui/Toggle'
import SmallPill from '../components/ui/SmallPill'

export default function ComponentsDemoPage() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [toggleValue, setToggleValue] = useState(false)
  const [selectValue, setSelectValue] = useState('')

  const handleButtonClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const selectOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' }
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎨 Composants UI Mobile</Text>
        <Text style={styles.subtitle}>
          Bibliothèque de composants pour l'application Gémou2
        </Text>
      </View>

      {/* Section Boutons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔘 Composant Button</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Variantes de Boutons</Text>
          <Text style={styles.cardDescription}>
            Différentes variantes pour s'adapter à tous les contextes
          </Text>
          
          <View style={styles.buttonGrid}>
            <Button variant="primary" onPress={() => {}}>Primary</Button>
            <Button variant="secondary" onPress={() => {}}>Secondary</Button>
            <Button variant="danger" onPress={() => {}}>Danger</Button>
            <Button variant="ghost" onPress={() => {}}>Ghost</Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Tailles de Boutons</Text>
          <View style={styles.buttonColumn}>
            <Button size="sm" onPress={() => {}}>Small Button</Button>
            <Button size="md" onPress={() => {}}>Medium Button</Button>
            <Button size="lg" onPress={() => {}}>Large Button</Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>États de Chargement</Text>
          <View style={styles.buttonColumn}>
            <Button
              loading={loading}
              onPress={handleButtonClick}
            >
              {loading ? 'Chargement...' : 'Cliquer pour charger'}
            </Button>
            <Button variant="secondary" loading>
              Bouton en chargement
            </Button>
            <Button disabled>Bouton désactivé</Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Bouton pleine largeur</Text>
          <Button fullWidth onPress={() => {}}>
            Bouton Full Width
          </Button>
        </Card>
      </View>

      {/* Section Cartes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Composant Card</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Carte Simple</Text>
          <Text style={styles.cardDescription}>
            Structure de base avec contenu personnalisable
          </Text>
          <CardContent>
            <Text style={styles.contentText}>
              Ceci est le contenu de la carte. Il peut contenir du texte,
              des images ou tout autre élément React Native.
            </Text>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Carte avec Actions</Text>
          <CardContent>
            <Text style={styles.contentText}>
              Une carte peut contenir des boutons et actions
            </Text>
            <Button size="sm" onPress={() => {}}>Action</Button>
          </CardContent>
        </Card>
      </View>

      {/* Section Formulaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Composants de Formulaire</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Champs de Saisie</Text>
          
          <View style={styles.formGroup}>
            <Input
              label="Nom complet"
              placeholder="Entrez votre nom"
              value={inputValue}
              onChangeText={setInputValue}
            />
          </View>

          <View style={styles.formGroup}>
            <Input
              label="Email"
              placeholder="votre@email.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Select & Toggle</Text>
          
          <View style={styles.formGroup}>
            <Select
              label="Sélectionnez une option"
              options={selectOptions}
              value={selectValue}
              onValueChange={setSelectValue}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Activer les notifications</Text>
              <Toggle
                value={toggleValue}
                onValueChange={setToggleValue}
              />
            </View>
          </View>
        </Card>
      </View>

      {/* Section Chargement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏳ États de Chargement</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Spinners</Text>
          <CardContent>
            <LoadingSpinner size="large" />
            <View style={styles.spacer} />
            <LoadingSpinner size="small" text="Chargement..." />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Carte de Chargement</Text>
          <LoadingCard text="Chargement des données..." />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Squelettes</Text>
          <SkeletonCard />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Table avec Squelettes</Text>
          <SkeletonTable rows={4} columns={3} />
        </Card>
      </View>

      {/* Section Pills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Composant SmallPill</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Badges et Pills</Text>
          <View style={styles.pillsContainer}>
            <SmallPill text="React Native" />
            <SmallPill text="TypeScript" />
            <SmallPill text="Expo" />
            <SmallPill text="Supabase" />
          </View>
        </Card>
      </View>

      {/* Section Modale */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Composant Modal</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Fenêtre Modale</Text>
          <Button onPress={() => setModalVisible(true)}>
            Ouvrir la modale
          </Button>
        </Card>
      </View>

      {/* Section Palette de Couleurs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Palette de Couleurs</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Couleurs Principales</Text>
          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.colorLabel}>Primary</Text>
              <Text style={styles.colorCode}>#3b82f6</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.colorLabel}>Secondary</Text>
              <Text style={styles.colorCode}>#8b5cf6</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.colorLabel}>Success</Text>
              <Text style={styles.colorCode}>#22c55e</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.colorLabel}>Warning</Text>
              <Text style={styles.colorCode}>#f59e0b</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.colorLabel}>Danger</Text>
              <Text style={styles.colorCode}>#ef4444</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.colorLabel}>Gray</Text>
              <Text style={styles.colorCode}>#6b7280</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Section Documentation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Documentation</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Utilisation des Composants</Text>
          <Text style={styles.cardDescription}>
            Tous les composants sont importables depuis le dossier components/ui/
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import { Button, Card, Input } from '../components/ui';\n\n<Button variant="primary" onPress={handleClick}>\n  Cliquez-moi\n</Button>`}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Bonnes Pratiques</Text>
          <View style={styles.practiceItem}>
            <Text style={styles.practiceIcon}>✅</Text>
            <View style={styles.practiceContent}>
              <Text style={styles.practiceTitle}>Utilisez les variantes</Text>
              <Text style={styles.practiceText}>
                Choisissez la bonne variante selon le contexte
              </Text>
            </View>
          </View>
          <View style={styles.practiceItem}>
            <Text style={styles.practiceIcon}>✅</Text>
            <View style={styles.practiceContent}>
              <Text style={styles.practiceTitle}>Mobile-first</Text>
              <Text style={styles.practiceText}>
                Concevez d'abord pour mobile, optimisez ensuite
              </Text>
            </View>
          </View>
          <View style={styles.practiceItem}>
            <Text style={styles.practiceIcon}>✅</Text>
            <View style={styles.practiceContent}>
              <Text style={styles.practiceTitle}>Accessibilité</Text>
              <Text style={styles.practiceText}>
                Pensez aux utilisateurs avec besoins spécifiques
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Padding bottom */}
      <View style={styles.bottomPadding} />

      {/* Modal Example */}
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Exemple de Modale"
      >
        <Text style={styles.modalText}>
          Ceci est une modale d'exemple. Elle peut contenir n'importe quel contenu React Native.
        </Text>
        <Button onPress={() => setModalVisible(false)}>
          Fermer
        </Button>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  section: {
    padding: 16,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  card: {
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20
  },
  buttonGrid: {
    gap: 12
  },
  buttonColumn: {
    gap: 12
  },
  formGroup: {
    marginBottom: 16
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  toggleLabel: {
    fontSize: 16,
    color: '#111827'
  },
  spacer: {
    height: 20
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between'
  },
  colorItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16
  },
  colorBox: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: 8
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4
  },
  colorCode: {
    fontSize: 12,
    color: '#6b7280'
  },
  codeBlock: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#1f2937',
    lineHeight: 18
  },
  practiceItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  practiceIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2
  },
  practiceContent: {
    flex: 1
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  practiceText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  contentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12
  },
  modalText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 20
  },
  bottomPadding: {
    height: 40
  }
})

