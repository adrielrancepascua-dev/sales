const STORAGE = {
  presets: "cindys_presets_v1",
  settings: "cindys_settings_v2",
  tx: "cindys_transactions_v1"
};

const SESSION = {
  shiftCashier: "cindys_shift_cashier_v1",
  apiKey: "cindys_api_key_session_v1"
};

const DEFAULT_WEBHOOK_URL = "";

const DEMO_PRESETS = [
  { id: uid(), item_name: "Pandesal", default_price: 3, category: "Bread", active: true, order: 1 },
  { id: uid(), item_name: "Spanish Bread", default_price: 12, category: "Bread", active: true, order: 2 },
  { id: uid(), item_name: "Ensaymada", default_price: 18, category: "Pastry", active: true, order: 3 },
  { id: uid(), item_name: "Cheese Bread", default_price: 15, category: "Bread", active: true, order: 4 },
  { id: uid(), item_name: "Loaf Bread", default_price: 55, category: "Loaf", active: true, order: 5 },
  { id: uid(), item_name: "Choco Bread", default_price: 16, category: "Bread", active: true, order: 6 },
  { id: uid(), item_name: "Donut", default_price: 20, category: "Pastry", active: true, order: 7 },
  { id: uid(), item_name: "Cake Slice", default_price: 45, category: "Cake", active: true, order: 8 },
  { id: uid(), item_name: "Bottled Water", default_price: 20, category: "Drinks", active: true, order: 9 },
  { id: uid(), item_name: "Soft Drinks", default_price: 30, category: "Drinks", active: true, order: 10 }
];

const state = {
  presets: load(STORAGE.presets, DEMO_PRESETS),
  settings: load(STORAGE.settings, {
    business_name: "CounterFlow",
    business_id: "BIZ-001",
    webhook_url: DEFAULT_WEBHOOK_URL,
    remember_api_key: false,
    api_key: "",
    owner_code: ""
  }),
  transactions: load(STORAGE.tx, []),
  activeCategory: "All",
  roleMode: "cashier",
  presetsCollapsed: false,
  shiftCashier: sessionStorage.getItem(SESSION.shiftCashier) || "",
  editingPresetId: "",
  selectedPresetId: "",
  priceOverrideActive: false
};

const el = {
  tabs: document.querySelectorAll(".tab[data-tab]"),
  ownerOnlyTabs: document.querySelectorAll(".owner-only"),
  ownerOnlyControls: document.querySelectorAll(".owner-only-control"),
  views: document.querySelectorAll(".view"),
  modeCashier: document.getElementById("modeCashier"),
  modeOwner: document.getElementById("modeOwner"),
  metaBusiness: document.getElementById("metaBusiness"),
  metaNow: document.getElementById("metaNow"),
  metaStatus: document.getElementById("metaStatus"),
  itemSearch: document.getElementById("itemSearch"),
  togglePresetsBtn: document.getElementById("togglePresetsBtn"),
  presetsBody: document.getElementById("presetsBody"),
  categoryChips: document.getElementById("categoryChips"),
  presetGrid: document.getElementById("presetGrid"),
  selectedItemNote: document.getElementById("selectedItemNote"),
  saleFormPanel: document.querySelector(".sale-form-panel"),
  saleForm: document.getElementById("saleForm"),
  shiftCashierName: document.getElementById("shiftCashierName"),
  startShiftBtn: document.getElementById("startShiftBtn"),
  endShiftBtn: document.getElementById("endShiftBtn"),
  shiftStatus: document.getElementById("shiftStatus"),
  itemName: document.getElementById("itemName"),
  category: document.getElementById("category"),
  categoryLabel: document.getElementById("category")?.closest("label"),
  quantity: document.getElementById("quantity"),
  unitPrice: document.getElementById("unitPrice"),
  priceOverrideBtn: document.getElementById("priceOverrideBtn"),
  amountPaid: document.getElementById("amountPaid"),
  paymentMethod: document.getElementById("paymentMethod"),
  paymentButtons: document.querySelectorAll(".pay-btn"),
  qtyButtons: document.querySelectorAll(".qty-btn"),
  notes: document.getElementById("notes"),
  notesLabel: document.getElementById("notes")?.closest("label"),
  afterSubmitBehavior: document.getElementById("afterSubmitBehavior"),
  submitBtn: document.getElementById("submitBtn"),
  uiTotal: document.getElementById("uiTotal"),
  uiChange: document.getElementById("uiChange"),
  uiRequestId: document.getElementById("uiRequestId"),
  resultBox: document.getElementById("resultBox"),
  recentList: document.getElementById("recentList"),
  sumTodayTotal: document.getElementById("sumTodayTotal"),
  sumTxCount: document.getElementById("sumTxCount"),
  sumCash: document.getElementById("sumCash"),
  sumGcash: document.getElementById("sumGcash"),
  topItems: document.getElementById("topItems"),
  presetForm: document.getElementById("presetForm"),
  presetEditId: document.getElementById("presetEditId"),
  presetName: document.getElementById("presetName"),
  presetPrice: document.getElementById("presetPrice"),
  presetCategory: document.getElementById("presetCategory"),
  presetOrder: document.getElementById("presetOrder"),
  presetActive: document.getElementById("presetActive"),
  presetSubmitBtn: document.getElementById("presetSubmitBtn"),
  presetCancelBtn: document.getElementById("presetCancelBtn"),
  presetTable: document.getElementById("presetTable"),
  settingsForm: document.getElementById("settingsForm"),
  cfgBusinessName: document.getElementById("cfgBusinessName"),
  cfgBusinessId: document.getElementById("cfgBusinessId"),
  cfgWebhook: document.getElementById("cfgWebhook"),
  cfgApiKey: document.getElementById("cfgApiKey"),
  cfgRememberApiKey: document.getElementById("cfgRememberApiKey"),
  cfgOwnerCode: document.getElementById("cfgOwnerCode")
};

boot();

function boot() {
  migrateOldSettings();
  bindTabs();
  bindModeControls();
  bindShiftControls();
  bindQuickControls();
  bindFormLogic();
  bindPresetCollapse();
  bindPresetManager();
  bindSettings();
  hydrateSettingsForm();
  hydrateMeta();
  hydrateShift();
  applyRoleMode();
  drawPresetControls();
  drawPresetGrid();
  drawPresetTable();
  drawRecent();
  drawSummary();
  syncPaymentButtons();
  updateSelectedPresetNote();
  updateComputed();
  updateSubmitButtonState();
  syncPresetsCollapseUI();
  tickClock();
  setInterval(tickClock, 1000);
}

function bindPresetCollapse() {
  if (!el.togglePresetsBtn || !el.presetsBody) return;

  el.togglePresetsBtn.addEventListener("click", () => {
    state.presetsCollapsed = !state.presetsCollapsed;
    syncPresetsCollapseUI();
  });

  const mobileMedia = window.matchMedia("(max-width: 640px)");
  const applyMobileDefault = (event) => {
    if (event.matches) {
      state.presetsCollapsed = true;
    } else {
      state.presetsCollapsed = false;
    }
    syncPresetsCollapseUI();
  };

  applyMobileDefault(mobileMedia);
  if (mobileMedia.addEventListener) {
    mobileMedia.addEventListener("change", applyMobileDefault);
  } else if (mobileMedia.addListener) {
    mobileMedia.addListener(applyMobileDefault);
  }
}

function syncPresetsCollapseUI() {
  if (!el.togglePresetsBtn || !el.presetsBody) return;
  el.presetsBody.classList.toggle("hidden", state.presetsCollapsed);
  el.togglePresetsBtn.textContent = state.presetsCollapsed ? "Show Presets" : "Hide Presets";
}

function migrateOldSettings() {
  if (state.settings.api_key && !state.settings.remember_api_key) {
    sessionStorage.setItem(SESSION.apiKey, state.settings.api_key);
    state.settings.api_key = "";
  }

  save(STORAGE.settings, state.settings);
}

function isBackendConfigured() {
  return !!(state.settings.webhook_url && getApiKey());
}

function bindTabs() {
  el.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      if (isOwnerView(target) && state.roleMode !== "owner") {
        showResult(false, "Switch to Owner Mode to access this page.");
        return;
      }

      el.tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      el.views.forEach((view) => {
        view.classList.toggle("active", view.id === `view-${target}`);
      });

      if (target === "summary") drawSummary();
      if (target === "presets") drawPresetTable();
    });
  });
}

function bindModeControls() {
  el.modeCashier.addEventListener("click", () => {
    state.roleMode = "cashier";
    applyRoleMode();
  });

  el.modeOwner.addEventListener("click", () => {
    const ownerCode = String(state.settings.owner_code || "").trim();
    if (ownerCode) {
      const input = window.prompt("Enter owner access code");
      if (String(input || "") !== ownerCode) {
        showResult(false, "Invalid owner access code.");
        return;
      }
    }
    state.roleMode = "owner";
    applyRoleMode();
  });
}

function applyRoleMode() {
  const owner = state.roleMode === "owner";
  el.modeCashier.classList.toggle("active", !owner);
  el.modeOwner.classList.toggle("active", owner);
  el.ownerOnlyTabs.forEach((tab) => tab.classList.toggle("hidden", !owner));
  el.ownerOnlyControls.forEach((node) => node.classList.toggle("hidden", !owner));

  const activeTab = document.querySelector(".tab[data-tab].active");
  if (activeTab && isOwnerView(activeTab.dataset.tab) && !owner) {
    const salesTab = document.querySelector('.tab[data-tab="sales"]');
    if (salesTab) salesTab.click();
  }

  applyCashierInputPolicy();
}

function isOwnerView(tabName) {
  return tabName === "presets" || tabName === "settings";
}

function bindShiftControls() {
  el.startShiftBtn.addEventListener("click", () => {
    const name = val(el.shiftCashierName);
    if (!name) {
      showResult(false, "Enter cashier name first.");
      return;
    }
    state.shiftCashier = name;
    sessionStorage.setItem(SESSION.shiftCashier, name);
    hydrateShift();
    showResult(true, `Shift started for ${name}.`);
  });

  el.endShiftBtn.addEventListener("click", () => {
    state.shiftCashier = "";
    sessionStorage.removeItem(SESSION.shiftCashier);
    hydrateShift();
    showResult(true, "Shift ended.");
  });
}

function hydrateShift() {
  el.shiftCashierName.value = state.shiftCashier;
  if (state.shiftCashier) {
    el.shiftStatus.textContent = `Active shift: ${state.shiftCashier}`;
    el.shiftCashierName.disabled = true;
    el.startShiftBtn.classList.add("hidden");
    el.endShiftBtn.classList.remove("hidden");
  } else {
    el.shiftStatus.textContent = "No active shift";
    el.shiftCashierName.disabled = false;
    el.startShiftBtn.classList.remove("hidden");
    el.endShiftBtn.classList.add("hidden");
  }
}

function bindQuickControls() {
  el.qtyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const add = Number(btn.dataset.qtyAdd || 0);
      const reset = btn.dataset.qtyReset;
      if (reset) {
        el.quantity.value = "1";
      } else {
        const current = Number(el.quantity.value || 0);
        const next = Math.max(1, current + add);
        el.quantity.value = String(next);
      }
      updateComputed();
    });
  });

  el.paymentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      el.paymentMethod.value = btn.dataset.method;
      syncPaymentButtons();
    });
  });

  el.priceOverrideBtn.addEventListener("click", () => {
    if (state.roleMode === "owner") {
      state.priceOverrideActive = true;
      applyCashierInputPolicy();
      showResult(true, "Price override enabled.");
      return;
    }

    if (!state.selectedPresetId) {
      showResult(false, "Select a preset first.");
      return;
    }

    if (!requestManagerApproval("Price override")) return;
    state.priceOverrideActive = true;
    applyCashierInputPolicy();
    showResult(true, "Manager override approved. Unit price unlocked for this sale.");
  });
}

function syncPaymentButtons() {
  el.paymentButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.method === el.paymentMethod.value);
  });
}

function bindFormLogic() {
  [el.quantity, el.unitPrice, el.amountPaid].forEach((i) => {
    i.addEventListener("input", updateComputed);
  });

  el.itemSearch.addEventListener("input", drawPresetGrid);

  el.saleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.shiftCashier) {
      showResult(false, "Start a cashier shift before submitting.");
      return;
    }

    const apiKey = getApiKey();
    const backendReady = isBackendConfigured();

    const isCashier = state.roleMode === "cashier";
    const selectedPreset = getSelectedPreset();

    if (isCashier && !selectedPreset) {
      showResult(false, "Tap a preset item before submitting.");
      return;
    }

    const client_request_id = requestId();
    el.uiRequestId.textContent = client_request_id;

    const payload = {
      business_id: state.settings.business_id,
      cashier_name: state.shiftCashier,
      item_name: isCashier ? selectedPreset.item_name : val(el.itemName),
      category: isCashier ? selectedPreset.category : (val(el.category) || "Uncategorized"),
      quantity: Number(el.quantity.value),
      unit_price: isCashier
        ? (state.priceOverrideActive ? Number(el.unitPrice.value) : Number(selectedPreset.default_price))
        : Number(el.unitPrice.value),
      amount_paid: Number(el.amountPaid.value),
      payment_method: val(el.paymentMethod),
      notes: val(el.notes),
      client_request_id
    };

    if (!backendReady) {
      showResult(false, "Live backend is required. Go to Settings and set your Apps Script webhook URL and API key.");
      return;
    }

    el.submitBtn.disabled = true;
    el.submitBtn.textContent = "Submitting...";

    try {
      const response = await fetch(state.settings.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true) {
        const msg = data.message || `Request failed with status ${response.status}`;
        showResult(false, msg);
        return;
      }

      saveTransaction(payload, data, response.status);

      showResult(true, `Sale Recorded ✓ Change: ${money(data.change ?? 0)}. Transaction: ${data.transaction_id || "n/a"}`);
      drawRecent();
      drawSummary();
      resetAfterSubmit();
    } catch {
      showResult(false, "Cannot reach backend. Check webhook URL, API key, or internet.");
    } finally {
      el.submitBtn.disabled = false;
      updateSubmitButtonState();
    }
  });
}

function saveTransaction(payload, response, statusCode) {
  const tx = {
    local_id: uid(),
    created_at: new Date().toISOString(),
    payload,
    response,
    status_code: statusCode
  };
  state.transactions.unshift(tx);
  state.transactions = state.transactions.slice(0, 250);
  save(STORAGE.tx, state.transactions);
}

function resetAfterSubmit() {
  el.notes.value = "";
  el.amountPaid.value = "";
  el.quantity.value = "1";
  state.priceOverrideActive = false;

  if (el.afterSubmitBehavior.value === "clear_item") {
    clearSelectedPreset();
    el.itemName.value = "";
    el.category.value = "";
    el.unitPrice.value = "";
  } else {
    const preset = getSelectedPreset();
    if (preset) {
      el.itemName.value = preset.item_name;
      el.category.value = preset.category;
      el.unitPrice.value = String(preset.default_price);
    }
  }

  applyCashierInputPolicy();
  updateSelectedPresetNote();
  updateComputed();
  el.amountPaid.focus();
}

function bindPresetManager() {
  el.presetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const draft = {
      id: state.editingPresetId || uid(),
      item_name: val(el.presetName),
      default_price: Number(el.presetPrice.value),
      category: val(el.presetCategory),
      order: Number(el.presetOrder.value),
      active: el.presetActive.checked
    };

    if (state.editingPresetId) {
      state.presets = state.presets.map((p) => (p.id === state.editingPresetId ? draft : p));
      showResult(true, "Preset updated.");
    } else {
      state.presets.push(draft);
      showResult(true, "Preset added.");
    }

    clearPresetForm();
    persistPresets();
    drawPresetControls();
    drawPresetGrid();
    drawPresetTable();
  });

  el.presetCancelBtn.addEventListener("click", () => {
    clearPresetForm();
  });
}

function clearPresetForm() {
  state.editingPresetId = "";
  el.presetEditId.value = "";
  el.presetForm.reset();
  el.presetActive.checked = true;
  el.presetSubmitBtn.textContent = "Add Preset";
  el.presetCancelBtn.classList.add("hidden");
}

function startPresetEdit(id) {
  const p = state.presets.find((it) => it.id === id);
  if (!p) return;
  state.editingPresetId = id;
  el.presetEditId.value = id;
  el.presetName.value = p.item_name;
  el.presetPrice.value = String(p.default_price);
  el.presetCategory.value = p.category;
  el.presetOrder.value = String(p.order);
  el.presetActive.checked = !!p.active;
  el.presetSubmitBtn.textContent = "Save Changes";
  el.presetCancelBtn.classList.remove("hidden");
}

function bindSettings() {
  el.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    state.settings.business_name = val(el.cfgBusinessName) || "CounterFlow";
    state.settings.business_id = val(el.cfgBusinessId) || "BIZ-001";
    state.settings.webhook_url = val(el.cfgWebhook);
    state.settings.remember_api_key = !!el.cfgRememberApiKey.checked;
    state.settings.owner_code = val(el.cfgOwnerCode);

    const incomingApiKey = val(el.cfgApiKey);
    if (state.settings.remember_api_key) {
      state.settings.api_key = incomingApiKey;
      sessionStorage.removeItem(SESSION.apiKey);
    } else {
      state.settings.api_key = "";
      sessionStorage.setItem(SESSION.apiKey, incomingApiKey);
    }

    save(STORAGE.settings, state.settings);
    hydrateMeta();
    showResult(true, "Settings saved.");
  });
}

function hydrateSettingsForm() {
  el.cfgBusinessName.value = state.settings.business_name || "CounterFlow";
  el.cfgBusinessId.value = state.settings.business_id || "BIZ-001";
  el.cfgWebhook.value = state.settings.webhook_url || "";
  el.cfgRememberApiKey.checked = !!state.settings.remember_api_key;
  el.cfgOwnerCode.value = state.settings.owner_code || "";
  el.cfgApiKey.value = getApiKey();
}

function getApiKey() {
  if (state.settings.remember_api_key) return String(state.settings.api_key || "").trim();
  return String(sessionStorage.getItem(SESSION.apiKey) || "").trim();
}

function hydrateMeta() {
  const displayName = state.settings.business_name || "CounterFlow";
  el.metaBusiness.textContent = displayName;
  document.title = `${displayName} POS`;
  const ready = isBackendConfigured();
  el.metaStatus.textContent = ready ? "Live Backend" : "Setup Required";
  el.metaStatus.classList.toggle("status-online", ready);
  el.metaStatus.classList.toggle("status-offline", !ready);
}

function tickClock() {
  el.metaNow.textContent = new Date().toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: true
  });
}

function drawPresetControls() {
  const categories = ["All", ...new Set(state.presets.map((p) => p.category))];
  el.categoryChips.innerHTML = categories
    .map((cat) => `<button class="chip ${state.activeCategory === cat ? "active" : ""}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`)
    .join("");

  el.categoryChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.activeCategory = chip.dataset.cat;
      drawPresetControls();
      drawPresetGrid();
    });
  });
}

function drawPresetGrid() {
  const q = val(el.itemSearch).toLowerCase();
  const list = state.presets
    .filter((p) => p.active)
    .filter((p) => state.activeCategory === "All" || p.category === state.activeCategory)
    .filter((p) => p.item_name.toLowerCase().includes(q))
    .sort((a, b) => Number(a.order) - Number(b.order));

  if (!list.length) {
    el.presetGrid.innerHTML = "<p>No presets found.</p>";
    return;
  }

  el.presetGrid.innerHTML = list
    .map((p) => `
      <article class="preset-card ${state.selectedPresetId === p.id ? "active" : ""}" data-id="${p.id}">
        <h4>${escapeHtml(p.item_name)}</h4>
        <p>${money(p.default_price)} | ${escapeHtml(p.category)}</p>
      </article>
    `)
    .join("");

  el.presetGrid.querySelectorAll(".preset-card").forEach((card) => {
    card.addEventListener("click", () => {
      const preset = state.presets.find((p) => p.id === card.dataset.id);
      if (!preset) return;
      selectPreset(preset);
      runPresetSelectionFlow();
    });
  });
}

function runPresetSelectionFlow() {
  // Make preset selection feel like an action: confirm, move user to next step, focus payment.
  if (el.paymentMethod.value === "cash") {
    const quantity = Number(el.quantity.value || 0);
    const unit = Number(el.unitPrice.value || 0);
    const total = quantity * unit;
    el.amountPaid.value = total > 0 ? String(total) : "";
  }

  highlightSelectionFeedback();

  if (el.saleFormPanel) {
    el.saleFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.setTimeout(() => {
    el.amountPaid.focus();
    el.amountPaid.select();
    updateComputed();
    updateSubmitButtonState();
  }, 220);
}

function highlightSelectionFeedback() {
  [el.selectedItemNote, el.saleFormPanel].forEach((node) => {
    if (!node) return;
    node.classList.remove("selection-flash");
    void node.offsetWidth;
    node.classList.add("selection-flash");
    window.setTimeout(() => node.classList.remove("selection-flash"), 320);
  });
}

function selectPreset(preset) {
  state.selectedPresetId = preset.id;
  state.priceOverrideActive = false;
  el.itemName.value = preset.item_name;
  el.category.value = preset.category;
  el.unitPrice.value = String(preset.default_price);
  if (!el.quantity.value || Number(el.quantity.value) < 1) el.quantity.value = "1";
  updateSelectedPresetNote();
  applyCashierInputPolicy();
  drawPresetGrid();
}

function clearSelectedPreset() {
  state.selectedPresetId = "";
  state.priceOverrideActive = false;
  updateSubmitButtonState();
}

function getSelectedPreset() {
  return state.presets.find((p) => p.id === state.selectedPresetId) || null;
}

function updateSelectedPresetNote() {
  const selected = getSelectedPreset();
  if (!selected) {
    el.selectedItemNote.textContent = "Tap an item on the left to start.";
    updateSubmitButtonState();
    return;
  }
  const overrideTag = state.priceOverrideActive ? " | Price override active" : "";
  el.selectedItemNote.textContent = `Selected: ${selected.item_name} - ${money(selected.default_price)}${overrideTag}`;
  updateSubmitButtonState();
}

function applyCashierInputPolicy() {
  const isCashier = state.roleMode === "cashier";
  el.itemName.readOnly = isCashier;
  el.category.readOnly = isCashier;
  el.unitPrice.readOnly = isCashier && !state.priceOverrideActive;

  if (el.categoryLabel) el.categoryLabel.classList.toggle("hidden", isCashier);
  if (el.notesLabel) el.notesLabel.classList.toggle("hidden", isCashier);

  updateSubmitButtonState();
}

function updateSubmitButtonState() {
  const selected = getSelectedPreset();
  const isCashier = state.roleMode === "cashier";
  const backendReady = isBackendConfigured();

  if (!backendReady) {
    el.submitBtn.disabled = true;
    el.submitBtn.textContent = "Configure Live Backend";
    el.submitBtn.classList.remove("submit-ready");
    return;
  }

  el.submitBtn.disabled = false;

  if (isCashier && selected) {
    const shortName = String(selected.item_name || "").slice(0, 22);
    el.submitBtn.textContent = `Submit ${shortName}`;
    el.submitBtn.classList.add("submit-ready");
    return;
  }

  el.submitBtn.textContent = "Submit Sale";
  el.submitBtn.classList.remove("submit-ready");
}

function drawPresetTable() {
  const sorted = [...state.presets].sort((a, b) => Number(a.order) - Number(b.order));
  el.presetTable.innerHTML = sorted
    .map((p) => `
      <div class="preset-row">
        <strong>${escapeHtml(p.item_name)}</strong>
        <span>${money(p.default_price)}</span>
        <span>${escapeHtml(p.category)}</span>
        <span>Order ${Number(p.order)}</span>
        <span class="muted">${p.active ? "Active" : "Inactive"}</span>
        <button class="preset-btn" data-action="edit" data-id="${p.id}">Edit</button>
        <button class="preset-btn" data-action="toggle" data-id="${p.id}">${p.active ? "Disable" : "Enable"}</button>
        <button class="preset-btn danger" data-action="delete" data-id="${p.id}">Delete</button>
      </div>
    `)
    .join("");

  el.presetTable.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const preset = state.presets.find((p) => p.id === id);
      if (!preset) return;

      if (action === "edit") {
        startPresetEdit(id);
        return;
      }

      if (action === "toggle") {
        preset.active = !preset.active;
      } else if (action === "delete") {
        if (!requestManagerApproval("Delete preset")) return;
        state.presets = state.presets.filter((p) => p.id !== id);
        if (state.selectedPresetId === id) clearSelectedPreset();
      }

      persistPresets();
      drawPresetControls();
      drawPresetGrid();
      drawPresetTable();
      updateSelectedPresetNote();
      applyCashierInputPolicy();
    });
  });
}

function requestManagerApproval(actionLabel) {
  const ownerCode = String(state.settings.owner_code || "").trim();
  if (!ownerCode) {
    // If no owner code is set, let them proceed.
    return true;
  }

  const input = window.prompt(`Manager approval required: ${actionLabel}. Enter owner code`);
  if (String(input || "") !== ownerCode) {
    showResult(false, "Manager approval failed.");
    return false;
  }

  return true;
}

function drawRecent() {
  const recent = state.transactions.slice(0, 5);
  if (!recent.length) {
    el.recentList.innerHTML = "<p>No recent successful transactions yet.</p>";
    return;
  }

  el.recentList.innerHTML = recent
    .map((t) => `
      <article class="recent-item">
        <strong>${escapeHtml(t.payload.item_name)} x${Number(t.payload.quantity)}</strong>
        <div>${money(Number(t.payload.quantity) * Number(t.payload.unit_price))} | ${escapeHtml(t.payload.payment_method)}</div>
        <small>${new Date(t.created_at).toLocaleString("en-PH")}</small>
      </article>
    `)
    .join("");
}

function drawSummary() {
  const today = new Date().toISOString().slice(0, 10);
  const txToday = state.transactions.filter((t) => (t.created_at || "").slice(0, 10) === today);

  const total = txToday.reduce((sum, t) => sum + Number(t.payload.quantity) * Number(t.payload.unit_price), 0);
  const cash = txToday
    .filter((t) => t.payload.payment_method === "cash")
    .reduce((sum, t) => sum + Number(t.payload.quantity) * Number(t.payload.unit_price), 0);
  const gcash = txToday
    .filter((t) => t.payload.payment_method === "gcash")
    .reduce((sum, t) => sum + Number(t.payload.quantity) * Number(t.payload.unit_price), 0);

  el.sumTodayTotal.textContent = money(total);
  el.sumTxCount.textContent = String(txToday.length);
  el.sumCash.textContent = money(cash);
  el.sumGcash.textContent = money(gcash);

  const itemCounter = new Map();
  txToday.forEach((t) => {
    const key = t.payload.item_name;
    itemCounter.set(key, (itemCounter.get(key) || 0) + Number(t.payload.quantity));
  });

  const top = [...itemCounter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!top.length) {
    el.topItems.innerHTML = "<p>No data yet today.</p>";
    return;
  }

  el.topItems.innerHTML = top
    .map(([name, qty]) => `<article class="top-item"><strong>${escapeHtml(name)}</strong><small> ${qty} sold</small></article>`)
    .join("");
}

function updateComputed() {
  const quantity = Number(el.quantity.value || 0);
  const unit = Number(el.unitPrice.value || 0);
  const paid = Number(el.amountPaid.value || 0);
  const total = quantity * unit;
  const change = paid - total;

  el.uiTotal.textContent = money(total);
  el.uiChange.textContent = money(change);
}

function showResult(ok, text) {
  el.resultBox.classList.remove("hidden", "ok", "err");
  el.resultBox.classList.add(ok ? "ok" : "err");
  el.resultBox.textContent = text;

  if (ok) {
    document.body.classList.remove("flash-ok");
    void document.body.offsetWidth;
    document.body.classList.add("flash-ok");
    setTimeout(() => document.body.classList.remove("flash-ok"), 300);
    beep();
  }
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 860;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore devices that block autoplay audio.
  }
}

function persistPresets() {
  save(STORAGE.presets, state.presets);
}

function requestId() {
  return `REQ-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function val(input) {
  return String(input.value || "").trim();
}

function money(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function escapeHtml(v) {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
