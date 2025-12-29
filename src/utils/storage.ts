import { STORAGE_KEY } from '../constants';
import type { ProjectData } from '../types';

export function saveProject(data: ProjectData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save project:', error);
  }
}

export function loadProject(): ProjectData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as ProjectData;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

export function clearProject(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear project:', error);
  }
}

export function hasProject(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check project:', error);
    return false;
  }
}
