'use client'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Tag {
  id: string
  name: string
  color?: string
}

interface EventTagsProps {
  tags: Tag[]
  style?: any
}

export default function EventTags({ tags, style }: EventTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <View style={[styles.descriptionContainer, style]}>
      <Text style={styles.descriptionTitle}>🏷️ Tags</Text>
      <View style={styles.badgesContainer}>
        {tags.map((tag) => (
          <View key={tag.id} style={styles.badge}>
            <Text style={styles.badgeText}>{tag.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#fce7f3',
    borderWidth: 2,
    borderColor: '#f9a8d4'
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9f1239'
  }
})
