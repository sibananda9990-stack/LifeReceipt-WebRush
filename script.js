const STORAGE_KEY = "lifeReceiptMemories_v2";

const TYPE_META = {
  music: { label: "Music", icon: "♫" },
  place: { label: "Place", icon: "⌖" },
  purchase: { label: "Purchase", icon: "₹" },
  photo: { label: "Photo", icon: "▣" },
  message: { label: "Message", icon: "✉" }
};

const SEED_MEMORIES = [
  {
    id: "m1",
    title: "Roads & Rain",
    type: "music",
    date: "2026-09-18",
    place: "Bhubaneswar, IN",
    note: "A playlist that made the long ride feel shorter.",
    value: "PRICELESS"
  },
  {
    id: "m2",
    title: "The Coffee Detour",
    type: "place",
    date: "2026-09-16",
    place: "Badrak, IN",
    note: "Stopped somewhere unexpected and found a better morning.",
    value: "₹120"
  },
  {
    id: "m3",
    title: "Something I Wanted",
    type: "purchase",
    date: "2026-09-14",
    place: "Cuttack, IN",
    note: "A small purchase that had been on the list for weeks.",
    value: "₹899"
  },
  {
    id: "m4",
    title: "Golden Hour",
    type: "photo",
    date: "2026-09-12",
    place: "Puri, IN",
    note: "The light was perfect. No filter needed.",
    value: "PRICELESS"
  },
  {
    id: "m5",
    title: "The Message",
    type: "message",
    date: "2026-09-10",
    place: "Online",
    note: "The message I almost didn't send.",
    value: "IMPORTANT"
  },
  {
    id: "m6",
    title: "Goodnight Became 2 Hours",
    type: "message",
    date: "2026-09-08",
    place: "Home",
    note: "One conversation became a memory.",
    value: "PRICELESS"
  },
  {
    id: "m7",
    title: "First Visit",
    type: "place",
    date: "2026-09-06",
    place: "Kolkata, IN",
    note: "A first visit that somehow felt familiar.",
    value: "₹450"
  },
  {
    id: "m8",
    title: "That One Repeat Song",
    type: "music",
    date: "2026-09-04",
    place: "Home",
    note: "Played the same song until it became the soundtrack.",
    value: "47 min"
  },
  {
    id: "m9",
    title: "A Road I Remember",
    type: "place",
    date: "2026-09-02",
    place: "Odisha, IN",
    note: "No destination. Just a road worth remembering.",
    value: "18 km"
  },
  {
    id: "m10",
    title: "Friends, Slightly Blurry",
    type: "photo",
    date: "2026-08-29",
    place: "Bhubaneswar, IN",
    note: "Not the clearest photo, but one of the best nights.",
    value: "PRICELESS"
  },
  {
    id: "m11",
    title: "Late Night Drive",
    type: "place",
    date: "2026-08-26",
    place: "Badrak, IN",
    note: "Quiet roads and a very loud playlist.",
    value: "01:42"
  },
  {
    id: "m12",
    title: "Coffee & Thoughts",
    type: "purchase",
    date: "2026-08-24",
    place: "Bhubaneswar, IN",
    note: "Sometimes a small coffee is enough to reset the day.",
    value: "₹120"
  }
];

const state = {
  memories: [],
  filter: "all",
  search: "",
  sort: "newest",
  editingId: null,
  lastFocusedElement: null
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  grid: $("#receiptGrid"),
  empty: $("#emptyState"),
  search: $("#searchInput"),
  sort: $("#sortSelect"),
  count: $("#countPill"),

  totalStat: $("#totalStat"),
  monthStat: $("#monthStat"),
  placesStat: $("#placesStat"),
  activeStat: $("#activeStat"),

  insightTotal: $("#insightTotal"),
  latestMemory: $("#latestMemory"),
  favoriteCategory: $("#favoriteCategory"),
  streakStat: $("#streakStat"),
  categoryBars: $("#categoryBars"),
  categoryTotal: $("#categoryTotal"),

  modal: $("#modalBackdrop"),
  modalTitle: $("#modalTitle"),
  form: $("#memoryForm"),
  memoryId: $("#memoryId"),
  memoryTitle: $("#memoryTitle"),
  memoryType: $("#memoryType"),
  memoryDate: $("#memoryDate"),
  memoryPlace: $("#memoryPlace"),
  memoryNote: $("#memoryNote"),
  memoryValue: $("#memoryValue"),

  toast: $("#toast")
};

function loadMemories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not load memories:", error);
  }

  return [...SEED_MEMORIES];
}

function saveMemories() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state.memories)
    );
  } catch (error) {
    console.warn("Could not save memories:", error);
    showToast("Could not save changes.");
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getFilteredMemories() {
  const search = state.search.trim().toLowerCase();

  let result = state.memories.filter((memory) => {
    const matchesFilter =
      state.filter === "all" ||
      memory.type === state.filter;

    const searchableText = [
      memory.title,
      memory.place,
      memory.note,
      memory.value,
      memory.type
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !search || searchableText.includes(search);

    return matchesFilter && matchesSearch;
  });

  result.sort((a, b) => {
    if (state.sort === "oldest") {
      return a.date.localeCompare(b.date);
    }

    if (state.sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (state.sort === "value") {
      return String(b.value).length - String(a.value).length;
    }

    return b.date.localeCompare(a.date);
  });

  return result;
}

function renderReceipts() {
  const memories = getFilteredMemories();

  elements.grid.innerHTML = "";

  elements.count.textContent =
    `${memories.length} ${memories.length === 1 ? "receipt" : "receipts"}`;

  if (!memories.length) {
    elements.empty.hidden = false;
    return;
  }

  elements.empty.hidden = true;

  memories.forEach((memory) => {
    const meta =
      TYPE_META[memory.type] || TYPE_META.message;

    const card = document.createElement("article");

    card.className = "receipt-card";

    card.innerHTML = `
      <div class="receipt-card-top">
        <span class="receipt-type">
          ${escapeHTML(meta.icon)} ${escapeHTML(meta.label)}
        </span>

        <span class="receipt-date">
          ${escapeHTML(formatDate(memory.date))}
        </span>
      </div>

      <h3>${escapeHTML(memory.title)}</h3>

      <p class="receipt-place">
        ${escapeHTML(memory.place)}
      </p>

      <p class="receipt-note">
        ${escapeHTML(memory.note)}
      </p>

      <div class="receipt-card-bottom">
        <span class="receipt-value">
          ${escapeHTML(memory.value)}
        </span>

        <div class="card-actions">
          <button
            class="card-action"
            type="button"
            data-action="edit"
            data-id="${escapeHTML(memory.id)}"
            aria-label="Edit ${escapeHTML(memory.title)}"
          >
            Edit
          </button>

          <button
            class="card-action delete"
            type="button"
            data-action="delete"
            data-id="${escapeHTML(memory.id)}"
            aria-label="Delete ${escapeHTML(memory.title)}"
          >
            Delete
          </button>
        </div>
      </div>
    `;

    elements.grid.appendChild(card);
  });
}

function updateStats() {
  const memories = state.memories;

  elements.totalStat.textContent = memories.length;
  elements.insightTotal.textContent = memories.length;

  const now = new Date();

  const currentMonthCount = memories.filter((memory) => {
    const date = new Date(`${memory.date}T00:00:00`);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  elements.monthStat.textContent = currentMonthCount;

  const places = new Set(
    memories
      .map((memory) => memory.place?.trim())
      .filter(Boolean)
  );

  elements.placesStat.textContent = places.size;

  const counts = getCategoryCounts();

  const topCategory = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0];

  elements.activeStat.textContent = topCategory
    ? TYPE_META[topCategory[0]]?.label || topCategory[0]
    : "—";

  elements.favoriteCategory.textContent = topCategory
    ? TYPE_META[topCategory[0]]?.label || topCategory[0]
    : "—";

  const latest = [...memories].sort((a, b) =>
    b.date.localeCompare(a.date)
  )[0];

  elements.latestMemory.textContent =
    latest?.title || "—";

  elements.streakStat.textContent =
    calculateMemoryStreak(memories);

  renderCategoryBars(counts);
}

function getCategoryCounts() {
  const counts = {
    music: 0,
    place: 0,
    purchase: 0,
    photo: 0,
    message: 0
  };

  state.memories.forEach((memory) => {
    if (counts[memory.type] !== undefined) {
      counts[memory.type]++;
    }
  });

  return counts;
}

function renderCategoryBars(counts) {
  const total = state.memories.length;

  elements.categoryTotal.textContent =
    `${total} ${total === 1 ? "memory" : "memories"}`;

  elements.categoryBars.innerHTML = "";

  Object.entries(counts).forEach(([type, count]) => {
    const label = TYPE_META[type].label;
    const percentage =
      total > 0 ? Math.round((count / total) * 100) : 0;

    const row = document.createElement("div");

    row.className = "category-bar";

    row.innerHTML = `
      <div class="category-bar-top">
        <span>${escapeHTML(label)}</span>
        <span>${count} · ${percentage}%</span>
      </div>

      <div class="category-track">
        <div
          class="category-fill"
          style="width: ${percentage}%"
        ></div>
      </div>
    `;

    elements.categoryBars.appendChild(row);
  });
}

function calculateMemoryStreak(memories) {
  const uniqueDates = [
    ...new Set(
      memories
        .map((memory) => memory.date)
        .filter(Boolean)
    )
  ].sort((a, b) => b.localeCompare(a));

  if (!uniqueDates.length) {
    return 0;
  }

  let streak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(
      `${uniqueDates[i - 1]}T00:00:00`
    );

    const previous = new Date(
      `${uniqueDates[i]}T00:00:00`
    );

    const difference =
      (current - previous) / 86400000;

    if (difference === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function refreshUI() {
  renderReceipts();
  updateStats();
}

function openModal(memory = null) {
  state.editingId = memory?.id || null;
  state.lastFocusedElement = document.activeElement;

  elements.modalTitle.textContent = memory
    ? "Edit memory"
    : "Add a memory";

  elements.memoryId.value = memory?.id || "";
  elements.memoryTitle.value = memory?.title || "";
  elements.memoryType.value = memory?.type || "music";
  elements.memoryDate.value =
    memory?.date || getTodayString();
  elements.memoryPlace.value = memory?.place || "";
  elements.memoryNote.value = memory?.note || "";
  elements.memoryValue.value = memory?.value || "";

  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    elements.memoryTitle.focus();
  });
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";

  if (
    state.lastFocusedElement &&
    typeof state.lastFocusedElement.focus === "function"
  ) {
    state.lastFocusedElement.focus();
  }

  state.lastFocusedElement = null;
  state.editingId = null;
}

function getTodayString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);

  const memory = {
    id:
      state.editingId ||
      `memory-${Date.now()}`,
    title: formData.get("title").trim(),
    type: formData.get("type"),
    date: formData.get("date"),
    place: formData.get("place").trim(),
    note: formData.get("note").trim(),
    value: formData.get("value").trim()
  };

  if (
    !memory.title ||
    !memory.date ||
    !memory.place ||
    !memory.note ||
    !memory.value
  ) {
    showToast("Please complete all fields.");
    return;
  }

  if (state.editingId) {
    const index = state.memories.findIndex(
      (item) => item.id === state.editingId
    );

    if (index !== -1) {
      state.memories[index] = memory;
      showToast("Receipt updated.");
    }
  } else {
    state.memories.unshift(memory);
    showToast("New receipt added.");
  }

  saveMemories();
  refreshUI();
  closeModal();
}

function editMemory(id) {
  const memory = state.memories.find(
    (item) => item.id === id
  );

  if (memory) {
    openModal(memory);
  }
}

function deleteMemory(id) {
  const memory = state.memories.find(
    (item) => item.id === id
  );

  if (!memory) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${memory.title}"?`
  );

  if (!confirmed) {
    return;
  }

  state.memories = state.memories.filter(
    (item) => item.id !== id
  );

  saveMemories();
  refreshUI();
  showToast("Receipt deleted.");
}

function clearFilters() {
  state.filter = "all";
  state.search = "";
  state.sort = "newest";

  elements.search.value = "";
  elements.sort.value = "newest";

  document.querySelectorAll(".filter").forEach((button) => {
    const active =
      button.dataset.filter === "all";

    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-pressed",
      String(active)
    );
  });

  refreshUI();
}

function exportMemories() {
  const data = JSON.stringify(
    state.memories,
    null,
    2
  );

  const blob = new Blob(
    [data],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "life-receipt-memories.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Memories exported.");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function showRandomMemory() {
  if (!state.memories.length) {
    showToast("No memories available yet.");
    return;
  }

  const memory =
    state.memories[
      Math.floor(
        Math.random() * state.memories.length
      )
    ];

  state.search = memory.title;
  elements.search.value = memory.title;

  state.filter = "all";

  document.querySelectorAll(".filter").forEach((button) => {
    const active =
      button.dataset.filter === "all";

    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-pressed",
      String(active)
    );
  });

  refreshUI();

  const card = [...elements.grid.children].find(
    (item) =>
      item.querySelector("h3")?.textContent ===
      memory.title
  );

  card?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  showToast(`Random memory: ${memory.title}`);
}

function toggleTheme() {
  const current =
    document.documentElement.dataset.theme;

  const next =
    current === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem(
      "lifeReceiptTheme",
      next
    );
  } catch (error) {
    console.warn("Theme could not be saved.");
  }
}

function loadTheme() {
  try {
    const saved =
      localStorage.getItem("lifeReceiptTheme");

    if (saved === "dark" || saved === "light") {
      document.documentElement.dataset.theme =
        saved;
    }
  } catch (error) {
    console.warn("Theme could not be loaded.");
  }
}

/* EVENT LISTENERS */

$("#addBtn")?.addEventListener(
  "click",
  () => openModal()
);

$("#emptyAddBtn")?.addEventListener(
  "click",
  () => openModal()
);

$("#randomBtn")?.addEventListener(
  "click",
  showRandomMemory
);

$("#themeBtn")?.addEventListener(
  "click",
  toggleTheme
);

$("#closeModalBtn")?.addEventListener(
  "click",
  closeModal
);

$("#cancelModalBtn")?.addEventListener(
  "click",
  closeModal
);

$("#clearBtn")?.addEventListener(
  "click",
  clearFilters
);

$("#exportBtn")?.addEventListener(
  "click",
  exportMemories
);

elements.form?.addEventListener(
  "submit",
  handleFormSubmit
);

elements.search?.addEventListener(
  "input",
  (event) => {
    state.search = event.target.value;
    renderReceipts();
  }
);

elements.sort?.addEventListener(
  "change",
  (event) => {
    state.sort = event.target.value;
    renderReceipts();
  }
);

document.querySelectorAll(".filter").forEach(
  (button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;

      document
        .querySelectorAll(".filter")
        .forEach((item) => {
          const active =
            item === button;

          item.classList.toggle(
            "active",
            active
          );

          item.setAttribute(
            "aria-pressed",
            String(active)
          );
        });

      renderReceipts();
    });
  }
);

elements.grid?.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
      editMemory(id);
    }

    if (action === "delete") {
      deleteMemory(id);
    }
  }
);

elements.modal?.addEventListener(
  "click",
  (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !elements.modal.hidden
    ) {
      closeModal();
    }
  }
);

/* INITIALIZE */

loadTheme();

state.memories = loadMemories();

refreshUI();
