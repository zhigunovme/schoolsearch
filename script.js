'use strict';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('ru-RU').format(value);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(item){return `<article class="card"><a class="card-photo" href="${item.id}.html" tabindex="-1" aria-hidden="true"><img src="img/${item.image}" srcset="img/${item.image.replace('.webp','-480.webp')} 480w, img/${item.image} 960w" sizes="(max-width: 480px) calc(100vw - 36px), (max-width: 760px) 45vw, 560px" decoding="async" alt="" width="600" height="400" loading="lazy"></a><div class="card-body"><div class="card-meta">${item.city} · ${item.age}</div><h3><a href="${item.id}.html">${item.name}</a></h3><p>${item.description}</p><div class="card-foot"><strong>${money(item.price)} ₽ / год</strong><span class="tag">${item.format}</span></div></div></article>`}
const menu=$('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);$('.nav').classList.toggle('is-open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');$('.nav').classList.remove('is-open');menu.focus()}});
$$('[data-featured]').forEach(el=>{if(el.children.length)return;el.innerHTML=window.organizations.filter(o=>el.dataset.featured==='all'||o.type===el.dataset.featured).slice(0,el.dataset.featured==='school'?4:3).map(card).join('')});
const catalog=$('#catalog-results');
if(catalog){
 const type=document.body.dataset.type,form=$('#search-form'),filters=$('#filters'),search=$('#query'),city=$('#city'),sort=$('#sort');
 const params=new URLSearchParams(location.search);search.value=params.get('q')||'';if([...city.options].some(o=>o.value===params.get('city')))city.value=params.get('city');
 function render(){
  const query=search.value.trim().toLocaleLowerCase('ru');
  const checked=name=>$$(`input[name="${name}"]:checked`,filters).map(el=>el.value);
  const formats=checked('format'),languages=checked('language'),extras=checked('extra');
  const max=Number($('#budget').value)||Infinity,district=$('#district').value;
  let results=window.organizations.filter(o=>o.type===type&&(!query||`${o.name} ${o.description} ${o.city}`.toLocaleLowerCase('ru').includes(query))&&(!city.value||o.city===city.value)&&(!district||o.district===district)&&o.price<=max&&(!formats.length||formats.includes(o.format))&&(!languages.length||languages.includes(o.language))&&(!extras.length||extras.includes(o.extra)));
  results.sort(sort.value==='low'?(a,b)=>a.price-b.price:sort.value==='high'?(a,b)=>b.price-a.price:(a,b)=>a.name.localeCompare(b.name,'ru'));
  catalog.innerHTML=results.map(card).join('');$('#result-count').textContent=`Найдено: ${results.length}`;$('#empty-state').hidden=results.length!==0;
  const url=new URL(location.href);query?url.searchParams.set('q',search.value.trim()):url.searchParams.delete('q');city.value?url.searchParams.set('city',city.value):url.searchParams.delete('city');try{history.replaceState(null,'',url)}catch{}
 }
 form.addEventListener('submit',e=>{e.preventDefault();render()});filters.addEventListener('change',render);sort.addEventListener('change',render);city.addEventListener('change',render);search.addEventListener('input',render);
 function reset(){form.reset();filters.reset();sort.value='name';render()}
 $$('[data-reset]').forEach(b=>b.addEventListener('click',reset));
 const toggle=$('#filter-toggle');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);$('.filter-panel').classList.toggle('is-open',open)});
 $('#filter-close').addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');$('.filter-panel').classList.remove('is-open');toggle.focus()});
 render();
}
if(document.body.dataset.page==='detail'){
 const id=document.body.dataset.id||new URLSearchParams(location.search).get('id');const item=window.organizations.find(o=>o.id===id)||window.organizations[0];
 if(!document.body.dataset.id)document.title=`${item.name} — School Search`;
 $$('[data-name]').forEach(el=>el.textContent=item.name);$('#detail-description').textContent=item.description;
 $('#detail-city').textContent=`${item.city} · ${item.district} район`;
 $('#detail-facts').innerHTML=[['Возраст',item.age],['Формат',item.format],['Язык занятий',item.language],['Направление',item.extra],['Стоимость в год',`${money(item.price)} ₽`]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
 $('#back-catalog').href=item.type==='school'?'school-search.html':'kindergarten-search.html';$('#back-catalog').textContent=item.type==='school'?'Школы':'Детские сады';
 const photos=[{file:item.image,label:'Основное пространство'},{file:item.type==='school'?'classroom.webp':'garden-playground.webp',label:item.type==='school'?'Учебный класс':'Площадка для игр'}];
 const main=$('#gallery-image');main.src=`img/${photos[0].file}`;main.srcset=`img/${photos[0].file.replace('.webp','-480.webp')} 480w, img/${photos[0].file} 960w`;main.alt=`${photos[0].label}`;
 $('#gallery-thumbs').innerHTML=photos.map((p,i)=>`<button type="button" aria-label="${p.label}" aria-pressed="${i===0}" data-photo="${i}"><img src="img/${p.file.replace('.webp','-480.webp')}" alt="" width="100" height="64"></button>`).join('');
 $$('#gallery-thumbs button').forEach(b=>b.addEventListener('click',()=>{const p=photos[Number(b.dataset.photo)];main.src=`img/${p.file}`;main.srcset=`img/${p.file.replace('.webp','-480.webp')} 480w, img/${p.file} 960w`;main.alt=`${p.label}`;$$('#gallery-thumbs button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
 $('#review-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#review-name').value.trim(),review=$('#review-text').value.trim();if(!name||!review){$('#review-status').hidden=false;$('#review-status').textContent='Введите имя и текст отзыва. Поля не могут состоять только из пробелов.';return}$('#review-status').hidden=false;$('#review-status').innerHTML=`<strong>Предпросмотр отзыва</strong><p>${esc(name)} · Оценка ${esc($('#review-rating').value)} из 5</p><p>${esc(review)}</p>`;});
 $('#related').innerHTML=window.organizations.filter(o=>o.id!==item.id&&o.type===item.type).slice(0,3).map(card).join('');
}
const organizationForm = $('#organization-form');
if (organizationForm) {
 const dialog = $('#application-success');
 const requiredText = ['org-name','org-description','org-city','org-address','org-contact'];
 function validateField(input) {
  input.setCustomValidity('');
  if (input.required && !input.value.trim()) input.setCustomValidity('Заполните это поле.');
  else if (input.id === 'org-description' && input.value.trim().length < 30) input.setCustomValidity('Добавьте описание длиной не менее 30 символов.');
  else if (input.id === 'org-phone') {
   const digits = input.value.replace(/\D/g, '');
   if (digits.length < 10 || digits.length > 15 || /[^\d\s()+-]/.test(input.value)) input.setCustomValidity('Введите телефон: от 10 до 15 цифр, например +7 (999) 123-45-67.');
  }
 }
 [...requiredText, 'org-phone'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => validateField(input));
 });
 organizationForm.addEventListener('submit', event => {
  event.preventDefault();
  [...requiredText, 'org-phone'].forEach(id => validateField(document.getElementById(id)));
  if (!organizationForm.reportValidity()) return;
  dialog.showModal();
 });
 $$('.dialog-close, .dialog-done', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
 dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
 });
}
