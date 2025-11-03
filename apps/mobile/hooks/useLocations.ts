/**
 * Hook pour gérer l'autocomplétion des localisations
 * depuis la table locations (district, city)
 * Version Mobile (React Native)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib'

export interface Location {
  id: string
  district: string
  city: string
  postal_code: string | null
  latitude: number | null
  longitude: number | null
}

export interface LocationOption {
  id: string
  district: string
  city: string
  label: string // Format: "District, City"
  postal_code: string | null
}

interface UseLocationsReturn {
  locations: LocationOption[]
  loading: boolean
  error: string | null
  searchLocations: (query: string) => Promise<void>
}

/**
 * Hook pour rechercher et filtrer les localisations
 * @param initialQuery Requête initiale (optionnel)
 * @param limit Nombre maximum de résultats (défaut: 10)
 */
export function useLocations(
  initialQuery = '',
  limit = 10
): UseLocationsReturn {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchLocations = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setLocations([])
        return
      }

      try {
        setLoading(true)
        setError(null)

        const searchTerm = query.trim().toLowerCase()

        // Recherche dans district OU city
        const { data, error: searchError } = await supabase
          .from('locations')
          .select('id, district, city, postal_code')
          .or(`district.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
          .order('district', { ascending: true })
          .limit(limit)

        if (searchError) {
          throw searchError
        }

        // Transformer les résultats en LocationOption
        const options: LocationOption[] = (data || []).map((loc) => ({
          id: loc.id,
          district: loc.district,
          city: loc.city,
          label: `${loc.district}, ${loc.city}`,
          postal_code: loc.postal_code
        }))

        setLocations(options)
      } catch (err: any) {
        console.error('Erreur lors de la recherche de localisations:', err)
        setError(err.message || 'Erreur lors de la recherche')
        setLocations([])
      } finally {
        setLoading(false)
      }
    },
    [limit]
  )

  // Recherche initiale si une requête est fournie
  useEffect(() => {
    if (initialQuery) {
      searchLocations(initialQuery)
    }
  }, [initialQuery, searchLocations])

  return {
    locations,
    loading,
    error,
    searchLocations
  }
}

/**
 * Hook simplifié pour récupérer toutes les villes uniques
 */
export function useCities(): {
  cities: string[]
  loading: boolean
  error: string | null
} {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('city')
          .order('city', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        // Extraire les villes uniques
        const uniqueCities = Array.from(
          new Set((data || []).map((loc) => loc.city))
        )
        setCities(uniqueCities)
      } catch (err: any) {
        console.error('Erreur lors de la récupération des villes:', err)
        setError(err.message || 'Erreur lors de la récupération')
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  return { cities, loading, error }
}

/**
 * Hook pour récupérer les districts d'une ville spécifique
 */
export function useDistrictsByCity(city: string | null): {
  districts: string[]
  loading: boolean
  error: string | null
} {
  const [districts, setDistricts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!city) {
      setDistricts([])
      return
    }

    async function fetchDistricts() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('district')
          .eq('city', city)
          .order('district', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        const districtList = (data || []).map((loc) => loc.district)
        setDistricts(districtList)
      } catch (err: any) {
        console.error('Erreur lors de la récupération des districts:', err)
        setError(err.message || 'Erreur lors de la récupération')
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
  }, [city])

  return { districts, loading, error }
}

