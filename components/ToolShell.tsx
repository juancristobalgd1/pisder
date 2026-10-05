export default function ToolShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 md:px-6">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-3 text-soft">{intro}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
