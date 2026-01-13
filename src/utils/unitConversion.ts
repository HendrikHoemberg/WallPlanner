import type { Unit } from '../types';

// Conversion factors TO millimeters
const TO_MM: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
};

// Convert any unit to base unit (mm)
export function toMillimeters(value: number, unit: Unit): number {
  return value * TO_MM[unit];
}

// Convert from base unit (mm) to display unit
export function fromMillimeters(valueMm: number, unit: Unit): number {
  return valueMm / TO_MM[unit];
}

// Format value with unit label
export function formatWithUnit(
  valueMm: number,
  unit: Unit,
  decimals: number = 2
): string {
  const converted = fromMillimeters(valueMm, unit);
  return `${converted.toFixed(decimals)}${unit}`;
}

// Get available units
export function getAvailableUnits(): Unit[] {
  return ['mm', 'cm', 'm'];
}

// Parse user input string to mm
export function parseUserInput(input: string, currentUnit: Unit): number | null {
  const trimmed = input.trim();

  // Try to extract number and unit from input
  const match = trimmed.match(/^([\d.]+)\s*([a-z%]+)?$/i);

  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);

  if (isNaN(value)) {
    return null;
  }

  // If unit is specified in input, use it; otherwise use current unit
  const unit = match[2]?.toLowerCase() as Unit | undefined;

  if (unit && unit in TO_MM) {
    return toMillimeters(value, unit);
  }

  // Use current unit if no unit specified
  return toMillimeters(value, currentUnit);
}
