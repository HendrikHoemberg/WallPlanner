import type { Unit, UnitSystem } from '../types';

// Conversion factors TO millimeters
const TO_MM: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
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

// Get available units for a unit system
export function getUnitsForSystem(system: UnitSystem): Unit[] {
  if (system === 'metric') {
    return ['mm', 'cm', 'm'];
  }
  return ['in', 'ft'];
}

// Get appropriate default unit for a system
export function getDefaultUnitForSystem(system: UnitSystem): Unit {
  if (system === 'metric') {
    return 'cm';
  }
  return 'in';
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

// Check if a unit is metric
export function isMetricUnit(unit: Unit): boolean {
  return ['mm', 'cm', 'm'].includes(unit);
}

// Get the system for a unit
export function getSystemForUnit(unit: Unit): UnitSystem {
  return isMetricUnit(unit) ? 'metric' : 'imperial';
}
