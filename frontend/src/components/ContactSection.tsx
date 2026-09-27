const LINKS = [
  {
    label: "email",
    value: "aimantariqsarwar@gmail.com",
    href: "mailto:aimantariqsarwar@gmail.com",
  },
  {
    label: "github",
    value: "github.com/aim-t",
    href: "https://github.com/aim-t",
  },
  {
    label: "linkedin",
    value: "linkedin.com/in/aiman-tariq-sarwar",
    href: "https://linkedin.com/in/aiman-tariq-sarwar",
  },
];

export function ContactSection() {
  return (
    <section className="text-sm">
      <p className="text-accent text-xs">visitor@aimantariq:~$ cat contact.md</p>
      <div className="border-border bg-panel mt-2 rounded-lg border p-4">
        <div className="text-fg-dim">
          <span className="text-accent">{"//"}</span> get in touch
        </div>
        <p className="text-fg-dim mt-2 leading-relaxed">
          Based in Gyor, Hungary, and currently looking for full-stack or AI/ML engineering roles,
          including internships and trainee positions, in Gyor and nearby areas in Hungary and
          Europe.
        </p>
        <div className="border-border mt-4 space-y-2 border-t border-dashed pt-4">
          {LINKS.map((link) => (
            <div key={link.label}>
              <span className="text-accent">{"//"}</span>{" "}
              <span className="text-fg-dim">{link.label}</span>{" "}
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-fg hover:text-accent underline decoration-dotted underline-offset-4 transition-colors"
              >
                {link.value}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
