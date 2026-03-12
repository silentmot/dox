import { type DragEvent, useCallback, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
type View = "home" | "convert"
type Step = "template" | "markdown" | "logo" | "generate"

const STEPS: { id: Step; num: string; label: string; desc: string }[] = [
  {
    id: "template",
    num: "01",
    label: "Template",
    desc: "Upload .docx/.dotx to extract design tokens, or select a saved template",
  },
  {
    id: "markdown",
    num: "02",
    label: "Content",
    desc: "Upload your .md file with the document content to convert",
  },
  {
    id: "logo",
    num: "03",
    label: "Logo",
    desc: "Select or upload a PNG logo for the document header",
  },
  {
    id: "generate",
    num: "04",
    label: "Generate",
    desc: "Build and download your styled .docx document",
  },
]

// ---------------------------------------------------------------------------
// Dropzone Component
// ---------------------------------------------------------------------------
function Dropzone({
  accept,
  label,
  hint,
  onFiles,
  file,
}: {
  accept: string
  label: string
  hint: string
  onFiles: (files: FileList) => void
  file: File | null
}) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDrag(true)
  }, [])
  const onDragLeave = useCallback(() => setDrag(false), [])
  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDrag(false)
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
    },
    [onFiles]
  )

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative flex min-h-35 cursor-pointer flex-col items-center justify-center
        rounded-lg border-2 border-dashed transition-all duration-200
        ${
          drag
            ? "border-(--accent-blue) bg-(--accent-blue)/5"
            : file
              ? "border-(--accent-green) bg-(--accent-green)/5"
              : "border-border hover:border-foreground/30 hover:bg-muted/50"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      {file ? (
        <div className="flex flex-col items-center gap-1 px-4 text-center">
          <div className="text-xs font-medium text-(--accent-green)">Ready</div>
          <div className="text-sm font-medium">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 px-4 text-center">
          <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </div>
          <div className="text-xs text-muted-foreground/70">{hint}</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { theme, setTheme } = useTheme()
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-foreground text-background text-[10px] font-bold tracking-tight">
            dx
          </div>
          <span className="text-sm font-semibold tracking-tight">dox</span>
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("home")}
            className={
              view === "home" ? "text-foreground" : "text-muted-foreground"
            }
          >
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("convert")}
            className={
              view === "convert" ? "text-foreground" : "text-muted-foreground"
            }
          >
            Convert
          </Button>
          <div className="mx-2 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
              {theme === "dark" ? (
                <circle cx="8" cy="8" r="4" />
              ) : (
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 010-13v13z" />
              )}
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Accent glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-150 rounded-full bg-(--accent-blue)/8 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-(--accent-green) animate-pulse" />
            Document Engineering Toolkit
          </div>

          {/* Headline */}
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Markdown to DOCX,
            </span>
            <br />
            <span className="bg-linear-to-r from-(--accent-blue) to-(--accent-green) bg-clip-text text-transparent">
              pixel-precise.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Extract design systems from existing Word documents. Upload markdown
            content. Generate production-grade .docx files with inherited
            styling, headers, footers, and table formatting. Everything runs in
            your browser.
          </p>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-3">
            <Button size="lg" onClick={onStart}>
              Start Converting
              <svg
                className="size-3.5 transition-transform group-hover/button:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open("https://github.com/DvoiD", "_blank")}
            >
              View Source
            </Button>
          </div>
        </div>

        {/* Workflow preview */}
        <div className="mt-20 grid gap-px rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4 overflow-hidden">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="bg-background p-5 flex flex-col gap-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-(--accent-blue)">
                  {step.num}
                </span>
                <span className="text-xs font-semibold">{step.label}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Features Section
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    title: "Template Extraction",
    desc: "Upload any .docx or .dotx file. The engine unpacks the ZIP archive, parses styles.xml, theme1.xml, headers, and footers to produce a reusable design-system manifest.",
    mono: "JSZip + DOMParser",
  },
  {
    title: "Markdown Parsing",
    desc: "Tokenizes headings, tables, ordered/unordered lists, inline formatting (bold, italic, code), and horizontal rules into a typed AST.",
    mono: "Zero dependencies",
  },
  {
    title: "Style Injection",
    desc: "Maps each AST node to docx-js constructors using template tokens: font scheme, color scheme, table style, numbering config, header/footer layout.",
    mono: "OOXML compliant",
  },
  {
    title: "Browser-Native",
    desc: "The full pipeline runs client-side. No server, no uploads to third parties. Your documents stay on your machine.",
    mono: "Privacy-first",
  },
]

function Features() {
  return (
    <section className="border-t border-border/50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-1">
          <span className="font-mono text-xs text-(--accent-blue)">
            Architecture
          </span>
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        </div>
        <div className="grid gap-px rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 overflow-hidden">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-background p-6 flex flex-col gap-2 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {f.mono}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Converter View
// ---------------------------------------------------------------------------
function ConverterView() {
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [mdFile, setMdFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const canGenerate = mdFile !== null

  const handleGenerate = useCallback(async () => {
    if (!mdFile) return
    setGenerating(true)
    setStatus("Reading markdown...")

    try {
      const mdText = await mdFile.text()
      setStatus(
        `Parsed ${mdText.split("\n").length} lines. Importing engine...`
      )

      // Dynamic import to keep initial bundle lean
      const [
        { parseMarkdown },
        { mapToDocx },
        { buildDocument },
        { DEFAULT_TEMPLATE },
      ] = await Promise.all([
        import("@/lib/engine/parser"),
        import("@/lib/engine/mapper"),
        import("@/lib/engine/builder"),
        import("@/lib/engine/template"),
      ])

      // Extract template if uploaded, otherwise use default
      let tokens = DEFAULT_TEMPLATE
      if (templateFile) {
        setStatus("Extracting template from .docx...")
        const { extractTemplate } = await import("@/lib/engine/extractor")
        const extracted = await extractTemplate(templateFile)
        if (extracted) tokens = extracted
      }

      // Read logo if uploaded
      let logoData: ArrayBuffer | null = null
      if (logoFile) {
        setStatus("Reading logo...")
        logoData = await logoFile.arrayBuffer()
      }

      setStatus("Parsing markdown AST...")
      const ast = parseMarkdown(mdText)

      setStatus(`Mapping ${ast.length} nodes to document elements...`)
      const elements = mapToDocx(ast, tokens)

      setStatus("Building document...")
      const buffer = await buildDocument(elements, tokens, logoData)

      // Download
      setStatus("Downloading...")
      const blob = new Blob([Uint8Array.from(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = mdFile.name.replace(/\.md$/i, ".docx")
      a.click()
      URL.revokeObjectURL(url)
      setStatus("Done.")
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }, [mdFile, templateFile, logoFile])

  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-1">
          <span className="font-mono text-xs text-(--accent-blue)">
            Pipeline
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Convert Document
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload your files and generate a styled .docx
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <span className="font-mono text-(--accent-blue)">01</span>{" "}
              Template
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Dropzone
              accept=".docx,.dotx"
              label="Upload .docx / .dotx"
              hint="Extract design tokens from an existing document"
              onFiles={(f) => setTemplateFile(f[0] ?? null)}
              file={templateFile}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <span className="font-mono text-(--accent-blue)">02</span>{" "}
              Markdown
            </label>
            <Dropzone
              accept=".md"
              label="Upload .md file"
              hint="Your document content in markdown format"
              onFiles={(f) => setMdFile(f[0] ?? null)}
              file={mdFile}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <span className="font-mono text-(--accent-blue)">03</span> Logo
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Dropzone
              accept=".png"
              label="Upload .png logo"
              hint="Appears in the document header, right-aligned"
              onFiles={(f) => setLogoFile(f[0] ?? null)}
              file={logoFile}
            />
          </div>
        </div>

        {/* Generate bar */}
        <div className="mt-8 flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-5 py-3">
          <div className="text-xs text-muted-foreground">
            {status ??
              (canGenerate
                ? "Ready to generate"
                : "Upload a markdown file to begin")}
          </div>
          <Button
            size="lg"
            disabled={!canGenerate || generating}
            onClick={handleGenerate}
          >
            {generating ? "Generating..." : "Generate .docx"}
          </Button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex size-4 items-center justify-center rounded bg-foreground/10 text-[8px] font-bold">
            dx
          </div>
          dox -- Document Engineering Toolkit
        </div>
        <div className="font-mono text-[10px] text-muted-foreground/50">
          OOXML / docx-js / JSZip / client-side
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// App Shell
// ---------------------------------------------------------------------------
export function App() {
  const [view, setView] = useState<View>("home")

  return (
    <div className="flex min-h-svh flex-col">
      <Header view={view} setView={setView} />
      <main className="flex-1">
        {view === "home" ? (
          <>
            <Hero onStart={() => setView("convert")} />
            <Features />
          </>
        ) : (
          <ConverterView />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
