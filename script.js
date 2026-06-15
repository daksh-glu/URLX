const API = "https://urlx-kgex.onrender.com";
let currentCode = "", statsVisible = false, qrVisible = false, qrInstance = null;

/* ════════════════════════════════
   CANVAS — Particle Network + FX
════════════════════════════════ */
(function () {
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, particles = [], shootingStars = [], ripples = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: rand(0.8, 2.2),
      vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18),
      alpha: rand(0.15, 0.6), da: rand(-0.004, 0.004),
      hue: rand(200, 230)
    };
  }

  function buildParticles() {
    const n = Math.min(Math.floor(W * H / 9000), 120);
    particles = Array.from({ length: n }, mkParticle);
  }

  function spawnStar() {
    shootingStars.push({
      x: rand(W * 0.05, W * 0.75), y: rand(0, H * 0.45),
      len: rand(90, 220), spd: rand(7, 16),
      alpha: 1, angle: Math.PI / 5.5
    });
  }

  setInterval(spawnStar, 2800);

  function spawnRipple(x, y) {
    ripples.push({ x, y, r: 0, alpha: 0.5, maxR: rand(60, 120) });
  }

  canvas.addEventListener("click", e => spawnRipple(e.clientX, e.clientY));
  canvas.addEventListener("touchstart", e => {
    const t = e.touches[0];
    spawnRipple(t.clientX, t.clientY);
  });

  const CONNECT_DIST = 120;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── particle network ──
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.da;
      if (p.alpha < 0.1 || p.alpha > 0.65) p.da *= -1;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},90%,75%,${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const lineAlpha = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,142,247,${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // ── shooting stars ──
    shootingStars = shootingStars.filter(s => s.alpha > 0);
    for (const s of shootingStars) {
      const ex = s.x + Math.cos(s.angle) * s.len;
      const ey = s.y + Math.sin(s.angle) * s.len;
      const g = ctx.createLinearGradient(s.x, s.y, ex, ey);
      g.addColorStop(0, `rgba(6,200,232,0)`);
      g.addColorStop(0.6, `rgba(6,200,232,${s.alpha * 0.6})`);
      g.addColorStop(1, `rgba(220,240,255,${s.alpha})`);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey);
      ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.stroke();

      // head glow
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();

      s.x += Math.cos(s.angle) * s.spd;
      s.y += Math.sin(s.angle) * s.spd;
      s.alpha -= 0.015;
    }

    // ── click ripples ──
    ripples = ripples.filter(r => r.alpha > 0);
    for (const r of ripples) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(79,142,247,${r.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      r.r += 2.5; r.alpha -= 0.018;
    }

    requestAnimationFrame(draw);
  }

  resize(); buildParticles(); draw();
  window.addEventListener("resize", () => { resize(); buildParticles(); });
})();

/* ════════════════════════════════
   CORE LOGIC
════════════════════════════════ */
async function shortenURL() {
  const input = document.getElementById("longUrl").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  const result = document.getElementById("result");
  const btn = document.getElementById("shortenBtn");
  const btnText = document.getElementById("btnText");
  const btnArrow = document.getElementById("btnArrow");
  const btnSpinner = document.getElementById("btnSpinner");

  ["result","statsBox","qrBox"].forEach(id => document.getElementById(id)?.classList.add("hidden"));
  errorMsg.classList.add("hidden");
  statsVisible = false; qrVisible = false; qrInstance = null;

  if (!input) { showError("Please enter a URL to shorten."); return; }
  if (!isValidURL(input)) { showError("That doesn't look like a valid URL. Make sure it starts with https://"); return; }

  btn.disabled = true;
  btnText.textContent = "Shortening...";
  btnArrow.classList.add("hidden");
  btnSpinner.classList.remove("hidden");

  try {
    const res = await fetch(`${API}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ long_url: input })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    currentCode = data.short_code;

    const shortURL = `${API}/${currentCode}`;
    document.getElementById("shortLink").textContent = shortURL;
    document.getElementById("shortLink").href = shortURL;
    document.getElementById("originalDisplay").textContent = input.length > 60 ? input.slice(0, 60) + "…" : input;

    result.classList.remove("hidden");
  } catch {
    showError("Could not reach the server. Please try again in a few seconds.");
  } finally {
    btn.disabled = false;
    btnText.textContent = "Shorten";
    btnArrow.classList.remove("hidden");
    btnSpinner.classList.add("hidden");
  }
}

function copyURL() {
  const text = document.getElementById("shortLink").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".copy-btn");
    btn.classList.add("copied");
    document.getElementById("copyIcon").classList.add("hidden");
    document.getElementById("checkIcon").classList.remove("hidden");
    setTimeout(() => {
      btn.classList.remove("copied");
      document.getElementById("copyIcon").classList.remove("hidden");
      document.getElementById("checkIcon").classList.add("hidden");
    }, 2000);
  });
}

async function toggleStats() {
  const box = document.getElementById("statsBox");
  if (statsVisible) { box.classList.add("hidden"); statsVisible = false; return; }
  try {
    const res = await fetch(`${API}/stats/${currentCode}`);
    const data = await res.json();
    document.getElementById("statClicks").textContent = data.clicks;
    document.getElementById("statLongUrl").textContent = data.long_url;
    const d = new Date(data.created_at);
    document.getElementById("statCreated").textContent =
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    box.classList.remove("hidden");
    statsVisible = true;
  } catch { showError("Could not load analytics."); }
}

function toggleQR() {
  const box = document.getElementById("qrBox");
  if (qrVisible) { box.classList.add("hidden"); qrVisible = false; return; }

  const shortURL = document.getElementById("shortLink").textContent;
  const container = document.getElementById("qrCode");
  container.innerHTML = "";

  qrInstance = new QRCode(container, {
    text: shortURL, width: 148, height: 148,
    colorDark: "#000000", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById("qrUrlChip").textContent = shortURL;
  box.classList.remove("hidden");
  qrVisible = true;
}

function downloadQR() {
  const container = document.getElementById("qrCode");
  const canvas = container.querySelector("canvas");
  const img = container.querySelector("img");
  const src = canvas ? canvas.toDataURL("image/png") : (img ? img.src : "");
  if (!src) return;
  const a = document.createElement("a");
  a.href = src; a.download = `urlx-${currentCode}.png`; a.click();
}

function resetForm() {
  document.getElementById("longUrl").value = "";
  ["result","statsBox","qrBox","errorMsg"].forEach(id => document.getElementById(id)?.classList.add("hidden"));
  statsVisible = false; qrVisible = false; qrInstance = null; currentCode = "";
  document.getElementById("longUrl").focus();
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = "⚠ " + msg;
  el.classList.remove("hidden");
}

function isValidURL(str) {
  try { const u = new URL(str); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

document.getElementById("longUrl").addEventListener("keydown", e => {
  if (e.key === "Enter") shortenURL();
});
