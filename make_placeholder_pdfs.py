#!/usr/bin/env python3
"""
Generate lightweight multi-page placeholder PDFs into public/pdfs/ so the near-fullscreen
PDF reader has real, scrollable content while iterating on the UI. Pure stdlib — no deps.

Ryan replaces each file by dropping his real PDF at the SAME path (public/pdfs/<name>.pdf);
no code change needed. Re-run this anytime to regenerate the placeholders.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "public", "pdfs")

DOCS = {
    "biography.pdf": "Biography",
    "resume.pdf": "Resume",
    "portfolio.pdf": "Portfolio",
    "evolution.pdf": "Professional Evolution",
}

BODY = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def make_pdf(path: str, title: str, n_pages: int = 4, lines_per_page: int = 20):
    font_obj = 3
    content_start = 4
    page_start = content_start + n_pages
    total = page_start + n_pages - 1

    # page text
    pages = []
    for p in range(n_pages):
        lines = [f"{title}  -  page {p + 1} of {n_pages}"]
        if p == 0:
            lines.append(f"PLACEHOLDER. Replace public/pdfs/{os.path.basename(path)} with your real PDF.")
        for _ in range(lines_per_page):
            lines.append(BODY)
        pages.append(lines)

    # content streams (relative Td line moves, accumulate downward)
    streams = []
    for lines in pages:
        cmds = ["BT", "/F1 22 Tf", "60 760 Td", f"({esc(lines[0])}) Tj", "/F1 12 Tf", "0 -34 Td", f"({esc(lines[1])}) Tj"]
        for ln in lines[2:]:
            cmds += ["0 -16 Td", f"({esc(ln)}) Tj"]
        cmds.append("ET")
        streams.append("\n".join(cmds))

    bodies = {}
    kids = " ".join(f"{page_start + i} 0 R" for i in range(n_pages))
    bodies[1] = "<< /Type /Catalog /Pages 2 0 R >>"
    bodies[2] = f"<< /Type /Pages /Kids [{kids}] /Count {n_pages} >>"
    bodies[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    for i, cs in enumerate(streams):
        bodies[content_start + i] = ("stream", cs)
    for i in range(n_pages):
        bodies[page_start + i] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 {font_obj} 0 R >> >> /Contents {content_start + i} 0 R >>"
        )

    out = bytearray(b"%PDF-1.4\n")
    offsets = {}
    for num in range(1, total + 1):
        offsets[num] = len(out)
        b = bodies[num]
        if isinstance(b, tuple):
            cs = b[1].encode("latin-1")
            out += f"{num} 0 obj\n<< /Length {len(cs)} >>\nstream\n".encode("latin-1")
            out += cs + b"\nendstream\nendobj\n"
        else:
            out += f"{num} 0 obj\n{b}\nendobj\n".encode("latin-1")

    xref = len(out)
    out += f"xref\n0 {total + 1}\n".encode("latin-1")
    out += b"0000000000 65535 f \n"
    for num in range(1, total + 1):
        out += f"{offsets[num]:010d} 00000 n \n".encode("latin-1")
    out += f"trailer\n<< /Size {total + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode("latin-1")

    with open(path, "wb") as f:
        f.write(out)


def main():
    os.makedirs(OUT, exist_ok=True)
    for fname, title in DOCS.items():
        make_pdf(os.path.join(OUT, fname), title)
        print("wrote", os.path.join(OUT, fname))


if __name__ == "__main__":
    main()
