import { getPublicExhibits } from './governance.js';
import { $, itemCard, setupCommon } from './shared.js';
import { createMuseumScene } from './scene.js';

setupCommon();
const exhibits = getPublicExhibits();
$('#featured .section-head h2').innerHTML = `${exhibits.length} hiện vật.<br><em>${exhibits.length === 1 ? 'Một câu chuyện.' : 'Nhiều câu chuyện.'}</em>`;
$('#featured-grid').innerHTML = exhibits.slice(0, 5).map((item) => itemCard(item, true)).join('') || '<p>Hiện chưa có hiện vật công khai. Hãy xuất bản nội dung trong Content Studio.</p>';
$('.hero__visual-bottom span:last-child').textContent = `${String(Math.min(exhibits.length, 1)).padStart(2, '0')} / ${String(exhibits.length).padStart(2, '0')}`;
$('#featured-grid').addEventListener('click', (event) => {
  const card = event.target.closest('[data-exhibit]');
  if (card) location.href = `./collection.html?item=${encodeURIComponent(card.dataset.exhibit)}`;
});
$('#featured-grid').addEventListener('keydown', (event) => {
  const card = event.target.closest('[data-exhibit]');
  if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); location.href = `./collection.html?item=${encodeURIComponent(card.dataset.exhibit)}`; }
});
try { createMuseumScene({ container: $('#hero-scene'), exhibits, preview: true }); }
catch (error) { console.warn('Không thể mở cảnh 3D:', error); $('#hero-scene').style.background = 'radial-gradient(circle at 50% 45%, #66695b, #192a2a 75%)'; }
