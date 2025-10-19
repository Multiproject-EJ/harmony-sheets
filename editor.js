const STORAGE_KEY = 'harmony-sheets-admin-v1';

const state = {
  products: [],
  baseline: [],
  selectedId: null,
  sortKey: 'name',
  sortDir: 'asc'
};

const subscribers = new Set();

const els = {
  status: document.querySelector('[data-status]'),
  statusIndicator: document.querySelector('[data-status-indicator]'),
  workspaceLabel: document.querySelector('[data-workspace-label]'),
  tableBody: document.querySelector('[data-products-table]'),
  tableMeta: document.querySelector('[data-table-meta]'),
  tableContainer: document.querySelector('[data-table-container]'),
  search: document.querySelector('[data-search]'),
  areaFilter: document.querySelector('[data-area-filter]'),
  addButton: document.querySelector('[data-add-product]'),
  exportButton: document.querySelector('[data-export]'),
  resetButton: document.querySelector('[data-reset]'),
  form: document.querySelector('[data-product-form]'),
  formTitle: document.querySelector('[data-form-title]'),
  formMode: document.querySelector('[data-form-mode]'),
  formPlaceholder: document.querySelector('[data-editor-empty]'),
  deleteButton: document.querySelector('[data-delete]'),
  cancelButton: document.querySelector('[data-cancel]'),
  viewButton: document.querySelector('[data-view-product]'),
  guideButton: document.querySelector('[data-editing-guide-open]'),
  guideModal: document.querySelector('[data-editing-guide-modal]'),
  guideDialog: document.querySelector('[data-editing-guide-dialog]'),
  guideDismissTriggers: document.querySelectorAll('[data-editing-guide-dismiss]'),
  productModal: document.querySelector('[data-product-modal]'),
  productModalDialog: document.querySelector('[data-product-modal-dialog]'),
  productModalDismissTriggers: document.querySelectorAll('[data-product-modal-dismiss]'),
  formFeedback: document.querySelector('[data-form-feedback]')
};

const formFields = {
  id: els.form?.elements.namedItem('id'),
  name: els.form?.elements.namedItem('name'),
  tagline: els.form?.elements.namedItem('tagline'),
  draft: els.form?.elements.namedItem('draft'),
  price: els.form?.elements.namedItem('price'),
  lifeAreas: els.form?.elements.namedItem('lifeAreas'),
  badges: els.form?.elements.namedItem('badges'),
  description: els.form?.elements.namedItem('description'),
  features: els.form?.elements.namedItem('features'),
  included: els.form?.elements.namedItem('included'),
  gallery: els.form?.elements.namedItem('gallery'),
  faqs: els.form?.elements.namedItem('faqs'),
  benefits: els.form?.elements.namedItem('benefits'),
  pricingTitle: els.form?.elements.namedItem('pricingTitle'),
  pricingSub: els.form?.elements.namedItem('pricingSub'),
  stripe: els.form?.elements.namedItem('stripe'),
  etsy: els.form?.elements.namedItem('etsy'),
  colorImage: els.form?.elements.namedItem('colorImage'),
  colorCaption: els.form?.elements.namedItem('colorCaption'),
  demoVideo: els.form?.elements.namedItem('demoVideo'),
  demoPoster: els.form?.elements.namedItem('demoPoster'),
  socialStars: els.form?.elements.namedItem('socialStars'),
  socialQuote: els.form?.elements.namedItem('socialQuote')
};

let lastFocusedGuideTrigger = null;
let lastFocusedEditorTrigger = null;
let lastFocusedEditorTriggerId = null;
let pendingSupabaseCheck = null;
let lastProductAction = null;
let currentPreviewUrl = null;

function getGuideFocusableElements() {
  if (!els.guideModal) return [];
  const selectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  return Array.from(els.guideModal.querySelectorAll(selectors)).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    return element.offsetParent !== null || element === els.guideDialog;
  });
}

function handleGuideKeydown(event) {
  if (event.key === 'Escape' && els.guideModal?.classList.contains('is-open')) {
    event.preventDefault();
    closeGuideModal();
  }
  if (event.key === 'Tab' && els.guideModal?.classList.contains('is-open')) {
    const focusable = getGuideFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function openGuideModal() {
  if (!els.guideModal) return;
  lastFocusedGuideTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : els.guideButton;
  els.guideModal.hidden = false;
  els.guideButton?.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => {
    els.guideModal?.classList.add('is-open');
    document.body.classList.add('admin-guide-open');
    const focusTarget = els.guideDialog || getGuideFocusableElements()[0];
    focusTarget?.focus();
  });
  document.addEventListener('keydown', handleGuideKeydown);
}

function closeGuideModal() {
  if (!els.guideModal) return;
  els.guideModal.classList.remove('is-open');
  els.guideModal.hidden = true;
  document.body.classList.remove('admin-guide-open');
  document.removeEventListener('keydown', handleGuideKeydown);
  els.guideButton?.setAttribute('aria-expanded', 'false');
  if (lastFocusedGuideTrigger && typeof lastFocusedGuideTrigger.focus === 'function') {
    lastFocusedGuideTrigger.focus();
  }
  lastFocusedGuideTrigger = null;
}

function setupGuideModal() {
  if (!els.guideModal || !els.guideButton) return;
  els.guideButton.addEventListener('click', (event) => {
    event.preventDefault();
    openGuideModal();
  });
  els.guideDismissTriggers?.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      closeGuideModal();
    });
  });
  els.guideModal.addEventListener('click', (event) => {
    if (event.target === els.guideModal) {
      closeGuideModal();
    }
  });
}

function getEditorFocusableElements() {
  if (!els.productModal) return [];
  const selectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  return Array.from(els.productModal.querySelectorAll(selectors)).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    return element.offsetParent !== null || element === els.productModalDialog;
  });
}

function handleEditorKeydown(event) {
  if (!els.productModal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    handleCancel();
    return;
  }
  if (event.key === 'Tab') {
    const focusable = getEditorFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function openProductModal(options = {}) {
  if (!els.productModal) return;
  const { focusTarget = null } = options;
  if (els.productModal.classList.contains('is-open')) {
    const fallback = focusTarget || els.productModalDialog;
    if (fallback && typeof fallback.focus === 'function') {
      fallback.focus();
    }
    return;
  }
  if (els.form) {
    els.form.hidden = false;
  }
  lastFocusedEditorTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  lastFocusedEditorTriggerId =
    lastFocusedEditorTrigger?.dataset?.id || lastFocusedEditorTrigger?.getAttribute?.('data-id') || null;
  els.productModal.hidden = false;
  requestAnimationFrame(() => {
    els.productModal?.classList.add('is-open');
    document.body.classList.add('admin-editor-open');
    const target = focusTarget || els.productModalDialog || getEditorFocusableElements()[0];
    target?.focus();
  });
  document.addEventListener('keydown', handleEditorKeydown);
}

function closeProductModal({ restoreFocus = true } = {}) {
  if (!els.productModal) return;
  els.productModal.classList.remove('is-open');
  document.body.classList.remove('admin-editor-open');
  document.removeEventListener('keydown', handleEditorKeydown);
  if (els.form) {
    els.form.hidden = true;
  }
  els.productModal.hidden = true;
  if (restoreFocus) {
    if (lastFocusedEditorTriggerId) {
      const safeId = escapeSelector(lastFocusedEditorTriggerId);
      const replacement = document.querySelector(`.admin-table__select[data-id="${safeId}"]`);
      if (replacement instanceof HTMLElement) {
        replacement.focus();
        lastFocusedEditorTrigger = null;
        lastFocusedEditorTriggerId = null;
        return;
      }
    }
    if (lastFocusedEditorTrigger && typeof lastFocusedEditorTrigger.focus === 'function') {
      lastFocusedEditorTrigger.focus();
    }
  }
  lastFocusedEditorTrigger = null;
  lastFocusedEditorTriggerId = null;
}

function setupProductModal() {
  if (!els.productModal) return;
  els.productModalDismissTriggers?.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      handleCancel();
    });
  });
  els.productModal.addEventListener('click', (event) => {
    if (event.target === els.productModal) {
      handleCancel();
    }
  });
}

const lifeAreaNames = {
  love: 'Love',
  career: 'Career',
  health: 'Health',
  finances: 'Finances',
  fun: 'Fun',
  family: 'Family',
  environment: 'Environment',
  spirituality: 'Spirituality'
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('Failed to parse saved data', error);
    return null;
  }
}

function setWorkspaceSource(label) {
  if (!els.workspaceLabel) return;
  const text = typeof label === 'string' && label.trim().length ? label.trim() : 'Catalog workspace';
  if (els.workspaceLabel.textContent !== text) {
    els.workspaceLabel.textContent = text;
  }
}

function setStatus(message, tone = 'neutral') {
  if (!els.status || !els.statusIndicator) return;
  els.status.textContent = message;
  const indicator = els.statusIndicator;
  indicator.dataset.tone = tone;
}

function setFormFeedback(message, tone = 'info') {
  if (!els.formFeedback) return;
  if (!message) {
    els.formFeedback.textContent = '';
    els.formFeedback.hidden = true;
    delete els.formFeedback.dataset.tone;
    return;
  }
  els.formFeedback.textContent = message;
  els.formFeedback.hidden = false;
  els.formFeedback.dataset.tone = tone;
}

function formatLifeAreas(areas) {
  if (!Array.isArray(areas) || !areas.length) return '—';
  return areas
    .map((area) => lifeAreaNames[area] || area)
    .join(', ');
}

function formatBadges(badges) {
  if (!Array.isArray(badges) || !badges.length) return '—';
  return badges.join(', ');
}

function priceValue(price) {
  if (typeof price === 'string') {
    const match = price.match(/\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return Number(price) || 0;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getProductPreviewUrl(product) {
  if (!product || typeof product !== 'object') return null;
  const id = typeof product.id === 'string' ? product.id.trim() : '';
  if (!id) return null;
  return `product.html?id=${encodeURIComponent(id)}`;
}

function updateViewProductButton(product) {
  if (!els.viewButton) return;
  const url = getProductPreviewUrl(product);
  currentPreviewUrl = url;
  if (url) {
    els.viewButton.disabled = false;
    els.viewButton.removeAttribute('aria-disabled');
    els.viewButton.title = 'Opens the product page in a new tab.';
  } else {
    els.viewButton.disabled = true;
    els.viewButton.setAttribute('aria-disabled', 'true');
    els.viewButton.title = 'Select a product with an ID to preview.';
  }
}

function notifyCatalogSubscribers(reason = 'update') {
  if (!subscribers.size) return;
  const payload = {
    products: clone(state.products),
    reason
  };
  subscribers.forEach((subscriber) => {
    try {
      subscriber(payload);
    } catch (error) {
      console.error('[editor] Catalog subscriber failed', error);
    }
  });
}

function escapeSelector(value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return String(value).replace(/(["\\])/g, '\\$1');
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeDraftFlag(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ['true', '1', 'yes', 'y', 'draft', 'inactive'].includes(normalized);
  }
  if (value == null) return false;
  return Boolean(value);
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  const normalized = { ...product };
  if (Object.prototype.hasOwnProperty.call(normalized, 'draft')) {
    normalized.draft = normalizeDraftFlag(normalized.draft);
  } else if (Object.prototype.hasOwnProperty.call(normalized, 'inactive')) {
    normalized.draft = normalizeDraftFlag(normalized.inactive);
    delete normalized.inactive;
  } else {
    normalized.draft = false;
  }
  return normalized;
}

function loadFromStorage() {
  if (!window.localStorage) return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? safeParse(stored) : null;
}

function persist(options = {}) {
  if (!window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
  const { message = 'All changes saved locally.', tone = 'success' } = options || {};
  setWorkspaceSource('Local workspace');
  if (message) {
    setStatus(message, tone);
  }
}

function clearStorage() {
  if (!window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

async function loadProducts() {
  try {
    const response = await fetch('products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load products');
    const data = await response.json();
    const baseline = clone(data).map(normalizeProduct);
    state.baseline = baseline;
    const stored = loadFromStorage();
    if (stored && Array.isArray(stored)) {
      state.products = stored.map(normalizeProduct);
      setWorkspaceSource('Local workspace');
      setStatus('Loaded from local workspace.');
    } else {
      state.products = clone(baseline);
      setWorkspaceSource('Source JSON');
      setStatus('Loaded from source JSON.');
    }
    renderTable();
    notifyCatalogSubscribers('load');
  } catch (error) {
    console.error(error);
    setStatus('Unable to load products. Refresh to try again.', 'danger');
    setWorkspaceSource('Workspace unavailable');
    renderErrorRow('Could not load products.');
  }
}

function renderErrorRow(message) {
  if (!els.tableBody) return;
  els.tableBody.innerHTML = `<tr><td colspan="5" class="admin-table__empty">${message}</td></tr>`;
  if (els.tableMeta) {
    els.tableMeta.textContent = '0 products';
  }
}

function getFilteredProducts() {
  const search = (els.search?.value || '').trim().toLowerCase();
  const area = els.areaFilter?.value || 'all';
  const products = state.products.slice();

  const filtered = products.filter((product) => {
    const matchesArea =
      area === 'all' || (Array.isArray(product.lifeAreas) && product.lifeAreas.includes(area));

    if (!search) return matchesArea;

    const haystack = [product.name, product.tagline, ...(product.badges || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return matchesArea && haystack.includes(search);
  });

  const sortKey = state.sortKey;
  const direction = state.sortDir === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    switch (sortKey) {
      case 'lifeAreas': {
        const aCount = a.lifeAreas ? a.lifeAreas.length : 0;
        const bCount = b.lifeAreas ? b.lifeAreas.length : 0;
        if (aCount === bCount) {
          return a.name.localeCompare(b.name) * direction;
        }
        return (aCount - bCount) * direction;
      }
      case 'badges': {
        const aCount = a.badges ? a.badges.length : 0;
        const bCount = b.badges ? b.badges.length : 0;
        if (aCount === bCount) {
          return a.name.localeCompare(b.name) * direction;
        }
        return (aCount - bCount) * direction;
      }
      case 'price':
        return (priceValue(a.price) - priceValue(b.price)) * direction;
      case 'name':
      default:
        return a.name.localeCompare(b.name) * direction;
    }
  });

  return filtered;
}

function renderProductRow(product) {
  const isSelected = state.selectedId === product.id;
  const attributes = [
    'data-row',
    `id="product-row-${product.id}"`,
    `data-id="${product.id}"`,
    `data-draft="${product.draft ? 'true' : 'false'}"`,
    isSelected ? 'aria-selected="true"' : '',
    isSelected ? 'class="is-active"' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const statusLabel = product.draft ? 'Draft' : 'Active';
  const productName = product.name || 'Untitled product';
  const productTagline = product.tagline || '';
  const lifeAreas = formatLifeAreas(product.lifeAreas);
  const badges = formatBadges(product.badges);
  const price = product.price || '—';
  const labelName = escapeAttribute(product.name || product.id || 'product');

  return `
    <tr ${attributes}>
      <th scope="row" data-label="Product">
        <button type="button" class="admin-table__select" data-id="${product.id}">
          <span class="admin-table__name">${productName}</span>
          <span class="admin-table__tagline">${productTagline}</span>
        </button>
      </th>
      <td data-label="Life areas">${lifeAreas}</td>
      <td data-label="Labels">${badges}</td>
      <td class="admin-table__price" data-label="Price">${price}</td>
      <td class="admin-table__status" data-label="Draft">
        <label class="admin-table__status-toggle">
          <input type="checkbox" data-draft-toggle data-id="${product.id}" ${
            product.draft ? 'checked' : ''
          } aria-label="Toggle draft status for ${labelName}">
          <span class="sr-only">${statusLabel} status for ${product.name || 'Untitled product'}</span>
        </label>
      </td>
    </tr>
  `;
}

function renderTable() {
  if (!els.tableBody) return;
  const products = getFilteredProducts();

  if (!products.length) {
    els.tableBody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No products found. Adjust your filters or add a new product.</td></tr>';
  } else {
    const rows = products.map((product) => renderProductRow(product)).join('');
    els.tableBody.innerHTML = rows;
  }

  if (els.tableMeta) {
    const total = state.products.length;
    const filtered = products.length;
    els.tableMeta.textContent = filtered === total ? `${total} products` : `${filtered} of ${total} products`;
  }
}

function selectProduct(id, options = {}) {
  const {
    openModal: shouldOpenModal = false,
    focusTarget = null,
    resetFeedback = true
  } = options;
  if (!els.form || !els.formTitle) return;
  if (resetFeedback) {
    setFormFeedback(null);
  }
  const product = state.products.find((item) => item.id === id);
  state.selectedId = product ? product.id : null;
  renderTable();
  if (!product) {
    updateViewProductButton(null);
    if (els.formPlaceholder) {
      els.formPlaceholder.hidden = false;
    }
    if (formFields.draft) {
      formFields.draft.checked = false;
    }
    if (!resetFeedback) {
      setFormFeedback(null);
    }
    closeProductModal({ restoreFocus: false });
    return;
  }

  els.form.reset();
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = true;
  }
  els.formMode.textContent = 'Editing';
  els.formTitle.textContent = product.name || 'Untitled product';

  formFields.id.value = product.id || '';
  formFields.name.value = product.name || '';
  formFields.tagline.value = product.tagline || '';
  if (formFields.draft) {
    formFields.draft.checked = Boolean(product.draft);
  }
  formFields.price.value = product.price || '';
  formFields.lifeAreas.value = Array.isArray(product.lifeAreas) ? product.lifeAreas.join(', ') : '';
  formFields.badges.value = Array.isArray(product.badges) ? product.badges.join(', ') : '';
  formFields.description.value = product.description || '';
  formFields.features.value = Array.isArray(product.features) ? product.features.join('\n') : '';
  formFields.included.value = Array.isArray(product.included) ? product.included.join('\n') : '';
  formFields.gallery.value = Array.isArray(product.gallery)
    ? product.gallery.map((item) => `${item.src || ''} | ${item.alt || ''}`.trim()).join('\n')
    : '';
  formFields.faqs.value = Array.isArray(product.faqs)
    ? product.faqs.map((item) => `${item.q || ''} | ${item.a || ''}`.trim()).join('\n')
    : '';
  formFields.benefits.value = Array.isArray(product.benefits)
    ? product.benefits.map((item) => `${item.title || ''} | ${item.desc || ''}`.trim()).join('\n')
    : '';
  formFields.pricingTitle.value = product.pricingTitle || '';
  formFields.pricingSub.value = product.pricingSub || '';
  formFields.stripe.value = product.stripe || '';
  formFields.etsy.value = product.etsy || '';
  formFields.colorImage.value = product.colorImage || '';
  formFields.colorCaption.value = product.colorCaption || '';
  formFields.demoVideo.value = product.demoVideo || '';
  formFields.demoPoster.value = product.demoPoster || '';
  formFields.socialStars.value = product.socialProof?.stars || '';
  formFields.socialQuote.value = product.socialProof?.quote || '';

  updateViewProductButton(product);

  if (shouldOpenModal) {
    openProductModal({ focusTarget });
  }
}

function parseList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseGallery(value) {
  return value
    .split('\n')
    .map((line) => {
      const [src, alt] = line.split('|').map((part) => part.trim());
      if (!src) return null;
      return { src, alt: alt || '' };
    })
    .filter(Boolean);
}

function parseFaqs(value) {
  return value
    .split('\n')
    .map((line) => {
      const [q, a] = line.split('|').map((part) => part.trim());
      if (!q) return null;
      return { q, a: a || '' };
    })
    .filter(Boolean);
}

function parseBenefits(value) {
  return value
    .split('\n')
    .map((line) => {
      const [title, desc] = line.split('|').map((part) => part.trim());
      if (!title) return null;
      return { title, desc: desc || '' };
    })
    .filter(Boolean);
}

function buildProductPayload() {
  const payload = {
    id: formFields.id.value.trim(),
    name: formFields.name.value.trim(),
    tagline: formFields.tagline.value.trim(),
    draft: Boolean(formFields.draft?.checked),
    price: formFields.price.value.trim(),
    lifeAreas: parseList(formFields.lifeAreas.value.trim()),
    badges: parseList(formFields.badges.value.trim()),
    description: formFields.description.value.trim(),
    features: parseLines(formFields.features.value.trim()),
    included: parseLines(formFields.included.value.trim()),
    gallery: parseGallery(formFields.gallery.value.trim()),
    faqs: parseFaqs(formFields.faqs.value.trim()),
    benefits: parseBenefits(formFields.benefits.value.trim()),
    pricingTitle: formFields.pricingTitle.value.trim(),
    pricingSub: formFields.pricingSub.value.trim(),
    stripe: formFields.stripe.value.trim(),
    etsy: formFields.etsy.value.trim(),
    colorImage: formFields.colorImage.value.trim(),
    colorCaption: formFields.colorCaption.value.trim(),
    demoVideo: formFields.demoVideo.value.trim(),
    demoPoster: formFields.demoPoster.value.trim(),
    socialProof: {
      stars: formFields.socialStars.value.trim(),
      quote: formFields.socialQuote.value.trim()
    }
  };

  if (!payload.gallery.length) delete payload.gallery;
  if (!payload.faqs.length) delete payload.faqs;
  if (!payload.benefits.length) delete payload.benefits;
  if (!payload.features.length) delete payload.features;
  if (!payload.included.length) delete payload.included;
  if (!payload.lifeAreas.length) delete payload.lifeAreas;
  if (!payload.badges.length) delete payload.badges;
  if (!payload.socialProof.stars && !payload.socialProof.quote) delete payload.socialProof;

  return payload;
}

function handleFormSubmit(event) {
  event.preventDefault();
  pendingSupabaseCheck = null;
  lastProductAction = null;
  const productPayload = buildProductPayload();

  if (!productPayload.id) {
    setStatus('Product ID is required to save.', 'danger');
    setFormFeedback('Product ID is required to save.', 'danger');
    formFields.id.focus();
    return;
  }

  const isNew = state.selectedId === null || !state.products.some((item) => item.id === state.selectedId);
  const idExists = state.products.some((item) => item.id === productPayload.id);

  if (isNew && idExists) {
    setStatus('A product with that ID already exists. Choose a unique ID.', 'danger');
    setFormFeedback('A product with that ID already exists. Choose a unique ID.', 'danger');
    formFields.id.focus();
    return;
  }

  let changeReason = 'update';
  if (isNew) {
    const newProduct = {
      ...productPayload,
      gallery: productPayload.gallery || [],
      faqs: productPayload.faqs || [],
      benefits: productPayload.benefits || [],
      features: productPayload.features || [],
      included: productPayload.included || []
    };
    state.products.push(newProduct);
    state.selectedId = newProduct.id;
    persist({ message: 'New product saved locally. Download the JSON when you are ready to publish.', tone: 'success' });
    setFormFeedback('New product saved locally. Checking Supabase for sync…', 'info');
    lastProductAction = 'create';
    changeReason = 'create';
  } else {
    const index = state.products.findIndex((item) => item.id === state.selectedId);
    if (index === -1) return;
    const existing = state.products[index];
    const merged = {
      ...existing,
      ...productPayload
    };
    if (!productPayload.socialProof && existing.socialProof) {
      delete merged.socialProof;
    }
    state.products.splice(index, 1, merged);
    state.selectedId = merged.id;
    persist({ message: 'Product updated and saved locally.', tone: 'success' });
    setFormFeedback('Product updated locally. Checking Supabase for sync…', 'info');
    lastProductAction = 'update';
    changeReason = 'update';
  }

  renderTable();
  selectProduct(state.selectedId, { resetFeedback: false });
  notifyCatalogSubscribers(changeReason);

  const checkToken = `product-save:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  pendingSupabaseCheck = checkToken;
  window.dispatchEvent(
    new CustomEvent('admin:product-saved', {
      detail: {
        id: state.selectedId,
        reason: changeReason,
        token: checkToken
      }
    })
  );
}

function handleTableClick(event) {
  const button = event.target.closest('.admin-table__select');
  if (!button) return;
  const { id } = button.dataset;
  if (id) selectProduct(id, { openModal: true });
}

function handleDraftToggle(event) {
  const checkbox = event.target.closest('[data-draft-toggle]');
  if (!checkbox) return;
  const { id } = checkbox.dataset;
  if (!id) return;
  const index = state.products.findIndex((item) => item.id === id);
  if (index === -1) return;

  const wasFocused = document.activeElement === checkbox;
  const checked = checkbox.checked;
  const product = state.products[index];
  const updated = {
    ...product,
    draft: checked
  };
  state.products.splice(index, 1, updated);

  const productLabel = updated.name || updated.id || 'product';
  const message = checked
    ? `“${productLabel}” marked as draft.`
    : `“${productLabel}” marked as active.`;

  persist({ message, tone: checked ? 'info' : 'success' });
  notifyCatalogSubscribers('draft-toggle');
  renderTable();

  if (state.selectedId === id && formFields.draft) {
    formFields.draft.checked = checked;
  }

  if (wasFocused) {
    const safeId = escapeSelector(id);
    requestAnimationFrame(() => {
      els.tableBody
        ?.querySelector(`[data-draft-toggle][data-id="${safeId}"]`)
        ?.focus();
    });
  }
}

function handleSort(event) {
  const button = event.target.closest('[data-sort]');
  if (!button) return;
  const key = button.dataset.sort;
  if (!key) return;
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortKey = key;
    state.sortDir = 'asc';
  }
  renderTable();
}

function handleSearch() {
  renderTable();
}

function handleAddProduct() {
  state.selectedId = null;
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = true;
  }
  els.form?.reset();
  if (formFields.draft) {
    formFields.draft.checked = true;
  }
  if (els.formMode) {
    els.formMode.textContent = 'New product';
  }
  if (els.formTitle) {
    els.formTitle.textContent = 'New product';
  }
  updateViewProductButton(null);
  setFormFeedback('Drafting a new product. Complete the form and save to add it to your workspace.', 'info');
  renderTable();
  setStatus('Drafting a new product. Complete the form and save to add it to the list.', 'info');
  openProductModal({ focusTarget: formFields.id });
}

function handleDelete() {
  if (!state.selectedId) {
    els.form.reset();
    if (els.formPlaceholder) {
      els.formPlaceholder.hidden = false;
    }
    updateViewProductButton(null);
    closeProductModal({ restoreFocus: false });
    return;
  }
  const index = state.products.findIndex((item) => item.id === state.selectedId);
  if (index === -1) return;
  const removed = state.products.splice(index, 1);
  setStatus(`Deleted “${removed[0]?.name || removed[0]?.id}”.`, 'danger');
  setFormFeedback('Product deleted locally. Save to Supabase when you are ready to publish this change.', 'warning');
  state.selectedId = null;
  updateViewProductButton(null);
  persist({ message: null });
  notifyCatalogSubscribers('delete');
  renderTable();
  els.form.reset();
  if (formFields.draft) {
    formFields.draft.checked = false;
  }
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  closeProductModal({ restoreFocus: false });
  const firstRow = els.tableBody?.querySelector('.admin-table__select');
  if (firstRow instanceof HTMLElement) {
    firstRow.focus();
  } else {
    els.addButton?.focus();
  }
}

function handleCancel() {
  els.form.reset();
  if (formFields.draft) {
    formFields.draft.checked = false;
  }
  state.selectedId = null;
  updateViewProductButton(null);
  renderTable();
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  setFormFeedback(null);
  closeProductModal();
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state.products, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `harmony-products-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  setStatus('Download started. Upload the JSON wherever you host your catalog.', 'info');
}

function handleReset() {
  state.products = clone(state.baseline);
  state.selectedId = null;
  clearStorage();
  setWorkspaceSource('Source JSON');
  setStatus('Reverted to source JSON.', 'info');
  setFormFeedback(null);
  renderTable();
  notifyCatalogSubscribers('reset');
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  if (els.form) {
    els.form.reset();
  }
  if (formFields.draft) {
    formFields.draft.checked = false;
  }
  updateViewProductButton(null);
  closeProductModal({ restoreFocus: false });
}

export function replaceCatalog(products, options = {}) {
  const {
    sourceLabel = 'Catalog workspace',
    statusMessage = null,
    statusTone = 'success',
    persistLocal = true,
    updateBaseline = false,
    reason = 'replace'
  } = options || {};

  const normalized = Array.isArray(products) ? products.map((product) => normalizeProduct(product)) : [];
  state.products = clone(normalized);
  if (updateBaseline) {
    state.baseline = clone(normalized);
  }

  state.selectedId = null;

  if (persistLocal && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
    } catch (error) {
      console.warn('[editor] Failed to persist catalog', error);
    }
  }

  setWorkspaceSource(sourceLabel);
  if (statusMessage) {
    setStatus(statusMessage, statusTone);
  }

  setFormFeedback(null);
  renderTable();
  notifyCatalogSubscribers(reason);

  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  if (els.form) {
    els.form.reset();
  }
  if (formFields.draft) {
    formFields.draft.checked = false;
  }

  updateViewProductButton(null);
  closeProductModal({ restoreFocus: false });
}

export function setWorkspaceStatus(message, tone = 'neutral') {
  setStatus(message, tone);
}

function handleKeyboardNavigation(event) {
  if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
  const rows = Array.from(els.tableBody?.querySelectorAll('[data-row]') || []);
  if (!rows.length) return;
  event.preventDefault();
  const currentIndex = rows.findIndex((row) => row.dataset.id === state.selectedId);
  let nextIndex = currentIndex;
  if (event.key === 'ArrowDown') {
    nextIndex = currentIndex === -1 ? 0 : Math.min(rows.length - 1, currentIndex + 1);
  } else if (event.key === 'ArrowUp') {
    nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
  }
  const nextRow = rows[nextIndex];
  if (nextRow) {
    const nextId = nextRow.dataset.id;
    selectProduct(nextId, { openModal: true });
  }
}

function registerEvents() {
  els.tableBody?.addEventListener('change', handleDraftToggle);
  els.tableBody?.addEventListener('click', handleTableClick);
  document.querySelector('.admin-table thead')?.addEventListener('click', handleSort);
  els.search?.addEventListener('input', handleSearch);
  els.areaFilter?.addEventListener('change', handleSearch);
  els.addButton?.addEventListener('click', handleAddProduct);
  els.exportButton?.addEventListener('click', handleExport);
  els.resetButton?.addEventListener('click', handleReset);
  els.deleteButton?.addEventListener('click', handleDelete);
  els.cancelButton?.addEventListener('click', handleCancel);
  els.viewButton?.addEventListener('click', handleViewProduct);
  els.form?.addEventListener('submit', handleFormSubmit);
  els.tableContainer?.addEventListener('keydown', handleKeyboardNavigation);
}

function handleViewProduct(event) {
  if (event) {
    event.preventDefault();
  }
  if (!currentPreviewUrl) return;
  const previewWindow = window.open(currentPreviewUrl, '_blank', 'noopener');
  if (previewWindow) {
    previewWindow.opener = null;
    return;
  }
  setStatus('Unable to open preview. Allow pop-ups and try again.', 'warning');
}

window.addEventListener('admin:supabase-check', (event) => {
  const detail = event?.detail || {};
  if (detail.source !== 'product-save') return;
  if (!detail.token || detail.token !== pendingSupabaseCheck) return;
  pendingSupabaseCheck = null;

  const baseMessage = lastProductAction === 'create' ? 'New product saved locally.' : 'Product updated locally.';
  lastProductAction = null;

  if (detail.status === 'error') {
    const errorText = detail.message ? String(detail.message) : 'Supabase check failed.';
    setFormFeedback(`${baseMessage} Supabase check failed: ${errorText}`, 'danger');
    return;
  }

  if (detail.status === 'success') {
    const count = typeof detail.count === 'number' ? detail.count : null;
    const localCount = typeof detail.localCount === 'number' ? detail.localCount : null;
    if (detail.matchesLocal && count !== null) {
      setFormFeedback(
        `${baseMessage} Supabase currently lists ${count} product${count === 1 ? '' : 's'}, matching your workspace.`,
        'success'
      );
      return;
    }
    if (count !== null && localCount !== null) {
      setFormFeedback(
        `${baseMessage} Supabase currently lists ${count} product${count === 1 ? '' : 's'} while your workspace has ${localCount}. Save to Supabase when you're ready to publish.`,
        'warning'
      );
      return;
    }
    setFormFeedback(`${baseMessage} Supabase check completed.`, 'success');
  }
});

export function getCatalogSnapshot() {
  return clone(state.products);
}

export function subscribeToCatalog(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Catalog subscriber must be a function');
  }
  try {
    callback({ products: clone(state.products), reason: 'subscribe' });
  } catch (error) {
    console.error('[editor] Catalog subscriber failed during initial emit', error);
  }
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

setupProductModal();
setupGuideModal();
registerEvents();
updateViewProductButton(null);
loadProducts();
