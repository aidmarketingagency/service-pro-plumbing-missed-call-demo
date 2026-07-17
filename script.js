(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
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