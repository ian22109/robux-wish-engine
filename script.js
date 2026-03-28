const COIN_PACKAGES = [
  { coins: 400, price: 4.99, bonus: 0 },
  { coins: 800, price: 9.99, bonus: 0 },
  { coins: 1700, price: 19.99, bonus: "6%" },
  { coins: 4500, price: 49.99, bonus: "12%" },
  { coins: 10000, price: 99.99, bonus: "25%" },
];

const PROXY = "https://api.allorigins.win/raw?url=";

let debounceTimer;
let currentResults = [];
let selectedUser = null;
let selectedPackage = null;
let purchaseStep = "select";

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchResultsContent = document.getElementById("searchResultsContent");
const searchWrapper = document.getElementById("searchWrapper");
const selectedUserBadge = document.getElementById("selectedUserBadge");
const dialogOverlay = document.getElementById("dialogOverlay");
const dialog = document.getElementById("dialog");
const dialogClose = document.getElementById("dialogClose");
const openDialogBtn = document.getElementById("openDialogBtn");

async function searchUsers(keyword) {
  if (!keyword.trim()) {
    currentResults = [];
    searchResults.style.display = "none";
    return;
  }

  searchResultsContent.innerHTML = '<div class="search-loading">Searching…</div>';
  searchResults.style.display = "block";

  try {
    const url = `${PROXY}${encodeURIComponent(`https://users.roblox.com/v1/users/search?keyword=${keyword}&limit=10`)}`;
    const res = await fetch(url);
    const data = await res.json();
    const users = data.data || [];
    currentResults = users;

    if (users.length === 0) {
      searchResultsContent.innerHTML = '<div class="search-no-results">No users found</div>';
      return;
    }

    const userIds = users.map(u => u.id).join(",");
    const avatarUrl = `${PROXY}${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png&isCircular=true`)}`;

    let avatars = {};
    try {
      const avatarRes = await fetch(avatarUrl);
      const avatarData = await avatarRes.json();
      (avatarData?.data || []).forEach(t => {
        if (t.imageUrl) avatars[t.targetId] = t.imageUrl;
      });
    } catch (err) {
      console.error("Failed to load avatars:", err);
    }

    searchResultsContent.innerHTML = users.map(user => `
      <button class="search-result-item" onclick="selectUser(${user.id})">
        <img
          src="${avatars[user.id] || '/placeholder.svg'}"
          alt="${user.name}"
          class="search-result-avatar"
          onerror="this.src='/placeholder.svg'"
        >
        <div class="search-result-info">
          <span class="search-result-name">
            ${user.displayName}
          </span>
          <span class="search-result-username">@${user.name}</span>
          ${user.hasVerifiedBadge ? `
            <svg class="verified-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ` : ''}
        </div>
      </button>
    `).join('');
  } catch (err) {
    console.error("Search error:", err);
    searchResultsContent.innerHTML = '<div class="search-no-results">Search failed. Please try again.</div>';
  }
}

function selectUser(userId) {
  const user = currentResults.find(u => u.id === userId);
  if (!user) return;

  selectedUser = user;
  searchInput.value = user.name;
  searchResults.style.display = "none";

  const avatarUrl = `${PROXY}${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`)}`;

  fetch(avatarUrl)
    .then(res => res.json())
    .then(data => {
      const avatarSrc = data?.data?.[0]?.imageUrl || '/placeholder.svg';
      document.getElementById("selectedUserAvatar").src = avatarSrc;
    })
    .catch(() => {
      document.getElementById("selectedUserAvatar").src = '/placeholder.svg';
    });

  document.getElementById("selectedUserDisplayName").textContent = user.displayName;
  document.getElementById("selectedUserUsername").textContent = `@${user.name}`;
  selectedUserBadge.style.display = "flex";

  selectedPackage = null;
  purchaseStep = "select";
  openDialog();
}

function openDialog() {
  if (!selectedUser) return;

  document.getElementById("dialogTitle").textContent = "Gift Coins";
  document.getElementById("dialogDescription").textContent = `Choose a package for ${selectedUser.displayName}`;

  renderDialogContent();
  dialogOverlay.style.display = "flex";
}

function closeDialog() {
  dialogOverlay.style.display = "none";
  purchaseStep = "select";
  selectedPackage = null;
}

function renderDialogContent() {
  const dialogBody = document.getElementById("dialogBody");

  if (purchaseStep === "select") {
    dialogBody.innerHTML = `
      <div class="package-list">
        ${COIN_PACKAGES.map((pkg, index) => `
          <button class="package-item ${selectedPackage?.coins === pkg.coins ? 'selected' : ''}" onclick="selectPackage(${index})">
            <div class="package-info">
              <svg class="package-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h6a2 2 0 1 1 0 4H8"></path>
                <path d="M12 18V6"></path>
              </svg>
              <span class="package-coins">${pkg.coins.toLocaleString()} Coins</span>
              ${pkg.bonus !== 0 ? `<span class="package-bonus">+${pkg.bonus} Bonus</span>` : ''}
            </div>
            <span class="package-price">$${pkg.price}</span>
          </button>
        `).join('')}
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary btn-full" ${!selectedPackage ? 'disabled' : ''} onclick="proceedToConfirm()">
          Continue
        </button>
      </div>
    `;
  } else if (purchaseStep === "confirm") {
    dialogBody.innerHTML = `
      <div class="confirmation-box">
        <div class="confirmation-row">
          <span class="confirmation-label">Recipient</span>
          <span class="confirmation-value">@${selectedUser.name}</span>
        </div>
        <div class="confirmation-row">
          <span class="confirmation-label">Package</span>
          <span class="confirmation-value">${selectedPackage.coins.toLocaleString()} Coins</span>
        </div>
        <div class="confirmation-row confirmation-total">
          <span class="confirmation-label">Total</span>
          <span class="confirmation-value">$${selectedPackage.price}</span>
        </div>
      </div>
      <p class="confirmation-note">
        This is a demo purchase. Nothing will be charged.
      </p>
      <div class="dialog-button-group">
        <button class="btn btn-secondary" onclick="backToSelect()">Back</button>
        <button class="btn btn-primary" style="flex: 1;" onclick="completePurchase()">Demo Purchase</button>
      </div>
    `;
  } else if (purchaseStep === "done") {
    document.getElementById("dialogTitle").textContent = "Purchase Complete!";
    document.getElementById("dialogDescription").textContent = "This was a demo purchase. Nothing was charged.";

    dialogBody.innerHTML = `
      <div class="success-content">
        <div class="success-icon-wrapper">
          <svg class="success-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div>
          <p class="success-coins">${selectedPackage.coins.toLocaleString()} Coins</p>
          <p class="success-recipient">sent to @${selectedUser.name} (Demo)</p>
        </div>
      </div>
      <button class="btn btn-primary btn-full" onclick="closeDialog()">Close</button>
    `;
  }
}

function selectPackage(index) {
  selectedPackage = COIN_PACKAGES[index];
  renderDialogContent();
}

function proceedToConfirm() {
  if (!selectedPackage) return;
  purchaseStep = "confirm";
  renderDialogContent();
}

function backToSelect() {
  purchaseStep = "select";
  renderDialogContent();
}

function completePurchase() {
  purchaseStep = "done";
  renderDialogContent();
}

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchUsers(e.target.value);
  }, 200);
});

searchInput.addEventListener("focus", () => {
  if (currentResults.length > 0) {
    searchResults.style.display = "block";
  }
});

document.addEventListener("mousedown", (e) => {
  if (searchWrapper && !searchWrapper.contains(e.target)) {
    searchResults.style.display = "none";
  }
});

dialogClose.addEventListener("click", closeDialog);
openDialogBtn.addEventListener("click", openDialog);

dialogOverlay.addEventListener("click", (e) => {
  if (e.target === dialogOverlay) {
    closeDialog();
  }
});
