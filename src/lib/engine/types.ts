/**
 * Shared type definitions for dox document engine.
 *
 * AST nodes (markdown parser output), template tokens (design system),
 * and app-level state types.
 */

// ---------------------------------------------------------------------------
// AST Node Types (markdown parser output)
// ---------------------------------------------------------------------------
export type AstNode =
  | HeadingNode
  | ParagraphNode
  | TableNode
  | BulletListNode
  | OrderedListNode
  | PageBreakNode

export interface HeadingNode {
  readonly type: "heading"
  readonly level: 1 | 2 | 3 | 4
  readonly text: string
}

export interface ParagraphNode {
  readonly type: "paragraph"
  readonly text: string
}

export interface TableNode {
  readonly type: "table"
  readonly rows: ReadonlyArray<ReadonlyArray<string>>
}

export interface BulletListNode {
  readonly type: "bulletList"
  readonly items: ReadonlyArray<string>
}

export interface OrderedListNode {
  readonly type: "orderedList"
  readonly items: ReadonlyArray<string>
}

export interface PageBreakNode {
  readonly type: "pageBreak"
}

// ---------------------------------------------------------------------------
// Template Token Types (design system extracted from .docx/.dotx)
// ---------------------------------------------------------------------------
export interface PageLayout {
  readonly width: number
  readonly height: number
  readonly margin: PageMargins
  readonly contentWidth: number
}

export interface PageMargins {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
  readonly header: number
  readonly footer: number
  readonly gutter: number
}

export interface ColorScheme {
  readonly accent1: string
  readonly accent1ShadeBF: string
  readonly text1TintBF: string
  readonly text1TintA6: string
  readonly text1Tint80: string
  readonly text1TintD9: string
  readonly bandFill: string
  readonly headerFill: string
  readonly tableSeparator: string
  readonly black: string
  readonly white: string
}

export interface FontScheme {
  readonly major: string
  readonly minor: string
  readonly bulletFont: string
}

export interface DocumentDefaults {
  readonly fontSize: number
  readonly spacingAfter: number
  readonly lineSpacing: number
}

export interface TableStyle {
  readonly cellPadding: number
  readonly headerBorderSize: number
  readonly firstColBorderSize: number
  readonly borderColor: string
  readonly bandFill: string
  readonly headerAlign: "center" | "left"
  readonly headerBold: boolean
  readonly cellFontSize: number
  readonly headerRowHeight: number
  readonly dataRowHeight: number
}

export interface TemplateTokens {
  readonly page: PageLayout
  readonly fonts: FontScheme
  readonly colors: ColorScheme
  readonly defaults: DocumentDefaults
  readonly table: TableStyle
}

// ---------------------------------------------------------------------------
// App-level State Types
// ---------------------------------------------------------------------------
export interface StoredTemplate {
  readonly id: string
  readonly name: string
  readonly source: string
  readonly tokens: TemplateTokens
  readonly createdAt: number
}

export interface StoredLogo {
  readonly id: string
  readonly name: string
  readonly dataUrl: string
  readonly width: number
  readonly height: number
  readonly createdAt: number
}
