#!/usr/bin/env node
/**
 * Converts a Docusaurus page from docs/ into a standalone, shareable .docx.
 *
 * Usage:
 *   npm run docx -- docs/beacon/beneficiary-journey.md [output.docx]
 *   node scripts/md2docx.js <input.md> [output.docx]
 *
 * The input is resolved against the current directory, then the docs-website
 * root, then docs/ — so it works whichever of those you run it from. Output
 * defaults to <docs-website>/build-docx/<name>.docx.
 *
 * Handles the Markdown subset these docs use: headings, paragraphs, bullet and
 * ordered lists, pipe tables, horizontal rules, and Docusaurus ':::' callouts.
 * Doc-site-relative links are rewritten to absolute URLs so they work off-site.
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ExternalHyperlink, Footer, PageNumber, convertInchesToTwip,
} = require("docx");

const SITE = "https://platform.airqo.net/docs";
const ROOT = path.resolve(__dirname, "..");   // src/docs-website
const DOCS = path.join(ROOT, "docs");

function usage(msg) {
  if (msg) console.error(`md2docx: ${msg}\n`);
  console.error("Usage: npm run docx -- <page.md> [output.docx]");
  console.error("  e.g. npm run docx -- docs/beacon/beneficiary-journey.md");
  process.exit(1);
}

if (!process.argv[2]) usage("no input file given");

const SRC = (() => {
  const arg = process.argv[2];
  const tried = [
    path.resolve(process.cwd(), arg),
    path.resolve(ROOT, arg),
    path.resolve(DOCS, arg),
  ];
  const hit = tried.find(p => fs.existsSync(p) && fs.statSync(p).isFile());
  if (!hit) usage(`cannot find "${arg}". Looked in:\n  ` + tried.join("\n  "));
  return hit;
})();

const OUT = (() => {
  if (process.argv[3]) return path.resolve(process.cwd(), process.argv[3]);
  const dir = path.join(ROOT, "build-docx");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, path.basename(SRC).replace(/\.mdx?$/, "") + ".docx");
})();

// US Letter with 1" margins
const CONTENT_WIDTH = 12240 - convertInchesToTwip(1) * 2; // 9360 DXA

const COLORS = {
  heading: "1A3D6D",
  accent: "2E6FD9",
  body: "1F2328",
  muted: "5A6472",
  rule: "D5DAE1",
  tableHeadBg: "EEF3FA",
  tableBorder: "C8D2DF",
};

const CALLOUT = {
  note:      { label: "Note",      bar: "2E6FD9", bg: "EAF1FC" },
  tip:       { label: "Tip",       bar: "1A9E5B", bg: "E8F6EE" },
  important: { label: "Important", bar: "6A47B8", bg: "F0EAFA" },
  warning:   { label: "Warning",   bar: "C77700", bg: "FDF1DF" },
  caution:   { label: "Caution",   bar: "C0392B", bg: "FBEAE8" },
  info:      { label: "Info",      bar: "2E6FD9", bg: "EAF1FC" },
};

/** Rewrites a Markdown link target so it resolves outside the docs site. */
function resolveHref(href) {
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith("/")) return SITE + href;           // /vertex/... -> site absolute
  // ./getting-started/access-beacon.md -> sibling page under /beacon/
  const clean = href.replace(/^\.\//, "").replace(/\.mdx?$/, "");
  return `${SITE}/${REL[0]}/${clean}`;
}

/** Splits inline Markdown into docx runs. Handles **bold**, `code`, and [text](url). */
function inline(text, opts = {}) {
  const base = { size: 22, color: opts.color || COLORS.body, font: "Calibri" };
  const out = [];
  // Order matters: links first so their label can still carry bold/code.
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0, m;
  const push = (t, extra = {}) => {
    if (t) out.push(new TextRun({ ...base, ...opts.run, ...extra, text: t }));
  };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      // link — strip any ** inside the label, keep it bold if it was
      const bold = /^\*\*.*\*\*$/.test(m[1]);
      out.push(new ExternalHyperlink({
        link: resolveHref(m[2]),
        children: [new TextRun({
          ...base, ...opts.run,
          text: m[1].replace(/\*\*/g, ""),
          bold: bold || undefined,
          style: "Hyperlink",
        })],
      }));
    } else if (m[3] !== undefined) {
      push(m[3], { bold: true });
    } else if (m[4] !== undefined) {
      push(m[4], { font: "Consolas", size: 20, shading: { type: ShadingType.CLEAR, fill: "F2F4F7" } });
    }
    last = re.lastIndex;
  }
  push(text.slice(last));
  return out.length ? out : [new TextRun({ ...base, ...opts.run, text: "" })];
}

const para = (text, o = {}) => new Paragraph({
  children: inline(text, o),
  spacing: { after: o.after ?? 140, line: 276 },
  ...(o.paragraph || {}),
});

function heading(text, level) {
  const sizes = { 1: 34, 2: 26, 3: 22 };
  return new Paragraph({
    heading: { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 }[level],
    spacing: { before: level === 1 ? 0 : level === 2 ? 340 : 240, after: level === 3 ? 100 : 160 },
    children: inline(text, { run: { size: sizes[level], bold: true, color: COLORS.heading } }),
    ...(level === 2 ? {
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.rule, space: 6 } },
    } : {}),
  });
}

const hr = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.rule, space: 8 } },
  children: [new TextRun({ text: "" })],
});

function listItem(text, ordered, index) {
  return new Paragraph({
    spacing: { after: 90, line: 276 },
    indent: { left: 460, hanging: 280 },
    children: [
      new TextRun({ text: ordered ? `${index}.` : "•", size: 22, color: COLORS.accent, bold: true, font: "Calibri" }),
      new TextRun({ text: "  ", size: 21, font: "Calibri" }),
      ...inline(text),
    ],
  });
}

function calloutBlock(kind, lines) {
  const c = CALLOUT[kind] || CALLOUT.note;
  const cellChildren = [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: c.label.toUpperCase(), bold: true, size: 17, color: c.bar, font: "Calibri" })],
    }),
    ...lines.map((l, i) => new Paragraph({
      spacing: { after: i === lines.length - 1 ? 0 : 100, line: 276 },
      children: inline(l),
    })),
  ];
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return new Table({
    columnWidths: [CONTENT_WIDTH],
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    borders: {
      top: noBorder, bottom: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder,
      left: { style: BorderStyle.SINGLE, size: 18, color: c.bar },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: c.bg, color: "auto" },
        margins: { top: 160, bottom: 160, left: 220, right: 220 },
        children: cellChildren,
      })],
    })],
  });
}

function tableBlock(rows) {
  const cols = rows[0].length;
  // Give the widest-content column more room; otherwise split evenly.
  const weights = rows[0].map((_, i) =>
    Math.max(...rows.map(r => (r[i] || "").replace(/\*\*|`/g, "").length)) || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let widths = weights.map(w => Math.max(1100, Math.round((w / total) * CONTENT_WIDTH)));
  const drift = CONTENT_WIDTH - widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += drift; // force exact sum

  const border = { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder };
  return new Table({
    columnWidths: widths,
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: rows.map((cells, r) => new TableRow({
      tableHeader: r === 0,
      children: cells.map((cell, i) => new TableCell({
        width: { size: widths[i], type: WidthType.DXA },
        shading: r === 0 ? { type: ShadingType.CLEAR, fill: COLORS.tableHeadBg, color: "auto" } : undefined,
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        children: [new Paragraph({
          spacing: { after: 0, line: 264 },
          children: inline(cell, r === 0 ? { run: { bold: true, color: COLORS.heading } } : {}),
        })],
      })),
    })),
  });
}

// ─── Parse ────────────────────────────────────────────────────────────────────

// Page identity, derived from the source rather than hardcoded.
const DOC_TITLE = (fs.readFileSync(SRC, "utf8").match(/^#\s+(.*)$/m) || [, path.basename(SRC)])[1].trim();
const REL = path.relative(DOCS, SRC).replace(/\.mdx?$/, "").split(path.sep);
const SECTION = (REL[0] || "docs").replace(/[-_]/g, " ").toUpperCase();
const CANONICAL = `${SITE}/${REL.join("/")}`;

const raw = fs.readFileSync(SRC, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
const lines = raw.split("\n");
const body = [];
let i = 0, orderedIdx = 0;

while (i < lines.length) {
  const line = lines[i];
  const t = line.trim();

  if (!t) { i++; orderedIdx = 0; continue; }

  // callout
  let m = t.match(/^:::(\w+)/);
  if (m) {
    const kind = m[1];
    const buf = [];
    i++;
    while (i < lines.length && lines[i].trim() !== ":::") { buf.push(lines[i].trim()); i++; }
    i++; // closing :::
    body.push(calloutBlock(kind, buf.filter(Boolean)));
    body.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun("")] }));
    continue;
  }

  // table
  if (t.startsWith("|") && (lines[i + 1] || "").trim().match(/^\|[\s:|-]+\|$/)) {
    const rows = [];
    const cellsOf = l => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
    rows.push(cellsOf(lines[i])); i += 2;
    while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(cellsOf(lines[i])); i++; }
    body.push(tableBlock(rows));
    body.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }));
    continue;
  }

  if (t === "---") {
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    const nextIsHeading = j < lines.length && /^#{1,3}\s/.test(lines[j].trim());
    if (!nextIsHeading) body.push(hr());
    i++;
    continue;
  }

  m = t.match(/^(#{1,3})\s+(.*)$/);
  if (m) { body.push(heading(m[2], m[1].length)); i++; continue; }

  m = t.match(/^[*-]\s+(.*)$/);
  if (m) { body.push(listItem(m[1], false)); i++; continue; }

  m = t.match(/^(\d+)\.\s+(.*)$/);
  if (m) { orderedIdx = parseInt(m[1], 10); body.push(listItem(m[2], true, orderedIdx)); i++; continue; }

  body.push(para(t));
  i++;
}

// ─── Document ─────────────────────────────────────────────────────────────────

const doc = new Document({
  creator: "AirQo",
  title: DOC_TITLE,
  description: `AirQo product documentation — ${DOC_TITLE}.`,
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: COLORS.body } } },
    characterStyles: [{
      id: "Hyperlink", name: "Hyperlink", basedOn: "DefaultParagraphFont",
      run: { color: COLORS.accent, underline: {} },
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: {
          top: convertInchesToTwip(1), bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1), right: convertInchesToTwip(1),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `AirQo · ${DOC_TITLE} · Page `, size: 17, color: COLORS.muted }),
            new TextRun({ children: [PageNumber.CURRENT], size: 17, color: COLORS.muted }),
            new TextRun({ text: " of ", size: 17, color: COLORS.muted }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: COLORS.muted }),
          ],
        })],
      }),
    },
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: `AIRQO ${SECTION}`, bold: true, size: 18, color: COLORS.accent })],
      }),
      ...body,
      hr(),
      new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({
          text: `Generated from the AirQo product documentation · ${CANONICAL}`,
          size: 17, color: COLORS.muted, italics: true,
        })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log(`wrote ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
});
