/* Shared number formatting, used by compute.js, charts.js and app.js. */

const fmtUSD = (v, opts = {}) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}US$ ${(abs / 1e6).toFixed(opts.decimals ?? 1)}M`;
  if (abs >= 1e3) return `${sign}US$ ${(abs / 1e3).toFixed(0)}K`;
  return `${sign}US$ ${abs.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
};
const fmtARS = (v, opts = {}) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$ ${(abs / 1e9).toFixed(opts.decimals ?? 1)}MM ARS`;
  if (abs >= 1e6) return `${sign}$ ${(abs / 1e6).toFixed(opts.decimals ?? 1)}M ARS`;
  return `${sign}$ ${abs.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS`;
};

const MONTH_EN_TO_ES = { Jan: "Ene", Feb: "Feb", Mar: "Mar", Apr: "Abr", May: "May", Jun: "Jun", Jul: "Jul", Aug: "Ago", Sep: "Sep", Oct: "Oct", Nov: "Nov", Dec: "Dic" };
const MONTH_ES_NAME_TO_EN = {
  enero: "Jan", febrero: "Feb", marzo: "Mar", abril: "Apr", mayo: "May", junio: "Jun",
  julio: "Jul", agosto: "Aug", septiembre: "Sep", setiembre: "Sep", octubre: "Oct", noviembre: "Nov", diciembre: "Dec"
};

// "Jul-26" -> "Jul-26" (en, as stored) ; toEs("Jul-26") -> "Jul-26" en español -> "Jul-26" ya que Jul coincide; "Sep-27" -> "Sep-27"
function monthLabelToEs(label) {
  const [mon, yy] = label.split("-");
  return `${MONTH_EN_TO_ES[mon] || mon}-${yy}`;
}

// "Noviembre 2028" -> "Nov-28"
function parseSpanishMonthYear(text) {
  const m = text.trim().toLowerCase().match(/([a-záéíóúñ]+)\s+(\d{4})/i);
  if (!m) return null;
  const mon = MONTH_ES_NAME_TO_EN[m[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
  if (!mon) return null;
  return `${mon}-${m[2].slice(2)}`;
}
