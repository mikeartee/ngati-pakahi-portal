/**
 * Pure function: returns true if two booking date ranges overlap.
 * Adjacent bookings (newStart === existingEnd) are NOT considered overlapping.
 * @param {string} existingStart - ISO date string
 * @param {string} existingEnd   - ISO date string
 * @param {string} newStart      - ISO date string
 * @param {string} newEnd        - ISO date string
 * @returns {boolean}
 */
export function bookingsOverlap(existingStart, existingEnd, newStart, newEnd) {
  return existingStart < newEnd && existingEnd > newStart;
}
