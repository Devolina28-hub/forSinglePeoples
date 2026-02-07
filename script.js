// script.js — complete version with all 15 games

// ────────────────────────────────────────────────
// INDEX PAGE LOGIC (yes / no button)
// ────────────────────────────────────────────────

let noClicks = 0;

document.addEventListener('DOMContentLoaded', () => {
  const yesBtn = document.getElementById('yesBtn');
  const noBtn  = document.getElementById('noBtn');
  const noMsg  = document.getElementById('noMessage');

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      document.getElementById('yesSound')?.play().catch(()=>{});
      confetti({ particleCount: 180, spread: 80 });
      setTimeout(() => window.location.href = 'main.html', 1400);
    });
  }

  if (noBtn) {
    noBtn.addEventListener('click', () => {
      document.getElementById('popSound')?.play().catch(()=>{});
      noClicks++;
      noMsg.classList.remove('d-none');

      const x = Math.random() * 80 + 10;
      const y = Math.random() * 60 + 20;
      noBtn.style.position = 'absolute';
      noBtn.style.left = x + 'vw';
      noBtn.style.top  = y + 'vh';
      noBtn.style.transform = 'scale(1.1)';

      if (noClicks > 3) {
        noMsg.textContent = "Seriously? Self-love is calling! Click YES already 💕";
      }
    });
  }

  // Floating hearts
  setInterval(() => {
    const h = document.createElement('div');
    h.textContent = ['❤️','💖','🌹','✨'][Math.floor(Math.random()*4)];
    h.style.position = 'absolute';
    h.style.left = Math.random()*100 + 'vw';
    h.style.fontSize = (Math.random()*2 + 1.8) + 'rem';
    h.style.animation = `float ${Math.random()*20 + 12}s linear`;
    document.querySelector('.floating-hearts')?.appendChild(h);
    setTimeout(() => h.remove(), 30000);
  }, 700);
});

// ────────────────────────────────────────────────
// CANVAS HELPER
// ────────────────────────────────────────────────

function createGameCanvas(area, baseWidth = 420, baseHeight = 320) {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = baseWidth  * dpr;
  canvas.height = baseHeight * dpr;
  canvas.style.width  = baseWidth  + 'px';
  canvas.style.height = baseHeight + 'px';
  canvas.style.border = '2px solid #ff69b4';
  canvas.style.borderRadius = '12px';
  canvas.style.background = 'rgba(255,255,255,0.65)';
  canvas.style.touchAction = 'none';
  area.innerHTML = '';
  area.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, baseWidth, baseHeight };
}

// ────────────────────────────────────────────────
// CLEANUP FUNCTION – prevents previous game leakage
// ────────────────────────────────────────────────

// Aggressive cleanup to prevent previous game content from leaking
function cleanGameArea(area, modalBody) {
  // 1. Clear all content inside #gameArea
  area.innerHTML = '';

  // 2. Remove any "End Game Now" buttons that were added previously
  const oldExitButtons = modalBody.querySelectorAll('.btn-outline-danger.btn-sm');
  oldExitButtons.forEach(btn => btn.remove());

  // 3. Remove any leftover canvases or UI elements
  const canvases = area.querySelectorAll('canvas');
  canvases.forEach(c => c.remove());

  // 4. Clear any appended result messages or counters
  const oldResults = area.querySelectorAll('.fw-bold, .fs-5, .display-4, p, div, button');
  oldResults.forEach(el => {
    if (!el.id.includes('startGameBtn')) el.remove();
  });
}
// ────────────────────────────────────────────────
// GAME STARTER + END SCREEN + END GAME NOW BUTTON
// ────────────────────────────────────────────────

function startDay(day, title, quote, gameFn) {
  document.getElementById('dayTitle').textContent = title;
  document.getElementById('dayQuote').textContent = quote;

  const modalEl = document.getElementById('dayModal');
  const modalBody = modalEl.querySelector('.modal-body');
  const area = document.getElementById('gameArea');

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Gentle background confetti when modal opens
  confetti({
    particleCount: 50,
    angle: 90,
    spread: 45,
    origin: { y: 0.1 },
    ticks: 180,
    gravity: 0.35,
    decay: 0.92,
    drift: 0,
    colors: ['#ff69b4', '#ff1493', '#ffffff', '#ffe6f2', '#fda4af']
  });

  document.getElementById('startGameBtn').onclick = () => {
    // FULL CLEANUP before starting new game
    cleanGameArea(area, modalBody);

    // Add "End Game Now" button (top-right)
    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'End Game Now ×';
    exitBtn.className = 'btn btn-sm btn-outline-danger position-absolute';
    exitBtn.style.top = '10px';
    exitBtn.style.right = '15px';
    exitBtn.style.zIndex = '100';
    exitBtn.onclick = () => {
      modal.hide();
    };
    modalBody.insertBefore(exitBtn, area);

    // Now start the game
    if (typeof window[gameFn] === 'function') {
      window[gameFn](area, day);
    }
  };
}

function showGameEnd(area, title, subtitle, day = null) {
  confetti({ particleCount: 220, spread: 110, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 140, spread: 90 }), 700);

  const endDiv = document.createElement('div');
  endDiv.className = 'position-absolute top-50 start-50 translate-middle text-center text-white p-4 rounded shadow-lg';
  endDiv.style.background = 'rgba(0,0,0,0.68)';
  endDiv.style.maxWidth = '92%';
  endDiv.style.zIndex = '10';
  endDiv.innerHTML = `
    <h2 class="fw-bold mb-3 game-end-message">${title}</h2>
    <p class="fs-5 mb-4 game-end-message">${subtitle}</p>
    <div class="d-flex justify-content-center gap-3 flex-wrap">
      <button class="btn btn-pink btn-lg" onclick="location.reload()">Play Again</button>
      ${day >= 21 ? `<a href="thankyou.html" class="btn btn-success btn-lg">Finish & Celebrate!</a>` : ''}
    </div>
  `;
  area.appendChild(endDiv);
}

// ────────────────────────────────────────────────
// 1. Rose Day – collect falling roses
// ────────────────────────────────────────────────

function rosePetalCollector(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 420, 340);
  let score = 0;
  let timeLeft = 25;
  let petals = [];
  let gameOver = false;

  const ui = document.createElement('p');
  ui.className = 'fw-bold fs-5 text-center mb-2';
  ui.innerHTML = `Time: ${timeLeft}s | Score: <span id="rScore">0</span>`;
  area.prepend(ui);

  function spawn() {
    if (gameOver) return;
    petals.push({ x: Math.random() * (baseWidth - 50), y: -60, speed: 2 + Math.random() * 2 });
  }
  const spawnInt = setInterval(spawn, 650);

  function handleTap(e) {
    e.preventDefault();
    if (gameOver) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (baseWidth / rect.width);
    const my = (touch.clientY - rect.top) * (baseHeight / rect.height);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      if (mx > p.x && mx < p.x + 50 && my > p.y && my < p.y + 50) {
        score += 10;
        petals.splice(i, 1);
        confetti({ particleCount: 45 });
        document.getElementById('rScore').textContent = score;
      }
    }
  }

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTap, { passive: false });

  const timer = setInterval(() => {
    timeLeft--;
    ui.innerHTML = `Time: ${timeLeft}s | Score: <span id="rScore">${score}</span>`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(spawnInt);
      gameOver = true;
      showGameEnd(area, `You collected ${score} roses!`, "Blooming beautifully on your own 🌹✨", day);
    }
  }, 1000);

  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    petals.forEach((p, i) => {
      p.y += p.speed;
      ctx.font = '45px Arial';
      ctx.fillText('🌹', p.x, p.y + 35);
      if (p.y > baseHeight + 60) petals.splice(i, 1);
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ────────────────────────────────────────────────
// 2. Propose Day – simple yes/no quiz
// ────────────────────────────────────────────────

function selfProposalQuiz(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Will you be your own Valentine forever? 💍</h4>
    <div class="d-grid gap-3 col-8 mx-auto">
      <button class="btn btn-success btn-lg py-3" onclick="selfLoveYes()">YES — obviously!</button>
      <button class="btn btn-outline-danger btn-lg py-3" onclick="selfLoveNo()">No...</button>
    </div>
    <p id="quizResult" class="mt-5 fs-4 fw-bold text-center"></p>
  `;

  let answered = false;

  window.selfLoveYes = () => {
    if (answered) return;
    answered = true;
    document.getElementById('quizResult').innerHTML = 'Proposal ACCEPTED!<br>You & You — best couple ever 💕✨';
    confetti({ particleCount: 150, spread: 90 });
    setTimeout(() => showGameEnd(area, "Self-love sealed!", "Best relationship you'll ever have.", day), 1800);
  };

  window.selfLoveNo = () => {
    if (answered) return;
    document.getElementById('quizResult').innerHTML = 'Try again — you deserve to say YES to yourself!';
  };
}

// ────────────────────────────────────────────────
// 3. Chocolate Day – dodge chocolates, collect hearts
// ────────────────────────────────────────────────

function chocolateDodge(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 420, 320);
  let score = 0;
  let timeLeft = 30;
  let player = { x: baseWidth/2 - 25, y: baseHeight - 60, size: 50 };
  let objects = [];
  let gameOver = false;

  const ui = document.createElement('p');
  ui.className = 'fw-bold fs-5 text-center mb-2';
  ui.innerHTML = `Time: ${timeLeft}s | Score: <span id="cdScore">0</span>`;
  area.prepend(ui);

  function spawn() {
    if (gameOver) return;
    const good = Math.random() > 0.4;
    objects.push({
      x: Math.random() * (baseWidth - 50),
      y: -60,
      type: good ? 'heart' : 'choco',
      speed: 2.5 + Math.random() * 2.5
    });
  }
  const spawnInt = setInterval(spawn, 750);

  function moveHandler(e) {
    if (gameOver) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    player.x = (touch.clientX - rect.left) * (baseWidth / rect.width) - player.size / 2;
    player.x = Math.max(0, Math.min(baseWidth - player.size, player.x));
  }

  canvas.addEventListener('mousemove', moveHandler);
  canvas.addEventListener('touchmove', moveHandler, { passive: false });

  const timer = setInterval(() => {
    timeLeft--;
    ui.innerHTML = `Time: ${timeLeft}s | Score: <span id="cdScore">${score}</span>`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(spawnInt);
      gameOver = true;
      showGameEnd(area, `You scored ${score} points!`, "Your independence stays sweet & strong 🍫❤️", day);
    }
  }, 1000);

  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    ctx.font = '45px Arial';
    ctx.fillText('🧑', player.x, player.y + 40);

    objects = objects.filter(o => {
      o.y += o.speed;
      ctx.fillText(o.type === 'choco' ? '🍫' : '❤️', o.x, o.y + 35);

      if (o.y + 45 > player.y && o.y < player.y + player.size &&
          o.x + 40 > player.x && o.x < player.x + player.size) {
        score += o.type === 'heart' ? 15 : -7;
        confetti({ particleCount: o.type === 'heart' ? 60 : 25 });
        document.getElementById('cdScore').textContent = score;
        return false;
      }
      return o.y < baseHeight + 60;
    });

    requestAnimationFrame(loop);
  }
  loop();
}

// ────────────────────────────────────────────────
// 4. Teddy Day – rapid click hug counter
// ────────────────────────────────────────────────

function teddyHugTimer(area, day) {
  area.innerHTML = `
    <h4 class="mb-3">Teddy Hug Challenge 🧸 – Tap as fast as you can!</h4>
    <p class="display-4 fw-bold mb-4" id="hugCount">0</p>
    <button id="hugButton" class="btn btn-warning btn-lg py-5 px-5 rounded-circle shadow">HUG!</button>
    <p class="mt-4 fs-5">Time left: <span id="hugTimer">20</span>s</p>
  `;

  let hugs = 0;
  let time = 20;
  const countEl = document.getElementById('hugCount');
  const timerEl = document.getElementById('hugTimer');
  const btn = document.getElementById('hugButton');

  btn.onclick = () => {
    hugs++;
    countEl.textContent = hugs;
    confetti({ particleCount: 35, spread: 60 });
  };

  const t = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time <= 0) {
      clearInterval(t);
      btn.disabled = true;
      showGameEnd(area, `You gave ${hugs} teddy hugs!`, "You're worthy of endless warmth 🧸💖", day);
    }
  }, 1000);
}

// ────────────────────────────────────────────────
// 5. Promise Day – build chain of self-promises
// ────────────────────────────────────────────────

function promiseChain(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Build Your Self-Love Promise Chain 🤝</h4>
    <p>Click to add promises — goal: 8</p>
    <ul id="promiseList" class="list-group mb-3 text-start"></ul>
    <button id="addPromiseBtn" class="btn btn-success btn-lg">I promise to...</button>
    <p class="mt-3 fs-5">Promises: <span id="promiseCount">0</span> / 8</p>
  `;

  const list = document.getElementById('promiseList');
  const countEl = document.getElementById('promiseCount');
  const btn = document.getElementById('addPromiseBtn');

  const promises = [
    "love myself more every day",
    "chase my dreams without apology",
    "say no to things that drain me",
    "eat dessert first sometimes",
    "prioritize rest and joy",
    "celebrate small wins loudly",
    "be kind to my body & mind",
    "trust my own path completely"
  ];

  let count = 0;

  btn.onclick = () => {
    if (count >= 8) return;
    const li = document.createElement('li');
    li.className = 'list-group-item bg-light border-0 shadow-sm mb-2';
    li.textContent = promises[Math.floor(Math.random() * promises.length)];
    list.appendChild(li);
    count++;
    countEl.textContent = count;
    if (count >= 8) {
      showGameEnd(area, "Promise Chain Complete!", "You're unstoppable when you keep promises to yourself 🤝🌟", day);
    }
  };
}

// ────────────────────────────────────────────────
// 6. Hug Day – tap to burst hearts
// ────────────────────────────────────────────────

function hugBurst(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 420, 320);
  let count = 0;
  let timeLeft = 25;
  let gameOver = false;

  const ui = document.createElement('p');
  ui.className = 'fw-bold fs-4 text-center mb-3';
  ui.innerHTML = `Hugs sent: <span id="hugCnt">0</span> | Time: ${timeLeft}s`;
  area.prepend(ui);

  function handleTap(e) {
    e.preventDefault();
    if (gameOver) return;
    count++;
    document.getElementById('hugCnt').textContent = count;
    confetti({ shapes: ['heart'], particleCount: 60, spread: 80 });
  }

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTap, { passive: false });

  const timer = setInterval(() => {
    timeLeft--;
    ui.innerHTML = `Hugs sent: <span id="hugCnt">${count}</span> | Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver = true;
      showGameEnd(area, `You sent ${count} hugs!`, "The best arms to fall into are your own 🤗💕", day);
    }
  }, 1000);

  // simple background hearts animation
  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    ctx.globalAlpha = 0.15;
    ctx.font = '80px Arial';
    ctx.fillText('🤗', Math.random()*baseWidth, Math.random()*baseHeight);
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
}

// ────────────────────────────────────────────────
// 7. Kiss Day – catch moving lips
// ────────────────────────────────────────────────

function kissTarget(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 420, 340);
  let score = 0;
  let timeLeft = 25;
  let targets = [];
  let gameOver = false;

  const ui = document.createElement('p');
  ui.className = 'fw-bold fs-5 text-center mb-2';
  ui.innerHTML = `Time: ${timeLeft}s | Kisses: <span id="kScore">0</span>`;
  area.prepend(ui);

  function spawn() {
    if (gameOver) return;
    targets.push({
      x: Math.random() * (baseWidth - 80) + 40,
      y: Math.random() * (baseHeight - 140) + 70
    });
  }
  const spawnInt = setInterval(spawn, 1100);

  function handleTap(e) {
    e.preventDefault();
    if (gameOver) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (baseWidth / rect.width);
    const my = (touch.clientY - rect.top) * (baseHeight / rect.height);
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      if (Math.hypot(mx - t.x, my - t.y) < 50) {
        score++;
        targets.splice(i, 1);
        confetti({ shapes: ['heart'], particleCount: 50 });
        document.getElementById('kScore').textContent = score;
      }
    }
  }

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTap, { passive: false });

  const timer = setInterval(() => {
    timeLeft--;
    ui.innerHTML = `Time: ${timeLeft}s | Kisses: <span id="kScore">${score}</span>`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(spawnInt);
      gameOver = true;
      showGameEnd(area, `You landed ${score} kisses! 💋`, "Mwah to yourself – you deserve it 😘✨", day);
    }
  }, 1000);

  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    targets.forEach(t => {
      ctx.font = '60px Arial';
      ctx.fillText('💋', t.x - 30, t.y + 20);
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ────────────────────────────────────────────────
// 8. Valentine's Day – click falling hearts
// ────────────────────────────────────────────────

function heartBreaker(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 420, 320);
  let score = 0;
  let timeLeft = 28;
  let hearts = [];
  let gameOver = false;

  const ui = document.createElement('p');
  ui.className = 'fw-bold fs-5 text-center mb-2';
  ui.innerHTML = `Time: ${timeLeft}s | Caught: <span id="hbScore">0</span>`;
  area.prepend(ui);

  function spawn() {
    if (gameOver) return;
    hearts.push({ x: Math.random() * baseWidth, y: -60, speed: 2.2 + Math.random() * 2 });
  }
  const spawnInt = setInterval(spawn, 800);

  function handleTap(e) {
    e.preventDefault();
    if (gameOver) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (baseWidth / rect.width);
    const my = (touch.clientY - rect.top) * (baseHeight / rect.height);
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      if (Math.hypot(mx - h.x, my - h.y) < 45) {
        score++;
        hearts.splice(i, 1);
        confetti({ particleCount: 40 });
        document.getElementById('hbScore').textContent = score;
      }
    }
  }

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTap, { passive: false });

  const timer = setInterval(() => {
    timeLeft--;
    ui.innerHTML = `Time: ${timeLeft}s | Caught: <span id="hbScore">${score}</span>`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(spawnInt);
      gameOver = true;
      showGameEnd(area, `You caught ${score} hearts!`, "Your own heart stays whole & full of love ❤️", day);
    }
  }, 1000);

  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    hearts.forEach(h => {
      h.y += h.speed;
      ctx.font = '50px Arial';
      ctx.fillText('❤️', h.x - 25, h.y + 25);
    });
    hearts = hearts.filter(h => h.y < baseHeight + 60);
    requestAnimationFrame(loop);
  }
  loop();
}

// ────────────────────────────────────────────────
// 9. Slap Day – slap flying negativity
// ────────────────────────────────────────────────

function slapNegativity(area, day) {
  area.innerHTML = `
    <h4 class="mb-3">Slap Negativity Away 👋</h4>
    <p class="fs-4">Slapped: <span id="slapCount">0</span></p>
    <div id="vibeZone" style="height:300px; position:relative; overflow:hidden; border:3px dashed #ef233c; border-radius:12px; background:rgba(255,255,255,0.4);"></div>
    <p class="mt-3 small text-muted">Tap the bad vibes!</p>
  `;

  let count = 0;
  let time = 22;
  const zone = document.getElementById('vibeZone');
  const vibes = ['😞','🥱','😤','🚩','💭','😓','🥀'];

  function spawnVibe() {
    const v = document.createElement('div');
    v.textContent = vibes[Math.floor(Math.random()*vibes.length)];
    v.style.position = 'absolute';
    v.style.fontSize = '3.8rem';
    v.style.left = Math.random()*88 + '%';
    v.style.top = '-60px';
    v.style.transition = 'top 4.2s linear';
    v.onclick = () => {
      count++;
      document.getElementById('slapCount').textContent = count;
      v.remove();
      confetti({ particleCount: 35 });
    };
    zone.appendChild(v);
    setTimeout(() => v.style.top = '110%', 100);
    setTimeout(() => v.remove(), 4800);
  }

  const spawn = setInterval(spawnVibe, 900);

  const t = setInterval(() => {
    time--;
    if (time <= 0) {
      clearInterval(t);
      clearInterval(spawn);
      showGameEnd(area, `You slapped ${count} bad vibes!`, "Your energy is now fierce & protected 👋🔥", day);
    }
  }, 1000);
}

// ────────────────────────────────────────────────
// 10. Kick Day – rapid kick button
// ────────────────────────────────────────────────

function kickChallenge(area, day) {
  area.innerHTML = `
    <h4>Kick Toxic Energy! 🦵</h4>
    <p class="display-4 fw-bold mb-4" id="kickCount">0</p>
    <button id="kickBtn" class="btn btn-danger btn-lg py-5 px-5 rounded-circle shadow">KICK!</button>
    <p class="mt-4 fs-5">Time left: <span id="kickTimer">25</span>s</p>
  `;

  let kicks = 0;
  let time = 25;
  const countEl = document.getElementById('kickCount');
  const timerEl = document.getElementById('kickTimer');
  const btn = document.getElementById('kickBtn');

  btn.onclick = () => {
    kicks++;
    countEl.textContent = kicks;
    confetti({ particleCount: 40, colors: ['#d00000','#ff4444'] });
  };

  const t = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time <= 0) {
      clearInterval(t);
      btn.disabled = true;
      showGameEnd(area, `You delivered ${kicks} powerful kicks!`, "Toxic energy kicked out – goals only now 🦵🚀", day);
    }
  }, 1000);
}

// ────────────────────────────────────────────────
// 11. Perfume Day – mix your scent
// ────────────────────────────────────────────────

function perfumeMixer(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Create Your Signature Self-Love Scent 🌸</h4>
    <div class="d-grid gap-3 col-10 mx-auto">
      <button class="btn btn-primary btn-lg" onclick="mixNote('Confidence')">Confidence</button>
      <button class="btn btn-info btn-lg" onclick="mixNote('Calm')">Calm</button>
      <button class="btn btn-warning btn-lg" onclick="mixNote('Joy')">Joy</button>
      <button class="btn btn-danger btn-lg" onclick="mixNote('Passion')">Passion</button>
    </div>
    <p id="scentResult" class="mt-5 fs-4 fw-bold text-center"></p>
  `;

  let notes = [];

  window.mixNote = (note) => {
    notes.push(note);
    if (notes.length >= 3) {
      const scent = notes.join(' + ');
      document.getElementById('scentResult').innerHTML = `Your signature scent:<br><strong>${scent} & Sparkle ✨</strong>`;
      confetti({ particleCount: 100 });
      setTimeout(() => showGameEnd(area, "Scent Created!", "You smell like success & zero regrets 🌸", day), 2200);
    } else {
      document.getElementById('scentResult').textContent = `Notes: ${notes.join(', ')} (${3 - notes.length} more...)`;
    }
  };
}

// ────────────────────────────────────────────────
// 12. Flirting Day – generate self-flirt lines
// ────────────────────────────────────────────────

function flirtGenerator(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Self-Flirt Generator 😉</h4>
    <button id="flirtBtn" class="btn btn-info btn-lg py-3 px-5">Give me a line!</button>
    <p id="flirtLine" class="mt-5 fs-4 fw-bold text-center px-3"></p>
    <p id="flirtCount" class="mt-3">Lines collected: 0 / 5</p>
  `;

  const lines = [
    "Damn, looking good today — and every day.",
    "You had me at self-care Sunday.",
    "Mirror, mirror on the wall — who's the flyest of them all? YOU.",
    "If being this hot was a crime, you'd be serving life.",
    "Your vibe is my favorite love language."
  ];

  let collected = 0;

  document.getElementById('flirtBtn').onclick = () => {
    if (collected >= 5) return;
    const line = lines[Math.floor(Math.random() * lines.length)];
    document.getElementById('flirtLine').textContent = line;
    collected++;
    document.getElementById('flirtCount').textContent = `Lines collected: ${collected} / 5`;
    confetti({ particleCount: 30 });

    if (collected >= 5) {
      showGameEnd(area, "Flirt Master Unlocked!", "You're dangerously charming — especially to yourself 😉💋", day);
    }
  };
}

// ────────────────────────────────────────────────
// 13. Confession Day – write something nice
// ────────────────────────────────────────────────

function confessionBooth(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Confession Booth 📝</h4>
    <p>Tell yourself something beautiful:</p>
    <textarea id="confessInput" class="form-control mb-3" rows="4" placeholder="I love that I..."></textarea>
    <button id="confessBtn" class="btn btn-primary btn-lg">Confess</button>
    <p id="confessResult" class="mt-4 fs-5 fw-bold"></p>
  `;

  document.getElementById('confessBtn').onclick = () => {
    const text = document.getElementById('confessInput').value.trim();
    if (!text) {
      document.getElementById('confessResult').textContent = "Say something kind to yourself ❤️";
      return;
    }

    document.getElementById('confessResult').innerHTML = `Beautiful confession!<br><em>${text}</em><br>You're glowing ✨`;
    confetti({ particleCount: 120 });
    setTimeout(() => showGameEnd(area, "Confession Accepted!", "You're obsessed with your own growth — and that's powerful.", day), 2200);
  };
}

// ────────────────────────────────────────────────
// 14. Missing Day – find missing piece (simple drag simulation)
// ────────────────────────────────────────────────

function findMissing(area, day) {
  area.innerHTML = `
    <h4 class="mb-4">Find Your Missing Piece ❓</h4>
    <div style="height:280px; border:3px dashed #7209b7; border-radius:12px; position:relative; background:rgba(255,255,255,0.4);">
      <div id="heartEmpty" style="position:absolute; top:40%; left:60%; font-size:8rem; opacity:0.3;">❤️</div>
      <div id="missingPiece" style="position:absolute; top:40%; left:40%; font-size:8rem; cursor:grab; user-select:none;">🧩</div>
    </div>
    <p class="mt-4 fs-5 text-center" id="missingMsg">Drag the piece to the heart!</p>
  `;

  const piece = document.getElementById('missingPiece');
  let isDragging = false;
  let offsetX, offsetY;

  piece.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - piece.offsetLeft;
    offsetY = e.clientY - piece.offsetTop;
    piece.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    piece.style.left = (e.clientX - offsetX) + 'px';
    piece.style.top  = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    piece.style.cursor = 'grab';

    // simple win condition: close to center of heart
    const heartRect = document.getElementById('heartEmpty').getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const dist = Math.hypot(
      (pieceRect.left + pieceRect.width/2) - (heartRect.left + heartRect.width/2),
      (pieceRect.top + pieceRect.height/2) - (heartRect.top + heartRect.height/2)
    );

    if (dist < 80) {
      document.getElementById('missingMsg').innerHTML = "You found it! You're already complete 💖";
      confetti({ particleCount: 150 });
      setTimeout(() => showGameEnd(area, "You're whole!", "Missing nothing — you're complete on your own.", day), 1800);
    }
  });

  // touch support
  piece.addEventListener('touchstart', e => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - piece.offsetLeft;
    offsetY = touch.clientY - piece.offsetTop;
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    piece.style.left = (touch.clientX - offsetX) + 'px';
    piece.style.top  = (touch.clientY - offsetY) + 'px';
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// ────────────────────────────────────────────────
// 15. BreakUP Day – maze escape (already detailed earlier)
// ────────────────────────────────────────────────

function breakFree(area, day) {
  const { canvas, ctx, baseWidth, baseHeight } = createGameCanvas(area, 400, 400);
  const status = document.createElement('p');
  status.className = 'fw-bold fs-5 text-center mb-2';
  status.textContent = 'Arrow keys / WASD or swipe → reach green exit!';
  area.prepend(status);

  const walls = [
    [0,0,400,12], [0,0,12,400], [388,0,12,400], [0,388,400,12],
    [90,60,220,12], [60,110,12,180], [280,140,12,160],
    [140,240,160,12], [240,190,12,110], [90,290,220,12]
  ];

  let player = { x: 24, y: 24, size: 22, speed: 4.8 };
  let goal = { x: 355, y: 355, size: 32 };
  let timeLeft = 45;
  let gameOver = false;
  let won = false;

  const keys = {};
  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

  // Touch swipe support
  let startX = 0, startY = 0;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (gameOver) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      keys['arrowright'] = keys['d'] = dx > 40;
      keys['arrowleft']  = keys['a'] = dx < -40;
    } else {
      keys['arrowdown'] = keys['s'] = dy > 40;
      keys['arrowup']   = keys['w'] = dy < -40;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    keys['arrowright'] = keys['d'] = keys['arrowleft'] = keys['a'] =
    keys['arrowdown'] = keys['s'] = keys['arrowup'] = keys['w'] = false;
  });

  function collides(a, b) {
    return a.x < b.x + (b.width || b.size) &&
           a.x + a.size > b.x &&
           a.y < b.y + (b.height || b.size) &&
           a.y + a.size > b.y;
  }

  const timer = setInterval(() => {
    timeLeft--;
    status.textContent = `Time: ${timeLeft}s | Reach the exit!`;
    if (timeLeft <= 0 && !won) {
      clearInterval(timer);
      gameOver = true;
      showGameEnd(area, "Time's up!", "Try again – freedom is waiting! ✂️", day);
    }
  }, 1000);

  function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, baseWidth, baseHeight);

    ctx.fillStyle = '#ff69b4';
    walls.forEach(w => ctx.fillRect(w[0], w[1], w[2]||10, w[3]||10));

    let nx = player.x, ny = player.y;
    if (keys['arrowup']   || keys['w']) ny -= player.speed;
    if (keys['arrowdown'] || keys['s']) ny += player.speed;
    if (keys['arrowleft'] || keys['a']) nx -= player.speed;
    if (keys['arrowright']|| keys['d']) nx += player.speed;

    const temp = { x: nx, y: ny, size: player.size };
    const hit = walls.some(w => collides(temp, {x:w[0], y:w[1], width:w[2]||10, height:w[3]||10}));

    if (!hit) {
      player.x = Math.max(0, Math.min(baseWidth - player.size, nx));
      player.y = Math.max(0, Math.min(baseHeight - player.size, ny));
    }

    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(player.x + player.size/2, player.y + player.size/2, player.size/2, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(goal.x, goal.y, goal.size, goal.size);

    if (collides(player, goal) && !won) {
      won = true;
      clearInterval(timer);
      gameOver = true;
      showGameEnd(
        area,
        "FREEDOM ACHIEVED!",
        "You broke free – single & unstoppable ✂️🚀",
        day
      );
    }

    requestAnimationFrame(loop);
  }
  loop();
}
// ────────────────────────────────────────────────
// Init message (optional)
// ────────────────────────────────────────────────

console.log("Self-love Valentine's Week – all 15 games loaded 💖");