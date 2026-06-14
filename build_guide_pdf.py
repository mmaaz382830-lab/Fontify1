#!/usr/bin/env python3
"""Generates the Fontify project setup & notes guide as a PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem, Preformatted, PageBreak,
)
from reportlab.lib.enums import TA_LEFT

# ---------------------------------------------------------------------------
# Palette
# ---------------------------------------------------------------------------
INK = colors.HexColor("#0a0a0a")
SUBTLE = colors.HexColor("#525252")
MUTED = colors.HexColor("#737373")
LINE = colors.HexColor("#e5e5e5")
ACCENT = colors.HexColor("#171717")
WARN_BG = colors.HexColor("#fff7ed")
WARN_BAR = colors.HexColor("#ea580c")
DB_BG = colors.HexColor("#eff6ff")
DB_BAR = colors.HexColor("#2563eb")
CODE_BG = colors.HexColor("#0a0a0a")
CODE_FG = colors.HexColor("#e5e5e5")
STEP_BG = colors.HexColor("#f5f5f5")

# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------
ss = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=ss["Title"], fontName="Helvetica-Bold",
                    fontSize=26, leading=30, textColor=INK, spaceAfter=4)
SUB = ParagraphStyle("SUB", parent=ss["Normal"], fontName="Helvetica",
                     fontSize=11, leading=15, textColor=MUTED, spaceAfter=2)
H2 = ParagraphStyle("H2", parent=ss["Heading1"], fontName="Helvetica-Bold",
                    fontSize=16, leading=20, textColor=INK,
                    spaceBefore=18, spaceAfter=6)
H3 = ParagraphStyle("H3", parent=ss["Heading2"], fontName="Helvetica-Bold",
                    fontSize=12.5, leading=16, textColor=INK,
                    spaceBefore=12, spaceAfter=4)
BODY = ParagraphStyle("BODY", parent=ss["Normal"], fontName="Helvetica",
                      fontSize=10, leading=15, textColor=INK, spaceAfter=6,
                      alignment=TA_LEFT)
SMALL = ParagraphStyle("SMALL", parent=ss["Normal"], fontName="Helvetica",
                       fontSize=8.5, leading=12, textColor=MUTED)
BULLET = ParagraphStyle("BULLET", parent=BODY, leftIndent=4, spaceAfter=3)
CODE = ParagraphStyle("CODE", parent=ss["Code"], fontName="Courier",
                      fontSize=8.5, leading=12, textColor=CODE_FG)
CALLOUT = ParagraphStyle("CALLOUT", parent=BODY, fontSize=9.5, leading=14,
                         spaceAfter=4)
CALLOUT_TITLE = ParagraphStyle("CALLOUT_TITLE", parent=BODY,
                               fontName="Helvetica-Bold", fontSize=10,
                               leading=14, spaceAfter=3)

story = []


def rule(space_before=4, space_after=8, color=LINE):
    story.append(Spacer(1, space_before))
    story.append(HRFlowable(width="100%", thickness=0.8, color=color))
    story.append(Spacer(1, space_after))


def bullets(items):
    flow = []
    for it in items:
        flow.append(ListItem(Paragraph(it, BULLET), leftIndent=10,
                             value="•"))
    story.append(ListFlowable(flow, bulletType="bullet", start="•",
                              leftIndent=12))


def code_block(text):
    p = Preformatted(text, CODE)
    t = Table([[p]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def callout(title, paras, bg, bar):
    inner = [Paragraph(title, CALLOUT_TITLE)]
    for p in paras:
        inner.append(Paragraph(p, CALLOUT))
    block = Table([[inner]], colWidths=[166 * mm])
    block.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 3, bar),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(block)
    story.append(Spacer(1, 10))


def step(num, title, paras=None, code=None, items=None):
    badge = Table([[Paragraph(f"<b>{num}</b>", ParagraphStyle(
        "b", parent=BODY, textColor=colors.white, fontSize=11,
        alignment=1, fontName="Helvetica-Bold"))]], colWidths=[9 * mm],
        rowHeights=[9 * mm])
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    head = Table([[badge, Paragraph(title, H3)]],
                 colWidths=[12 * mm, 154 * mm])
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(head)
    story.append(Spacer(1, 3))
    if paras:
        for p in paras:
            story.append(Paragraph(p, BODY))
    if items:
        bullets(items)
    if code:
        code_block(code)
    story.append(Spacer(1, 6))


# ===========================================================================
# COVER / HEADER
# ===========================================================================
story.append(Spacer(1, 6))
story.append(Paragraph("Fontify — Setup &amp; Operations Guide", H1))
story.append(Paragraph(
    "Important behavior notes &amp; database requirements for the typography "
    "utility app and Chrome extension", SUB))
story.append(Spacer(1, 2))
story.append(Paragraph(
    "Next.js (App Router) · Supabase · Tailwind CSS · Chrome Extension (MV3)",
    SMALL))
rule(6, 10, INK)

story.append(Paragraph(
    "This guide collects every <b>required manual step</b> and "
    "<b>important behavior caveat</b> surfaced while building the project — "
    "the things that code alone cannot configure. Follow the database setup "
    "first, then review the behavior notes for each module.", BODY))

# ===========================================================================
# PART 1 — DATABASE REQUIREMENTS
# ===========================================================================
story.append(Paragraph("Part 1 — Database Requirements (Supabase)", H2))
rule(0, 8)

story.append(Paragraph(
    "The app uses Supabase for Google authentication and for persisting "
    "user data (saved font pairings and type-scale presets). The following "
    "must be configured in your Supabase project dashboard — they are not "
    "created automatically by the app.", BODY))

callout(
    "⚠ Required before saving features work",
    ["The <b>Font Pairing Engine</b> and <b>Type Scale Calculator</b> both "
     "read/write Supabase tables. If the migrations below are not run, the "
     "Save / Load buttons will silently return empty results or error on "
     "insert. The user must also be <b>logged in</b> — the server actions "
     "return early when there is no authenticated user."],
    WARN_BG, WARN_BAR)

story.append(Paragraph("1.1 — Environment variables", H3))
story.append(Paragraph(
    "Create <font face='Courier'>.env.local</font> at the project root with "
    "your real Supabase credentials (placeholders are currently used so the "
    "build can run):", BODY))
code_block(
    "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co\n"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key\n\n"
    "# Optional — Font Pairing Engine (free Google Fonts API)\n"
    "NEXT_PUBLIC_GOOGLE_FONTS_KEY=your-google-fonts-api-key")

story.append(Paragraph("1.2 — Enable Google authentication", H3))
bullets([
    "<b>Supabase → Authentication → Providers → Google</b>: enable it and "
    "paste your Google OAuth <b>Client ID</b> and <b>Client Secret</b>.",
    "<b>Google Cloud Console → OAuth credentials</b>: add Supabase's "
    "callback as an authorized redirect URI: "
    "<font face='Courier'>https://&lt;project-ref&gt;.supabase.co/auth/v1/callback</font>",
    "<b>Supabase → Authentication → URL Configuration</b>: add your site "
    "URLs to <i>Redirect URLs</i>, e.g. "
    "<font face='Courier'>http://localhost:3000/**</font> and your "
    "production domain.",
])

story.append(Paragraph("1.3 — Run the table migrations", H3))
story.append(Paragraph(
    "In <b>Supabase → SQL Editor</b>, paste and run each migration file from "
    "the project's <font face='Courier'>supabase/migrations/</font> folder. "
    "Both tables use Row Level Security so users can only access their own "
    "rows.", BODY))

story.append(Paragraph(
    "<b>Migration A — </b><font face='Courier'>0001_saved_pairings.sql</font> "
    "(Font Pairing Engine)", BODY))
code_block(
    "create table if not exists public.saved_pairings (\n"
    "  id           uuid primary key default gen_random_uuid(),\n"
    "  user_id      uuid not null references auth.users (id) on delete cascade,\n"
    "  tag          text not null,\n"
    "  heading_font text not null,\n"
    "  body_font    text not null,\n"
    "  created_at   timestamptz not null default now()\n"
    ");\n"
    "alter table public.saved_pairings enable row level security;\n"
    "-- + SELECT / INSERT / DELETE policies on auth.uid() = user_id")

story.append(Paragraph(
    "<b>Migration B — </b><font face='Courier'>0002_scale_presets.sql</font> "
    "(Type Scale Calculator)", BODY))
code_block(
    "create table if not exists public.scale_presets (\n"
    "  id         uuid primary key default gen_random_uuid(),\n"
    "  user_id    uuid not null references auth.users (id) on delete cascade,\n"
    "  name       text not null,\n"
    "  base       numeric not null,\n"
    "  ratio      numeric not null,\n"
    "  min_vw     integer not null,\n"
    "  max_vw     integer not null,\n"
    "  created_at timestamptz not null default now()\n"
    ");\n"
    "alter table public.scale_presets enable row level security;\n"
    "-- + SELECT / INSERT / DELETE policies on auth.uid() = user_id")

callout(
    "ℹ Row Level Security (RLS) summary",
    ["Each table has three policies — <b>select</b>, <b>insert</b>, and "
     "<b>delete</b> — all gated on <font face='Courier'>auth.uid() = "
     "user_id</font>. There is intentionally no UPDATE policy. The full "
     "policy SQL is included in each migration file."],
    DB_BG, DB_BAR)

story.append(PageBreak())

# ===========================================================================
# PART 2 — IMPORTANT BEHAVIOR NOTES
# ===========================================================================
story.append(Paragraph("Part 2 — Important Behavior Notes", H2))
rule(0, 8)
story.append(Paragraph(
    "These are behavior caveats that affect how the app and extension run. "
    "They do not block the build, but they change what you should expect at "
    "runtime.", BODY))

story.append(Paragraph("2.1 — Next.js version specifics", H3))
bullets([
    "<b>Async cookies():</b> In Next.js 15+/16, "
    "<font face='Courier'>cookies()</font> is async, so the server Supabase "
    "client is an <font face='Courier'>async</font> function — always call "
    "it as <font face='Courier'>await createClient()</font>.",
    "<b>middleware → proxy:</b> Next.js 16 renamed the "
    "<font face='Courier'>middleware.ts</font> convention to "
    "<font face='Courier'>proxy.ts</font>. The project uses "
    "<font face='Courier'>proxy.ts</font> (exported function "
    "<font face='Courier'>proxy()</font>) which calls "
    "<font face='Courier'>updateSession</font> to refresh the auth token on "
    "each request.",
])

story.append(Paragraph("2.2 — Font Pairing Engine", H3))
bullets([
    "<b>Why not next/font:</b> <font face='Courier'>next/font</font> is "
    "build-time only and cannot load fonts chosen at runtime by a picker. "
    "The tool uses <b>manual &lt;link&gt; injection</b> into "
    "<font face='Courier'>document.head</font> instead.",
    "<b>API key is public:</b> The Google Fonts key is "
    "<font face='Courier'>NEXT_PUBLIC_</font> (exposed client-side). "
    "Restrict it by <b>HTTP referrer</b> in Google Cloud Console to prevent "
    "abuse.",
    "<b>Graceful fallback:</b> If the key is missing or the request fails, "
    "the tool loads a curated offline list (~30 fonts) and shows an amber "
    "badge — it never dead-ends.",
])

story.append(Paragraph("2.3 — Variable Font Inspector", H3))
bullets([
    "<b>100% client-side:</b> Fonts are parsed in the browser with "
    "<font face='Courier'>opentype.js</font> — nothing is uploaded.",
    "<b>Blob @font-face in preview:</b> The live preview injects an "
    "<font face='Courier'>@font-face</font> via an object URL. This works "
    "fully in a real browser; in a sandboxed in-app preview, Blob URLs / "
    "font loading may be restricted (metadata, axes, and CSS output still "
    "render).",
])

story.append(Paragraph("2.4 — In-app file preview sandbox", H3))
bullets([
    "Workspace file previews run in a sandboxed iframe with <b>no network "
    "access</b> — external stylesheets, scripts, fonts, and images will not "
    "load. Downloaded files work fully in a real browser.",
])

callout(
    "⚠ Chrome Extension — the key UX caveat",
    ["A Chrome <b>popup closes the moment you click back onto the webpage</b> "
     "to hover an element. With the current design (content script → "
     "<font face='Courier'>chrome.runtime.sendMessage</font> → popup), you "
     "must keep the popup open to watch results update live. This is fine for "
     "a learning build but not ideal for everyday use.",
     "<b>Recommended fixes:</b> (1) store the latest reading in "
     "<font face='Courier'>chrome.storage</font> and show the last hovered "
     "element's styles when the popup reopens; or (2) render an on-page "
     "overlay/tooltip drawn by <font face='Courier'>content.js</font> "
     "instead of sending data to the popup.",
     "<b>Restricted pages:</b> Injection is blocked on "
     "<font face='Courier'>chrome://</font>, "
     "<font face='Courier'>about:</font>, and the Chrome Web Store — the "
     "popup guards against these."],
    WARN_BG, WARN_BAR)

# ===========================================================================
# PART 3 — STEP-BY-STEP SETUP
# ===========================================================================
story.append(Paragraph("Part 3 — Step-by-Step Setup", H2))
rule(0, 8)

step("1", "Install dependencies",
     paras=["From the project root, install all packages:"],
     code="npm install")

step("2", "Configure environment variables",
     paras=["Copy the example file and fill in real values:"],
     code="cp .env.local.example .env.local\n# then edit .env.local")

step("3", "Set up Google OAuth",
     items=[
         "Enable Google provider in Supabase (Client ID + Secret).",
         "Add the Supabase callback URL in Google Cloud Console.",
         "Add localhost + production URLs to Supabase Redirect URLs.",
     ])

step("4", "Run database migrations",
     paras=["In Supabase → SQL Editor, run both files in order:"],
     items=[
         "<font face='Courier'>supabase/migrations/0001_saved_pairings.sql</font>",
         "<font face='Courier'>supabase/migrations/0002_scale_presets.sql</font>",
     ])

step("5", "Run the app",
     paras=["Start the dev server and sign in with Google:"],
     code="npm run dev   # http://localhost:3000")

step("6", "Verify the build (optional)",
     code="npx tsc --noEmit\nnpm run build")

step("7", "Load the Chrome extension",
     items=[
         "Open <font face='Courier'>chrome://extensions</font> and enable "
         "<b>Developer mode</b>.",
         "Click <b>Load unpacked</b> and select the "
         "<font face='Courier'>extension/</font> folder.",
         "Open a normal webpage, click the icon → <b>Inspect Font</b>, then "
         "hover elements (keep the popup open).",
     ])

rule(10, 6)
story.append(Paragraph(
    "Generated for the Fontify project · Keep this guide with your repo for "
    "onboarding and deployment.", SMALL))


# ===========================================================================
# Footer with page numbers
# ===========================================================================
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "Fontify — Setup & Operations Guide")
    canvas.drawRightString(190 * mm, 12 * mm, f"Page {doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(
    "Fontify-Setup-Guide.pdf", pagesize=A4,
    leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=18 * mm, bottomMargin=20 * mm,
    title="Fontify — Setup & Operations Guide",
    author="Arena.ai Agent",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("PDF written: Fontify-Setup-Guide.pdf")
