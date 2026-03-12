# API Reference

This document provides comprehensive API documentation for the dox document engine modules.

## Table of Contents

- [Parser Module](#parser-module)
- [Extractor Module](#extractor-module)
- [Mapper Module](#mapper-module)
- [Builder Module](#builder-module)
- [Template Module](#template-module)
- [Types](#types)

---

## Parser Module

**File:** [src/lib/engine/parser.ts](../src/lib/engine/parser.ts)

Zero-dependency markdown parser that converts markdown text into an Abstract Syntax Tree (AST).

### Functions

#### `parseMarkdown(text: string): AstNode[]`

Parses markdown text and returns an array of AST nodes.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `text` | `string` | Raw markdown text content |

**Returns:** `AstNode[]` - Array of parsed AST nodes

**Example:**

```typescript
import { parseMarkdown } from "@/lib/engine/parser"

const markdown = `
# Main Title

This is a paragraph with **bold** and *italic* text.

- Item 1
- Item 2

| Column A | Column B |
|----------|----------|
| Data 1   | Data 2   |
`

const ast = parseMarkdown(markdown)
// Returns:
// [
//   { type: "heading", level: 1, text: "Main Title" },
//   { type: "paragraph", text: "This is a paragraph with **bold** and *italic* text." },
//   { type: "bulletList", items: ["Item 1", "Item 2"] },
//   { type: "table", rows: [["Column A", "Column B"], ["Data 1", "Data 2"]] }
// ]
```

### Supported Markdown Elements

| Element | Syntax | AST Node |
|---------|--------|----------|
| Heading 1-4 | `#` through `####` | `HeadingNode` |
| Paragraph | Plain text | `ParagraphNode` |
| Bullet List | `- item` | `BulletListNode` |
| Numbered List | `1. item` | `OrderedListNode` |
| Table | `\| col1 \| col2 \|` | `TableNode` |
| Page Break | `---` (3+ dashes) | `PageBreakNode` |
| Bold | `**text**` | Inline in paragraph |
| Italic | `*text*` | Inline in paragraph |
| Code | `` `code` `` | Inline in paragraph |

### Implementation Notes

- Normalizes line endings (`\r\n`, `\r` → `\n`)
- Skips empty lines
- Tables skip separator rows (`|---|---|`)
- Lists are grouped by consecutive items

---

## Extractor Module

**File:** [src/lib/engine/extractor.ts](../src/lib/engine/extractor.ts)

Extracts design tokens from `.docx` or `.dotx` template files using JSZip and DOMParser.

### Functions

#### `extractTemplate(file: File): Promise<TemplateTokens | null>`

Extracts template tokens from an uploaded Word document.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `file` | `File` | `.docx` or `.dotx` file |

**Returns:** `Promise<TemplateTokens | null>` - Extracted tokens or null on failure

**Example:**

```typescript
import { extractTemplate } from "@/lib/engine/extractor"

const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

const tokens = await extractTemplate(file)
if (tokens) {
  console.log("Font scheme:", tokens.fonts)
  console.log("Color scheme:", tokens.colors)
  console.log("Page dimensions:", tokens.page.width, "x", tokens.page.height)
}
```

### Extraction Pipeline

1. **JSZip Unpack** - Extracts the ZIP archive structure
2. **XML Parsing** - Reads internal XML files:
   - `word/styles.xml` - Document defaults and styles
   - `word/theme/theme1.xml` - Color and font schemes
   - `word/document.xml` - Page layout (sectPr)
3. **Token Assembly** - Combines extracted values into `TemplateTokens`

### Extracted Data

| Source File | Extracted Data |
|-------------|----------------|
| `theme1.xml` | Color scheme (accent colors), Font scheme (major/minor) |
| `styles.xml` | Default font size, paragraph spacing |
| `document.xml` | Page dimensions, margins |

### Helper Functions

#### `shadeColor(hex: string, factor: number): string`

Applies a shading factor to a hex color.

```typescript
// Darken by 25%
const darkened = shadeColor("3494BA", 0.75) // "276E8B"
```

---

## Mapper Module

**File:** [src/lib/engine/mapper.ts](../src/lib/engine/mapper.ts)

Maps AST nodes to docx library elements using template tokens.

### Functions

#### `mapToDocx(nodes: ReadonlyArray<AstNode>, t: TemplateTokens): (Paragraph | Table)[]`

Converts an array of AST nodes to docx elements.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `nodes` | `ReadonlyArray<AstNode>` | Parsed AST nodes |
| `t` | `TemplateTokens` | Template design tokens |

**Returns:** `(Paragraph | Table)[]` - Array of docx elements

**Example:**

```typescript
import { mapToDocx } from "@/lib/engine/mapper"
import { parseMarkdown } from "@/lib/engine/parser"
import { DEFAULT_TEMPLATE } from "@/lib/engine/template"

const ast = parseMarkdown("# Hello World")
const elements = mapToDocx(ast, DEFAULT_TEMPLATE)
// Returns: [Paragraph with heading style]
```

### Mapping Rules

| AST Node | docx Element | Styling |
|----------|--------------|---------|
| `HeadingNode` (level 1) | `Paragraph` with `TITLE` style | 72pt, all caps, major font |
| `HeadingNode` (level 2) | `Paragraph` with `HEADING_1` | 36pt, all caps, major font |
| `HeadingNode` (level 3) | `Paragraph` with `HEADING_2` | 28pt, all caps, major font |
| `HeadingNode` (level 4) | `Paragraph` with `HEADING_3` | 28pt, small caps, major font |
| `ParagraphNode` | `Paragraph` | Minor font, default size |
| `BulletListNode` | `Paragraph` with numbering | Bullet character (•) |
| `OrderedListNode` | `Paragraph` with numbering | Decimal format (1., 2., ...) |
| `TableNode` | `Table` | Header row, alternating bands |
| `PageBreakNode` | `Paragraph` with `PageBreak` | - |

### Inline Formatting

The `inlineRuns()` function handles text formatting within paragraphs:

| Markdown | docx TextRun Properties |
|----------|-------------------------|
| `**bold**` | `bold: true` |
| `*italic*` | `italics: true` |
| `` `code` `` | `font: "Courier New"`, smaller size |

### Table Styling

Tables are styled with:

- **Header row border** - Bottom border on first row
- **First column border** - Right border on first column
- **Alternating bands** - Background fill on even rows
- **Cell padding** - Configurable padding

---

## Builder Module

**File:** [src/lib/engine/builder.ts](../src/lib/engine/builder.ts)

Assembles the final document with headers, footers, and styling.

### Functions

#### `buildDocument(body: (Paragraph | Table)[], t: TemplateTokens, logoData: ArrayBuffer | null): Promise<Uint8Array>`

Builds a complete DOCX document from mapped elements.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `body` | `(Paragraph \| Table)[]` | Mapped document elements |
| `t` | `TemplateTokens` | Template design tokens |
| `logoData` | `ArrayBuffer \| null` | Optional logo PNG data |

**Returns:** `Promise<Uint8Array>` - DOCX file as byte array

**Example:**

```typescript
import { buildDocument } from "@/lib/engine/builder"
import { mapToDocx } from "@/lib/engine/mapper"
import { parseMarkdown } from "@/lib/engine/parser"
import { DEFAULT_TEMPLATE } from "@/lib/engine/template"

const ast = parseMarkdown("# Document Title\n\nContent here.")
const elements = mapToDocx(ast, DEFAULT_TEMPLATE)

// Optional: Load logo
const logoResponse = await fetch("/logo.png")
const logoData = await logoResponse.arrayBuffer()

const docxBuffer = await buildDocument(elements, DEFAULT_TEMPLATE, logoData)

// Download
const blob = new Blob([docxBuffer], {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
})
const url = URL.createObjectURL(blob)
// Create download link...
```

### Document Structure

```
Document
├── Styles
│   ├── Default (Normal)
│   ├── Heading 1
│   ├── Heading 2
│   └── Heading 3
├── Numbering Config
│   ├── bullets (•, ○)
│   └── numbers (1., 2., 3.)
└── Sections
    └── Section 1
        ├── Properties (page size, margins)
        ├── Header
        │   ├── Logo (if provided)
        │   └── "Generated by dox" text
        ├── Footer
        │   └── Page number + "dox" branding
        └── Children (body elements)
```

### Header Content

- **Logo** - Right-aligned PNG (152x71 px) if provided
- **Tagline** - "Generated by dox" text

### Footer Content

- **Page number** - Current page number
- **Branding** - "dox" text
- **Accent border** - Left border in accent color

---

## Template Module

**File:** [src/lib/engine/template.ts](../src/lib/engine/template.ts)

Provides the default template tokens based on the EcoSol RFP-SWMS style.

### Constants

#### `DEFAULT_TEMPLATE: TemplateTokens`

Default design tokens used when no template is uploaded.

**Page Layout:**

```typescript
{
  width: 12240,      // Letter width (twips)
  height: 15840,     // Letter height (twips)
  margin: {
    top: 1440,       // 1 inch
    right: 1440,
    bottom: 1440,
    left: 1440,
    header: 0,
    footer: 720,     // 0.5 inch
    gutter: 0
  },
  contentWidth: 9360 // Usable width
}
```

**Font Scheme:**

```typescript
{
  major: "Tw Cen MT",
  minor: "Tw Cen MT",
  bulletFont: "Arial"
}
```

**Color Scheme:**

```typescript
{
  accent1: "3494BA",       // Teal blue
  accent1ShadeBF: "276E8B", // Darker shade
  text1TintBF: "404040",    // Dark gray
  text1TintA6: "595959",
  text1Tint80: "7F7F7F",
  text1TintD9: "262626",
  bandFill: "F2F2F2",       // Light gray (table bands)
  headerFill: "F2F2EF",
  tableSeparator: "7F7F7F",
  black: "000000",
  white: "FFFFFF"
}
```

**Document Defaults:**

```typescript
{
  fontSize: 22,       // 11pt (half-points)
  spacingAfter: 160,  // Paragraph spacing (twips)
  lineSpacing: 259    // Line height
}
```

**Table Style:**

```typescript
{
  cellPadding: 100,
  headerBorderSize: 6,
  firstColBorderSize: 4,
  borderColor: "7F7F7F",
  bandFill: "F2F2F2",
  headerAlign: "center",
  headerBold: true,
  cellFontSize: 20,      // 10pt
  headerRowHeight: 360,
  dataRowHeight: 320
}
```

---

## Types

**File:** [src/lib/engine/types.ts](../src/lib/engine/types.ts)

### AST Node Types

```typescript
// Union type for all AST nodes
type AstNode =
  | HeadingNode
  | ParagraphNode
  | TableNode
  | BulletListNode
  | OrderedListNode
  | PageBreakNode

// Heading node (levels 1-4)
interface HeadingNode {
  readonly type: "heading"
  readonly level: 1 | 2 | 3 | 4
  readonly text: string
}

// Paragraph node
interface ParagraphNode {
  readonly type: "paragraph"
  readonly text: string
}

// Table node with rows of cells
interface TableNode {
  readonly type: "table"
  readonly rows: ReadonlyArray<ReadonlyArray<string>>
}

// Bullet list node
interface BulletListNode {
  readonly type: "bulletList"
  readonly items: ReadonlyArray<string>
}

// Ordered list node
interface OrderedListNode {
  readonly type: "orderedList"
  readonly items: ReadonlyArray<string>
}

// Page break node
interface PageBreakNode {
  readonly type: "pageBreak"
}
```

### Template Token Types

```typescript
// Main template tokens structure
interface TemplateTokens {
  readonly page: PageLayout
  readonly fonts: FontScheme
  readonly colors: ColorScheme
  readonly defaults: DocumentDefaults
  readonly table: TableStyle
}

// Page layout configuration
interface PageLayout {
  readonly width: number      // Page width in twips
  readonly height: number     // Page height in twips
  readonly margin: PageMargins
  readonly contentWidth: number // Usable content width
}

// Page margin configuration
interface PageMargins {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
  readonly header: number
  readonly footer: number
  readonly gutter: number
}

// Font scheme
interface FontScheme {
  readonly major: string    // Heading font
  readonly minor: string    // Body font
  readonly bulletFont: string
}

// Color scheme (hex strings without #)
interface ColorScheme {
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

// Document defaults
interface DocumentDefaults {
  readonly fontSize: number      // Half-points (22 = 11pt)
  readonly spacingAfter: number  // Twips
  readonly lineSpacing: number   // Twips
}

// Table styling
interface TableStyle {
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
```

### Storage Types

```typescript
// Stored template for persistence
interface StoredTemplate {
  readonly id: string
  readonly name: string
  readonly source: string      // Original filename
  readonly tokens: TemplateTokens
  readonly createdAt: number   // Timestamp
}

// Stored logo for persistence
interface StoredLogo {
  readonly id: string
  readonly name: string
  readonly dataUrl: string     // Base64 data URL
  readonly width: number
  readonly height: number
  readonly createdAt: number
}
```

---

## Error Handling

All engine functions handle errors gracefully:

### Parser

- Never throws; returns partial AST on malformed input
- Skips unrecognized content

### Extractor

- Returns `null` on any extraction failure
- Logs errors to console
- Falls back to default tokens

### Mapper

- Never throws; skips unknown node types
- Creates fallback elements for edge cases

### Builder

- May throw on invalid logo data
- Returns valid Uint8Array on success

---

## Unit Conversions

| Unit | Conversion |
|------|------------|
| Points to Half-points | Multiply by 2 |
| Inches to Twips | Multiply by 1440 |
| Points to Twips | Multiply by 20 |

---

**Next:** [User Guide](./user-guide.md) | [Architecture](./architecture.md)
