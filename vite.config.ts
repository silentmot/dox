import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""
const isUserOrOrgPagesRepo = repositoryName.toLowerCase().endsWith(".github.io")

export default defineConfig({
  base: process.env.GITHUB_ACTIONS
    ? isUserOrOrgPagesRepo
      ? "/"
      : repositoryName
        ? `/${repositoryName}/`
        : "/"
    : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
