// Commander deck breakdown widget (animated + interactive, mobile-friendly).
(function () {
  "use strict";

  var root = document.querySelector("[data-deck-viz]");
  if (!root) return;

  var ring = root.querySelector("[data-deck-viz-ring]");
  var buttons = root.querySelector("[data-deck-viz-buttons]");
  var sliders = root.querySelector("[data-deck-viz-sliders]");
  var totalEl = root.querySelector("[data-deck-viz-total]");
  var titleEl = root.querySelector("[data-deck-viz-title]");
  var metaEl = root.querySelector("[data-deck-viz-meta]");
  var bodyEl = root.querySelector("[data-deck-viz-body]");

  if (!ring || !buttons || !sliders || !totalEl || !titleEl || !metaEl || !bodyEl) return;

  // Keep total fixed at 100 cards (99 + commander) so sliders never "break" the deck.
  var DECK_TOTAL = 100;

  // Counts are for the 99 + commander (total 100), as a simple starting point.
  var groups = [
    {
      id: "lands",
      name: "Lands",
      count: 38,
      color: "#6bcf7f",
      min: 30,
      max: 45,
      adjustable: true,
      body: "Enough lands to hit your early drops and still cast big plays later. More colors and higher average mana cost usually means more fixing."
    },
    {
      id: "ramp",
      name: "Ramp",
      count: 12,
      color: "#5eb8ff",
      min: 6,
      max: 18,
      adjustable: true,
      body: "Mana rocks, land ramp, and cost reducers help you keep pace at a 4-player table. Most decks want ramp early so they can do more every turn."
    },
    {
      id: "draw",
      name: "Card draw",
      count: 9,
      color: "#b38cff",
      min: 5,
      max: 16,
      adjustable: true,
      body: "You need a steady flow of cards so you don’t stall out after the first wave. Mix burst draw with repeatable engines when possible."
    },
    {
      id: "removal",
      name: "Removal",
      count: 10,
      color: "#ff7a59",
      min: 6,
      max: 16,
      adjustable: true,
      body: "Answers for creatures, artifacts/enchantments, and problem permanents. Include a mix of spot removal and a couple board wipes."
    },
    {
      id: "finishers",
      name: "Finishers",
      count: 2,
      color: "#f6c453",
      min: 0,
      max: 6,
      adjustable: true,
      body: "A small number of cards that actually end the game (overrun effects, combos, massive threats). Your commander often counts as one."
    },
    {
      id: "synergy",
      name: "Synergy / creatures",
      count: 29,
      color: "#c7d2de",
      min: 0,
      max: 99,
      adjustable: false,
      body: "The core of your deck: creatures and synergy pieces that advance your commander’s plan. This number flexes the most by strategy."
    }
  ];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function recomputeSynergy() {
    var synergy = groups.find(function (g) {
      return g.id === "synergy";
    });
    if (!synergy) return;

    var used = groups
      .filter(function (g) {
        return g.id !== "synergy";
      })
      .reduce(function (sum, g) {
        return sum + g.count;
      }, 0);

    synergy.count = clamp(DECK_TOTAL - used, 0, DECK_TOTAL);
  }

  recomputeSynergy();
  totalEl.textContent = String(DECK_TOTAL);

  var r = 54;
  var cx = 70;
  var cy = 70;
  var circumference = 2 * Math.PI * r;

  function el(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  function setActive(id) {
    groups.forEach(function (g) {
      var btn = buttons.querySelector('[data-deck-viz-btn="' + g.id + '"]');
      if (btn) {
        var pressed = g.id === id;
        btn.classList.toggle("is-active", pressed);
        btn.setAttribute("aria-pressed", pressed ? "true" : "false");
      }

      var seg = ring.querySelector('[data-deck-viz-seg="' + g.id + '"]');
      if (seg) seg.classList.toggle("is-active", g.id === id);
    });

    var group = groups.find(function (g) {
      return g.id === id;
    });
    if (!group) return;

    titleEl.textContent = group.name;
    metaEl.textContent = group.count + " / " + DECK_TOTAL + " cards";
    bodyEl.textContent = group.body;
  }

  function updateButtons() {
    groups.forEach(function (g) {
      var btn = buttons.querySelector('[data-deck-viz-btn="' + g.id + '"]');
      if (!btn) return;
      var countEl = btn.querySelector(".deckviz-count");
      if (countEl) countEl.textContent = String(g.count);
    });
  }

  function updateSegments(animated) {
    var runningOffset = 0;
    groups.forEach(function (g) {
      var segLen = (g.count / DECK_TOTAL) * circumference;
      var seg = ring.querySelector('[data-deck-viz-seg="' + g.id + '"]');
      if (!seg) return;

      seg.setAttribute("aria-label", g.name + ": " + g.count + " cards");
      if (animated) seg.style.transition = "stroke-dasharray 250ms ease, stroke-dashoffset 250ms ease";
      else seg.style.transition = "none";

      seg.style.strokeDasharray = segLen + " " + (circumference - segLen);
      seg.style.strokeDashoffset = String(-runningOffset);
      runningOffset += segLen;
    });
  }

  function syncDetailIfActive() {
    var activeBtn = buttons.querySelector(".deckviz-btn.is-active");
    if (!activeBtn) return;
    var id = activeBtn.getAttribute("data-deck-viz-btn");
    if (!id) return;
    setActive(id);
  }

  // Build segments + buttons.
  var offset = 0;
  groups.forEach(function (g) {
    var segLen = (g.count / DECK_TOTAL) * circumference;
    var seg = el("circle");

    seg.setAttribute("class", "deckviz-seg");
    seg.setAttribute("cx", String(cx));
    seg.setAttribute("cy", String(cy));
    seg.setAttribute("r", String(r));
    seg.setAttribute("tabindex", "0");
    seg.setAttribute("role", "button");
    seg.setAttribute("aria-label", g.name + ": " + g.count + " cards");
    seg.setAttribute("data-deck-viz-seg", g.id);
    seg.style.setProperty("--seg", g.color);

    // Start collapsed for animation; fill in after first frame.
    seg.style.strokeDasharray = "0 " + circumference;
    seg.style.strokeDashoffset = String(-offset);

    seg.addEventListener("click", function () {
      setActive(g.id);
    });
    seg.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(g.id);
      }
    });

    ring.appendChild(seg);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "deckviz-btn";
    btn.setAttribute("data-deck-viz-btn", g.id);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML =
      '<span class="deckviz-swatch" style="--swatch:' +
      g.color +
      '"></span><span class="deckviz-name">' +
      g.name +
      '</span><span class="deckviz-count">' +
      g.count +
      "</span>";

    btn.addEventListener("click", function () {
      setActive(g.id);
    });

    buttons.appendChild(btn);

    offset += segLen;
  });

  // Build sliders (adjustable groups + auto remainder for synergy).
  groups.forEach(function (g) {
    var row = document.createElement("div");
    row.className = "deckviz-slider";
    row.setAttribute("data-deck-viz-slider", g.id);

    var top = document.createElement("div");
    top.className = "deckviz-slider-top";
    top.innerHTML =
      '<span class="deckviz-slider-name"><span class="deckviz-swatch" style="--swatch:' +
      g.color +
      '"></span>' +
      g.name +
      '</span><span class="deckviz-slider-value" data-deck-viz-slider-value="' +
      g.id +
      '">' +
      g.count +
      "</span>";
    row.appendChild(top);

    if (g.adjustable) {
      var range = document.createElement("input");
      range.className = "deckviz-range";
      range.type = "range";
      range.min = String(g.min);
      range.max = String(g.max);
      range.step = "1";
      range.value = String(g.count);
      range.setAttribute("aria-label", g.name + " count");
      range.setAttribute("data-deck-viz-range", g.id);
      row.appendChild(range);
    } else {
      var hint = document.createElement("p");
      hint.className = "deckviz-slider-hint";
      hint.textContent = "Auto-fills to keep the deck at 100 cards.";
      row.appendChild(hint);
    }

    sliders.appendChild(row);
  });

  var scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      recomputeSynergy();
      updateButtons();
      updateSegments(true);

      // Update slider displayed values (including synergy auto value).
      groups.forEach(function (g) {
        var val = sliders.querySelector('[data-deck-viz-slider-value="' + g.id + '"]');
        if (val) val.textContent = String(g.count);
      });

      syncDetailIfActive();
    });
  }

  sliders.addEventListener("input", function (e) {
    var target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type !== "range") return;
    var id = target.getAttribute("data-deck-viz-range");
    if (!id) return;

    var g = groups.find(function (x) {
      return x.id === id;
    });
    if (!g || !g.adjustable) return;

    g.count = clamp(parseInt(target.value, 10) || 0, g.min, g.max);

    // If user over-allocates, clamp this slider so synergy never goes negative.
    var usedWithoutThis = groups
      .filter(function (x) {
        return x.id !== "synergy" && x.id !== g.id;
      })
      .reduce(function (sum, x) {
        return sum + x.count;
      }, 0);

    var maxAllowed = clamp(DECK_TOTAL - usedWithoutThis, g.min, g.max);
    if (g.count > maxAllowed) {
      g.count = maxAllowed;
      target.value = String(maxAllowed);
    }

    scheduleUpdate();
  });

  // Animate segments in.
  requestAnimationFrame(function () {
    updateSegments(true);
  });

  // Set initial active group.
  setActive(groups[0].id);
  updateButtons();
})();

