const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const focusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const drawer=$('.site-drawer');
const backdrop=$('.drawer-backdrop');
const menuToggle=$('.menu-toggle');
const search=$('.search-panel, .search-screen');
const searchTrigger=$('.search-trigger');
const searchField=$('#site-search, #search-field');
const searchLinks=$$('.search-results a, .search-links a');
const lightbox=$('.lightbox');
const lightboxImage=$('.lightbox img');
let lastFocus=null;

function lockPage(){
 const open=drawer?.classList.contains('open')||search?.classList.contains('open')||lightbox?.classList.contains('open');
 document.body.classList.toggle('lock',Boolean(open));
}

function focusInside(container){
 const items=$$(focusable,container).filter(el=>el.getClientRects().length);
 (items[0]||container)?.focus();
}

function trapTab(event,container){
 if(event.key!=='Tab'||!container)return;
 const items=$$(focusable,container).filter(el=>el.getClientRects().length);
 if(!items.length){event.preventDefault();container.focus();return;}
 const first=items[0],last=items[items.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}

function setDrawer(open){
 if(!drawer||!backdrop)return;
 if(open)lastFocus=document.activeElement;
 drawer.classList.toggle('open',open);
 backdrop.classList.toggle('open',open);
 drawer.setAttribute('aria-hidden',String(!open));
 drawer.inert=!open;
 menuToggle?.setAttribute('aria-expanded',String(open));
 lockPage();
 if(open)focusInside(drawer);
 else if(lastFocus?.isConnected)lastFocus.focus();
}

menuToggle?.addEventListener('click',()=>setDrawer(!drawer.classList.contains('open')));
$('.drawer-close')?.addEventListener('click',()=>setDrawer(false));
backdrop?.addEventListener('click',()=>setDrawer(false));
$$('.drawer-links a,.drawer-actions a').forEach(link=>link.addEventListener('click',()=>setDrawer(false)));

function setSearch(open){
 if(!search)return;
 if(open)lastFocus=document.activeElement;
 search.classList.toggle('open',open);
 search.setAttribute('aria-hidden',String(!open));
 search.inert=!open;
 searchTrigger?.setAttribute('aria-expanded',String(open));
 lockPage();
 if(open)searchField?.focus();
 else if(lastFocus?.isConnected)lastFocus.focus();
}

searchTrigger?.addEventListener('click',()=>setSearch(true));
$('.search-close')?.addEventListener('click',()=>setSearch(false));

let emptyState=null;
if(search){
 emptyState=document.createElement('p');
 emptyState.className='search-empty';
 emptyState.setAttribute('role','status');
 emptyState.textContent='نتیجه‌ای پیدا نشد.';
 emptyState.hidden=true;
 (search.querySelector('.search-results,.search-links'))?.after(emptyState);
}
searchField?.addEventListener('input',()=>{
 const query=searchField.value.trim().toLocaleLowerCase('fa');
 let visible=0;
 searchLinks.forEach(link=>{
  const searchable=`${link.textContent} ${link.dataset.keywords||''}`.toLocaleLowerCase('fa');
  const match=!query||searchable.includes(query);
  link.hidden=!match;
  if(match)visible++;
 });
 if(emptyState)emptyState.hidden=visible>0;
});

$$('[data-full]').forEach(button=>{
 button.addEventListener('click',()=>{
  if(!lightbox||!lightboxImage)return;
  lastFocus=button;
  lightboxImage.src=button.dataset.full;
  lightboxImage.alt=$('img',button)?.alt||'تصویر گالری';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  lightbox.inert=false;
  lockPage();
  focusInside(lightbox);
 });
});

function closeLightbox(){
 if(!lightbox)return;
 lightbox.classList.remove('open');
 lightbox.setAttribute('aria-hidden','true');
 lightbox.inert=true;
 if(lightboxImage)lightboxImage.removeAttribute('src');
 lockPage();
 if(lastFocus?.isConnected)lastFocus.focus();
}
$('.lightbox-close')?.addEventListener('click',closeLightbox);
lightbox?.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});

document.addEventListener('keydown',event=>{
 if(drawer?.classList.contains('open')){if(event.key==='Escape')setDrawer(false);else trapTab(event,drawer);}
 if(search?.classList.contains('open')){if(event.key==='Escape')setSearch(false);else trapTab(event,search);}
 if(lightbox?.classList.contains('open')){if(event.key==='Escape')closeLightbox();else trapTab(event,lightbox);}
});


/* WOON category scroll-linked image switching — scroll-position based */
(()=>{
 const section=document.querySelector('.home-categories');
 const items=[...document.querySelectorAll('.category-item[data-category]')];
 const shots=[...document.querySelectorAll('.category-shot[data-shot]')];
 if(!section||!items.length||!shots.length)return;
 let active=-1, ticking=false;
 const activate=index=>{
  if(index===active||!shots[index])return;
  active=index;
  items.forEach((item,i)=>{
   const on=i===index;
   item.classList.toggle('active',on);
   item.setAttribute('aria-current',on?'true':'false');
  });
  shots.forEach((img,i)=>{
   const on=i===index;
   img.classList.toggle('active',on);
   img.style.opacity=on?'1':'0';
   img.style.visibility=on?'visible':'hidden';
   img.style.transform=on?'scale(1)':'scale(1.035)';
   img.style.zIndex=on?'2':'1';
  });
 };
 const update=()=>{
  ticking=false;
  const sectionRect=section.getBoundingClientRect();
  if(sectionRect.bottom<0||sectionRect.top>window.innerHeight)return;
  const target=window.innerHeight*.5;
  let best=0,dist=Infinity;
  items.forEach((item,i)=>{
   const r=item.getBoundingClientRect();
   const mid=r.top+r.height*.5;
   const d=Math.abs(mid-target);
   if(d<dist){dist=d;best=i;}
  });
  activate(best);
 };
 const requestUpdate=()=>{
  if(!ticking){ticking=true;requestAnimationFrame(update);}
 };
 window.addEventListener('scroll',requestUpdate,{passive:true});
 window.addEventListener('resize',requestUpdate);
 items.forEach((item,i)=>{
  item.addEventListener('mouseenter',()=>activate(i));
  item.addEventListener('focus',()=>activate(i));
 });
 update();
})();
const galleryTrack=$('.gallery-grid');
$('.gallery-next')?.addEventListener('click',()=>galleryTrack?.scrollBy({left:Math.min(galleryTrack.clientWidth*.72,520),behavior:'smooth'}));
$('.gallery-prev')?.addEventListener('click',()=>galleryTrack?.scrollBy({left:-Math.min(galleryTrack.clientWidth*.72,520),behavior:'smooth'}));
