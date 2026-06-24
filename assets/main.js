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

  /* ---- cart (localStorage) ---- */
  var CART_KEY = 'wusen_cart';
  function readCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
  }
  function writeCart(items){
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCartCount();
    document.dispatchEvent(new CustomEvent('cart:change', {detail:items}));
  }
  function cartQty(){
    return readCart().reduce(function(s,i){ return s + i.qty; }, 0);
  }
  function renderCartCount(){
    var n = cartQty();
    document.querySelectorAll('[data-cart-count]').forEach(function(el){
      el.textContent = n;
      el.style.display = n > 0 ? 'inline-grid' : 'none';
    });
  }
  // 加入購物車：優先用按鈕上的 data-*，否則從最近的卡片/商品區自動讀取。
  function addToCart(btn, qty){
    qty = qty || 1;
    var scope = btn.closest('[data-product]') || btn.closest('.card') || btn.closest('.pd') || document;
    function pick(sel, attr){
      var el = btn.getAttribute('data-'+attr) ? null : scope.querySelector(sel);
      return btn.getAttribute('data-'+attr) || (el ? el.textContent.trim() : '');
    }
    var name = btn.getAttribute('data-name') || (scope.querySelector('h3,h1.pd-title,.pd h1') ? scope.querySelector('h3,h1.pd-title,.pd h1').textContent.trim() : '霧森茶品');
    var priceText = btn.getAttribute('data-price') || (scope.querySelector('[data-price-out]') ? scope.querySelector('[data-price-out]').textContent : (scope.querySelector('.price') ? scope.querySelector('.price').textContent : 'NT$0'));
    var price = parseInt(String(priceText).replace(/[^\d]/g,''), 10) || 0;
    var imgEl = scope.querySelector('img');
    var img = btn.getAttribute('data-img') || (imgEl ? imgEl.getAttribute('src') : 'assets/oolong.webp');
    var variant = '';
    var activeChip = scope.querySelector('.chip.active');
    if(activeChip) variant = activeChip.textContent.trim();
    var id = (btn.getAttribute('data-id') || name) + (variant ? '|'+variant : '');

    var items = readCart();
    var found = items.filter(function(i){ return i.id === id; })[0];
    if(found) found.qty += qty;
    else items.push({ id:id, name:name, variant:variant, price:price, img:img, qty:qty });
    writeCart(items);
    showToast('已加入購物車');
  }
  // 對外暴露（cart / checkout 頁使用）。
  window.WusenCart = {
    read: readCart, write: writeCart, qty: cartQty,
    setQty: function(id, q){
      var items = readCart().map(function(i){ if(i.id===id) i.qty = Math.max(1, q); return i; });
      writeCart(items);
    },
    remove: function(id){
      writeCart(readCart().filter(function(i){ return i.id !== id; }));
    },
    clear: function(){ writeCart([]); },
    subtotal: function(){ return readCart().reduce(function(s,i){ return s + i.price*i.qty; }, 0); }
  };
  renderCartCount();

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
    b.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var scope = b.closest('.pd') || b.closest('.card') || document;
      var qtyInput = scope.querySelector('.qty input');
      var q = qtyInput ? (parseInt(qtyInput.value,10) || 1) : 1;
      addToCart(b, q);
      // 「直接購買」：加入後直接前往結帳。
      if(b.hasAttribute('data-buy')){ location.href = 'checkout.html'; }
    });
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

  /* ---- cart page render ---- */
  var SHIP_FREE = 1500, SHIP_FEE = 120;
  function money(n){ return 'NT$' + n.toLocaleString('en-US'); }
  var cartList = document.querySelector('[data-cart-list]');
  if(cartList){
    var cartEmpty = document.querySelector('[data-cart-empty]');
    var cartBody = document.querySelector('[data-cart-body]');
    function renderCart(){
      var items = readCart();
      if(!items.length){
        if(cartEmpty) cartEmpty.style.display = '';
        if(cartBody) cartBody.style.display = 'none';
        return;
      }
      if(cartEmpty) cartEmpty.style.display = 'none';
      if(cartBody) cartBody.style.display = '';
      cartList.innerHTML = items.map(function(i){
        return '<div class="cart-row" data-id="'+encodeURIComponent(i.id)+'">'
          + '<div class="cart-thumb"><img src="'+i.img+'" alt="'+i.name+'"></div>'
          + '<div class="cart-info"><p class="cart-name">'+i.name+'</p>'
          + (i.variant ? '<p class="cart-variant">'+i.variant+'</p>' : '')
          + '<p class="cart-unit">'+money(i.price)+'</p></div>'
          + '<div class="qty cart-qty"><button data-step="down" aria-label="減少">−</button>'
          + '<input value="'+i.qty+'" inputmode="numeric" aria-label="數量" readonly>'
          + '<button data-step="up" aria-label="增加">+</button></div>'
          + '<div class="cart-line">'+money(i.price*i.qty)+'</div>'
          + '<button class="cart-del" data-del aria-label="移除">'
          + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
          + '</div>';
      }).join('');
      renderSummary();
    }
    function renderSummary(){
      var sub = window.WusenCart.subtotal();
      var ship = sub >= SHIP_FREE || sub === 0 ? 0 : SHIP_FEE;
      var setT = function(sel,val){ var el = document.querySelector(sel); if(el) el.textContent = val; };
      setT('[data-sum-sub]', money(sub));
      setT('[data-sum-ship]', ship === 0 ? '免運' : money(ship));
      setT('[data-sum-total]', money(sub + ship));
      var hint = document.querySelector('[data-ship-hint]');
      if(hint) hint.textContent = sub >= SHIP_FREE ? '已享免運' : ('再買 '+money(SHIP_FREE - sub)+' 即免運');
    }
    cartList.addEventListener('click', function(e){
      var row = e.target.closest('.cart-row'); if(!row) return;
      var id = decodeURIComponent(row.getAttribute('data-id'));
      var items = readCart();
      var item = items.filter(function(i){ return i.id===id; })[0];
      if(e.target.closest('[data-del]')){ window.WusenCart.remove(id); renderCart(); return; }
      var step = e.target.closest('[data-step]');
      if(step && item){
        var q = item.qty + (step.getAttribute('data-step')==='up' ? 1 : -1);
        if(q < 1){ window.WusenCart.remove(id); } else { window.WusenCart.setQty(id, q); }
        renderCart();
      }
    });
    renderCart();
  }

  /* ---- checkout page render ---- */
  var coSummary = document.querySelector('[data-checkout-summary]');
  if(coSummary){
    var items = readCart();
    if(!items.length){
      coSummary.innerHTML = '<p class="muted">購物車是空的。<a href="shop.html">去逛逛茶品 →</a></p>';
      var coForm0 = document.querySelector('form[data-checkout]');
      if(coForm0) coForm0.style.display = 'none';
    } else {
      var sub = window.WusenCart.subtotal();
      var ship = sub >= SHIP_FREE ? 0 : SHIP_FEE;
      coSummary.innerHTML = items.map(function(i){
        return '<div class="co-line"><span>'+i.name+(i.variant?'・'+i.variant:'')+' ×'+i.qty+'</span><span>'+money(i.price*i.qty)+'</span></div>';
      }).join('')
      + '<div class="co-line co-sub"><span>小計</span><span>'+money(sub)+'</span></div>'
      + '<div class="co-line"><span>運費</span><span>'+(ship===0?'免運':money(ship))+'</span></div>'
      + '<div class="co-line co-total"><span>應付金額</span><span>'+money(sub+ship)+'</span></div>';
    }
    var coForm = document.querySelector('form[data-checkout]');
    if(coForm){
      coForm.addEventListener('submit', function(e){
        e.preventDefault();
        window.WusenCart.clear();
        var wrap = document.querySelector('[data-checkout-wrap]');
        if(wrap){
          wrap.innerHTML = '<div class="co-done"><div class="co-done-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'
            + '<h2 class="h-lg">訂單已成立</h2><p class="lede">感謝您的訂購，這是一個展示用的範例結帳流程。我們已寄出確認信（示意），您可繼續逛逛或回到首頁。</p>'
            + '<div class="cta" style="margin-top:1.6rem"><a class="btn btn-primary" href="shop.html">繼續選購</a><a class="btn btn-ghost" href="index.html">回首頁</a></div></div>';
          window.scrollTo({top:0,behavior:'smooth'});
        }
      });
    }
  }

  /* ---- account (login/register, demo only) ---- */
  var ACC_KEY = 'wusen_user';
  function getUser(){ try { return JSON.parse(localStorage.getItem(ACC_KEY)); } catch(e){ return null; } }
  function renderAccountNav(){
    var u = getUser();
    document.querySelectorAll('[data-account-link]').forEach(function(el){
      el.setAttribute('title', u ? (u.name+' · 會員中心') : '會員登入');
    });
  }
  renderAccountNav();
  var authForms = document.querySelectorAll('form[data-auth]');
  if(authForms.length){
    authForms.forEach(function(f){
      f.addEventListener('submit', function(e){
        e.preventDefault();
        var data = Object.fromEntries(new FormData(f).entries());
        var name = data.name || (data.email ? data.email.split('@')[0] : '會員');
        localStorage.setItem(ACC_KEY, JSON.stringify({ name:name, email:data.email||'' }));
        showToast('登入成功，歡迎回來');
        setTimeout(function(){ location.href = 'account.html'; }, 700);
      });
    });
  }
  // account dashboard
  var accDash = document.querySelector('[data-account-dash]');
  if(accDash){
    var u = getUser();
    if(!u){ location.href = 'login.html'; }
    else {
      var setT2 = function(sel,val){ var el = accDash.querySelector(sel); if(el) el.textContent = val; };
      setT2('[data-acc-name]', u.name);
      setT2('[data-acc-email]', u.email || '—');
      var logout = accDash.querySelector('[data-logout]');
      if(logout) logout.addEventListener('click', function(){ localStorage.removeItem(ACC_KEY); location.href='index.html'; });
    }
  }
  // auth tab toggle (login / register)
  document.querySelectorAll('[data-auth-tab]').forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = tab.getAttribute('data-auth-tab');
      document.querySelectorAll('[data-auth-tab]').forEach(function(t){ t.classList.toggle('active', t===tab); });
      document.querySelectorAll('[data-auth-panel]').forEach(function(p){
        p.style.display = (p.getAttribute('data-auth-panel')===target) ? '' : 'none';
      });
    });
  });

  /* ---- year ---- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
