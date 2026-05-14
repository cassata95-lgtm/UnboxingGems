// ── Your Google Maps List Links ───────────────────────────────────────────────
// HOW TO CREATE:
//   1. Open Google Maps on your phone or desktop
//   2. Tap "Saved" → "New list" → name it (e.g. "Hidden Waterfalls of SE Asia")
//   3. Search each destination and tap "Save" → choose your list
//   4. Open the list → tap Share → copy the link
//   5. Paste each link below
const MAPS_LISTS = {
  1: 'https://maps.app.goo.gl/czn1aY78JmEcM9LT9?g_st=i',
  2: 'https://maps.app.goo.gl/jRATTA5XiSGLMoUD9?g_st=i',
  3: 'https://maps.app.goo.gl/UU1fEykhyA6f3yt47?g_st=i',
};

// ── Your Stripe Payment Links ─────────────────────────────────────────────────
// HOW TO CREATE:
//   1. Go to stripe.com → Payment Links → Create Link
//   2. Add product: "Unboxed Gems Bundle 1" → $9.99 → one-time
//   3. Under "After payment" set redirect to:
//      https://yoursite.com/?success=true&bundle=1
//   4. Paste each link below
const STRIPE_LINKS = {
  1: 'https://buy.stripe.com/YOUR_LINK_FOR_BUNDLE_1',
  2: 'https://buy.stripe.com/YOUR_LINK_FOR_BUNDLE_2',
  3: 'https://buy.stripe.com/YOUR_LINK_FOR_BUNDLE_3',
  all: 'https://buy.stripe.com/YOUR_LINK_FOR_ALL_ACCESS',
};

const STORAGE_KEY = 'unboxed_gems_unlocked';

function getUnlocked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveUnlocked(bundleId) {
  const list = getUnlocked();
  if (!list.includes(bundleId)) {
    list.push(bundleId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

function revealBundle(bundleId) {
  const lockedEl   = document.getElementById(`locked-${bundleId}`);
  const unlockedEl = document.getElementById(`unlocked-${bundleId}`);
  const mapLink    = document.getElementById(`map-link-${bundleId}`);
  const btn        = document.getElementById(`btn-${bundleId}`);

  if (!lockedEl || !unlockedEl) return;

  // Swap locked → unlocked panel
  lockedEl.style.display   = 'none';
  unlockedEl.style.display = 'block';

  // Point the map button to the real Google Maps list
  if (mapLink) mapLink.href = MAPS_LISTS[bundleId];

  // Update purchase button
  if (btn) {
    btn.textContent = '✓ Unlocked';
    btn.classList.add('unlocked-state');
    btn.onclick = null;
  }
}

function purchaseAll() {
  const stripeLink = STRIPE_LINKS['all'];

  if (!stripeLink || stripeLink.includes('YOUR_LINK')) {
    [1, 2, 3].forEach(id => { saveUnlocked(id); revealBundle(id); });
    revealAllAccessCard();
    showModal();
    return;
  }

  window.location.href = stripeLink;
}

function purchase(bundleId) {
  const stripeLink = STRIPE_LINKS[bundleId];

  if (!stripeLink || stripeLink.includes('YOUR_LINK')) {
    saveUnlocked(bundleId);
    revealBundle(bundleId);
    showModal();
    return;
  }

  window.location.href = stripeLink;
}

function revealAllAccessCard() {
  const btn = document.getElementById('btn-all');
  if (btn) {
    btn.textContent = '✓ All Access Unlocked';
    btn.classList.add('unlocked-state');
    btn.onclick = null;
  }
}

function checkReturnFromStripe() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    const bundleId = params.get('bundle');
    if (bundleId === 'all') {
      [1, 2, 3].forEach(id => { saveUnlocked(id); revealBundle(id); });
      revealAllAccessCard();
      showModal();
    } else {
      const id = parseInt(bundleId, 10);
      if (id) { saveUnlocked(id); revealBundle(id); showModal(); }
    }
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function showModal() {
  document.getElementById('successModal').classList.add('active');
}
function closeModal() {
  document.getElementById('successModal').classList.remove('active');
  document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('successModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  getUnlocked().forEach(id => revealBundle(id));
  checkReturnFromStripe();
});
