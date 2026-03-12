# Architecture Documentation

This document provides a detailed technical overview of the dox document engineering toolkit architecture.

## System Overview

dox is a client-side document conversion pipeline that transforms markdown content into styled DOCX files using design tokens extracted from Word templates.

## High-Level Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[React UI Components]
        Theme[Theme Provider]
        Dropzone[File Dropzone]
    end

    subgraph "Processing Pipeline"
        direction TB
        A[Input Files] --> B{Template?}
        B -->|Yes| C[Extractor]
        B -->|No| D[Default Template]
        C --> E[Template Tokens]
        D --> E

        F[Markdown File] --> G[Parser]
        G --> H[AST Nodes]

        E --> I[Mapper]
        H --> I

        J[Logo PNG] --> K[ArrayBuffer]
        K --> I

        I --> L[Builder]
        L --> M[DOCX Buffer]
        M --> N[Download]
    end

    subgraph "Core Engine"
        C
        G
        I
        L
    end

    UI --> A
    UI --> F
    UI --> J
    Theme --> UI
```

## Component Architecture

```mermaid
graph LR
    subgraph "App Shell"
        App[App.tsx]
        Header
        Footer
        Main[Main Content]
    end

    subgraph "Views"
        Home[Home View]
        Convert[Convert View]
    end

    subgraph "Home Components"
        Hero
        Features
    end

    subgraph "Convert Components"
        Dropzone1[Template Dropzone]
        Dropzone2[Markdown Dropzone]
        Dropzone3[Logo Dropzone]
        GenerateBar
    end

    App --> Header
    App --> Main
    App --> Footer

    Main --> Home
    Main --> Convert

    Home --> Hero
    Home --> Features

    Convert --> Dropzone1
    Convert --> Dropzone2
    Convert --> Dropzone3
    Convert --> GenerateBar
```

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Input Stage"
        TPL[Template .docx/.dotx]
        MD[Markdown .md]
        LOGO[Logo .png]
    end

    subgraph "Extraction Stage"
        ZIP[JSZip Unpack]
        XML1[word/styles.xml]
        XML2[word/theme/theme1.xml]
        XML3[word/document.xml]
        PARSE[DOMParser]
        TOKENS[TemplateTokens]
    end

    subgraph "Parsing Stage"
        LINES[Text Lines]
        TOKENIZE[Tokenizer]
        AST[AST Nodes]
    end

    subgraph "Mapping Stage"
        MAP[mapToDocx]
        ELEMS[docx Elements]
    end

    subgraph "Building Stage"
        BUILD[buildDocument]
        PACK[Packer]
        BLOB[Blob]
        DL[Download]
    end

    TPL --> ZIP
    ZIP --> XML1 & XML2 & XML3
    XML1 & XML2 & XML3 --> PARSE
    PARSE --> TOKENS

    MD --> LINES
    LINES --> TOKENIZE
    TOKENIZE --> AST

    TOKENS --> MAP
    AST --> MAP
    LOGO --> MAP

    MAP --> ELEMS
    ELEMS --> BUILD
    TOKENS --> BUILD
    LOGO --> BUILD

    BUILD --> PACK
    PACK --> BLOB
    BLOB --> DL
```

## Engine Module Sequence

```mermaid
sequenceDiagram
    participant User
    participant UI as App.tsx
    participant Parser
    participant Extractor
    participant Mapper
    participant Builder

    User->>UI: Upload Template (optional)
    UI->>Extractor: extractTemplate(file)
    Extractor->>Extractor: JSZip.loadAsync()
    Extractor->>Extractor: Parse XML files
    Extractor-->>UI: TemplateTokens

    User->>UI: Upload Markdown
    UI->>Parser: parseMarkdown(text)
    Parser->>Parser: Tokenize lines
    Parser->>Parser: Build AST
    Parser-->>UI: AstNode[]

    User->>UI: Upload Logo (optional)
    UI->>UI: Read as ArrayBuffer

    User->>UI: Click Generate
    UI->>Mapper: mapToDocx(ast, tokens)
    Mapper-->>UI: (Paragraph | Table)[]

    UI->>Builder: buildDocument(elements, tokens, logo)
    Builder->>Builder: Create Document
    Builder->>Builder: Add Header/Footer
    Builder->>Builder: Configure Styles
    Builder-->>UI: Uint8Array

    UI->>User: Download .docx
```

## Type System

```mermaid
classDiagram
    class AstNode {
        <<union>>
        HeadingNode
        ParagraphNode
        TableNode
        BulletListNode
        OrderedListNode
        PageBreakNode
    }

    class HeadingNode {
        +type: "heading"
        +level: 1..4
        +text: string
    }

    class ParagraphNode {
        +type: "paragraph"
        +text: string
    }

    class TableNode {
        +type: "table"
        +rows: string[][]
    }

    class BulletListNode {
        +type: "bulletList"
        +items: string[]
    }

    class OrderedListNode {
        +type: "orderedList"
        +items: string[]
    }

    class PageBreakNode {
        +type: "pageBreak"
    }

    class TemplateTokens {
        +page: PageLayout
        +fonts: FontScheme
        +colors: ColorScheme
        +defaults: DocumentDefaults
        +table: TableStyle
    }

    class PageLayout {
        +width: number
        +height: number
        +margin: PageMargins
        +contentWidth: number
    }

    class ColorScheme {
        +accent1: string
        +accent1ShadeBF: string
        +text1TintBF: string
        +bandFill: string
        +headerFill: string
        +tableSeparator: string
    }

    class FontScheme {
        +major: string
        +minor: string
        +bulletFont: string
    }

    class TableStyle {
        +cellPadding: number
        +headerBorderSize: number
        +firstColBorderSize: number
        +borderColor: string
        +bandFill: string
        +headerAlign: string
        +headerBold: boolean
    }

    AstNode <|-- HeadingNode
    AstNode <|-- ParagraphNode
    AstNode <|-- TableNode
    AstNode <|-- BulletListNode
    AstNode <|-- OrderedListNode
    AstNode <|-- PageBreakNode

    TemplateTokens --> PageLayout
    TemplateTokens --> ColorScheme
    TemplateTokens --> FontScheme
    TemplateTokens --> TableStyle
```

## Module Dependencies

```mermaid
graph BT
    subgraph "Engine Core"
        types[types.ts]
        template[template.ts]
        parser[parser.ts]
        extractor[extractor.ts]
        mapper[mapper.ts]
        builder[builder.ts]
    end

    subgraph "External Dependencies"
        docx[docx]
        jszip[JSZip]
    end

    subgraph "Application"
        app[App.tsx]
    end

    types --> parser
    types --> extractor
    types --> mapper
    types --> builder

    template --> extractor
    template --> mapper
    template --> builder

    parser --> mapper

    extractor --> mapper
    extractor --> builder

    mapper --> builder

    docx --> mapper
    docx --> builder
    jszip --> extractor

    app --> parser
    app --> extractor
    app --> mapper
    app --> builder
    app --> template
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Home: App loads

    state Home {
        [*] --> Hero
        Hero --> Features: Scroll
        Features --> Hero: Scroll up
    }

    state Convert {
        [*] --> Idle
        Idle --> TemplateUploaded: Upload template
        Idle --> MdUploaded: Upload markdown
        Idle --> LogoUploaded: Upload logo

        TemplateUploaded --> ReadyToGenerate: Has markdown
        MdUploaded --> ReadyToGenerate: Always
        LogoUploaded --> ReadyToGenerate: Has markdown

        ReadyToGenerate --> Generating: Click generate
        Generating --> ReadingMD: Read markdown
        ReadingMD --> Parsing: Parse AST
        Parsing --> Extracting: Extract template
        Extracting --> Mapping: Map to docx
        Mapping --> Building: Build document
        Building --> Downloading: Pack & download
        Downloading --> Done: Complete

        Generating --> Error: Exception
        Error --> Idle: Reset
        Done --> Idle: Reset
    }

    Home --> Convert: Start Converting
    Convert --> Home: Navigate home
```

## File Processing Pipeline

### Template Extraction

```mermaid
flowchart LR
    subgraph "ZIP Archive"
        DOCX[.docx/.dotx]
    end

    subgraph "JSZip"
        UNPACK[Unpack Archive]
    end

    subgraph "XML Files"
        STYLES[word/styles.xml]
        THEME[word/theme/theme1.xml]
        DOCUMENT[word/document.xml]
    end

    subgraph "DOMParser"
        PARSE1[Parse styles]
        PARSE2[Parse theme]
        PARSE3[Parse document]
    end

    subgraph "Extraction"
        COLORS[Color Scheme]
        FONTS[Font Scheme]
        PAGE[Page Layout]
        DEFAULTS[Document Defaults]
    end

    DOCX --> UNPACK
    UNPACK --> STYLES & THEME & DOCUMENT
    STYLES --> PARSE1
    THEME --> PARSE2
    DOCUMENT --> PARSE3
    PARSE2 --> COLORS & FONTS
    PARSE3 --> PAGE
    PARSE1 --> DEFAULTS
    COLORS & FONTS & PAGE & DEFAULTS --> TOKENS[TemplateTokens]
```

### Markdown Parsing

```mermaid
flowchart TD
    subgraph "Input"
        MD[Markdown Text]
    end

    subgraph "Line Processing"
        SPLIT[Split by newlines]
        ITER[Iterate lines]
    end

    subgraph "Pattern Matching"
        HEADING{Heading?}
        TABLE{Table?}
        BULLET{Bullet list?}
        ORDERED{Ordered list?}
        BREAK{Page break?}
        PARA{Paragraph}
    end

    subgraph "AST Nodes"
        HNODE[HeadingNode]
        TNODE[TableNode]
        BNODE[BulletListNode]
        ONODE[OrderedListNode]
        PBNODE[PageBreakNode]
        PNODE[ParagraphNode]
    end

    MD --> SPLIT --> ITER
    ITER --> HEADING
    HEADING -->|Yes| HNODE
    HEADING -->|No| TABLE
    TABLE -->|Yes| TNODE
    TABLE -->|No| BULLET
    BULLET -->|Yes| BNODE
    BULLET -->|No| ORDERED
    ORDERED -->|Yes| ONODE
    ORDERED -->|No| BREAK
    BREAK -->|Yes| PBNODE
    BREAK -->|No| PARA
    PARA --> PNODE

    HNODE & TNODE & BNODE & ONODE & PBNODE & PNODE --> AST[AstNode[]]
```

## Styling System

### CSS Architecture

```mermaid
graph TD
    subgraph "CSS Sources"
        TAILWIND[Tailwind CSS 4]
        ANIMATE[tw-animate-css]
        SHADCN[shadcn/tailwind.css]
        FONT[DM Sans Variable]
        CUSTOM[index.css]
    end

    subgraph "CSS Variables"
        LIGHT[Light Theme]
        DARK[Dark Theme]
        CUSTOM_VARS[Custom Properties]
    end

    subgraph "Output"
        BUNDLE[CSS Bundle]
    end

    TAILWIND --> BUNDLE
    ANIMATE --> BUNDLE
    SHADCN --> BUNDLE
    FONT --> BUNDLE
    CUSTOM --> BUNDLE

    CUSTOM --> LIGHT & DARK
    LIGHT --> CUSTOM_VARS
    DARK --> CUSTOM_VARS
    CUSTOM_VARS --> BUNDLE
```

### Theme System

```mermaid
graph LR
    subgraph "Theme Provider"
        CONTEXT[React Context]
        STORAGE[localStorage]
        SYSTEM[System Preference]
    end

    subgraph "Theme Values"
        LIGHT_VAL[light]
        DARK_VAL[dark]
        SYSTEM_VAL[system]
    end

    subgraph "Application"
        ROOT[document.documentElement]
        CLASS[.dark class]
    end

    CONTEXT --> STORAGE
    SYSTEM --> CONTEXT

    STORAGE --> LIGHT_VAL & DARK_VAL & SYSTEM_VAL

    CONTEXT --> ROOT
    ROOT --> CLASS

    CLASS -->|Applied| DARK_MODE[Dark Mode Styles]
    CLASS -->|Not applied| LIGHT_MODE[Light Mode Styles]
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        LOCAL[Local Machine]
        VITE[Vite Dev Server]
    end

    subgraph "CI/CD"
        GH[GitHub]
        ACTIONS[GitHub Actions]
    end

    subgraph "Production"
        PAGES[GitHub Pages]
        STATIC[Static Files]
    end

    subgraph "Users"
        BROWSER[User Browser]
    end

    LOCAL --> VITE
    LOCAL --> GH

    GH --> ACTIONS
    ACTIONS --> BUILD[Build Process]
    BUILD --> DEPLOY[Deploy]
    DEPLOY --> PAGES

    PAGES --> STATIC
    STATIC --> BROWSER
```

## Performance Considerations

### Code Splitting

```mermaid
graph TD
    subgraph "Initial Bundle"
        MAIN[main.tsx]
        APP[App.tsx]
        UI[UI Components]
        CSS[Styles]
    end

    subgraph "Dynamic Imports"
        PARSER[parser.ts]
        MAPPER[mapper.ts]
        BUILDER[builder.ts]
        EXTRACTOR[extractor.ts]
    end

    subgraph "External"
        DOCX_LIB[docx library]
        JSZIP_LIB[JSZip library]
    end

    MAIN --> APP --> UI & CSS

    APP -.->|Dynamic import| PARSER
    APP -.->|Dynamic import| MAPPER
    APP -.->|Dynamic import| BUILDER
    APP -.->|Dynamic import| EXTRACTOR

    MAPPER --> DOCX_LIB
    BUILDER --> DOCX_LIB
    EXTRACTOR --> JSZIP_LIB
```

### Bundle Size Optimization

| Strategy | Implementation |
|----------|----------------|
| Dynamic Imports | Engine modules loaded on-demand |
| Tree Shaking | Vite automatic optimization |
| CSS Purging | Tailwind CSS 4 built-in |
| Minification | Vite production build |

## Security Model

```mermaid
graph TD
    subgraph "Browser Sandbox"
        APP[dox Application]
        FS[File System API]
        STORAGE1[localStorage]
    end

    subgraph "Data Flow"
        UPLOAD[User Upload]
        PROCESS[Client Processing]
        OUTPUT[Client Download]
    end

    subgraph "Protected"
        SERVER[(No Server)]
        NETWORK[(No Network Calls)]
        TRACKING[(No Tracking)]
    end

    UPLOAD --> APP
    APP --> PROCESS
    PROCESS --> OUTPUT

    APP --> FS & STORAGE1

    APP -.-x SERVER
    APP -.-x NETWORK
    APP -.-x TRACKING
```

## Error Handling

```mermaid
flowchart TD
    START[Operation Start]
    TRY[Try Block]
    SUCCESS{Success?}
    ERROR[Error Caught]
    LOG[Console Error]
    RETURN_NULL[Return null]
    PROPAGATE[Propagate to UI]
    USER_MSG[User Error Message]

    START --> TRY
    TRY --> SUCCESS
    SUCCESS -->|Yes| DONE[Complete]
    SUCCESS -->|No| ERROR
    ERROR --> LOG
    LOG --> RETURN_NULL
    RETURN_NULL --> PROPAGATE
    PROPAGATE --> USER_MSG
```

---

**Next:** [API Reference](./api-reference.md) | [User Guide](./user-guide.md)
