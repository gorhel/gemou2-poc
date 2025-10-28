import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Button } from '../ui/Button';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  image_url?: string;
  status: string;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onJoinEvent?: (eventId: string) => void;
  onParticipationChange?: () => void;
}

export default function EventCard({ event, onViewDetails, onJoinEvent, onParticipationChange }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const { date, time } = formatDate(event.date_time);
  
  const actualParticipantsCount = event.current_participants;
  const isFull = actualParticipantsCount >= event.max_participants;
  const spotsLeft = event.max_participants - actualParticipantsCount;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'; // green-500
      case 'cancelled':
        return '#ef4444'; // red-500
      case 'completed':
        return '#6b7280'; // gray-500
      default:
        return '#6b7280';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onViewDetails(event)}
      activeOpacity={0.9}
      className="relative h-48 rounded-lg overflow-hidden mb-4"
    >
      {/* Image de fond */}
      <ImageBackground
        source={{ uri: event.image_url || 'https://via.placeholder.com/400x200' }}
        className="absolute inset-0"
        resizeMode="cover"
      >
        {/* Overlay sombre */}
        <View className="absolute inset-0 bg-black/40" />
        
        {/* Contenu en bas */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          {/* Titre principal */}
          <Text className="text-lg font-bold mb-1 text-white" numberOfLines={1}>
            {event.title}
          </Text>
          
          {/* Informations */}
          <View className="space-y-1">
            <View className="flex-row items-center space-x-2">
              <Text className="text-white text-sm">📅</Text>
              <Text className="text-white text-sm">{date}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-white text-sm">🕐</Text>
              <Text className="text-white text-sm">{time}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-white text-sm">📍</Text>
              <Text className="text-white text-sm" numberOfLines={1}>{event.location}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-white text-sm">👥</Text>
              <Text className="text-white text-sm">
                {actualParticipantsCount}/{event.max_participants} participants
              </Text>
              {isFull ? (
                <Text className="text-red-300 text-sm font-medium">• Complet</Text>
              ) : (
                <Text className="text-green-300 text-sm font-medium">
                  • {spotsLeft} place{spotsLeft > 1 ? 's' : ''} restante{spotsLeft > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Indicateur de statut */}
        <View 
          className="absolute top-3 right-3 w-3 h-3 rounded-full" 
          style={{ backgroundColor: getStatusColor(event.status) }}
        />
      </ImageBackground>
    </TouchableOpacity>
  );
}

