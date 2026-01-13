import { useCallback } from 'react';
import { useFrameStore } from '../stores/frameStore';
import { useUIStore } from '../stores/uiStore';
import { wallStore } from '../stores/wallStore';
import type { ProjectData } from '../types';
import { loadProject, saveProject } from '../utils/storage';

const STORAGE_DEBOUNCE_MS = 1000;

export function useProjectPersistence() {
  const save = useCallback(() => {
    const wallState = wallStore.getState();
    const uiState = useUIStore.getState();
    const frameState = useFrameStore.getState();

    const projectData: ProjectData = {
      version: '1.0.0',
      wall: wallState.wall,
      frameTemplates: frameState.templates,
      frameInstances: frameState.instances,
      viewport: uiState.viewport,
      lastSaved: Date.now(),
    };

    saveProject(projectData);
  }, []);

  const load = useCallback((): ProjectData | null => {
    return loadProject();
  }, []);

  const clear = useCallback(() => {
    wallStore.getState().resetWall();
    useFrameStore.setState({ templates: [], instances: [] });
    useUIStore.getState().resetViewport();
  }, []);

  return {
    save,
    load,
    clear,
    debounceMs: STORAGE_DEBOUNCE_MS,
  };
}
