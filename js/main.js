(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      siteNav.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  const revealEls = document.querySelectorAll("[data-reveal], .delight, .animations__figure, .gallery");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  document.querySelectorAll(".delight").forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dustHost = document.getElementById("inkDust");
  if (dustHost && !reduced) {
    for (let i = 0; i < 14; i++) {
      const dot = document.createElement("span");
      dot.className = "ember-dot";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.animationDuration = `${9 + Math.random() * 14}s`;
      dot.style.animationDelay = `${Math.random() * 10}s`;
      const size = 2 + Math.random() * 3.5;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dustHost.appendChild(dot);
    }
  }

  /* Amber ink motes over parchment */
  const canvas = document.getElementById("moteCanvas");
  if (!canvas || reduced) return;

  const ctx = canvas.getContext("2d");
  let raf = 0;
  const motes = [];

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const spawn = (burst = false) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const n = burst ? 32 : 1;
    for (let i = 0; i < n; i++) {
      const fromLogo = Math.random() > 0.3;
      motes.push({
        x: fromLogo ? cw * 0.5 + (Math.random() - 0.5) * cw * 0.32 : Math.random() * cw,
        y: fromLogo ? ch * 0.42 + Math.random() * ch * 0.1 : ch * (0.55 + Math.random() * 0.4),
        r: 1.2 + Math.random() * 3.8,
        vy: 0.15 + Math.random() * 0.65,
        vx: (Math.random() - 0.5) * 0.35,
        life: 0,
        max: 110 + Math.random() * 150,
        alpha: 0.18 + Math.random() * 0.4,
        warm: Math.random() > 0.25,
      });
    }
  };

  const draw = () => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    if (motes.length < 50 && Math.random() > 0.42) spawn();

    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.y -= m.vy;
      m.x += m.vx + Math.sin(m.life * 0.045) * 0.18;
      m.life++;
      const t = m.life / m.max;
      const a = m.alpha * (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88);

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * (1 + t * 0.45), 0, Math.PI * 2);
      if (m.warm) {
        ctx.fillStyle = `rgba(224, 122, 40, ${a})`;
        ctx.shadowColor = "rgba(224, 122, 40, 0.65)";
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(58, 44, 32, ${a * 0.45})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (m.life >= m.max || m.y < -20) motes.splice(i, 1);
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  spawn(true);
  window.addEventListener("resize", resize);
  draw();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
})();
