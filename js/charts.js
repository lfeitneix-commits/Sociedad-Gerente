/* Hand-built inline-SVG charts. No external chart library / no CDN dependency.
 * fmtUSD/fmtARS come from js/format.js (loaded before this file). */

let tooltipEl = null;
function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "viz-tooltip";
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}
function showTooltip(x, y, html) {
  const tt = getTooltip();
  tt.innerHTML = html;
  tt.style.left = `${x + 14}px`;
  tt.style.top = `${y + 14}px`;
  tt.classList.add("show");
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove("show");
}

function niceNum(range, round) {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}
// Round axis bounds to clean numbers (0 / 500K / 1M...) instead of raw fractions of the data max.
function niceTicks(min, max, maxTicks = 5) {
  const range = niceNum(Math.max(max - min, 1), false);
  const step = niceNum(range / (maxTicks - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) ticks.push(v);
  return { ticks, niceMin, niceMax, step };
}

const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/* ---------------- Line chart: AUM vs break-even ---------------- */
function renderAumChart(containerId, model) {
  const container = document.getElementById(containerId);
  const W = 640, H = 300;
  const padL = 54, padR = 16, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const pts = model.aumSeries.points;
  const breakEven = model.aumSeries.breakEvenUsd;
  const rawMax = Math.max(breakEven, ...pts.map(p => p.usd));
  const { ticks, niceMax } = niceTicks(0, rawMax, 5);
  const maxY = niceMax;

  const x = i => padL + (i / (pts.length - 1)) * plotW;
  const y = v => padT + plotH - (v / maxY) * plotH;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Evolución del AUM total en USD frente al AUM de equilibrio" });

  // gridlines (clean round values)
  ticks.forEach(val => {
    const gy = y(val);
    svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: gy, y2: gy, stroke: "var(--gridline)", "stroke-width": 1 }));
    const label = el("text", { x: padL - 8, y: gy + 4, "text-anchor": "end", "font-size": 10.5, fill: "var(--text-muted)" });
    label.textContent = fmtUSD(val, { decimals: 0 });
    svg.appendChild(label);
  });

  // break-even reference line
  const beY = y(breakEven);
  const beLine = el("line", { x1: padL, x2: W - padR, y1: beY, y2: beY, stroke: "var(--series-ref)", "stroke-width": 2, "stroke-dasharray": "5 4" });
  svg.appendChild(beLine);
  const beLabel = el("text", { x: W - padR, y: beY - 6, "text-anchor": "end", "font-size": 11, "font-weight": 650, fill: "var(--series-ref)" });
  beLabel.textContent = `Break-even: ${fmtUSD(breakEven)}`;
  svg.appendChild(beLabel);

  // x-axis month labels (every 3rd month)
  pts.forEach((p, i) => {
    if (i % 3 === 0 || i === pts.length - 1) {
      const t = el("text", { x: x(i), y: H - padB + 18, "text-anchor": "middle", "font-size": 10, fill: "var(--text-muted)" });
      t.textContent = p.m;
      svg.appendChild(t);
    }
  });

  // area fill
  let areaPath = `M ${x(0)} ${y(pts[0].usd)}`;
  pts.forEach((p, i) => { if (i > 0) areaPath += ` L ${x(i)} ${y(p.usd)}`; });
  areaPath += ` L ${x(pts.length - 1)} ${padT + plotH} L ${x(0)} ${padT + plotH} Z`;
  svg.appendChild(el("path", { d: areaPath, fill: "var(--series-1-wash)", stroke: "none" }));

  // line
  let linePath = `M ${x(0)} ${y(pts[0].usd)}`;
  pts.forEach((p, i) => { if (i > 0) linePath += ` L ${x(i)} ${y(p.usd)}`; });
  svg.appendChild(el("path", { d: linePath, fill: "none", stroke: "var(--series-1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));

  // crossing marker
  const crossIdx = pts.findIndex(p => p.m === model.aumSeries.breakEvenCrossMonth);
  if (crossIdx >= 0) {
    const cx = x(crossIdx), cy = y(pts[crossIdx].usd);
    svg.appendChild(el("circle", { cx, cy, r: 5, fill: "var(--good)", stroke: "var(--surface-1)", "stroke-width": 2 }));
    const lbl = el("text", { x: cx, y: cy - 12, "text-anchor": "middle", "font-size": 10.5, "font-weight": 650, fill: "var(--good-text)" });
    lbl.textContent = `Break-even ${pts[crossIdx].m}`;
    svg.appendChild(lbl);
  }

  // end dot
  const last = pts[pts.length - 1];
  svg.appendChild(el("circle", { cx: x(pts.length - 1), cy: y(last.usd), r: 4, fill: "var(--series-1)", stroke: "var(--surface-1)", "stroke-width": 2 }));

  // hover overlay + crosshair
  const crosshair = el("line", { x1: 0, x2: 0, y1: padT, y2: padT + plotH, stroke: "var(--baseline)", "stroke-width": 1, opacity: 0 });
  svg.appendChild(crosshair);
  const hoverDot = el("circle", { r: 5, fill: "var(--series-1)", stroke: "var(--surface-1)", "stroke-width": 2, opacity: 0 });
  svg.appendChild(hoverDot);

  const overlay = el("rect", { x: padL, y: padT, width: plotW, height: plotH, fill: "transparent" });
  overlay.addEventListener("pointermove", (e) => {
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.round(((relX - padL) / plotW) * (pts.length - 1));
    idx = Math.max(0, Math.min(pts.length - 1, idx));
    const p = pts[idx];
    crosshair.setAttribute("x1", x(idx)); crosshair.setAttribute("x2", x(idx)); crosshair.setAttribute("opacity", 1);
    hoverDot.setAttribute("cx", x(idx)); hoverDot.setAttribute("cy", y(p.usd)); hoverDot.setAttribute("opacity", 1);
    const aboveBE = p.usd >= breakEven;
    showTooltip(e.clientX, e.clientY, `<div class="tt-row"><span>${p.m}</span></div><div class="tt-row"><span>AUM total</span><span class="tt-value">${fmtUSD(p.usd)}</span></div><div class="tt-row"><span>${aboveBE ? "Sobre" : "Bajo"} break-even</span></div>`);
  });
  overlay.addEventListener("pointerleave", () => { crosshair.setAttribute("opacity", 0); hoverDot.setAttribute("opacity", 0); hideTooltip(); });
  svg.appendChild(overlay);

  container.innerHTML = "";
  container.appendChild(svg);
}

/* ---------------- Grouped bar: Ingresos / Costos / Resultado por año ---------------- */
function renderYearsChart(containerId, model) {
  const container = document.getElementById(containerId);
  const W = 640, H = 300;
  const padL = 58, padR = 16, padT = 16, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const years = model.years;
  const allVals = years.flatMap(y => [y.revenue_usd, y.cost_usd]);
  const rawMax = Math.max(...allVals);
  const rawMin = Math.min(0, ...years.map(y => y.result_usd));
  const { ticks, niceMin, niceMax } = niceTicks(rawMin, rawMax, 5);
  const minVal = niceMin, maxAbs = niceMax;

  // manual scale: map [minVal, maxAbs] -> [padT+plotH, padT]
  const range = maxAbs - minVal;
  const Y = v => padT + plotH - ((v - minVal) / range) * plotH;
  const zeroLineY = Y(0);

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Ingresos, costos y resultado neto por año" });

  // gridlines (clean round values)
  ticks.forEach(val => {
    const gy = Y(val);
    svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: gy, y2: gy, stroke: "var(--gridline)", "stroke-width": 1 }));
    const label = el("text", { x: padL - 8, y: gy + 4, "text-anchor": "end", "font-size": 10.5, fill: "var(--text-muted)" });
    label.textContent = fmtUSD(val, { decimals: 1 });
    svg.appendChild(label);
  });
  // zero baseline emphasized
  svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: zeroLineY, y2: zeroLineY, stroke: "var(--baseline)", "stroke-width": 1.2 }));

  const groupW = plotW / years.length;
  const barW = 22, gap = 6;

  years.forEach((yr, gi) => {
    const groupCenter = padL + groupW * gi + groupW / 2;
    const bars = [
      { key: "revenue", label: "Ingresos", val: yr.revenue_usd, color: "var(--series-1)" },
      { key: "cost", label: "Costos", val: yr.cost_usd, color: "var(--series-2)" },
      { key: "result", label: "Resultado neto", val: yr.result_usd, color: yr.result_usd >= 0 ? "var(--good)" : "var(--critical)" }
    ];
    const totalW = bars.length * barW + (bars.length - 1) * gap;
    let bx = groupCenter - totalW / 2;

    bars.forEach(b => {
      const barTopY = Y(Math.max(b.val, 0));
      const barBotY = Y(Math.min(b.val, 0));
      const h = Math.max(2, barBotY - barTopY);
      const rect = el("rect", { x: bx, y: barTopY, width: barW, height: h, rx: 4, fill: b.color, opacity: 0.95 });
      rect.style.cursor = "pointer";
      rect.addEventListener("pointermove", (e) => {
        showTooltip(e.clientX, e.clientY, `<div class="tt-row"><b>${yr.label} (${yr.year})</b></div><div class="tt-row"><span>${b.label}</span><span class="tt-value">${fmtUSD(b.val)}</span></div>`);
      });
      rect.addEventListener("pointerleave", hideTooltip);
      svg.appendChild(rect);
      bx += barW + gap;
    });

    const gLabel = el("text", { x: groupCenter, y: H - padB + 20, "text-anchor": "middle", "font-size": 11.5, "font-weight": 650, fill: "var(--text-secondary)" });
    gLabel.textContent = `${yr.label} · ${yr.year}`;
    svg.appendChild(gLabel);
  });

  container.innerHTML = "";
  container.appendChild(svg);
}

/* ---------------- Horizontal bar: distribución de costos ---------------- */
function renderCostChart(containerId, model) {
  const container = document.getElementById(containerId);
  const items = model.costBreakdown.items;
  const total = model.costBreakdown.total_ars;
  const rowH = 34;
  const W = 640, padL = 210, padR = 70, padT = 6, padB = 6;
  const plotW = W - padL - padR;
  const H = padT + padB + items.length * rowH;
  const maxVal = Math.max(...items.map(i => i.ars));

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Distribución de costos por concepto" });

  items.forEach((item, i) => {
    const cy = padT + i * rowH + rowH / 2;
    const barW = (item.ars / maxVal) * plotW;
    const pct = (item.ars / total) * 100;

    const label = el("text", { x: padL - 12, y: cy + 4, "text-anchor": "end", "font-size": 12, fill: "var(--text-secondary)" });
    label.textContent = item.label;
    svg.appendChild(label);

    // track
    svg.appendChild(el("rect", { x: padL, y: cy - 9, width: plotW, height: 18, rx: 5, fill: "var(--gridline)", opacity: 0.5 }));
    // bar
    const bar = el("rect", { x: padL, y: cy - 9, width: Math.max(4, barW), height: 18, rx: 5, fill: "var(--series-2)" });
    bar.style.cursor = "pointer";
    bar.addEventListener("pointermove", (e) => {
      showTooltip(e.clientX, e.clientY, `<div class="tt-row"><b>${item.label}</b></div><div class="tt-row"><span>Monto</span><span class="tt-value">${fmtARS(item.ars)}</span></div><div class="tt-row"><span>% del total</span><span class="tt-value">${pct.toFixed(1)}%</span></div>`);
    });
    bar.addEventListener("pointerleave", hideTooltip);
    svg.appendChild(bar);

    const valLabel = el("text", { x: padL + Math.max(4, barW) + 10, y: cy + 4, "font-size": 11.5, "font-weight": 650, fill: "var(--text-primary)" });
    valLabel.textContent = `${pct.toFixed(0)}%`;
    svg.appendChild(valLabel);
  });

  container.innerHTML = "";
  container.appendChild(svg);
}
