# dox - Document Engineering Toolkit

<p align="center">
  <strong>Markdown to DOCX, pixel-precise.</strong>
</p>

<p align="center">
  A browser-native document conversion tool that extracts design systems from Word templates
  and generates production-grade .docx files from markdown content.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

## Features

- **Template Extraction** - Upload any `.docx` or `.dotx` file to extract design tokens (fonts, colors, margins, table styles)
- **Markdown Parsing** - Zero-dependency markdown parser supporting headings, tables, lists, and inline formatting
- **Style Injection** - Maps parsed content to OOXML-compliant docx elements using template tokens
- **Browser-Native** - Full pipeline runs client-side; your documents never leave your machine
- **Theme Support** - Light/dark mode with system preference detection
- **GitHub Pages Ready** - Deployed automatically via GitHub Actions

## Installation

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/DvoiD/dox.git
cd dox

# Install dependencies
bun install

# Start development server
bun dev
```

### Build for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

## Quick Start

### 1. Template Upload (Optional)

Upload a `.docx` or `.dotx` file to extract its design system:

- Font scheme (major/minor fonts)
- Color scheme (accent colors, text colors)
- Page layout (margins, dimensions)
- Table styles (borders, banding, padding)

If no template is provided, the default EcoSol RFP-SWMS style is used.

### 2. Markdown Content

Upload your markdown file (`.md`). Supported elements:

| Element | Markdown Syntax |
|---------|----------------|
| Heading 1-4 | `#`, `##`, `###`, `####` |
| Paragraph | Plain text |
| Bullet List | `- item` |
| Numbered List | `1. item` |
| Table | `\| col1 \| col2 \|` |
| Bold | `**text**` |
| Italic | `*text*` |
| Code | `` `code` `` |
| Page Break | `---` (three dashes) |

### 3. Logo (Optional)

Upload a PNG logo to appear in the document header, right-aligned.

### 4. Generate

Click "Generate .docx" to build and download your styled document.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Runtime                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Template   │    │   Markdown   │    │    Logo      │      │
│  │  (.docx/.dotx)│    │    (.md)     │    │    (.png)    │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                    │                    │              │
│         ▼                    ▼                    │              │
│  ┌──────────────┐    ┌──────────────┐            │              │
│  │  Extractor   │    │   Parser     │            │              │
│  │  (JSZip +    │    │  (Zero-dep)  │            │              │
│  │   DOMParser) │    │              │            │              │
│  └──────┬───────┘    └──────┬───────┘            │              │
│         │                    │                    │              │
│         ▼                    ▼                    │              │
│  ┌──────────────┐    ┌──────────────┐            │              │
│  │   Template   │    │     AST      │            │              │
│  │    Tokens    │    │    Nodes     │            │              │
│  └──────┬───────┘    └──────┬───────┘            │              │
│         │                    │                    │              │
│         └────────┬───────────┘                    │              │
│                  ▼                                │              │
│         ┌──────────────┐                          │              │
│         │    Mapper    │◄─────────────────────────┘              │
│         │  (docx-js)   │                                         │
│         └──────┬───────┘                                         │
│                │                                                 │
│                ▼                                                 │
│         ┌──────────────┐                                         │
│         │   Builder    │                                         │
│         │  (Packer)    │                                         │
│         └──────┬───────┘                                         │
│                │                                                 │
│                ▼                                                 │
│         ┌──────────────┐                                         │
│         │  Output.docx │                                         │
│         └──────────────┘                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Modules

| Module | Purpose | Key Dependencies |
|--------|---------|------------------|
| [parser.ts](src/lib/engine/parser.ts) | Markdown → AST conversion | None (zero-dep) |
| [extractor.ts](src/lib/engine/extractor.ts) | Template → Token extraction | JSZip, DOMParser |
| [mapper.ts](src/lib/engine/mapper.ts) | AST → docx elements | docx |
| [builder.ts](src/lib/engine/builder.ts) | Document assembly | docx |
| [template.ts](src/lib/engine/template.ts) | Default tokens | None |
| [types.ts](src/lib/engine/types.ts) | TypeScript definitions | None |

## API Reference

### Parser Module

```typescript
import { parseMarkdown } from "@/lib/engine/parser"

const ast = parseMarkdown(markdownText)
// Returns: AstNode[]
```

#### Supported AST Nodes

```typescript
type AstNode =
  | HeadingNode    // { type: "heading", level: 1-4, text: string }
  | ParagraphNode  // { type: "paragraph", text: string }
  | TableNode      // { type: "table", rows: string[][] }
  | BulletListNode // { type: "bulletList", items: string[] }
  | OrderedListNode// { type: "orderedList", items: string[] }
  | PageBreakNode  // { type: "pageBreak" }
```

### Extractor Module

```typescript
import { extractTemplate } from "@/lib/engine/extractor"

const tokens = await extractTemplate(file)
// Returns: TemplateTokens | null
```

#### Template Tokens Structure

```typescript
interface TemplateTokens {
  page: PageLayout      // Dimensions and margins
  fonts: FontScheme     // Major/minor typefaces
  colors: ColorScheme   // Accent and text colors
  defaults: DocumentDefaults // Font size, spacing
  table: TableStyle     // Table styling config
}
```

### Mapper Module

```typescript
import { mapToDocx } from "@/lib/engine/mapper"

const elements = mapToDocx(ast, tokens)
// Returns: (Paragraph | Table)[]
```

### Builder Module

```typescript
import { buildDocument } from "@/lib/engine/builder"

const buffer = await buildDocument(elements, tokens, logoData)
// Returns: Promise<Uint8Array>
```

## Project Structure

```
dox/
├── src/
│   ├── App.tsx                    # Main application shell
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind + CSS variables
│   ├── components/
│   │   ├── theme-provider.tsx     # Dark/light mode context
│   │   └── ui/
│   │       ├── button.tsx         # shadcn/ui button component
│   │       ├── card.tsx           # Card component
│   │       ├── badge.tsx          # Badge component
│   │       ├── separator.tsx      # Separator component
│   │       ├── tabs.tsx           # Tabs component
│   │       └── tooltip.tsx        # Tooltip component
│   ├── lib/
│   │   ├── utils.ts               # Utility functions (cn, etc.)
│   │   └── engine/
│   │       ├── types.ts           # TypeScript type definitions
│   │       ├── parser.ts          # Markdown parser
│   │       ├── extractor.ts       # Template extractor
│   │       ├── mapper.ts          # AST to docx mapper
│   │       ├── builder.ts         # Document builder
│   │       └── template.ts        # Default template tokens
│   └── assets/                    # Static assets
├── public/                        # Public static files
├── docs/                          # Documentation
├── package.json
├── vite.config.ts
├── tsconfig.json
└── biome.json                     # Linting/formatting config
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Document Generation | docx (OOXML library) |
| Archive Handling | JSZip |
| Linting | Biome |
| Package Manager | Bun |

## Development

### Scripts

```bash
# Development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint

# Format code
bun run format

# Type check
bun run typecheck
```

### Code Style

This project uses:
- **Biome** for linting and formatting
- **Prettier** with Tailwind plugin for CSS formatting
- **TypeScript** with strict mode

## Deployment

The project is configured for GitHub Pages deployment via GitHub Actions. On push to `master`:

1. Build process runs via Vite
2. Output is deployed to GitHub Pages
3. Base URL is automatically set to `/dox/`

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

Requires modern browser features:
- File API (FileReader, Blob)
- Web Crypto API (for hash generation)
- CSS Custom Properties
- CSS Grid and Flexbox

## Security & Privacy

- **No server uploads** - All processing happens in the browser
- **No external API calls** - Your documents stay on your device
- **No tracking** - No analytics or telemetry
- **No cookies** - Only localStorage for theme preference

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Built with React + Vite + docx-js
</p>
