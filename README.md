# dox - Document Engineering Toolkit

<p align="center">
  <strong>Markdown to DOCX, pixel-precise.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-purple" alt="Vite 7" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-Private-red" alt="License" />
</p>

A browser-native document conversion tool that extracts design systems from Word templates and generates production-grade .docx files from markdown content. Everything runs client-side—your documents never leave your machine.

## Features

- **Template Extraction** - Upload any `.docx` or `.dotx` file to extract design tokens (fonts, colors, margins, table styles)
- **Markdown Parsing** - Zero-dependency parser supporting headings, tables, lists, and inline formatting
- **Style Injection** - Maps parsed content to OOXML-compliant docx elements using template tokens
- **Browser-Native** - Full pipeline runs client-side; no server uploads required
- **Theme Support** - Light/dark mode with system preference detection
- **GitHub Pages Ready** - Automatic deployment via GitHub Actions

## Quick Start

```bash
# Clone and install
git clone https://github.com/DvoiD/dox.git
cd dox
bun install

# Start development server
bun dev

# Build for production
bun run build
```

## Usage

### 1. Template (Optional)
Upload a `.docx` or `.dotx` file to extract its design system, or use the default EcoSol style.

### 2. Content (Required)
Upload your markdown file. Supported elements:

| Element | Syntax |
|---------|--------|
| Headings | `#`, `##`, `###`, `####` |
| Paragraph | Plain text |
| Bullet List | `- item` |
| Numbered List | `1. item` |
| Table | `\| col1 \| col2 \|` |
| Bold | `**text**` |
| Italic | `*text*` |
| Code | `` `code` `` |
| Page Break | `---` |

### 3. Logo (Optional)
Upload a PNG logo for the document header.

### 4. Generate
Click "Generate .docx" to download your styled document.

## Architecture

```
Template (.docx) → Extractor → TemplateTokens
                              ↓
Markdown (.md)  → Parser  → AstNodes → Mapper → Builder → .docx
                              ↑
Logo (.png)     → ArrayBuffer ─────────────────┘
```

## Project Structure

```
src/
├── App.tsx              # Main application shell
├── components/
│   ├── theme-provider.tsx
│   └── ui/              # shadcn/ui components
└── lib/engine/
    ├── types.ts         # TypeScript definitions
    ├── parser.ts        # Markdown → AST
    ├── extractor.ts     # Template → Tokens
    ├── mapper.ts        # AST → docx elements
    ├── builder.ts       # Document assembly
    └── template.ts      # Default tokens
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

## Scripts

```bash
bun dev          # Development server
bun run build    # Production build
bun run lint     # Lint with Biome
bun run format   # Format with Biome
bun run typecheck# Type check
bun run preview  # Preview production build
```

## Documentation

- [Architecture Documentation](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [User Guide](docs/user-guide.md)
- [Full README](docs/README.md)

## Security & Privacy

- **No server uploads** - All processing happens in the browser
- **No external API calls** - Your documents stay on your device
- **No tracking** - No analytics or telemetry

## Browser Support

Chrome 90+, Firefox 90+, Safari 14+, Edge 90+

## Adding Components

This project uses shadcn/ui. To add components:

```bash
npx shadcn@latest add button
```

Components are placed in `src/components/ui/` and can be imported as:

```tsx
import { Button } from "@/components/ui/button"
```

## License

Private and proprietary. All rights reserved.

---

Built with React + Vite + docx-js
