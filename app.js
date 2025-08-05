const SUPABASE_URL = 'https://mthmrtgksktvriyqlizt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10aG1ydGdrc2t0dnJpeXFsaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjY5NDQsImV4cCI6MjA2NjQ0Mjk0NH0.Pyq82ew0NhEnO2KcZeob0bpP9BYeZdEBTGPCoIjCH50';
const TABLE = 'notes';

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

let id = getQueryParam('id') || generateId();
if (!getQueryParam('id')) {
  history.replaceState(null, '', `?id=${id}`);
}
document.getElementById('page-title').textContent = `Quick Note: ${id}`;

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

fetchNote(id).then(note => {
  if (note?.content) {
    textarea.value = note.content;
  }
});

let timeout;
textarea.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    saveNote(id, textarea.value);
  }, 500);
});

// Toolbar elements
const toggleLockBtn = document.getElementById('toggle-lock');
const copyBtn = document.getElementById('copy-all');
const pasteBtn = document.getElementById('paste-replace');
const reloadBtn = document.getElementById('reload');

let isUnlocked = false;

function setButtonsState(enabled) {
  [pasteBtn, reloadBtn].forEach(btn => {
    btn.disabled = !enabled;
    btn.classList.toggle('bg-blue-600', enabled);
    btn.classList.toggle('bg-gray-400', !enabled);
    btn.classList.toggle('hover:bg-blue-700', enabled);
    btn.classList.toggle('cursor-not-allowed', !enabled);
  });
  textarea.readOnly = !enabled;
}

// Lock the textarea on initial load
setButtonsState(false);

toggleLockBtn.addEventListener('click', () => {
  isUnlocked = !isUnlocked;
  toggleLockBtn.textContent = isUnlocked ? 'Lock' : 'Unlock';
  setButtonsState(isUnlocked);
});

// Copy All
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(textarea.value).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy All'), 1000);
  });
});

// Paste & Replace
pasteBtn.addEventListener('click', async () => {
  const text = await navigator.clipboard.readText();
  textarea.value = text;
  saveNote(id, text); // Save immediately after replace
});

// Reload from DB
reloadBtn.addEventListener('click', async () => {
  const note = await fetchNote(id);
  if (note?.content !== undefined) {
    textarea.value = note.content;
  }
});
