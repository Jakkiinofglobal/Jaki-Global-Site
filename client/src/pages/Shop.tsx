import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageComponent, PageConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";

/** Proper CSS background-image */
function bg(urlStr?: string): React.CSSProperties {
  if (!urlStr) return {};
  const m = urlStr.match(/url\((.*)\)/i);
  const raw = m ? m[1].replace(/^['"]|['"]$/g, "") : urlStr;
  return { backgroundImage: `url(${raw})`, backgroundSize: "cover", backgroundPosition: "center" };
}

function RenderComp(c: PageComponent) {
  const style: React.CSSProperties = { ...(c.style ?? {}) };
  switch (c.type) {
    case "header":
      return (
        <div key={c.id} style={style}>
          <h1
            style={{
              fontFamily: c.style.fontFamily,
              fontSize: (c.style.fontSize as any) || "32px",
              fontWeight: (c.style.fontWeight as any) || "700",
            }}
          >
            {c.content || "Header Text"}
          </h1>
        </div>
      );
    case "text":
      return (
        <div key={c.id} style={style}>
          <p style={{ fontFamily: c.style.fontFamily }}>{c.content || ""}</p>
        </div>
      );
    case "image":
      return (
        <div key={c.id} style={style}>
          {c.content ? (
            <img
              src={c.content}
              alt="Image"
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
              draggable={false}
            />
          ) : null}
        </div>
      );
    case "background": {
      const s: React.CSSProperties = c.style?.backgroundImage
        ? { ...style, ...bg(c.style.backgroundImage), minHeight: (c.style?.height as any) || "200px" }
        : { ...style, minHeight: (c.style?.height as any) || "200px" };
      return (
        <section key={c.id} style={s}>
          <div className="p-8">{c.content || ""}</div>
        </section>
      );
    }
    case "button":
      return (
        <div key={c.id} style={style}>
          <button
            style={{
              fontFamily: c.style.fontFamily,
              padding: (c.style.padding as any) || ("12px 24px" as any),
              borderRadius: "6px",
              border: "1px solid currentColor",
              cursor: "pointer",
            }}
            onClick={(e) => e.preventDefault()}
          >
            {c.content || "Button"}
          </button>
        </div>
      );
    case "productGrid":
      return (
        <div key={c.id} style={style}>
          <ProductGrid />
        </div>
      );
    default:
      return null;
  }
}

export default function Shop() {
  const { data: pages } = useQuery<PageConfig[]>({ queryKey: ["/api/pages"] });
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  useEffect(() => {
    if (pages && pages.length > 0 && !currentPageId) setCurrentPageId(pages[0].id);
  }, [pages, currentPageId]);

  const current = useMemo(() => pages?.find((p) => p.id === currentPageId), [pages, currentPageId]);
  const comps = useMemo(
    () =>
      (current?.components as PageComponent[] | undefined)?.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ||
      [],
    [current]
  );

  // first background = page backdrop
  const bgComp = comps.find((c) => c.type === "background") || null;
  const content = bgComp ? comps.filter((c) => c.id !== bgComp.id) : comps;

  const canvasBg: React.CSSProperties = bgComp
    ? {
        backgroundColor: bgComp.style?.backgroundColor || "transparent",
        ...bg(bgComp.style?.backgroundImage),
        padding: (bgComp.style?.padding as any) || "0",
        minHeight: "100%",
      }
    : { minHeight: "100%" };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header with nav */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-background/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto">
          <strong className="whitespace-nowrap">Jaki Global</strong>
          <nav className="flex items-center gap-2">
            {pages?.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === currentPageId ? "default" : "outline"}
                onClick={() => setCurrentPageId(p.id)}
                className="whitespace-nowrap"
              >
                {p.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="w-full">
          <div className="max-w-6xl mx-auto min-h-screen p-6 space-y-4" style={canvasBg}>
            {content.length === 0 ? (
              <div className="text-center text-muted-foreground py-24">This page is empty.</div>
            ) : (
              content.map((c) => <React.Fragment key={c.id}>{RenderComp(c)}</React.Fragment>)
            )}
          </div>
        </div>
      </main>

      <footer className="bg-black text-white text-center py-5">
        <p className="text-sm">
          Contact: <a href="mailto:jakiinfo.global@gmail.com" className="underline">jakiinfo.global@gmail.com</a>
        </p>
        <p className="text-sm">Please donate: <span className="font-bold">$26KG1</span></p>
        <p className="text-xs opacity-70">© 2025 Jaki Global. All rights reserved.</p>
      </footer>
    </div>
  );
}
