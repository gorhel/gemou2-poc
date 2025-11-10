'use client'

import React from 'react'

interface Tag {
  id: string
  name: string
  color?: string
}

interface EventTagsProps {
  tags: Tag[]
  className?: string
}

export default function EventTags({ tags, className = '' }: EventTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800 border-2 border-pink-300"
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}
