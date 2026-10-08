import { getPublicExhibits, submitReport } from './governance.js';

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function itemCard(item, compact = false) {
  return `<article class="artifact-card ${compact ? 'artifact-card--compact' : ''}" tabindex="0" data-exhibit="${escapeHtml(item.id)}" aria-label="Xem ${escapeHtml(item.name)}">
    <div class="artifact-card__image" style="--card-accent:${escapeHtml(item.color)}"><img src="${escapeHtml(item.image)}" alt="Minh họa ${escapeHtml(item.name)}" loading="lazy"><span class="artifact-card__number">${String(item.order).padStart(2, '0')}</span></div>
    <div class="artifact-card__copy"><p class="eyebrow">${escapeHtml(item.era)}</p><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.summary)}</p><span class="text-link">Khám phá hiện vật <span aria-hidden="true">↗</span></span></div>
  </article>`;
}

export function renderInfo(item, container) {
  if (!item || !container) return;
  container.innerHTML = `<div class="info-cover" style="--card-accent:${escapeHtml(item.color)}"><img src="${escapeHtml(item.image)}" alt="Minh họa ${escapeHtml(item.name)}"></div>
    <p class="eyebrow">${escapeHtml(item.era)} <span class="eyebrow-dot">·</span> ${escapeHtml(item.material)}</p>
    <h2>${escapeHtml(item.name)}</h2><p class="info-summary">${escapeHtml(item.summary)}</p><p class="info-description">${escapeHtml(item.description)}</p>
    <div class="audio-block"><div><span class="audio-icon">♫</span><strong>Thuyết minh</strong><small>Giọng đọc máy · Bản demo</small></div><button class="icon-action" type="button" data-speak aria-label="Phát thuyết minh">▶</button></div>
    <details class="transcript" open><summary>Bản chép lời</summary><p>${escapeHtml(item.transcript)}</p></details>
    <details class="report-box"><summary>Báo cáo nội dung sai</summary><form data-report-form><label>Lý do<select name="reason" required><option value="Mô tả cần kiểm tra">Mô tả cần kiểm tra</option><option value="Thông tin thiếu">Thông tin thiếu</option><option value="Thuyết minh">Thuyết minh</option><option value="Khác">Khác</option></select></label><label>Nội dung báo cáo<textarea name="detail" rows="3" required minlength="8" placeholder="Mô tả vấn đề bạn nhận thấy..."></textarea></label><button type="submit">Gửi báo cáo mẫu ↗</button><small>Báo cáo chỉ lưu trong trình duyệt demo.</small></form></details>`;
  $('[data-speak]', container)?.addEventListener('click', (event) => toggleSpeech(item, event.currentTarget));
  $('[data-report-form]', container)?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submitReport(item.id, String(data.get('reason')), String(data.get('detail')).trim());
    event.currentTarget.reset();
    showToast('Đã gửi báo cáo mẫu tới Content Studio trong trình duyệt này.');
  });
}

let speakingButton = null;
export function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (speakingButton) { speakingButton.textContent = '▶'; speakingButton.setAttribute('aria-label', 'Phát thuyết minh'); speakingButton = null; }
}

function toggleSpeech(item, button) {
  if (!('speechSynthesis' in window)) { showToast('Trình duyệt chưa hỗ trợ đọc văn bản. Bạn có thể xem bản chép lời bên dưới.'); return; }
  if (speakingButton === button) { stopSpeech(); return; }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(item.transcript);
  utterance.lang = 'vi-VN'; utterance.rate = 0.93;
  utterance.onend = () => stopSpeech(); utterance.onerror = () => stopSpeech();
  button.textContent = '❚❚'; button.setAttribute('aria-label', 'Dừng thuyết minh'); speakingButton = button;
  speechSynthesis.speak(utterance);
}

export function showToast(message) {
  let toast = $('#toast');
  if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
  toast.textContent = message;
  toast.classList.add('toast--show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('toast--show'), 3600);
}

export function setupModal() {
  const modal = $('#exhibit-modal');
  if (!modal) return;
  function open(id) {
    const item = getPublicExhibits().find((entry) => entry.id === id);
    if (!item) return;
    renderInfo(item, $('.modal-content', modal));
    modal.hidden = false;
    document.body.classList.add('modal-open');
    $('.modal-close', modal)?.focus();
  }
  function close() { stopSpeech(); modal.hidden = true; document.body.classList.remove('modal-open'); }
  document.addEventListener('click', (event) => { const card = event.target.closest('[data-exhibit]'); if (card) open(card.dataset.exhibit); });
  document.addEventListener('keydown', (event) => {
    const card = event.target.closest('[data-exhibit]');
    if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(card.dataset.exhibit); }
  });
  $('.modal-close', modal)?.addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) close(); });
  return { open, close };
}

export function setupCommon() {
  const current = document.body.dataset.page;
  $$('[data-nav]').forEach((link) => { if (link.dataset.nav === current) link.setAttribute('aria-current', 'page'); });
  const menu = $('.mobile-menu');
  const toggle = $('.menu-toggle');
  toggle?.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
  $$('.mobile-menu a').forEach((link) => link.addEventListener('click', () => menu?.classList.remove('is-open')));
}
