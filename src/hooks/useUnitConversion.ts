import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { wallStore } from '../stores/wallStore';
import type { UnitSystem } from '../types';
import {
    formatWithUnit,
    fromMillimeters,
    getDefaultUnitForSystem,
    getUnitsForSystem,
    parseUserInput as parseInput,
    toMillimeters,
} from '../utils/unitConversion';

export function useUnitConversion() {
  const { wall, setDisplayUnit, setUnitSystem } = wallStore(
    useShallow((state) => ({
      wall: state.wall,
      setDisplayUnit: state.setDisplayUnit,
      setUnitSystem: state.setUnitSystem,
    }))
  );

  const currentUnit = wall.unitConfig.displayUnit;
  const currentSystem = wall.unitConfig.system;

  const toDisplay = useCallback(
    (valueMm: number) => {
      return fromMillimeters(valueMm, currentUnit);
    },
    [currentUnit]
  );

  const toBase = useCallback(
    (value: number) => {
      return toMillimeters(value, currentUnit);
    },
    [currentUnit]
  );

  const format = useCallback(
    (valueMm: number, decimals?: number) => {
      return formatWithUnit(valueMm, currentUnit, decimals);
    },
    [currentUnit]
  );

  const parseUserInput = useCallback(
    (input: string) => {
      return parseInput(input, currentUnit);
    },
    [currentUnit]
  );

  const getAvailableUnits = useCallback(() => {
    return getUnitsForSystem(currentSystem);
  }, [currentSystem]);

  const toggleSystem = useCallback(() => {
    const newSystem: UnitSystem = currentSystem === 'metric' ? 'imperial' : 'metric';
    const defaultUnit = getDefaultUnitForSystem(newSystem);
    setUnitSystem(newSystem);
    setDisplayUnit(defaultUnit);
  }, [currentSystem, setUnitSystem, setDisplayUnit]);

  return {
    toDisplay,
    toBase,
    format,
    parseUserInput,
    currentUnit,
    currentSystem,
    setUnit: setDisplayUnit,
    toggleSystem,
    getAvailableUnits,
  };
}
