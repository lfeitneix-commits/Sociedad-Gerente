/*
 * Sincronización best-effort con el Google Sheet publicado.
 *
 * IMPORTANTE — límites conocidos de este enfoque:
 *  1. Solo puede leer la PRIMERA hoja del link publicado (la pestaña
 *     "Resultado económico": AUM, ingresos, costos, resultado, break-even,
 *     VAN, TIR). Las demás pestañas (Costos SG, Supuestos, Análisis Fondos
 *     Neix) no tienen un gid publicado conocido, así que la distribución de
 *     costos, empleados, proveedores y fondos siguen siendo datos editables
 *     a mano en js/data.js.
 *  2. Requiere que el navegador pueda hacer fetch() a docs.google.com sin
 *     bloqueo de CORS. Los sheets "publicados en la web" normalmente lo
 *     permiten para su export CSV, pero no está garantizado en todos los
 *     casos/navegadores — por eso todo está en un try/catch con mensaje de
 *     error visible en vez de fallar en silencio.
 *  3. Si el layout de la hoja cambia (se renombra una fila, se agregan
 *     columnas antes de "Fecha", etc.) el matcheo por etiqueta puede dejar
 *     de encontrar filas — en ese caso no rompe nada, simplemente no
 *     actualiza esos valores y lo informa en el estado.
 *
 * Si esto falla en tu navegador, la alternativa confiable es pedirle a
 * Claude que vuelva a leer el Sheet (vía Google Drive) y regenere js/data.js.
 */

function csvUrlFromPubHtml(pubHtmlUrl) {
  return pubHtmlUrl.replace(/\/pubhtml.*$/, "/pub?output=csv");
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function parseMoney(cell) {
  if (cell === undefined || cell === null) return undefined;
  const t = cell.trim();
  if (t === "" || t === "-") return undefined;
  const negParen = /^\(.*\)$/.test(t);
  const cleaned = t.replace(/[()$%\s]/g, "").replace(/,/g, "");
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return undefined;
  return negParen ? -n : n;
}

function findRow(rows, label) {
  return rows.find(r => (r[0] || "").trim() === label);
}

async function syncFromGoogleSheets() {
  const statusEl = document.getElementById("sync-status");
  const setStatus = (text, cls) => { if (statusEl) { statusEl.textContent = text; statusEl.className = `sync-status ${cls || ""}`; } };

  setStatus("Sincronizando...", "syncing");
  try {
    const csvUrl = csvUrlFromPubHtml(INPUTS.meta.sourceUrl);
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCsv(text).map(r => r.map(c => (c || "").trim()));

    const fechaRow = findRow(rows, "Fecha");
    if (!fechaRow) throw new Error('No se encontró la fila "Fecha" (¿cambió el layout de la hoja?)');
    const colToMonth = {};
    fechaRow.forEach((cell, i) => { if (i > 0 && /^[A-Za-z]{3}-\d{2}$/.test(cell)) colToMonth[i] = cell; });
    if (Object.keys(colToMonth).length === 0) throw new Error('La fila "Fecha" no tiene meses reconocibles.');

    let updated = 0;
    const applySeries = (label, target) => {
      const row = findRow(rows, label);
      if (!row) return;
      Object.entries(colToMonth).forEach(([col, month]) => {
        const val = parseMoney(row[col]);
        if (val !== undefined) { target[month] = val; updated++; }
      });
    };

    applySeries("AUM Total", INPUTS.monthly.aum_total_ars);
    applySeries("Ingresos totales SG $", INPUTS.monthly.ingresos_ars);
    applySeries("Ingresos totales SG USD", INPUTS.monthly.ingresos_usd);
    applySeries("Costos totales $", INPUTS.monthly.costos_ars);
    applySeries("Costos totales USD", INPUTS.monthly.costos_usd);
    applySeries("Resultado Neto SG $", INPUTS.monthly.resultado_neto_ars);
    applySeries("Resultado Neto SG USD", INPUTS.monthly.resultado_neto_usd);
    applySeries("Rdo Neto SG USD descontado", INPUTS.monthly.resultado_neto_usd_descontado);

    const tcRow = findRow(rows, "Tipo de cambio oficial");
    if (tcRow) {
      Object.entries(colToMonth).forEach(([col, month]) => {
        const val = parseMoney(tcRow[col]);
        const m = INPUTS.months.find(m => m.label === month);
        if (val !== undefined && m) { m.fx = val; updated++; }
      });
    }

    const beArs = findRow(rows, "Break even (en pesos)");
    const beUsd = findRow(rows, "Break even (en USD)");
    if (beArs) { const v = parseMoney(beArs[1]); if (v !== undefined) { INPUTS.breakEven.ars = v; updated++; } }
    if (beUsd) { const v = parseMoney(beUsd[1]); if (v !== undefined) { INPUTS.breakEven.usd = v; updated++; } }

    const vanRow = findRow(rows, "VAN (en USD)");
    if (vanRow) { const v = parseMoney(vanRow[1]); if (v !== undefined) { INPUTS.van.usd = v; updated++; } }

    const tirRow = findRow(rows, "TIR");
    if (tirRow) { const v = parseMoney(tirRow[1]); if (v !== undefined) { INPUTS.tir.pct = v > 1 ? v / 100 : v; updated++; } }

    const feeRow = findRow(rows, "Fee anual promedio");
    if (feeRow) { const v = parseMoney(feeRow[1]); if (v !== undefined) { INPUTS.feeAnnualAvg.pct = v > 1 ? v / 100 : v; updated++; } }

    // Nota: el payback mostrado en el dashboard se calcula a partir de la serie
    // resultado_neto_usd_descontado (ver compute.js), no de este texto — pero igual
    // guardamos el texto de la celda como referencia por si difiere.
    const paybackRow = findRow(rows, "Payback descontado (en meses)");
    if (paybackRow) {
      const noteCell = paybackRow.find((c, i) => i > 0 && /recuperar/i.test(c));
      if (noteCell) { INPUTS.payback.sheetLabel = noteCell; INPUTS.payback.sheetNote = `Texto literal del modelo: "${noteCell}".`; }
    }

    if (updated === 0) throw new Error("Se leyó la hoja pero no se reconoció ninguna fila esperada.");

    INPUTS.meta.lastSynced = new Date().toISOString();
    MODEL = computeModel(INPUTS);
    if (typeof renderAll === "function") renderAll();
    if (typeof initSimulator === "function") initSimulator();
    setStatus(`Sincronizado con Google Sheets (${updated} valores actualizados) — ${new Date().toLocaleString("es-AR")}`, "ok");
  } catch (err) {
    console.error("Sync error:", err);
    setStatus(`No se pudo sincronizar automáticamente (${err.message}). Mostrando los últimos datos guardados en data.js. Si esto persiste, pedile a Claude que actualice data.js manualmente.`, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("sync-btn");
  if (btn) btn.addEventListener("click", syncFromGoogleSheets);
});
