// ── Auth guard (include on every inner page) ──────────────────────────────
function requireAuth() {
  if (!sessionStorage.getItem('whanau_auth')) {
    window.location.href = 'index.html';
  }
}

function getUser() {
  return {
    name:     sessionStorage.getItem('whanau_name') || 'Whānau',
    relation: sessionStorage.getItem('whanau_relation') || '',
    detail:   sessionStorage.getItem('whanau_detail') || '',
  };
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ── Shared header renderer ────────────────────────────────────────────────
function renderHeader(activePage) {
  const user = getUser();
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

// ── Bookings data store (sessionStorage-backed) ───────────────────────────
function getBookings() {
  const raw = localStorage.getItem('whanau_bookings');
  return raw ? JSON.parse(raw) : [
    { id: 1, venue: 'hall',         date: '2025-08-02', name: 'Tūhoe Reunion',        bookedBy: 'Hemi Tūhoe' },
    { id: 2, venue: 'meetinghouse', date: '2025-08-09', name: 'Karakia & Hui',         bookedBy: 'Aroha Ngāti' },
    { id: 3, venue: 'hall',         date: '2025-08-16', name: 'Birthday Celebration',  bookedBy: 'Rangi Pakahi' },
    { id: 4, venue: 'meetinghouse', date: '2025-08-23', name: 'Whakapapa Workshop',    bookedBy: 'Mere Tūhoe' },
  ];
}

function saveBookings(bookings) {
  localStorage.setItem('whanau_bookings', JSON.stringify(bookings));
}

// ── Announcements data ────────────────────────────────────────────────────
const ANNOUNCEMENTS = [
  {
    id: 1,
    date: '2025-07-28',
    title: 'Annual Whānau Hui — Save the Date',
    body: 'Our annual gathering will be held on 23 August 2025 at the meeting house. All whānau are warmly invited. Bring a plate!',
    tag: 'event',
  },
  {
    id: 2,
    date: '2025-07-20',
    title: 'Hall Maintenance — Closed 5–6 Aug',
    body: 'The hall will be closed for roof repairs on 5 and 6 August. Please plan bookings accordingly.',
    tag: 'urgent',
  },
  {
    id: 3,
    date: '2025-07-15',
    title: 'Whakapapa Records Update',
    body: 'New records have been added to the family tree. Check the Whakapapa page to see the latest additions from the Tūhoe branch.',
    tag: 'info',
  },
  {
    id: 4,
    date: '2025-07-01',
    title: 'Scholarship Applications Open',
    body: 'Applications for the Ngāti Pakahi education scholarship are now open. Contact the secretary for the application form.',
    tag: 'info',
  },
];
