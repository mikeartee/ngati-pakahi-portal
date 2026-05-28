// ── Auth guard (include on every inner page) ──────────────────────────────
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
  }
}

async function getUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { name: 'Whānau', birth_year: null, death_year: null, parent_id: null };

  const { data, error } = await supabase
    .from('whakapapa')
    .select('name, birth_year, death_year, parent_id')
    .eq('auth_user_id', session.user.id)
    .limit(1)
    .single();

  if (error || !data) return { name: 'Whānau', birth_year: null, death_year: null, parent_id: null };
  return data;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ── Shared header renderer ────────────────────────────────────────────────
async function renderHeader(activePage) {
  const user = await getUser();
  const pages = [
    { href: 'home.html',       label: 'Kāinga',     key: 'home' },
    { href: 'whakapapa.html',  label: 'Whakapapa',  key: 'whakapapa' },
    { href: 'bookings.html',   label: 'Bookings',   key: 'bookings' },
  ];
  const navLinks = pages.map(p =>
    `<a href="${p.href}" class="${p.key === activePage ? 'active' : ''}">${p.label}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="koru-border"></div>
    <header>
      <div class="header-inner">
        <div>
          <div class="site-title">🌿 Ngāti Pakahi O Manga Iti</div>
          <div class="site-subtitle">Nau mai, ${user.name}</div>
        </div>
        <nav>
          ${navLinks}
          <a href="#" onclick="logout();return false;" style="opacity:0.7">Sign out</a>
        </nav>
      </div>
    </header>
  `);
}

// ── Bookings data store (Supabase-backed) ────────────────────────────────

/**
 * Pure function: returns true if two booking date ranges overlap.
 * Adjacent bookings (newStart === existingEnd) are NOT considered overlapping.
 * @param {string} existingStart - ISO date string
 * @param {string} existingEnd   - ISO date string
 * @param {string} newStart      - ISO date string
 * @param {string} newEnd        - ISO date string
 * @returns {boolean}
 */
function bookingsOverlap(existingStart, existingEnd, newStart, newEnd) {
  return existingStart < newEnd && existingEnd > newStart;
}

async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) { console.error('getBookings error:', error); return []; }
  return data;
}

async function saveBookings(bookings) {
  // Upsert the full list — callers pass the mutated array after push/filter
  const { error } = await supabase
    .from('bookings')
    .upsert(bookings, { onConflict: 'id' });
  if (error) console.error('saveBookings error:', error);
}

// ── Announcements data (Supabase-backed) ──────────────────────────────────
async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('getAnnouncements error:', error); return []; }
  return data;
}

// ── Whakapapa / family data (Supabase-backed) ─────────────────────────────
async function getFamilyData() {
  const { data, error } = await supabase
    .from('whakapapa')
    .select('*')
    .order('id', { ascending: true });
  if (error) { console.error('getFamilyData error:', error); return []; }
  return data;
}

async function saveFamilyData(data) {
  const { error } = await supabase
    .from('whakapapa')
    .upsert(data, { onConflict: 'id' });
  if (error) console.error('saveFamilyData error:', error);
}
