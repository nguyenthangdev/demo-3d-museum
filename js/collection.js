import { getPublicExhibits } from './governance.js';
import { $, $$, itemCard, setupCommon, setupModal } from './shared.js';

setupCommon();
const exhibits = getPublicExhibits();
let filter = 'all';
let search = '';

function render() {
  const visible = exhibits.filter((item) => (filter === 'all' || item.era.includes(filter)) && `${item.name} ${item.era} ${item.summary}`.toLocaleLowerCase('vi').includes(search));
  $('#collection-grid').innerHTML = visible.map((item) => itemCard(item)).join('');
  $('#collection-count').textContent = `${String(visible.length).padStart(2, '0')} HIỆN VẬT`;
  $('#collection-empty').hidden = visible.length > 0;
}

const modal = setupModal();
render();
const requested = new URLSearchParams(location.search).get('item');
if (requested) modal?.open(requested);
$$('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  $$('[data-filter]').forEach((other) => other.classList.toggle('is-active', other === button));
  render();
}));
$('#collection-search').addEventListener('input', (event) => { search = event.target.value.trim().toLocaleLowerCase('vi'); render(); });
