import JSZip from "jszip"
import { DEFAULT_TEMPLATE } from "./template"
import type {
  ColorScheme,
  FontScheme,
  TableStyle,
  TemplateTokens,
} from "./types"

/**
 * Extract TemplateTokens from an uploaded .docx/.dotx file.
 *
 * Pipeline:
 *   1. JSZip unpacks the ZIP archive
 *   2. DOMParser reads word/styles.xml, word/theme/theme1.xml,
 *      word/header1.xml, word/footer1.xml, word/document.xml
 *   3. Each XML is walked to extract design tokens
 *   4. Returns a TemplateTokens object (or null on failure)
 */
export async function extractTemplate(
  file: File
): Promise<TemplateTokens | null> {
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const parser = new DOMParser()

    const readXml = async (path: string): Promise<Document | null> => {
      const entry = zip.file(path)
      if (!entry) return null
      const text = await entry.async("text")
      return parser.parseFromString(text, "application/xml")
    }

    const themeDoc = await readXml("word/theme/theme1.xml")
    const stylesDoc = await readXml("word/styles.xml")
    const docDoc = await readXml("word/document.xml")

    // -- Extract color scheme from theme --
    const colors: ColorScheme = { ...DEFAULT_TEMPLATE.colors }
    if (themeDoc) {
      const clr = themeDoc.querySelector("clrScheme")
      if (clr) {
        const get = (role: string): string | null => {
          const el = clr.querySelector(role)
          const srgb = el?.querySelector("srgbClr")
          if (srgb) return srgb.getAttribute("val")
          const sys = el?.querySelector("sysClr")
          if (sys) return sys.getAttribute("lastClr")
          return null
        }
        const a1 = get("accent1")
        if (a1) {
          Object.assign(colors, {
            accent1: a1,
            accent1ShadeBF: shadeColor(a1, 0.75),
            tableSeparator: "7F7F7F",
          })
        }
      }
    }

    // -- Extract font scheme from theme --
    let fonts: FontScheme = { ...DEFAULT_TEMPLATE.fonts }
    if (themeDoc) {
      const major = themeDoc.querySelector("majorFont > latin")
      const minor = themeDoc.querySelector("minorFont > latin")
      const majorTypeface = major?.getAttribute("typeface") ?? fonts.major
      const minorTypeface = minor?.getAttribute("typeface") ?? fonts.minor
      fonts = {
        ...fonts,
        major: majorTypeface,
        minor: minorTypeface,
      }
    }

    // -- Extract page layout from document sectPr --
    const page = {
      ...DEFAULT_TEMPLATE.page,
      margin: { ...DEFAULT_TEMPLATE.page.margin },
    }
    if (docDoc) {
      const sectPr = docDoc.querySelector("sectPr")
      if (sectPr) {
        const pgSz = sectPr.querySelector("pgSz")
        if (pgSz) {
          page.width = num(pgSz, "w:w") ?? page.width
          page.height = num(pgSz, "w:h") ?? page.height
        }
        const pgMar = sectPr.querySelector("pgMar")
        if (pgMar) {
          page.margin.top = num(pgMar, "w:top") ?? page.margin.top
          page.margin.right = num(pgMar, "w:right") ?? page.margin.right
          page.margin.bottom = num(pgMar, "w:bottom") ?? page.margin.bottom
          page.margin.left = num(pgMar, "w:left") ?? page.margin.left
          page.margin.header = num(pgMar, "w:header") ?? page.margin.header
          page.margin.footer = num(pgMar, "w:footer") ?? page.margin.footer
        }
        page.contentWidth = page.width - page.margin.left - page.margin.right
      }
    }

    // -- Extract heading styles from styles.xml --
    const defaults = { ...DEFAULT_TEMPLATE.defaults }
    if (stylesDoc) {
      const docDef = stylesDoc.querySelector("docDefaults rPrDefault rPr")
      if (docDef) {
        const sz = docDef.querySelector("sz")
        if (sz) defaults.fontSize = num(sz, "w:val") ?? defaults.fontSize
      }
      const pDef = stylesDoc.querySelector("docDefaults pPrDefault pPr spacing")
      if (pDef) {
        defaults.spacingAfter = num(pDef, "w:after") ?? defaults.spacingAfter
        defaults.lineSpacing = num(pDef, "w:line") ?? defaults.lineSpacing
      }
    }

    const table: TableStyle = {
      ...DEFAULT_TEMPLATE.table,
      borderColor: colors.tableSeparator,
      bandFill: colors.bandFill,
    }

    return { page, fonts, colors, defaults, table }
  } catch (err) {
    console.error("Template extraction failed:", err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function num(el: Element, attr: string): number | null {
  const v = el.getAttribute(attr)
  if (v === null) return null
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function shadeColor(hex: string, factor: number): string {
  const r = Math.round(Number.parseInt(hex.slice(0, 2), 16) * factor)
  const g = Math.round(Number.parseInt(hex.slice(2, 4), 16) * factor)
  const b = Math.round(Number.parseInt(hex.slice(4, 6), 16) * factor)
  return [r, g, b]
    .map((c) => Math.min(255, c).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}
