/* 霧森製茶所 — shared interactions */
(function(){
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* ---- header scroll ---- */
  var head = document.querySelector('.site-head');
  var onScroll = function(){
    if(head) head.classList.toggle('scrolled', window.scrollY > 24);
    var tt = document.querySelector('.to-top');
    if(tt) tt.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- hamburger ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mobile-nav');
  function closeMenu(){ if(burger){burger.classList.remove('open'); burger.setAttribute('aria-expanded','false');} if(mnav){mnav.classList.remove('open');} document.body.style.overflow=''; }
  if(burger && mnav){
    burger.addEventListener('click', function(){
      var open = burger.classList.toggle('open');
      mnav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true':'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });
  }

  /* ---- back to top ---- */
  var toTop = document.querySelector('.to-top');
  if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  /* ---- reveal ---- */
  var rev = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && rev.length){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    rev.forEach(function(el){ io.observe(el); });
    // safety: reveal all after 2.5s in case observer misses
    setTimeout(function(){ rev.forEach(function(el){ el.classList.add('in'); }); }, 2500);
  } else {
    rev.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- cart counter (decorative) ---- */
  var cartCount = 0;
  function bumpCart(n){
    cartCount += (n||1);
    document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = cartCount; el.style.display='inline-grid'; });
    showToast('已加入購物車');
  }

  /* ---- toast ---- */
  var toastEl;
  function showToast(msg){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span></span>';
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400);
  }

  /* ---- add to cart buttons ---- */
  document.querySelectorAll('[data-add]').forEach(function(b){
    b.addEventListener('click', function(e){ e.preventDefault(); bumpCart(1); });
  });

  /* ---- shop filter ---- */
  var tabs = document.querySelectorAll('.tab[data-filter]');
  if(tabs.length){
    var items = document.querySelectorAll('[data-cat]');
    tabs.forEach(function(t){
      t.addEventListener('click', function(){
        tabs.forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
        t.classList.add('active'); t.setAttribute('aria-selected','true');
        var f = t.getAttribute('data-filter');
        items.forEach(function(it){
          var show = (f==='all' || it.getAttribute('data-cat')===f);
          it.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- product gallery ---- */
  var mainImg = document.querySelector('.gallery .main img');
  var thumbs = document.querySelectorAll('.thumbs button');
  if(mainImg && thumbs.length){
    thumbs.forEach(function(btn){
      btn.addEventListener('click', function(){
        thumbs.forEach(function(x){ x.classList.remove('active'); });
        btn.classList.add('active');
        mainImg.src = btn.getAttribute('data-full') || btn.querySelector('img').src;
      });
    });
  }

  /* ---- variant chips ---- */
  document.querySelectorAll('.chip-row').forEach(function(row){
    var chips = row.querySelectorAll('.chip');
    chips.forEach(function(c){
      c.addEventListener('click', function(){
        chips.forEach(function(x){ x.classList.remove('active'); });
        c.classList.add('active');
        var price = c.getAttribute('data-price');
        var out = document.querySelector('[data-price-out]');
        if(price && out) out.textContent = price;
      });
    });
  });

  /* ---- quantity ---- */
  document.querySelectorAll('.qty').forEach(function(q){
    var input = q.querySelector('input');
    q.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){
        var v = parseInt(input.value,10) || 1;
        v += (b.getAttribute('data-step')==='up') ? 1 : -1;
        if(v < 1) v = 1; if(v > 99) v = 99;
        input.value = v;
      });
    });
  });

  /* ---- accordion ---- */
  document.querySelectorAll('.acc-item').forEach(function(item){
    var q = item.querySelector('.acc-q');
    var a = item.querySelector('.acc-a');
    if(!q || !a) return;
    q.addEventListener('click', function(){
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true':'false');
      a.style.maxHeight = open ? (a.scrollHeight + 'px') : '0px';
    });
  });

  /* ---- contact form ---- */
  var form = document.querySelector('form[data-contact]');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      showToast('感謝來信,我們將盡快回覆');
      form.reset();
    });
  }

  /* ---- year ---- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
