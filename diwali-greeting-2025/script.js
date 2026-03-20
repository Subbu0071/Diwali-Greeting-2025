/* Diwali Wishes 2025 - script.js
   Handles scene transitions, diya interactions, rockets/crackers, and audio fallbacks.
*/

(() => {
  // Scenes
  const scenes = {
    entry: document.getElementById('scene-entry'),
    diyas: document.getElementById('scene-diyas'),
    crackers: document.getElementById('scene-crackers'),
    blessings: document.getElementById('scene-blessings'),
    closing: document.getElementById('scene-closing')
  };

  // Buttons
  const enterBtn = document.getElementById('enter-btn');
  const backToEntry = document.getElementById('back-to-entry');
  const playMusicBtn = document.getElementById('play-music');
  const backFromCrackers = document.getElementById('back-from-crackers');
  const btnRocket = document.getElementById('btn-rocket');
  const btnChakri = document.getElementById('btn-chakri');
  const btnFlower = document.getElementById('btn-flower');
  const replayBtn = document.getElementById('replay');
  const shareBtn = document.getElementById('share');
  const closingReplay = document.getElementById('closing-replay');
  const closingShare = document.getElementById('closing-share');

  // Audio elements
  const bgMusic = document.getElementById('bg-music');
  const sfxDiya = document.getElementById('sfx-diya');
  const sfxBurst = document.getElementById('sfx-burst');
  const sfxClick = document.getElementById('sfx-click');

  // Diya elements / state
  const diyasContainer = document.getElementById('diyas');
  const diyas = Array.from(document.querySelectorAll('.diya'));
  const diyaLine = document.getElementById('diya-line');
  const diyaComplete = document.getElementById('diya-complete');

  let litCount = 0;
  const blessingLines = [
    "May this diya light up your heart with peace.",
    "May your dreams shine brighter than ever.",
    "Let every flame remind you that love never fades.",
    "May your home be warmed with shared laughter.",
    "May hope and joy fill your coming days.",
    "Wishing you prosperity and bright tomorrows.",
    "May kindness guide your path always.",
    "Keep shining — you are loved."
  ];

  // UTIL: simple web audio beep fallback if sfx files not present/blocked
  function playBeep(freq = 440, duration = 0.08, type = 'sine', vol = 0.03) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop(); ctx.close();
      }, duration * 1000);
    } catch (e) { /* no audio context available */ }
  }

  // Show a scene (hide others)
  function showScene(targetScene) {
    Object.values(scenes).forEach(s => s.classList.remove('active'));
    targetScene.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Entry button
  enterBtn.addEventListener('click', () => {
    playSfx('click');
    showScene(scenes.diyas);
    // small automatic intro: focus first diya
    setTimeout(() => diyas[0].focus(), 400);
  });

  backToEntry.addEventListener('click', () => { playSfx('click'); showScene(scenes.entry); });

  // Play/pause music
  playMusicBtn.addEventListener('click', async () => {
    playSfx('click');
    if (bgMusic.paused) {
      try { await bgMusic.play(); playMusicBtn.textContent = 'Pause Music'; }
      catch(e) { alert('Tap anywhere to enable audio due to browser restrictions.'); }
    } else { bgMusic.pause(); playMusicBtn.textContent = 'Play Music'; }
  });

  // Initialize diyas interactions
  diyas.forEach((el, i) => {
    el.dataset.index = i;
    el.addEventListener('click', () => lightDiya(el, i));
    el.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); lightDiya(el, i); }});
  });

  function lightDiya(el, idx) {
    if (el.classList.contains('lit')) return;
    el.classList.add('lit');
    litCount++;
    // show blessing line
    diyaLine.textContent = blessingLines[idx % blessingLines.length] || "May light fill your life!";
    diyaLine.classList.add('fade-in');
    // play sound
    playSfx('diya');
    // when all lit
    if (litCount >= diyas.length) {
      setTimeout(() => {
        diyaComplete.textContent = "Just as every diya adds light to the night, may your presence add joy to every heart you touch. Happy Diwali! 💖";
        diyaComplete.classList.remove('hidden');
        diyaComplete.classList.add('fade-in');
        // reveal crackers scene button (link to crackers automatically)
        setTimeout(() => showScene(scenes.crackers), 1600);
      }, 700);
    }
  }

  // play sound helper (audio files if present; fallback beep)
  function playSfx(name){
    if (name === 'diya') {
      if (sfxDiya && sfxDiya.src) { try { sfxDiya.currentTime = 0; sfxDiya.play(); return; } catch(e){} }
      playBeep(880,0.09,'sine',0.06);
    } else if (name === 'burst') {
      if (sfxBurst && sfxBurst.src) { try { sfxBurst.currentTime = 0; sfxBurst.play(); return; } catch(e){} }
      playBeep(220,0.12,'sawtooth',0.08);
    } else if (name === 'click') {
      if (sfxClick && sfxClick.src) { try { sfxClick.currentTime = 0; sfxClick.play(); return; } catch(e){} }
      playBeep(1200,0.04,'sine',0.02);
    }
  }

  // CRACKERS: create rocket that flies and bursts with colored particles
  const crackerStage = document.getElementById('cracker-stage');
  function launchRocket(x = null) {
    // x position (random if null)
    const width = crackerStage.clientWidth;
    const startX = (x === null) ? (Math.random() * (width * 0.8) + width*0.1) : x;
    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    rocket.style.left = (startX - 4) + 'px';
    rocket.style.bottom = '10px';
    crackerStage.appendChild(rocket);

    // animate rocket up using JS (duration relative to height)
    const targetTopPct = Math.random() * 0.45 + 0.2; // how high (20% - 65%)
    const viewportHeight = crackerStage.clientHeight;
    const distance = viewportHeight * (1 - targetTopPct) - 40;
    const duration = 800 + Math.random() * 900;

    let start = null;
    const startBottom = 10;
    function frame(t){
      if (!start) start = t;
      const progress = Math.min((t-start)/duration, 1);
      const bottom = startBottom + distance * progress;
      rocket.style.bottom = bottom + 'px';
      rocket.style.transform = `rotate(${(progress*600 - 300) * 0.02}deg)`; // small wiggle
      if (progress < 1) requestAnimationFrame(frame);
      else {
        // burst
        burstAt(parseFloat(rocket.style.left) + 4, crackerStage.clientHeight - bottom - 20);
        rocket.remove();
        playSfx('burst');
      }
    }
    requestAnimationFrame(frame);
  }

  // bursting particles (DOM-based)
  function burstAt(clientX, clientY) {
    const colors = ['#ffd166','#ff7b7b','#ffd6a5','#ffb86b','#ffec99','#ff9f43'];
    const count = 18 + Math.floor(Math.random()*14);
    for (let i=0;i<count;i++){
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 4 + Math.random()*8;
      p.style.width = p.style.height = size + 'px';
      p.style.left = clientX + (Math.random()*30 - 15) + 'px';
      p.style.top = clientY + (Math.random()*20 - 10) + 'px';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.opacity = 1;
      crackerStage.appendChild(p);

      const angle = Math.random()*Math.PI*2;
      const speed = 30 + Math.random()*170;
      const vx = Math.cos(angle)*speed;
      const vy = Math.sin(angle)*speed;

      const life = 700 + Math.random()*800;
      const start = performance.now();
      function animate(now){
        const t = now - start;
        const progress = t / life;
        if (progress >= 1) {
          p.remove();
          return;
        }
        p.style.transform = `translate(${vx*progress}px, ${-vy*progress + 0.5*250*progress*progress/100}px) scale(${1-progress})`;
        p.style.opacity = (1-progress).toString();
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }
  }

  // Buttons for crackers
  btnRocket.addEventListener('click', () => { playSfx('click'); launchRocket(); });
  btnChakri.addEventListener('click', () => { playSfx('click'); spinChakri(); });
  btnFlower.addEventListener('click', () => { playSfx('click'); flowerpot(); });

  // Click anywhere on cracker stage to launch rocket there
  crackerStage.addEventListener('click', (e) => {
    const rect = crackerStage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    launchRocket(x);
  });

  backFromCrackers.addEventListener('click', () => { playSfx('click'); showScene(scenes.diyas); });

  // Chakri (spin) - sample ground spinner animation
  function spinChakri(){
    // create a circle of small particles that spin on the ground
    const centerX = crackerStage.clientWidth/2;
    const centerY = crackerStage.clientHeight - 40;
    const ring = document.createElement('div');
    ring.style.position = 'absolute';
    ring.style.left = (centerX - 60) + 'px';
    ring.style.bottom = '20px';
    ring.style.width = '120px';
    ring.style.height = '120px';
    ring.style.borderRadius = '50%';
    ring.style.pointerEvents = 'none';
    crackerStage.appendChild(ring);

    const count = 18;
    for (let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.position = 'absolute';
      const angle = (i/count) * Math.PI * 2;
      const rx = Math.cos(angle) * 46 + 60;
      const ry = Math.sin(angle) * 46 + 60;
      el.style.left = rx + 'px';
      el.style.top = ry + 'px';
      el.style.background = `hsl(${Math.random()*60+30}deg,85%,65%)`;
      ring.appendChild(el);
      // animate spin with CSS transform via JS
      el.animate([
        { transform: `rotate(${i * (360/count)}deg) translateY(0)` },
        { transform: `rotate(${i * (360/count) + 360}deg) translateY(0)` }
      ], { duration: 900 + Math.random()*400, iterations: 1, easing:'cubic-bezier(.2,.9,.2,1)' });
    }
    // small burst after spin
    setTimeout(()=> {
      burstAt(centerX, crackerStage.clientHeight - 160);
      ring.remove();
      playSfx('burst');
    }, 1100);
  }

  // Flowerpot (vertical spark)
  function flowerpot(){
    const centerX = Math.random() * (crackerStage.clientWidth * 0.6) + crackerStage.clientWidth*0.2;
    const baseY = crackerStage.clientHeight - 30;
    // create vertical particles
    for (let i=0;i<22;i++){
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 4 + Math.random()*8;
      p.style.width = p.style.height = size + 'px';
      p.style.left = (centerX + (Math.random()*40 - 20)) + 'px';
      p.style.top = baseY + 'px';
      p.style.background = ['#ffd166','#ffb86b','#ff7b7b'][Math.floor(Math.random()*3)];
      crackerStage.appendChild(p);

      const up = 120 + Math.random()*220;
      const life = 700 + Math.random()*600;
      const start = performance.now();
      function animate(now){
        const t = now - start;
        const progress = t / life;
        if (progress >= 1){ p.remove(); return; }
        p.style.transform = `translateY(${-up * progress}px) translateX(${(Math.random()-0.5)*40*progress}px) scale(${1-progress})`;
        p.style.opacity = (1-progress).toString();
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }
    playSfx('burst');
  }

  // Blessings page controls
  replayBtn.addEventListener('click', () => {
    playSfx('click');
    resetAll();
    showScene(scenes.diyas);
  });

  shareBtn.addEventListener('click', () => {
    playSfx('click');
    if (navigator.share) {
      navigator.share({ title: 'Diwali Wishes 2025', url: window.location.href }).catch(()=>{/*ignored*/});
    } else {
      navigator.clipboard.writeText(window.location.href).then(()=> alert('Link copied to clipboard. Share it with your loved ones!'));
    }
  });

  closingReplay.addEventListener('click', () => { playSfx('click'); resetAll(); showScene(scenes.diyas); });
  closingShare.addEventListener('click', () => { playSfx('click'); shareBtn.click(); });

  // Reset diyas and state
  function resetAll(){
    diyas.forEach(el => el.classList.remove('lit'));
    litCount = 0;
    diyaLine.textContent = '';
    diyaComplete.textContent = '';
    diyaComplete.classList.add('hidden');
    // clear particles
    const particles = crackerStage.querySelectorAll('.particle, .rocket');
    particles.forEach(p => p.remove());
  }

  // On load, generate diyas count to match container (responsive)
  function generateDiyas(count = 8) {
    diyasContainer.innerHTML = '';
    for (let i=0;i<count;i++){
      const d = document.createElement('div');
      d.className = 'diya';
      d.dataset.index = i;
      d.setAttribute('role','button');
      d.setAttribute('tabindex','0');
      d.setAttribute('aria-label', `diya ${i+1}`);
      d.addEventListener('click', () => lightDiya(d, i));
      d.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); lightDiya(d, i); }});
      diyasContainer.appendChild(d);
    }
  }

  // initial scene
  showScene(scenes.entry);
  generateDiyas(8);

  // small accessibility: press Escape to return to entry
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { showScene(scenes.entry); }
  });

  // make sure sounds are user-gesture enabled (most browsers require)
  // if user interacts anywhere, unmute audio and attempt to play background music if visible
  document.addEventListener('pointerdown', function onceAudioUnlock() {
    // remove this listener after first use
    document.removeEventListener('pointerdown', onceAudioUnlock);
    try {
      if (bgMusic && bgMusic.paused) {
        // do not auto-play; only unlock audio context for play on request
        // attempts to play will be initiated by play button or subsequent clicks
      }
    } catch(e){}
  });

})();
