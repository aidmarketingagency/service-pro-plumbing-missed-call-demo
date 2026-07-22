/* AID teaser bubble + auto-open schedule (v3, 2026-07-22):
   teaser at 10s next to the closed launcher, auto-open never before 20s.
   Pages with the data-aid-widget-boost snippet keep that snippet's own 20s
   opener; this block only auto-opens on pages without it. Clicking the
   teaser or the launcher opens the chat immediately. */
(function () {
  var WID = '54722168';
  var BUBBLE_ID = 'ultra-fast-widget-bubble-' + WID;
  var OPEN_KEY = 'aidWidgetAutoOpened';
  var LEGACY_KEY = 'aidDemoWidgetAutoOpened';
  var TEASER_KEY = 'aidTeaserShown';
  var TEASER_AT = 10; /* seconds, the old auto-open moment */
  var OPEN_AT = 20;   /* seconds, minimum auto-open delay */
  var hasBoost = !!document.querySelector('script[data-aid-widget-boost]');
  function bubble() { return document.getElementById(BUBBLE_ID); }
  function isOpen() {
    var c = document.getElementById('ultra-fast-widget-container-' + WID);
    return !!(c && getComputedStyle(c).display !== 'none');
  }
  function alreadyOpened() {
    try { return !!(sessionStorage.getItem(OPEN_KEY) || sessionStorage.getItem(LEGACY_KEY)); } catch (e) { return false; }
  }
  var teaser = null;
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) {
      userTouched = true;
      hideTeaser();
    }
  }, true);
  function hideTeaser() {
    if (!teaser) return;
    var t = teaser;
    teaser = null;
    t.style.opacity = '0';
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
  }
  function openChat() {
    hideTeaser();
    var b = bubble();
    if (b && !isOpen()) b.click();
  }
  function showTeaser() {
    if (teaser || userTouched || isOpen() || alreadyOpened()) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
      sessionStorage.setItem(TEASER_KEY, '1');
    } catch (e) {}
    var d = document.createElement('div');
    d.setAttribute('data-aid-teaser', '');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.style.cssText = 'position:fixed;right:20px;bottom:98px;z-index:999998;max-width:250px;background:#141419;color:#F4F4F5;padding:13px 32px 13px 16px;border-radius:16px;border:1px solid rgba(201,168,76,.45);box-shadow:0 12px 28px rgba(0,0,0,.5);font:500 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease;';
    var txt = document.createElement('p');
    txt.style.cssText = 'margin:0;';
    txt.textContent = 'Free demo, your Agent talks and speaks! 🎙️';
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.textContent = '×';
    x.style.cssText = 'position:absolute;top:2px;right:6px;background:transparent;border:none;color:rgba(244,244,245,.55);font-size:18px;line-height:1;cursor:pointer;padding:2px 4px;';
    x.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); });
    var arrow = document.createElement('span');
    arrow.style.cssText = 'position:absolute;bottom:-7px;right:26px;width:12px;height:12px;background:#141419;border-right:1px solid rgba(201,168,76,.45);border-bottom:1px solid rgba(201,168,76,.45);transform:rotate(45deg);';
    d.appendChild(txt);
    d.appendChild(x);
    d.appendChild(arrow);
    d.addEventListener('click', function (e) { if (e.target === x) return; e.stopPropagation(); openChat(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } });
    document.body.appendChild(d);
    teaser = d;
    requestAnimationFrame(function () { d.style.opacity = '1'; d.style.transform = 'translateY(0)'; });
  }
  var ticks = 0;
  var timer = setInterval(function () {
    ticks += 1;
    if (isOpen()) {
      hideTeaser();
      if (hasBoost || ticks >= OPEN_AT) clearInterval(timer);
      return;
    }
    var b = bubble();
    if (b && ticks >= TEASER_AT) showTeaser();
    if (!hasBoost && b && ticks >= OPEN_AT) {
      clearInterval(timer);
      hideTeaser();
      var guard = alreadyOpened();
      try { sessionStorage.setItem(LEGACY_KEY, '1'); } catch (e) {}
      if (!guard && !userTouched && !isOpen()) b.click();
    }
    if (ticks > 60) clearInterval(timer);
  }, 1000);
})();

(function(){
  // Reduced-motion gate (spec: JS-driven animation must check this)
  var motionQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced(){ return !!motionQ.matches; }

  // -- SMS thread sequencer --
  var thread   = document.getElementById('thread');
  var b0 = document.getElementById('b0');
  var b1 = document.getElementById('b1');
  var b2 = document.getElementById('b2');
  var b3 = document.getElementById('b3');
  var t1 = document.getElementById('typing1');
  var t2 = document.getElementById('typing2');
  var replayBtn = document.getElementById('replayBtn');
  var timers = [];
  var playing = false;

  function clearAll(){ timers.forEach(function(id){ clearTimeout(id); }); timers = []; }

  function resetThread(){
    [b0,b1,b2,b3].forEach(function(b){ b.classList.remove('show'); });
    [t1,t2].forEach(function(t){ t.classList.remove('show'); });
  }

  function showFinal(){
    clearAll();
    playing = false;
    [b0,b1,b2,b3].forEach(function(b){ b.classList.add('show'); });
    [t1,t2].forEach(function(t){ t.classList.remove('show'); });
  }

  function playThread(){
    if (reduced()){ showFinal(); return; }
    if (playing) return;
    playing = true;
    clearAll();
    resetThread();
    var seq = [
      { ms: 240,  fn: function(){ b0.classList.add('show'); } },
      { ms: 1000, fn: function(){ t1.classList.add('show'); } },
      { ms: 2000, fn: function(){ t1.classList.remove('show'); b1.classList.add('show'); } },
      { ms: 2900, fn: function(){ b2.classList.add('show'); } },
      { ms: 3500, fn: function(){ t2.classList.add('show'); } },
      { ms: 4550, fn: function(){ t2.classList.remove('show'); b3.classList.add('show'); playing = false; } }
    ];
    seq.forEach(function(s){ timers.push(setTimeout(s.fn, s.ms)); });
  }

  replayBtn.addEventListener('click', function(){
    replayBtn.classList.add('spin');
    setTimeout(function(){ replayBtn.classList.remove('spin'); }, 520);
    playing = false;
    playThread();
  });

  // Re-arm on every scroll re-entry (v2 spec: nothing plays once and dies)
  if ('IntersectionObserver' in window){
    var demoIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          playThread();
        } else if (!reduced()){
          clearAll();
          playing = false;
          resetThread();
        }
      });
    }, { threshold: 0.3 });
    demoIO.observe(thread);
  } else {
    playThread();
  }

  // -- Stat counter (count up to 2200, re-arms on re-entry) --
  var statEl   = document.getElementById('statNumber');
  var replayStatBtn = document.getElementById('statReplayBtn');
  var countRun = 0;

  function runCount(){
    if (reduced()){
      statEl.innerHTML = '$2<span class="cents">,200</span>';
      return;
    }
    var run = ++countRun;
    var start = null;
    var dur = 1600;
    var target = 2200;
    function step(ts){
      if (run !== countRun) return; // superseded
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var val = Math.round(ease * target);
      var s = val.toLocaleString();
      var parts = s.split(',');
      if (parts.length === 2){
        statEl.innerHTML = '$' + parts[0] + '<span class="cents">,' + parts[1] + '</span>';
      } else {
        statEl.textContent = '$' + s;
      }
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (replayStatBtn){
    replayStatBtn.addEventListener('click', function(){
      replayStatBtn.classList.add('spin');
      setTimeout(function(){ replayStatBtn.classList.remove('spin'); }, 520);
      runCount();
    });
  }

  if ('IntersectionObserver' in window){
    var statIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) runCount();
      });
    }, { threshold: 0.4 });
    if (statEl) statIO.observe(statEl);
  } else {
    runCount();
  }

  // mid-session reduced-motion toggle: snap everything to final state
  if (motionQ.addEventListener){
    motionQ.addEventListener('change', function(){
      if (reduced()){
        showFinal();
        if (statEl) statEl.innerHTML = '$2<span class="cents">,200</span>';
      }
    });
  }

  // -- Scroll reveal for sections --
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var revIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); revIO.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function(el){ revIO.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('visible'); });
  }

  // -- Sticky mobile CTA: hide when real CTA panel is in view (A1) --
  var mobileCta = document.getElementById('mobileCta');
  var ctaPanel  = document.getElementById('ctaPanel');
  if (mobileCta && ctaPanel && 'IntersectionObserver' in window){
    var ctaIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          mobileCta.classList.add('hidden');
        } else {
          mobileCta.classList.remove('hidden');
        }
      });
    }, { threshold: 0.1 });
    ctaIO.observe(ctaPanel);
  }

})();