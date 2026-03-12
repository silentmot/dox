import type {
  AstNode,
  BulletListNode,
  HeadingNode,
  OrderedListNode,
  PageBreakNode,
  ParagraphNode,
  TableNode,
} from "./types"

export function parseMarkdown(text: string): AstNode[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
  const nodes: AstNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line === undefined || line.trim() === "") {
      i++
      continue
    }
    if (/^-{3,}$/.test(line.trim())) {
      nodes.push({ type: "pageBreak" } satisfies PageBreakNode)
      i++
      continue
    }

    const hm = line.match(/^(#{1,4})\s+(.+)$/)
    if (hm && hm[1] && hm[2]) {
      nodes.push({
        type: "heading",
        level: hm[1].length as 1 | 2 | 3 | 4,
        text: hm[2].trim(),
      } satisfies HeadingNode)
      i++
      continue
    }

    if (line.trim().startsWith("|")) {
      const rows: string[][] = []
      while (i < lines.length && lines[i]?.trim().startsWith("|")) {
        const raw = lines[i]!.trim()
        const cells = raw
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim())
        if (cells.length > 0 && !cells.every((c) => /^[:-]+$/.test(c)))
          rows.push(cells)
        i++
      }
      if (rows.length > 0)
        nodes.push({ type: "table", rows } satisfies TableNode)
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i]?.match(/^\d+\.\s+(.+)$/)
        if (!m || !m[1]) break
        items.push(m[1].trim())
        i++
      }
      nodes.push({ type: "orderedList", items } satisfies OrderedListNode)
      continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i]?.startsWith("- ")) {
        items.push(lines[i]!.replace(/^- /, "").trim())
        i++
      }
      nodes.push({ type: "bulletList", items } satisfies BulletListNode)
      continue
    }

    nodes.push({ type: "paragraph", text: line } satisfies ParagraphNode)
    i++
  }
  return nodes
}
