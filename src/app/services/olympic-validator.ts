import { Olympic } from '@models/olympic.model';
import { Participation } from '@models/participation.model';

const INVALID_DATA_MESSAGE = 'Invalid Olympic data';

export function validateOlympics(data: unknown): Olympic[] {
  if (!isOlympicArray(data) || hasDuplicateIds(data)) {
    throw new Error(INVALID_DATA_MESSAGE);
  }
  return data;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isParticipation(value: unknown): value is Participation {
  return isObject(value)
    && Number.isInteger(value['id'])
    && Number.isInteger(value['year'])
    && isNonEmptyString(value['city'])
    && isNonNegativeInteger(value['medalsCount'])
    && isNonNegativeInteger(value['athleteCount']);
}

function isOlympic(value: unknown): value is Olympic {
  return isObject(value)
    && Number.isInteger(value['id'])
    && isNonEmptyString(value['country'])
    && isParticipationArray(value['participations']);
}

function isOlympicArray(value: unknown): value is Olympic[] {
  return Array.isArray(value) && value.every(isOlympic);
}

function isParticipationArray(value: unknown): value is Participation[] {
  return Array.isArray(value) && value.every(isParticipation);
}

function hasDuplicateIds(olympics: Olympic[]): boolean {
  return new Set(olympics.map((olympic: Olympic): number => olympic.id)).size !== olympics.length;
}
