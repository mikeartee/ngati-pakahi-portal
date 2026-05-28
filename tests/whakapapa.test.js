import { describe, it, expect } from 'vitest';
import { linkOrphanChildren, getEditableIds } from '../lib/whakapapa.js';

// Sample tree:
// 1: Peti (root)
// 2: Rangi (parent_id: 1)
// 3: Mere (parent_id: 1)  <- sibling of Rangi
// 4: Tuhoe (parent_id: 2) <- child of Rangi
// 5: Aroha (parent_id: 2) <- child of Rangi, sibling of Tuhoe
// 6: Koha (parent_id: 3)  <- child of Mere, cousin of Tuhoe

const people = [
  { id: 1, name: 'Peti',  parent_id: null, parent_name: null },
  { id: 2, name: 'Rangi', parent_id: 1,    parent_name: 'Peti' },
  { id: 3, name: 'Mere',  parent_id: 1,    parent_name: 'Peti' },
  { id: 4, name: 'Tuhoe', parent_id: 2,    parent_name: 'Rangi' },
  { id: 5, name: 'Aroha', parent_id: 2,    parent_name: 'Rangi' },
  { id: 6, name: 'Koha',  parent_id: 3,    parent_name: 'Mere' },
];

describe('linkOrphanChildren', () => {
  it('links orphan children when parent registers', () => {
    const orphans = [
      { id: 10, name: 'NewChild', parent_id: null, parent_name: 'NewParent' },
      { id: 11, name: 'Other',    parent_id: null, parent_name: 'SomeoneElse' },
    ];
    const newParent = { id: 99, name: 'NewParent', parent_id: null, parent_name: null };
    const result = linkOrphanChildren([...orphans, newParent], newParent);
    const linked = result.find(p => p.id === 10);
    expect(linked.parent_id).toBe(99);
  });

  it('does not link children whose parent_name does not match', () => {
    const orphans = [
      { id: 10, name: 'NewChild', parent_id: null, parent_name: 'DifferentName' },
    ];
    const newParent = { id: 99, name: 'NewParent', parent_id: null, parent_name: null };
    const result = linkOrphanChildren([...orphans, newParent], newParent);
    expect(result.find(p => p.id === 10).parent_id).toBeNull();
  });

  it('is case-insensitive when matching parent names', () => {
    const orphans = [
      { id: 10, name: 'Child', parent_id: null, parent_name: 'newparent' },
    ];
    const newParent = { id: 99, name: 'NewParent', parent_id: null, parent_name: null };
    const result = linkOrphanChildren([...orphans, newParent], newParent);
    expect(result.find(p => p.id === 10).parent_id).toBe(99);
  });

  it('does not modify already-linked children', () => {
    const linked = [
      { id: 10, name: 'Child', parent_id: 5, parent_name: 'NewParent' },
    ];
    const newParent = { id: 99, name: 'NewParent', parent_id: null, parent_name: null };
    const result = linkOrphanChildren([...linked, newParent], newParent);
    expect(result.find(p => p.id === 10).parent_id).toBe(5);
  });
});

describe('getEditableIds', () => {
  it('includes self', () => {
    const ids = getEditableIds(people, 2); // Rangi
    expect(ids.has(2)).toBe(true);
  });

  it('includes parent', () => {
    const ids = getEditableIds(people, 2); // Rangi, parent is Peti (1)
    expect(ids.has(1)).toBe(true);
  });

  it('includes children', () => {
    const ids = getEditableIds(people, 2); // Rangi, children are Tuhoe (4) and Aroha (5)
    expect(ids.has(4)).toBe(true);
    expect(ids.has(5)).toBe(true);
  });

  it('includes siblings', () => {
    const ids = getEditableIds(people, 2); // Rangi, sibling is Mere (3)
    expect(ids.has(3)).toBe(true);
  });

  it('excludes cousins', () => {
    const ids = getEditableIds(people, 4); // Tuhoe, cousin is Koha (6)
    expect(ids.has(6)).toBe(false);
  });

  it('excludes unrelated members', () => {
    const ids = getEditableIds(people, 4); // Tuhoe
    expect(ids.has(1)).toBe(false); // Peti (grandparent) not editable
  });

  it('returns empty set for unknown user', () => {
    const ids = getEditableIds(people, 999);
    expect(ids.size).toBe(0);
  });
});
