import React from 'react';

interface UserAvatarProps {
    name: string;
    imageUrl?: string | null;
    isOnline?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ name, imageUrl, isOnline, size = 'md' }: UserAvatarProps) {
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getColors = (name: string) => {
        const colors = [
            'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        if (!name) return colors[0];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    const indicatorClasses = {
        sm: 'w-2 h-2 border-2',
        md: 'w-2.5 h-2.5 border-2',
        lg: 'w-3 h-3 border-2'
    };

    return (
        <div className="relative inline-block shrink-0">
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className={`${sizeClasses[size]} rounded-full object-cover shadow-sm ring-1 ring-border`}
                />
            ) : (
                <div className={`${sizeClasses[size]} ${getColors(name)} rounded-full flex items-center justify-center text-white font-medium shadow-sm ring-1 ring-border/50`}>
                    {getInitials(name)}
                </div>
            )}
            
            {isOnline && (
                <span className={`absolute bottom-0 right-0 ${indicatorClasses[size]} bg-green-500 border-background rounded-full`} />
            )}
        </div>
    );
}
