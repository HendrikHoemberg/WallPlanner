import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { wallStore } from '../stores/wallStore';
import {
    formatWithUnit,
    fromMillimeters,
    getAvailableUnits,
    parseUserInput as parseInput,
    toMillimeters,
} from '../utils/unitConversion';

export function useUnitConversion() {
  const { wall, setDisplayUnit } = wallStore(
    useShallow((state) => ({
      wall: state.wall,
      setDisplayUnit: state.setDisplayUnit,
    }))
  );

  const currentUnit = wall.unitConfig.displayUnit;

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

  const getUnits = useCallback(() => {
    return getAvailableUnits();
  }, []);

  return {
    toDisplay,
    toBase,
    format,
    parseUserInput,
    currentUnit,
    setUnit: setDisplayUnit,
    getAvailableUnits: getUnits,
  };
}
