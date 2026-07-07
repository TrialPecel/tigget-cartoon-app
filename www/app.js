/* ==========================================================================
   BUDGETING APP LOGIC (WITH INTEGRATED SASSY DINO AI)
   ========================================================================== */

// Helper to format currency to Indonesian Rupiah (Rp)
function formatRupiah(amount) {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

// Initial state data in case localStorage is empty
const defaultData = {
  wallets: [
    { id: 'w-1', name: 'Dompet Utama 💵', balance: 500000, color: 'wc-lime' },
    { id: 'w-2', name: 'Kantong Jajan 💳', balance: 150000, color: 'wc-yellow' },
    { id: 'w-3', name: 'Tabungan Darurat 🐷', balance: 1000000, color: 'wc-cyan' }
  ],
  budgets: [
    { category: 'Makanan & Minuman', limit: 1200000 },
    { category: 'Belanja', limit: 800000 },
    { category: 'Transportasi', limit: 300000 },
    { category: 'Hiburan', limit: 500000 }
  ],
  transactions: [
    { id: 't-1', type: 'expense', title: 'Gado-gado Mas Jhon', amount: 19000, category: 'Makanan & Minuman', walletId: 'w-1', date: '2026-07-03' },
    { id: 't-2', type: 'expense', title: 'Es Teh & Kopi Susu', amount: 22000, category: 'Makanan & Minuman', walletId: 'w-1', date: '2026-07-02' },
    { id: 't-3', type: 'expense', title: 'Beli Burger Premium', amount: 53000, category: 'Makanan & Minuman', walletId: 'w-2', date: '2026-07-01' },
    { id: 't-4', type: 'income', title: 'Gaji Bulanan Part-time', amount: 2500000, category: 'Gaji & Bonus', walletId: 'w-1', date: '2026-07-01' },
    { id: 't-5', type: 'expense', title: 'Bensin Motor', amount: 30000, category: 'Transportasi', walletId: 'w-1', date: '2026-07-02' }
  ],
  targets: [
    { id: 'g-1', name: 'Beli Sepeda Lipat Baru 🚲', targetAmount: 1500000, currentSaved: 350000, walletId: 'w-3' },
    { id: 'g-2', name: 'Liburan Akhir Tahun 🏝️', targetAmount: 3000000, currentSaved: 150000, walletId: 'w-3' }
  ]
};

// State Object loaded from LocalStorage or Default
let state = JSON.parse(localStorage.getItem('tigget_state')) || defaultData;

// Save current state to LocalStorage
function saveState() {
  localStorage.setItem('tigget_state', JSON.stringify(state));
  renderAll();
}

/* ==========================================================================
   RENDERING ENGINES
   ========================================================================== */

// Render Homepage Overview Dashboard
function renderDashboard() {
  // 1. Calculate Total Balance
  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
  document.getElementById('total-balance').textContent = formatRupiah(totalBalance);
  
  // 2. Count Active Wallets
  const walletCount = state.wallets.length;
  document.getElementById('wallets-summary').textContent = `${walletCount} dompet aktif • Juli 2026`;

  // 3. Calculate Income and Expenses
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  document.getElementById('income-amount').textContent = formatRupiah(totalIncome);
  document.getElementById('expense-amount').textContent = formatRupiah(totalExpense);

  // 4. Render Active Budgets progress on Home tab (top 2 active budgets)
  const homeBudgetContainer = document.getElementById('home-budget-list');
  homeBudgetContainer.innerHTML = '';

  if (state.budgets.length === 0) {
    homeBudgetContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📊</span>
        <p>Belum ada anggaran. Ayo set budget belanja agar pengeluaranmu aman!</p>
      </div>`;
  } else {
    // Show top budgets
    state.budgets.slice(0, 3).forEach(b => {
      // Calculate spent amount in this budget category
      const categorySpent = state.transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.min(100, Math.round((categorySpent / b.limit) * 100));
      const isOver = categorySpent > b.limit;

      const budgetEl = document.createElement('div');
      budgetEl.className = `budget-progress-card ${isOver ? 'progress-warn shake-anim' : ''}`;
      budgetEl.innerHTML = `
        <div class="budget-header">
          <span class="budget-name">${b.category}</span>
          <span class="budget-digits">
            <strong class="${isOver ? 'text-red' : ''}">${formatRupiah(categorySpent)}</strong> / ${formatRupiah(b.limit)}
          </span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
      `;
      homeBudgetContainer.appendChild(budgetEl);
    });
  }

  // 5. Render Recent Transactions List (max 5)
  const txContainer = document.getElementById('recent-transactions-list');
  txContainer.innerHTML = '';

  if (state.transactions.length === 0) {
    txContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🦖</span>
        <p>Belum ada transaksi. Tambah satu menggunakan tombol + di kanan bawah!</p>
      </div>`;
  } else {
    // Sort transactions by date descending (newest first)
    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTx.slice(0, 5).forEach(t => {
      const wallet = state.wallets.find(w => w.id === t.walletId);
      const walletName = wallet ? wallet.name : 'Dompet';
      
      // Get category icon
      let catIcon = '🎈';
      if (t.category.includes('Makanan')) catIcon = '🍔';
      else if (t.category.includes('Belanja')) catIcon = '🛍️';
      else if (t.category.includes('Transportasi')) catIcon = '🚗';
      else if (t.category.includes('Hiburan')) catIcon = '🎮';
      else if (t.category.includes('Kesehatan')) catIcon = '🏥';
      else if (t.category.includes('Pendidikan')) catIcon = '🎓';
      else if (t.category.includes('Gaji')) catIcon = '💰';

      const txEl = document.createElement('div');
      txEl.className = 'transaction-card';
      txEl.innerHTML = `
        <div class="transaction-left">
          <div class="tx-icon-wrapper">${catIcon}</div>
          <div class="tx-details">
            <span class="tx-title">${t.title}</span>
            <span class="tx-meta">${t.date} • ${walletName}</span>
          </div>
        </div>
        <div class="transaction-right">
          <span class="tx-value ${t.type === 'income' ? 'text-green' : 'text-red'}">
            ${t.type === 'income' ? '+' : '-'}${formatRupiah(t.amount)}
          </span>
          <button class="btn-delete-tx" onclick="deleteTransaction('${t.id}')">Hapus</button>
        </div>
      `;
      txContainer.appendChild(txEl);
    });
  }
}

// Render Wallets Tab (Dompet)
function renderWallets() {
  const grid = document.getElementById('wallets-grid');
  grid.innerHTML = '';

  state.wallets.forEach(w => {
    // Calculate total transactions associated with this wallet
    const walletTransactions = state.transactions.filter(t => t.walletId === w.id);
    const flowCount = walletTransactions.length;

    const card = document.createElement('div');
    card.className = `wallet-cartoon-card ${w.color}`;
    card.innerHTML = `
      <div class="wallet-header">
        <span class="wallet-icon">👛</span>
        <div class="wallet-actions">
          <button class="btn-wallet-delete" onclick="deleteWallet('${w.id}')">Hapus</button>
        </div>
      </div>
      <div class="wallet-info">
        <span class="wallet-label">${flowCount} Transaksi</span>
        <h3 class="wallet-name-title">${w.name}</h3>
        <span class="wallet-balance-num">${formatRupiah(w.balance)}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Render Detailed Budgets Tab
function renderBudgets() {
  const container = document.getElementById('budgets-list-detailed');
  container.innerHTML = '';

  if (state.budgets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📊</span>
        <p>Belum ada anggaran. Ayo set budget bulanan kamu!</p>
      </div>`;
    return;
  }

  state.budgets.forEach(b => {
    const spent = state.transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = Math.min(100, Math.round((spent / b.limit) * 100));
    const isOver = spent > b.limit;
    
    // Choose sticker emoji for category
    let emoji = '🎈';
    if (b.category.includes('Makanan')) emoji = '🍔';
    else if (b.category.includes('Belanja')) emoji = '🛍️';
    else if (b.category.includes('Transportasi')) emoji = '🚗';
    else if (b.category.includes('Hiburan')) emoji = '🎮';
    else if (b.category.includes('Kesehatan')) emoji = '🏥';
    else if (b.category.includes('Pendidikan')) emoji = '🎓';

    const card = document.createElement('div');
    card.className = `budget-detailed-card ${isOver ? 'shake-anim' : ''}`;
    card.innerHTML = `
      <div class="budget-detail-top">
        <span class="budget-detail-cat">${emoji} ${b.category}</span>
        <button class="btn-budget-delete" onclick="deleteBudget('${b.category}')">Hapus</button>
      </div>
      <div class="budget-detail-middle">
        <div class="progress-bar-container ${isOver ? 'progress-warn' : ''}">
          <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
      </div>
      <div class="budget-detail-bottom">
        <span>Telah terpakai: <strong>${formatRupiah(spent)}</strong></span>
        <span>Limit: <strong>${formatRupiah(b.limit)}</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Targets Tab (with Walking Dino Progress Path!)
function renderTargets() {
  const container = document.getElementById('targets-list');
  container.innerHTML = '';

  if (state.targets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎯</span>
        <p>Belum ada target tabungan. Ayo buat keinginanmu menjadi kenyataan!</p>
      </div>`;
    return;
  }

  state.targets.forEach(g => {
    const pct = Math.min(100, Math.round((g.currentSaved / g.targetAmount) * 100));
    const wallet = state.wallets.find(w => w.id === g.walletId);
    const walletName = wallet ? wallet.name : 'Tabungan';

    const card = document.createElement('div');
    card.className = 'target-card';
    card.innerHTML = `
      <div class="target-top">
        <div class="target-meta">
          <span class="target-goal-title">${g.name}</span>
          <span class="target-wallet-source">Sumber Alokasi: ${walletName}</span>
        </div>
        <div class="target-actions">
          <button class="btn-cartoon btn-neon-lime" style="padding: 4px 8px; font-size: 11px;" onclick="openSavingModal('${g.id}', '${g.name.replace(/'/g, "\\'")}')">Tabung 💰</button>
          <button class="btn-target-delete" onclick="deleteTarget('${g.id}')">Hapus</button>
        </div>
      </div>
      
      <!-- Dino Path Walkway -->
      <div class="dino-path-container">
        <div class="dino-path-track"></div>
        <!-- Walking dino avatar. position shifts dynamically -->
        <div class="walking-dino" style="left: calc(${pct}% - 22px)">🦖</div>
        <div class="goal-flag">🏁</div>
      </div>

      <div class="target-amounts">
        <span>Terkumpul: <strong>${formatRupiah(g.currentSaved)}</strong> / ${formatRupiah(g.targetAmount)}</span>
        <span class="target-pct">${pct}%</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Update option lists in all forms (Wallets options)
function updateFormSelectors() {
  const txWalletSel = document.getElementById('tx-wallet');
  const targetWalletSel = document.getElementById('target-wallet');
  const savingWalletSel = document.getElementById('saving-wallet');

  const optionsHTML = state.wallets.map(w => `<option value="${w.id}">${w.name} (${formatRupiah(w.balance)})</option>`).join('');

  txWalletSel.innerHTML = optionsHTML;
  targetWalletSel.innerHTML = optionsHTML;
  savingWalletSel.innerHTML = optionsHTML;
}

// Refresh all UI elements
function renderAll() {
  renderDashboard();
  renderWallets();
  renderBudgets();
  renderTargets();
  updateFormSelectors();
}

/* ==========================================================================
   CRUD STATE OPERATIONS
   ========================================================================== */

// Add Transaction
document.getElementById('form-transaction').addEventListener('submit', function(e) {
  e.preventDefault();

  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const title = document.getElementById('tx-title').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const category = document.getElementById('tx-category').value;
  const walletId = document.getElementById('tx-wallet').value;
  const date = document.getElementById('tx-date').value;

  // Find associated wallet
  const walletIndex = state.wallets.findIndex(w => w.id === walletId);
  if (walletIndex === -1) {
    alert('Dompet tidak ditemukan!');
    return;
  }

  // Update wallet balance
  if (type === 'expense') {
    if (state.wallets[walletIndex].balance < amount) {
      alert('Waduh, saldo dompetmu kurang! Dino tidak menyarankan utang ya 🦖');
      return;
    }
    state.wallets[walletIndex].balance -= amount;
  } else {
    state.wallets[walletIndex].balance += amount;
  }

  // Create new transaction
  const newTx = {
    id: 't-' + Date.now(),
    type,
    title,
    amount,
    category,
    walletId,
    date
  };

  state.transactions.push(newTx);
  
  // Sassy Dino warning comment automatically trigger on expense
  if (type === 'expense') {
    checkDinoAlertOnExpense(newTx);
  }

  saveState();
  closeAllModals();
  this.reset();
  
  // Set default date back to today
  document.getElementById('tx-date').valueAsDate = new Date();
});

// Delete Transaction
function deleteTransaction(id) {
  const txIndex = state.transactions.findIndex(t => t.id === id);
  if (txIndex === -1) return;

  const tx = state.transactions[txIndex];
  const walletIndex = state.wallets.findIndex(w => w.id === tx.walletId);
  
  // Revert wallet balance
  if (walletIndex !== -1) {
    if (tx.type === 'expense') {
      state.wallets[walletIndex].balance += tx.amount;
    } else {
      state.wallets[walletIndex].balance -= tx.amount;
    }
  }

  state.transactions.splice(txIndex, 1);
  saveState();
}

// Add Wallet
document.getElementById('form-wallet').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('wallet-name').value.trim();
  const balance = parseFloat(document.getElementById('wallet-balance').value);
  const color = document.querySelector('input[name="wallet-color"]:checked').value;

  const newWallet = {
    id: 'w-' + Date.now(),
    name,
    balance,
    color
  };

  state.wallets.push(newWallet);
  saveState();
  closeAllModals();
  this.reset();
});

// Delete Wallet
function deleteWallet(id) {
  if (state.wallets.length <= 1) {
    alert('Kamu harus menyisakan minimal satu Dompet aktif! Dino gak mau kamu menyimpan uang di bawah kasur 🦖');
    return;
  }

  if (confirm('Hapus dompet ini? Transaksi yang terhubung tidak akan terhapus, tetapi saldonya hilang.')) {
    state.wallets = state.wallets.filter(w => w.id !== id);
    saveState();
  }
}

// Add/Set Budget
document.getElementById('form-budget').addEventListener('submit', function(e) {
  e.preventDefault();

  const category = document.getElementById('budget-category').value;
  const limit = parseFloat(document.getElementById('budget-limit').value);

  // Overwrite if category budget exists, otherwise push new
  const index = state.budgets.findIndex(b => b.category === category);
  if (index !== -1) {
    state.budgets[index].limit = limit;
  } else {
    state.budgets.push({ category, limit });
  }

  saveState();
  closeAllModals();
  this.reset();
});

// Delete Budget
function deleteBudget(category) {
  state.budgets = state.budgets.filter(b => b.category !== category);
  saveState();
}

// Add Saving Target
document.getElementById('form-target').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('target-name').value.trim();
  const targetAmount = parseFloat(document.getElementById('target-amount').value);
  const currentSaved = parseFloat(document.getElementById('target-current').value);
  const walletId = document.getElementById('target-wallet').value;

  if (currentSaved > targetAmount) {
    alert('Waduh, celenganmu meluap! Tabungan awal tidak boleh melebihi target.');
    return;
  }

  // Deduct initial saving from source wallet
  const walletIndex = state.wallets.findIndex(w => w.id === walletId);
  if (walletIndex !== -1) {
    if (state.wallets[walletIndex].balance < currentSaved) {
      alert('Saldo dompet alokasi tidak cukup untuk tabungan awal!');
      return;
    }
    state.wallets[walletIndex].balance -= currentSaved;
  }

  const newTarget = {
    id: 'g-' + Date.now(),
    name,
    targetAmount,
    currentSaved,
    walletId
  };

  state.targets.push(newTarget);
  saveState();
  closeAllModals();
  this.reset();
});

// Top-up Allocations to saving target
function openSavingModal(id, name) {
  document.getElementById('saving-target-id').value = id;
  document.getElementById('saving-target-name-label').textContent = `Alokasi untuk: "${name}"`;
  
  // Set default values and active modal
  document.getElementById('saving-amount').value = '';
  document.getElementById('modal-target-saving').classList.add('active');
}

document.getElementById('form-target-saving').addEventListener('submit', function(e) {
  e.preventDefault();

  const id = document.getElementById('saving-target-id').value;
  const amount = parseFloat(document.getElementById('saving-amount').value);
  const walletId = document.getElementById('saving-wallet').value;

  const targetIndex = state.targets.findIndex(g => g.id === id);
  const walletIndex = state.wallets.findIndex(w => w.id === walletId);

  if (targetIndex === -1 || walletIndex === -1) {
    alert('Data target atau dompet tidak valid!');
    return;
  }

  const wallet = state.wallets[walletIndex];
  const target = state.targets[targetIndex];

  if (wallet.balance < amount) {
    alert('Saldo dompet alokasi kurang! Dino sedih mendengarnya 🦖');
    return;
  }

  const remainingNeeded = target.targetAmount - target.currentSaved;
  if (amount > remainingNeeded) {
    alert(`Uang kepenuhan! Kamu hanya membutuhkan ${formatRupiah(remainingNeeded)} lagi untuk memenuhi target ini.`);
    return;
  }

  // Deduct from wallet and add to target
  state.wallets[walletIndex].balance -= amount;
  state.targets[targetIndex].currentSaved += amount;

  // Log as an expense transaction for tracking history (optional, let's log it so it records in transactions)
  state.transactions.push({
    id: 't-' + Date.now(),
    type: 'expense',
    title: `Alokasi celengan: ${target.name}`,
    amount: amount,
    category: 'Lain-lain',
    walletId: walletId,
    date: new Date().toISOString().split('T')[0]
  });

  // Check if target is completed
  if (state.targets[targetIndex].currentSaved >= state.targets[targetIndex].targetAmount) {
    setTimeout(() => {
      alert(`SELAMAT! Target "${target.name}" sudah terpenuhi! Dino melompat kegirangan! 🦖🎉🏄‍♂️`);
    }, 500);
  }

  saveState();
  closeAllModals();
  this.reset();
});

// Delete Saving Target
function deleteTarget(id) {
  if (confirm('Hapus target tabungan ini? Uang yang sudah masuk tabungan tidak dikembalikan ke dompet (diasumsikan hangus/terpakai).')) {
    state.targets = state.targets.filter(g => g.id !== id);
    saveState();
  }
}

/* ==========================================================================
   ROUTING AND TAB NAVIGATION SYSTEM
   ========================================================================== */
const navItems = document.querySelectorAll('.nav-item');
const tabPanels = document.querySelectorAll('.tab-panel');

navItems.forEach(item => {
  item.addEventListener('click', function() {
    const targetTab = this.getAttribute('data-tab');

    // Toggle nav active classes
    navItems.forEach(nav => nav.classList.remove('active'));
    this.classList.add('active');

    // Toggle panels active classes
    tabPanels.forEach(panel => {
      if (panel.id === targetTab) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Auto-scroll chat to bottom if switching to Dino AI
    if (targetTab === 'tab-ai') {
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
});

// See all budget category navigation bridge
document.querySelectorAll('.btn-see-all').forEach(btn => {
  btn.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab') || 'tab-budget';
    
    // Find nav item matching target panel id
    const navBtn = document.querySelector(`.nav-item[data-tab="${targetTabId}"]`);
    if (navBtn) {
      navBtn.click();
    }
  });
});

// Trigger Home tab "Transaksi Terakhir -> Semua"
document.getElementById('btn-see-all-transactions').addEventListener('click', function() {
  alert('Tab "Transaksi" terintegrasi di Beranda dan Dompet. Kamu bisa melihat riwayat per dompet di tab Dompet! 🦖');
});

/* ==========================================================================
   MODAL CONTROLLER CODES
   ========================================================================== */
const modalTransaction = document.getElementById('modal-transaction');
const modalWallet = document.getElementById('modal-wallet');
const modalBudget = document.getElementById('modal-budget');
const modalTarget = document.getElementById('modal-target');
const modalTargetSaving = document.getElementById('modal-target-saving');

const allModals = [modalTransaction, modalWallet, modalBudget, modalTarget, modalTargetSaving];

function closeAllModals() {
  allModals.forEach(m => m.classList.remove('active'));
}

// Attach click event for close modal buttons
document.querySelectorAll('.btn-close-modal').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

// Close modal when clicking dark overlay backdrops
allModals.forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      closeAllModals();
    }
  });
});

// Open Add Transaction modals
document.getElementById('btn-fab-add').addEventListener('click', () => {
  modalTransaction.classList.add('active');
});
document.getElementById('btn-add-quick').addEventListener('click', () => {
  modalTransaction.classList.add('active');
});

// Open Add Wallet modals
document.getElementById('btn-add-wallet').addEventListener('click', () => {
  modalWallet.classList.add('active');
});

// Open Add Budget modals
document.getElementById('btn-add-budget').addEventListener('click', () => {
  modalBudget.classList.add('active');
});

// Open Add Target modals
document.getElementById('btn-add-target').addEventListener('click', () => {
  modalTarget.classList.add('active');
});

/* ==========================================================================
   DINO AI CHAT BOT LOGIC
   ========================================================================== */
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

function appendMessage(sender, text) {
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${sender}`;
  messageEl.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatMessages.appendChild(messageEl);
  
  // Auto scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate Dino response based on queries
function getDinoResponse(userInput) {
  const query = userInput.toLowerCase();
  
  // Dynamic statistics calculations
  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseCount = state.transactions.filter(t => t.type === 'expense').length;

  // Question 1: Check security & current stats
  if (query.includes('aman') || query.includes('status') || query.includes('keamanan')) {
    let budgetTotal = state.budgets.reduce((sum, b) => sum + b.limit, 0);
    if (budgetTotal === 0) budgetTotal = 1; // prevent div by zero
    
    const spentPct = Math.round((totalExpense / budgetTotal) * 100);
    
    if (totalExpense === 0) {
      return `Pengeluaranmu masih Rp 0! Bersih kinclong! Dino senang dompetmu gemuk, pertahankan! 🦖✨`;
    } else if (spentPct > 90) {
      return `DARURAT RAWWRR! 🦖💥 Pengeluaranmu (${formatRupiah(totalExpense)}) udah menyentuh ${spentPct}% dari total anggaranmu! Dompetmu lagi sekarat! Stop belanja boba, hemat sekarang!`;
    } else if (spentPct > 60) {
      return `Awas, lampu kuning! ⚠️ Pengeluaranmu udah ${spentPct}% (${formatRupiah(totalExpense)}). Kurangi jajan barang unfaedah ya! Dino memantau!`;
    } else {
      return `Pengeluaranmu Rp ${totalExpense.toLocaleString('id-ID')} (${spentPct}% dari budget). Masih tergolong aman, tapi dino sarankan jangan terlalu rileks! 🦖`;
    }
  }

  // Question 2: Roast expenses / Kritik Belanja
  if (query.includes('kritik') || query.includes('hujat') || query.includes('jajan') || query.includes('belanjaku')) {
    const expenses = state.transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      return `Gak ada jajan hari ini? Hebat! Dino bangga padamu. Kamu mendapat 1 sticker jempol purba dari Dino! 👍🦖`;
    }
    
    // Sort to get latest expense
    const latest = [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    
    let advice = '';
    if (latest.category === 'Makanan & Minuman') {
      advice = `Makan terus! Ingat, perut kenyang tapi dompet kerontang itu bikin pusing. Dino harap porsinya gak berlebihan! 🦖🍔`;
    } else if (latest.category === 'Belanja') {
      advice = `Hah? Belanja barang apa lagi itu? Apakah itu benar-benar kebutuhan primer, atau cuma nafsu sesaat? Jawab jujur! 🦖🛍️`;
    } else {
      advice = `Hemat pangkal kaya, boros pangkal dino ngamuk! 🦖💥`;
    }

    return `Dino lihat transaksi terakhirmu: <strong>"${latest.title}" seharga ${formatRupiah(latest.amount)}</strong>. <br><br>${advice}<br><br>Oh ya, celengan targetmu gimana kabarnya? Baru terisi dikit tuh!`;
  }

  // Question 3: Tips Hemat
  if (query.includes('tips') || query.includes('hemat') || query.includes('saran')) {
    const tips = [
      `Tips Dino #1: Bawa air minum sendiri dari rumah! Biaya beli air mineral kemasan Rp 5.000 sehari kalau dikali sebulan bisa buat isi bensin motor! 🏍️🦖`,
      `Tips Dino #2: Belanja bahan makanan di pasar tradisional pas pagi-pagi, lebih murah dibanding supermarket mall AC dingin yang bikin pengen beli es krim! 🛒🦖`,
      `Tips Dino #3: Terapkan aturan "Tunggu 24 Jam" sebelum checkout barang di e-commerce. Biasanya besok paginya kamu udah lupa dan gak pengen beli lagi! 🦖📦`,
      `Tips Dino #4: Kurangi ngopi-ngopi senja estetik. Kopi sachet di kamar diseduh air termos kosan juga bisa bikin melek kok! ☕🦖`
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Keyword check: Boba
  if (query.includes('boba') || query.includes('kopi')) {
    return `Boba / Kopi Susu lagi?! Itu cuma manis di tenggorokan tapi pahit di dompet. Dino sedot boba kamu sampai habis baru tau rasa! 🦖🧋`;
  }

  // Keyword check: Gaji / Uang / Kaya
  if (query.includes('gaji') || query.includes('bonus') || query.includes('kaya')) {
    return `Wih, ngomongin gaji nih! Gaji masuk langsung taruh di Tabungan Target / Dompet Utama ya! Jangan malah dihabisin buat skin game online! Dino mengawasi! 🦖💰`;
  }

  // Keyword check: Dinolucu / Siapa kamu
  if (query.includes('siapa') || query.includes('nama') || query.includes('dino')) {
    return `Aku <strong>TiggetDino</strong>! Dinopoli keuangan pelindung dompetmu. Misi hidupku adalah membasmi keborosan umat manusia! Rawrrr! 🦖🦖`;
  }

  // Default response
  return `Dino mengerti curhatanmu tentang "${userInput}". Tapi Dino lebih tertarik mendengar alasan kenapa saldo dompetmu sisa sedikit. Coba cek lagi pengeluaranmu, yuk! 🦖`;
}

// Dino alerts user on home transaction additions
function checkDinoAlertOnExpense(tx) {
  // If expense is massive (> 100k)
  if (tx.amount >= 150000) {
    const chatMsg = `⚠️ Dino mendeteksi pengeluaran besar! Kamu baru saja membelanjakan <strong>${formatRupiah(tx.amount)}</strong> untuk "${tx.title}". Dino agak panik nih! 🦖💥`;
    
    // Push message to chat history
    setTimeout(() => {
      appendMessage('dino', chatMsg);
    }, 1000);
  }
}

// Handle chat send trigger
function handleChatSubmit() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Append user message
  appendMessage('user', text);
  chatInput.value = '';

  // Show simulated "Dino is typing..."
  const typingEl = document.createElement('div');
  typingEl.className = 'message message-dino typing-indicator';
  typingEl.innerHTML = '<div class="msg-bubble">🦖 <em>Dino sedang memikirkan hujatan...</em></div>';
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Delay for cartoon bot response
  setTimeout(() => {
    // Remove typing indicator
    const typing = document.querySelector('.typing-indicator');
    if (typing) typing.remove();

    const response = getDinoResponse(text);
    appendMessage('dino', response);
  }, 1200);
}

btnSendChat.addEventListener('click', handleChatSubmit);
chatInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    handleChatSubmit();
  }
});

// Quick suggestion chips binding
document.querySelectorAll('.btn-suggest').forEach(btn => {
  btn.addEventListener('click', function() {
    const msg = this.getAttribute('data-msg');
    chatInput.value = msg;
    handleChatSubmit();
  });
});

/* ==========================================================================
   INITIALIZATION AND SETUP ON LOAD
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  // 1. Set today's date in Transaction Form input
  const dateInput = document.getElementById('tx-date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  // 2. Render all dynamic panels
  renderAll();
});
