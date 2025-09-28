import React from 'react';
import Link from 'next/link';

interface Participant {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  joined_at: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  role: 'host' | 'participant';
}

interface ParticipantCardProps {
  participant: Participant;
  showJoinDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ParticipantCard({ 
  participant, 
  showJoinDate = true, 
  size = 'md' 
}: ParticipantCardProps) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          avatar: 'w-8 h-8',
          avatarText: 'text-xs',
          name: 'text-sm',
          username: 'text-xs',
          role: 'text-xs',
          date: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-4',
          avatar: 'w-14 h-14',
          avatarText: 'text-lg',
          name: 'text-lg',
          username: 'text-sm',
          role: 'text-sm',
          date: 'text-sm'
        };
      default: // md
        return {
          container: 'p-3',
          avatar: 'w-10 h-10',
          avatarText: 'text-sm',
          name: 'text-base',
          username: 'text-sm',
          role: 'text-xs',
          date: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Link href={`/profile/${participant.profile.username}`} className="block">
      <div className={`flex items-center space-x-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all ${sizeClasses.container}`}>
        <div className={`${sizeClasses.avatar} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0`}>
          {participant.profile.avatar_url ? (
            <img
              src={participant.profile.avatar_url}
              alt={participant.profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className={`w-full h-full flex items-center justify-center text-white font-bold ${sizeClasses.avatarText}`}
              style={{ backgroundColor: `hsl(${participant.profile.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}
            >
              {getInitials(participant.profile.full_name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-gray-900 truncate ${sizeClasses.name}`}>
            {participant.profile.full_name}
          </h4>
          <p className={`text-gray-500 truncate ${sizeClasses.username}`}>
            @{participant.profile.username}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
              participant.role === 'host' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            } ${sizeClasses.role}`}>
              {participant.role === 'host' ? '👑 Hôte' : '👤 Participant'}
            </span>
            {showJoinDate && (
              <span className={`text-gray-400 ${sizeClasses.date}`}>
                {formatJoinDate(participant.joined_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

