import { describe, it, expect } from 'vitest';
import { bookingsOverlap } from '../lib/bookings.js';

describe('bookingsOverlap', () => {
  it('returns true for overlapping ranges on same venue', () => {
    expect(bookingsOverlap('2025-08-01', '2025-08-05', '2025-08-03', '2025-08-07')).toBe(true);
  });

  it('returns true when new range is fully inside existing', () => {
    expect(bookingsOverlap('2025-08-01', '2025-08-10', '2025-08-03', '2025-08-07')).toBe(true);
  });

  it('returns false for non-overlapping ranges', () => {
    expect(bookingsOverlap('2025-08-01', '2025-08-05', '2025-08-10', '2025-08-15')).toBe(false);
  });

  it('returns false for adjacent ranges (end = start of next)', () => {
    expect(bookingsOverlap('2025-08-01', '2025-08-05', '2025-08-05', '2025-08-10')).toBe(false);
  });

  it('returns false when new range ends before existing starts', () => {
    expect(bookingsOverlap('2025-08-10', '2025-08-15', '2025-08-01', '2025-08-05')).toBe(false);
  });
});
