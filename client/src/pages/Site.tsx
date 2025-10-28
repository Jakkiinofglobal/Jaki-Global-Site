// client/src/pages/Site.tsx
import { useQuery } from "@tanstack/react-query";
import { PageConfig, PageComponent } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ProductGrid } from "@/components/ProductGrid";

function renderComponent(comp: PageComponent) {
  const style: React.CSSProperties = {
    ...comp.style,
    position: "relative",
  };

  switch (comp.type) {
    case "header":
      return (
        <div key={comp.id} style={style}>
          <h1
            style={{
              fontFamily: comp.style.fontFamily,
              fontSize: comp.style.fontSize || "32px",
              fontWeight: (comp.style.fontWeight as any) || "700",
            }}
          >
            {comp.content || "Header Text"}
          </h1>
        </div>
      );

    case "text":
      return (
        <div key={comp.id} style={style}>
          <p style={{ fontFamily: comp.style.fontFamily }}>
            {comp.content || "Text content goes here..."}
          </p>
        </div>
      );

    case "image":
      return (
        <div key={comp.id} style={style}>
          {comp.content ? (
            <img
              src={comp.content}
              alt="Image"
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          ) : (
            <div className="bg-muted flex items-center justify-center p-8 rounded">
              <p className="text-muted-foreground text-sm">No image set</p>
            </div>
          )}
        </div>
      );

    case "background": {
      const bgStyle: React.CSSProperties = comp.style.backgroundImage
        ? {
            backgroundImage: `url(${comp.style.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : {};
      return (
        <section key={comp.id} style={{ ...style, ...bgStyle, minHeight: "200px" }}>
          <div className="p-8">
            {comp.content || ""}
          </div>
        </section>
      );
    }

    case "button":
      return (
        <div key={comp.id} style={style}>
          <button
            style={{
              fontFamily: comp.style.fontFamily,
              padding: (comp.style.padding as any) || "12px 24px",
              borderRadius: "6px",
              border: "1px solid currentColor",
            }}
          >
            {comp.content || "Button"}
          </button>
        </div>
      );

    case "productGrid":
      return (
        <div key={comp.id} style={style}>
          <ProductGrid />
        </div>
      );

    default:
      return null;
  }
}

export default function Site() {
  const { data: pages, isLoading } = useQuery<PageConfig[]>({
    queryKey: ["/api/pages"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  // Pick a “Home” page if it exists, else first page.
  const home =
    pages?.find((p) => p.name?.toLowerCase() === "home" || p.name?.toLowerCase() === "site") ??
    pages?.[0];

  if (!home || !home.components || (Array.isArray(home.components) && home.components.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">This page is empty.</h2>
          <p className="text-muted-foreground">
            Add content in the builder and click Save to publish.
          </p>
        </Card>
      </div>
    );
  }

  const ordered = [...(home.components as PageComponent[])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {ordered.map(renderComponent)}
      </div>

      <footer className="mt-10 bg-[#0d0d0d] text-white text-center p-5">
        <p className="m-1">
          <strong>Contact:</strong>{" "}
          <a href="mailto:jakiinfo.global@gmail.com" className="text-sky-400">
            jakiinfo.global@gmail.com
          </a>
        </p>
        <p className="m-1">
          <strong>Please donate:</strong>{" "}
          <span className="font-bold text-red-400">$26KG1</span>
        </p>
        <p className="m-1 opacity-70 text-sm">© 2025 Jaki Global. All rights reserved.</p>
      </footer>
    </main>
  );
}
