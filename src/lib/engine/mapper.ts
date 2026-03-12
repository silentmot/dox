import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx"
import type { AstNode, TemplateTokens } from "./types"

export function mapToDocx(
  nodes: ReadonlyArray<AstNode>,
  t: TemplateTokens
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = []
  for (const n of nodes) {
    switch (n.type) {
      case "pageBreak":
        out.push(new Paragraph({ children: [new PageBreak()] }))
        break
      case "heading":
        out.push(heading(n.level, n.text, t))
        break
      case "paragraph":
        out.push(
          new Paragraph({
            spacing: {
              after: t.defaults.spacingAfter,
              line: t.defaults.lineSpacing,
            },
            children: inlineRuns(n.text, t),
          })
        )
        break
      case "bulletList":
        for (const it of n.items)
          out.push(
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { after: t.defaults.spacingAfter },
              children: inlineRuns(it, t),
            })
          )
        break
      case "orderedList":
        for (const it of n.items)
          out.push(
            new Paragraph({
              numbering: { reference: "numbers", level: 0 },
              spacing: { after: t.defaults.spacingAfter },
              children: inlineRuns(it, t),
            })
          )
        break
      case "table":
        out.push(table(n.rows, t))
        out.push(
          new Paragraph({
            spacing: { after: t.defaults.spacingAfter },
            children: [],
          })
        )
        break
    }
  }
  return out
}

const H: Record<
  1 | 2 | 3 | 4,
  {
    h: (typeof HeadingLevel)[keyof typeof HeadingLevel]
    sz: number
    caps: boolean
    sc: boolean
    sp: { before?: number; after?: number }
  }
> = {
  1: { h: HeadingLevel.TITLE, sz: 72, caps: true, sc: false, sp: { after: 0 } },
  2: {
    h: HeadingLevel.HEADING_1,
    sz: 36,
    caps: true,
    sc: false,
    sp: { before: 400, after: 40 },
  },
  3: {
    h: HeadingLevel.HEADING_2,
    sz: 28,
    caps: true,
    sc: false,
    sp: { before: 120, after: 0 },
  },
  4: {
    h: HeadingLevel.HEADING_3,
    sz: 28,
    caps: false,
    sc: true,
    sp: { before: 120, after: 0 },
  },
}

function heading(
  level: 1 | 2 | 3 | 4,
  text: string,
  t: TemplateTokens
): Paragraph {
  const c = H[level]
  const r: Record<string, unknown> = { text, font: t.fonts.major, size: c.sz }
  if (level === 1) r.color = t.colors.text1TintBF
  if (c.caps) r.allCaps = true
  if (c.sc) {
    r.allCaps = false
    r.smallCaps = true
  }
  return new Paragraph({
    heading: c.h,
    spacing: c.sp,
    children: [new TextRun(r as ConstructorParameters<typeof TextRun>[0])],
  })
}

function table(
  rows: ReadonlyArray<ReadonlyArray<string>>,
  t: TemplateTokens
): Table {
  const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0)
  if (colCount === 0)
    return new Table({
      width: { size: t.page.contentWidth, type: WidthType.DXA },
      rows: [],
    })
  const cw = Math.floor(t.page.contentWidth / colCount)
  const colWidths = Array.from<number>({ length: colCount }).fill(cw)
  colWidths[colCount - 1] = t.page.contentWidth - cw * (colCount - 1)

  const NIL = { style: BorderStyle.NONE, size: 0 }
  const HB = {
    style: BorderStyle.SINGLE,
    size: t.table.headerBorderSize,
    color: t.table.borderColor,
  }
  const C1R = {
    style: BorderStyle.SINGLE,
    size: t.table.firstColBorderSize,
    color: t.table.borderColor,
  }
  const pad = t.table.cellPadding
  const CP = { top: pad, bottom: pad, left: pad, right: pad }

  const tRows = rows.map((row, ri) => {
    const isH = ri === 0
    const di = ri - 1
    const band = !isH && di % 2 === 0
    const cells = row.map((txt, ci) => {
      const fc = ci === 0
      const brd = isH
        ? { top: NIL, bottom: HB, left: NIL, right: NIL }
        : { top: NIL, bottom: NIL, left: NIL, right: fc ? C1R : NIL }
      const shd =
        !isH && !fc && band
          ? { fill: t.table.bandFill, type: ShadingType.CLEAR, color: "auto" }
          : undefined
      return new TableCell({
        width: { size: colWidths[ci] || 0, type: WidthType.DXA },
        borders: brd,
        ...(shd ? { shading: shd } : {}),
        margins: CP,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            ...(isH && t.table.headerAlign === "center"
              ? { alignment: AlignmentType.CENTER }
              : {}),
            spacing: { after: 0, line: 240 },
            children: [
              new TextRun({
                text: txt,
                font: isH ? t.fonts.major : t.fonts.minor,
                size: t.table.cellFontSize,
                bold: isH && t.table.headerBold,
              }),
            ],
          }),
        ],
      })
    })
    while (cells.length < colCount) {
      const pi = cells.length
      cells.push(
        new TableCell({
          width: { size: colWidths[pi] || 0, type: WidthType.DXA },
          borders: {
            top: NIL,
            bottom: NIL,
            left: NIL,
            right: pi === 0 ? C1R : NIL,
          },
          margins: CP,
          children: [
            new Paragraph({
              children: [new TextRun({ text: "", size: t.table.cellFontSize })],
            }),
          ],
        })
      )
    }
    return new TableRow({ children: cells, tableHeader: isH })
  })

  return new Table({
    width: { size: t.page.contentWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    borders: {
      top: NIL,
      bottom: NIL,
      left: NIL,
      right: NIL,
      insideHorizontal: NIL,
      insideVertical: NIL,
    },
    rows: tRows,
  })
}

function inlineRuns(text: string, t: TemplateTokens): TextRun[] {
  const runs: TextRun[] = []
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g
  let m = re.exec(text)
  while (m !== null) {
    if (m[2])
      runs.push(
        new TextRun({
          text: m[2],
          bold: true,
          font: t.fonts.minor,
          size: t.defaults.fontSize,
        })
      )
    else if (m[4])
      runs.push(
        new TextRun({
          text: m[4],
          italics: true,
          font: t.fonts.minor,
          size: t.defaults.fontSize,
        })
      )
    else if (m[6])
      runs.push(
        new TextRun({
          text: m[6],
          font: "Courier New",
          size: 20,
          color: t.colors.text1TintD9,
        })
      )
    else if (m[7])
      runs.push(
        new TextRun({
          text: m[7],
          font: t.fonts.minor,
          size: t.defaults.fontSize,
        })
      )
    m = re.exec(text)
  }
  if (runs.length === 0)
    runs.push(
      new TextRun({ text, font: t.fonts.minor, size: t.defaults.fontSize })
    )
  return runs
}
