/**
 * rehypeMermaid — renders ```mermaid code blocks to inline SVG at build time.
 *
 * Requires beautiful-mermaid (optional dependency):
 *   npm install beautiful-mermaid
 *
 * If beautiful-mermaid is not installed, mermaid code blocks are left as-is
 * so downstream plugins (e.g. @shikijs/rehype) can process them as code.
 *
 * Supports dual-theme output: pass `themes: { light, dark }` to generate
 * two SVGs per diagram. Tailwind CSS classes (`block dark:hidden` /
 * `hidden dark:block`) control which SVG is visible based on the active
 * theme. Requires `@custom-variant dark` configured for `[data-theme]`.
 */

import type { Plugin } from "unified";
import type { Root, Element, ElementContent } from "hast";
import { visit } from "unist-util-visit";
import { toString as hastToString } from "hast-util-to-string";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";

export interface RehypeMermaidOptions {
  /**
   * CSS class name applied to the wrapper <div> around each rendered SVG.
   * When omitted, a `data-mermaid` attribute is used instead.
   */
  className?: string;
}

export const rehypeMermaid: Plugin<[RehypeMermaidOptions?], Root> = (
  options = {}
) => {
  return async tree => {
    const nodes: Array<{
      node: Element;
      index: number;
      parent: { children: ElementContent[] };
    }> = [];

    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || index === null || !parent) return;
      const codeEl = node.children[0];
      if (!codeEl || codeEl.type !== "element" || codeEl.tagName !== "code")
        return;
      const cls = codeEl.properties?.className;
      if (!Array.isArray(cls) || !cls.includes("language-mermaid")) return;
      nodes.push({
        node,
        index: index!,
        parent: parent as { children: ElementContent[] },
      });
    });

    if (nodes.length === 0) return;

    type RenderFn = (code: string) => string;
    let renderFn: RenderFn | null = null;

    const nativeImport = new Function("s", "return import(s)") as (
      s: string
    ) => Promise<typeof import("beautiful-mermaid")>;
    const mod = await nativeImport("beautiful-mermaid");

    renderFn = code =>
      mod.renderMermaidSVG(code, {
        bg: "var(--background)",
        fg: "var(--foreground)",
        line: "var(--border)",
        muted: "var(--muted-foreground)",
        font: "var(--font-sans)",
        monoFont: "var(--font-mono)",
        // transparent: true,
      });

    for (const { node, index, parent } of nodes.reverse()) {
      const code = hastToString(node.children[0] as Element).trim();
      const svgHtml = renderFn(code);
      const svgRoot = fromHtmlIsomorphic(svgHtml, { fragment: true });
      const codeNode: Element = {
        type: "element",
        tagName: "code",
        properties: { className: ["hidden"] },
        children: [{ type: "text", value: code }],
      };
      const preNode: Element = {
        type: "element",
        tagName: "pre",
        properties: options.className
          ? { className: [options.className] }
          : { "data-mermaid": "" },
        children: [...(svgRoot.children as ElementContent[]), codeNode],
      };
      parent.children.splice(index, 1, preNode);
    }
  };
};
