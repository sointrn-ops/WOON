const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const drawer=$('.site-drawer'),backdrop=$('.drawer-backdrop'),toggle=$('.menu-toggle');let previousFocus=null;
function setDrawer(open){if(!drawer)return;if(open)previousFocus=document.activeElement;drawer.classList.toggle('open',open);backdrop?.classList.toggle('open',open);drawer.inert=!open;drawer.setAttribute('aria-hidden',String(!open));toggle?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('lock',open||$('.search-screen.open')!==null);if(open)$('.drawer-close',drawer)?.focus();else previousFocus?.focus()}
toggle?.addEventListener('click',()=>setDrawer(!drawer.classList.contains('open')));$('.drawer-close')?.addEventListener('click',()=>setDrawer(false));backdrop?.addEventListener('click',()=>setDrawer(false));$$('.drawer-links a,.drawer-actions a').forEach(a=>a.addEventListener('click',()=>setDrawer(false)));
const search=$('.search-screen');function setSearch(open){if(!search)return;search.classList.toggle('open',open);search.inert=!open;search.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('lock',open||drawer?.classList.contains('open'));if(open)$('#search-field')?.focus()}$$('.search-trigger').forEach(b=>b.addEventListener('click',()=>setSearch(true)));$('.search-close')?.addEventListener('click',()=>setSearch(false));$('#search-field')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase();$$('.search-links a').forEach(a=>a.hidden=!a.textContent.toLocaleLowerCase().includes(q))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setDrawer(false);setSearch(false);closeLightbox()}});
const section=$('.home-categories'),items=$$('.category-item[data-category]'),shots=$$('.category-media [data-shot]');if(section&&items.length&&shots.length){let active=0;const activate=i=>{active=i;items.forEach((a,n)=>a.classList.toggle('active',n===i));shots.forEach((im,n)=>im.classList.toggle('active',n===i))};const update=()=>{const mid=innerHeight*.5;let best=0,dist=Infinity;items.forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);if(d<dist){dist=d;best=i}});activate(best)};let raf=false;addEventListener('scroll',()=>{if(!raf){raf=true;requestAnimationFrame(()=>{update();raf=false})}},{passive:true});items.forEach((el,i)=>{el.addEventListener('mouseenter',()=>activate(i));el.addEventListener('focus',()=>activate(i))});update()}
function activateMenuTab(name){const tab=$(`[data-menu-tab="${name}"]`);if(!tab)return;$$('[data-menu-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b===tab));b.setAttribute('tabindex',b===tab?'0':'-1')});$$('[data-menu-panel]').forEach(p=>{p.hidden=p.dataset.menuPanel!==name})}
$('[data-menu-tab]').forEach(btn=>btn.addEventListener('click',()=>activateMenuTab(btn.dataset.menuTab)));
function syncMenuHash(){if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}const target=document.getElementById(id);if(!target)return;const panel=target.closest('[data-menu-panel]');if(panel)activateMenuTab(panel.dataset.menuPanel)}
syncMenuHash();addEventListener('hashchange',syncMenuHash);
const track=$('.gallery-track');const cards=track?$('.gallery-card',track):[];const galleryCount=$('.gallery-count');function galleryStep(){return cards[0]?cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||0):420}function updateGalleryCount(){if(!track||!cards.length||!galleryCount)return;const index=Math.max(0,Math.min(cards.length-1,Math.round(track.scrollLeft/galleryStep())));galleryCount.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0')}$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{if(!track)return;const dir=b.dataset.gallery==='next'?1:-1;track.scrollBy({left:dir*galleryStep(),behavior:'smooth'})}));track?.addEventListener('scroll',updateGalleryCount,{passive:true});updateGalleryCount();if(track){let down=false,startX=0,startScroll=0,moved=false;track.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;down=true;moved=false;startX=e.clientX;startScroll=track.scrollLeft;track.classList.add('is-dragging')});track.addEventListener('pointermove',e=>{if(!down)return;const delta=e.clientX-startX;if(Math.abs(delta)>5)moved=true;if(moved)track.scrollLeft=startScroll-delta});const stop=()=>{if(!down)return;down=false;track.classList.remove('is-dragging');if(moved){const idx=Math.round(track.scrollLeft/galleryStep());track.scrollTo({left:idx*galleryStep(),behavior:'smooth'});track.dataset.dragged='true';setTimeout(()=>delete track.dataset.dragged,80)}};track.addEventListener('pointerup',stop);track.addEventListener('pointercancel',stop);track.addEventListener('pointerleave',stop);track.addEventListener('click',e=>{if(track.dataset.dragged==='true'){e.preventDefault();e.stopPropagation()}},true);track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*galleryStep(),behavior:'smooth'})}})};
const lightbox=$('.lightbox'),lightboxImg=$('.lightbox img');function closeLightbox(){if(!lightbox)return;lightbox.classList.remove('open');lightbox.inert=true;lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lock');lightboxImg?.removeAttribute('src')}$$('[data-full]').forEach(b=>b.addEventListener('click',()=>{if(!lightbox||!lightboxImg)return;lightboxImg.src=b.dataset.full;lightboxImg.alt=$('img',b)?.alt||'Gallery image';lightbox.classList.add('open');lightbox.inert=false;lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lock')}));$('.lightbox-close')?.addEventListener('click',closeLightbox);lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

/* Shared page state and accessibility */
(()=>{
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.header-links a[href],.drawer-links a[href]').forEach(link=>{
    const raw=link.getAttribute('href')||'';
    if(!raw||raw.startsWith('#')||raw.startsWith('http'))return;
    const target=raw.split('#')[0].toLowerCase()||'index.html';
    if(target===current){
      link.setAttribute('aria-current','page');
      link.classList.add('is-current');
    }
  });
  document.querySelectorAll('img:not([alt])').forEach(img=>img.setAttribute('alt',''));
})();


/* Retry the homepage hero photo if the primary image host responds with an error. */
(()=>{
 const hero=document.querySelector('.home-hero-image');
 if(!hero)return;
 const fallbacks=[
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=2400&q=90',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=85',
  'https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?auto=format&fit=crop&w=2400&q=85'
 ];
 let attempt=0;
 hero.addEventListener('error',()=>{
   if(attempt<fallbacks.length)hero.src=fallbacks[attempt++];
 });
})();
