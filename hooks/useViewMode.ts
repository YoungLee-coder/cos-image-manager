import { useState } from 'react';
import { ViewMode } from '../types';

export function useViewMode(defaultMode: ViewMode = 'grid') {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  return {
    viewMode,
    setViewMode,
  };
} 