const SUPABASE_URL = 'https://mthmrtgksktvriyqlizt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10aG1ydGdrc2t0dnJpeXFsaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjY5NDQsImV4cCI6MjA2NjQ0Mjk0NH0.Pyq82ew0NhEnO2KcZeob0bpP9BYeZdEBTGPCoIjCH50';
const TABLE = 'notes';

const id = location.pathname.split('/').pop() || generateId();
const textarea = document.getElementById('note');

function generateId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function fetchNote(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const data = await res.json();
  return data[0];
}

async function saveNote(id, content) {
  await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ id, content })
  });
}

if (!location.pathname.endsWith(id)) {
  history.replaceState(null, '', location.pathname + id);
}

fetchNote(id).then(note => {
  if (note?.content) {
    textarea.value = note.content;
  }
});

var timeout;
textarea.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    saveNote(id, textarea.value);
  }, 500);
});
