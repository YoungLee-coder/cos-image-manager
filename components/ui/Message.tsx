import React from 'react';
import { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  onClose?: () => void;
}

export function Message({ message, onClose }: MessageProps) {
  const bgColor = message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span>{message.text}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-sm font-medium hover:opacity-75"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
} 