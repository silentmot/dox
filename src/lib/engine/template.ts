import type { TemplateTokens } from "./types"

/**
 * Default template tokens (EcoSol RFP-SWMS style).
 * Source: rfp-swms-template.xml
 */
export const DEFAULT_TEMPLATE: TemplateTokens = {
  page: {
    width: 12240,
    height: 15840,
    margin: {
      top: 1440,
      right: 1440,
      bottom: 1440,
      left: 1440,
      header: 0,
      footer: 720,
      gutter: 0,
    },
    contentWidth: 9360,
  },
  fonts: { major: "Tw Cen MT", minor: "Tw Cen MT", bulletFont: "Arial" },
  colors: {
    accent1: "3494BA",
    accent1ShadeBF: "276E8B",
    text1TintBF: "404040",
    text1TintA6: "595959",
    text1Tint80: "7F7F7F",
    text1TintD9: "262626",
    bandFill: "F2F2F2",
    headerFill: "F2F2EF",
    tableSeparator: "7F7F7F",
    black: "000000",
    white: "FFFFFF",
  },
  defaults: { fontSize: 22, spacingAfter: 160, lineSpacing: 259 },
  table: {
    cellPadding: 100,
    headerBorderSize: 6,
    firstColBorderSize: 4,
    borderColor: "7F7F7F",
    bandFill: "F2F2F2",
    headerAlign: "center",
    headerBold: true,
    cellFontSize: 20,
    headerRowHeight: 360,
    dataRowHeight: 320,
  },
} as const
