/**
 * Given a list of people and a newly inserted person,
 * returns the updated list with orphan children linked to the new person.
 * A child is an orphan if parent_id is null but parent_name matches the new person's name.
 * Matching is case-insensitive. Already-linked children (parent_id !== null) are not modified.
 *
 * @param {Array} people     - Full list of person objects
 * @param {Object} newPerson - The newly registered person { id, name, ... }
 * @returns {Array} Updated list of people
 */
export function linkOrphanChildren(people, newPerson) {
  return people.map(p => {
    if (p.parent_id === null && p.parent_name &&
        p.parent_name.toLowerCase() === newPerson.name.toLowerCase() &&
        p.id !== newPerson.id) {
      return { ...p, parent_id: newPerson.id };
    }
    return p;
  });
}

/**
 * Given a list of people and the current user's whakapapa id,
 * returns the set of person ids the current user is allowed to edit.
 * Editable: self, parent, children, siblings (same parent_id, not self).
 *
 * @param {Array} people        - Full list of person objects
 * @param {number} currentUserId - The id of the currently logged-in person
 * @returns {Set<number>} Set of editable person ids
 */
export function getEditableIds(people, currentUserId) {
  const currentUser = people.find(p => p.id === currentUserId);
  if (!currentUser) return new Set();

  const editable = new Set();
  editable.add(currentUserId); // self

  // parent
  if (currentUser.parent_id !== null) {
    editable.add(currentUser.parent_id);
  }

  people.forEach(p => {
    // children
    if (p.parent_id === currentUserId) {
      editable.add(p.id);
    }
    // siblings (same non-null parent_id, not self)
    if (p.id !== currentUserId &&
        p.parent_id !== null &&
        p.parent_id === currentUser.parent_id) {
      editable.add(p.id);
    }
  });

  return editable;
}
