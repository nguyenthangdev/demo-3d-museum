import { $, escapeHtml, showToast } from './shared.js';

const MAX_ITEMS = 12;
const IMAGE_LIMIT = 10 * 1024 * 1024;
const AUDIO_LIMIT = 25 * 1024 * 1024;
const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const audioTypes = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/webm']);

export function setupMediaDemo(getExhibits) {
  const selected = [];
  const list = $('#media-local-list');
  const speechButton = $('#media-demo-speech');
  let speaking = false;
  let nextId = 0;

  function stopSpeech() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speaking = false;
    speechButton.textContent = '▶ Nghe thử';
  }

  function renderSelected() {
    $('#media-local-count').textContent = selected.length;
    list.innerHTML = selected.length ? selected.map((entry) => `<article class="media-local-card">
      <div class="media-local-card__preview">${entry.kind === 'image' ? `<img src="${escapeHtml(entry.url)}" alt="Ảnh xem trước: ${escapeHtml(entry.name)}">` : '<span aria-hidden="true">♫</span>'}</div>
      <div class="media-local-card__body"><strong>${escapeHtml(entry.name)}</strong><small>${entry.kind === 'image' ? 'Ảnh' : 'Audio'} · ${entry.sizeMb} MB · Chỉ xem trước</small>
      ${entry.kind === 'audio' ? `<audio controls preload="metadata" src="${escapeHtml(entry.url)}" aria-label="Nghe thử ${escapeHtml(entry.name)}">Trình duyệt không phát được audio này.</audio><label class="media-transcript-label">Bản chép lời demo<textarea data-transcript-id="${entry.id}" rows="2" placeholder="Nhập transcript cho audio này...">${escapeHtml(entry.transcript)}</textarea></label>` : ''}</div>
      <button class="media-remove" type="button" data-remove-id="${entry.id}" aria-label="Bỏ ${escapeHtml(entry.name)} khỏi danh sách xem trước">×</button>
    </article>`).join('') : '<div class="empty-state">Chưa chọn file. Hãy thử chọn ảnh hoặc audio ở phía trên.</div>';
  }

  function addFiles(kind, files) {
    const allowed = kind === 'image' ? imageTypes : audioTypes;
    const limit = kind === 'image' ? IMAGE_LIMIT : AUDIO_LIMIT;
    for (const file of files) {
      if (selected.length >= MAX_ITEMS) { showToast('Bản demo chỉ xem trước tối đa 12 file cùng lúc.'); break; }
      if (!allowed.has(file.type)) { showToast(`Định dạng ${kind === 'image' ? 'ảnh' : 'audio'} chưa hỗ trợ: ${file.name}`); continue; }
      if (file.size > limit) { showToast(`File quá lớn: ${file.name}. Giới hạn ${limit / 1024 / 1024} MB.`); continue; }
      selected.unshift({ id: String(++nextId), kind, name: file.name, sizeMb: (file.size / 1024 / 1024).toFixed(2), url: URL.createObjectURL(file), transcript: '' });
    }
    renderSelected();
  }

  $('#choose-image').addEventListener('click', () => $('#image-file-input').click());
  $('#choose-audio').addEventListener('click', () => $('#audio-file-input').click());
  for (const [kind, selector] of [['image', '#image-file-input'], ['audio', '#audio-file-input']]) {
    $(selector).addEventListener('change', (event) => {
      addFiles(kind, [...event.target.files]);
      event.target.value = '';
    });
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-id]');
    if (!button) return;
    const index = selected.findIndex((entry) => entry.id === button.dataset.removeId);
    if (index < 0) return;
    URL.revokeObjectURL(selected[index].url);
    selected.splice(index, 1);
    renderSelected();
    showToast('Đã bỏ file khỏi phiên xem trước.');
  });
  list.addEventListener('input', (event) => {
    const field = event.target.closest('[data-transcript-id]');
    const entry = selected.find((item) => item.id === field?.dataset.transcriptId);
    if (entry) entry.transcript = field.value;
  });
  list.addEventListener('play', (event) => { if (event.target.tagName === 'AUDIO') stopSpeech(); }, true);
  list.addEventListener('error', (event) => { if (event.target.tagName === 'AUDIO') showToast('Trình duyệt không phát được định dạng audio này.'); }, true);

  speechButton.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) { showToast('Trình duyệt không hỗ trợ giọng đọc máy. Bản chép lời vẫn xem được.'); return; }
    if (speaking) { stopSpeech(); return; }
    list.querySelectorAll('audio').forEach((audio) => audio.pause());
    const transcript = getExhibits().find((item) => item.id === 'trong-dong')?.transcript;
    if (!transcript) return;
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.93;
    utterance.onend = stopSpeech;
    utterance.onerror = stopSpeech;
    speaking = true;
    speechButton.textContent = '❚❚ Dừng';
    speechSynthesis.speak(utterance);
  });

  function reset() {
    stopSpeech();
    selected.forEach((entry) => URL.revokeObjectURL(entry.url));
    selected.length = 0;
    renderSelected();
  }

  window.addEventListener('beforeunload', () => selected.forEach((entry) => URL.revokeObjectURL(entry.url)));
  renderSelected();
  return {
    renderSample() { $('#media-demo-transcript').textContent = getExhibits().find((item) => item.id === 'trong-dong')?.transcript || 'Chưa có bản chép lời mẫu.'; },
    stopSpeech,
    reset,
  };
}
