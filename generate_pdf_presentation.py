import sys
import os

def escape_pdf_str(text):
    text = str(text).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    return text

class SlidePDFBuilder:
    def __init__(self, filename, title="PORTOFOLIO DANA RIYADI"):
        self.filename = filename
        self.title = title
        self.pages = [] # List of stream strings for each page
        self.width = 960 # 16:9 widescreen landscape width
        self.height = 540 # 16:9 widescreen landscape height

    def add_page(self, slide_num, total_slides, slide_title, items_callback):
        # Callback returns drawing commands string
        stream_cmds = []

        # Background
        stream_cmds.append("0.97 0.98 0.99 rg 0 0 960 540 re f")

        # Top Bar (Dark Navy #0F172A)
        stream_cmds.append("0.06 0.09 0.16 rg 0 475 960 65 re f")
        # Gold accent line under header
        stream_cmds.append("0.12 0.23 0.54 rg 0 471 960 4 re f")

        # Header Title (White)
        stream_cmds.append("BT /F2 18 Tf 1 1 1 rg 30 510 Td (" + escape_pdf_str(self.title) + ") Tj ET")
        # Header Subtitle (Accent)
        stream_cmds.append("BT /F1 12 Tf 0.7 0.8 0.95 rg 30 490 Td (" + escape_pdf_str(slide_title) + ") Tj ET")

        # Bottom Bar
        stream_cmds.append("0.90 0.93 0.96 rg 0 0 960 32 re f")
        stream_cmds.append("0.4 0.45 0.55 rg")
        stream_cmds.append("BT /F1 10 Tf 30 11 Td (Copyright (C) 2026 Dana Riyadi - All Rights Reserved) Tj ET")
        page_str = f"Halaman {slide_num} dari {total_slides}"
        stream_cmds.append("BT /F1 10 Tf 850 11 Td (" + escape_pdf_str(page_str) + ") Tj ET")

        # Slide Content via callback
        content_cmds = items_callback(self)
        stream_cmds.extend(content_cmds)

        self.pages.append("\n".join(stream_cmds))

    def draw_card(self, x, y, w, h, bg_rgb=(1, 1, 1), border_rgb=(0.85, 0.88, 0.92)):
        cmds = []
        # Filled rect
        cmds.append(f"{bg_rgb[0]} {bg_rgb[1]} {bg_rgb[2]} rg {x} {y} {w} {h} re f")
        # Border rect
        cmds.append(f"{border_rgb[0]} {border_rgb[1]} {border_rgb[2]} RG 1 w {x} {y} {w} {h} re S")
        return cmds

    def draw_text(self, text, x, y, size=12, bold=False, rgb=(0.06, 0.09, 0.16)):
        font = "/F2" if bold else "/F1"
        return [f"BT {font} {size} Tf {rgb[0]} {rgb[1]} {rgb[2]} rg {x} {y} Td ({escape_pdf_str(text)}) Tj ET"]

    def draw_badge(self, text, x, y, bg_rgb=(0.12, 0.23, 0.54), txt_rgb=(1, 1, 1)):
        w = len(text) * 7 + 16
        h = 20
        cmds = []
        cmds.append(f"{bg_rgb[0]} {bg_rgb[1]} {bg_rgb[2]} rg {x} {y} {w} {h} re f")
        cmds.append(f"BT /F2 9 Tf {txt_rgb[0]} {txt_rgb[1]} {txt_rgb[2]} rg {x+8} {y+5} Td ({escape_pdf_str(text)}) Tj ET")
        return cmds

    def build(self):
        objects = []
        # Obj 1: Catalog
        objects.append("<</Type /Catalog /Pages 2 0 R>>")
        # Obj 2: Pages
        page_obj_refs = " ".join([f"{i+4} 0 R" for i in range(len(self.pages))])
        objects.append(f"<</Type /Pages /Kids [{page_obj_refs}] /Count {len(self.pages)}>>")
        # Obj 3: Fonts Font 1 = Helvetica, Font 2 = Helvetica-Bold
        objects.append("<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>")
        objects.append("<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>")

        # Page Objects & Content Streams
        font_res = "<</Font <</F1 3 0 R /F2 4 0 R>>>>"
        
        start_obj_idx = 5
        content_stream_start = start_obj_idx + len(self.pages)

        page_objs = []
        stream_objs = []

        for i, page_cmds in enumerate(self.pages):
            page_obj_num = start_obj_idx + i
            stream_obj_num = content_stream_start + i
            page_objs.append(f"<</Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources {font_res} /Contents {stream_obj_num} 0 R>>")
            
            stream_bytes = page_cmds.encode('latin1')
            stream_objs.append(f"<</Length {len(stream_bytes)}>>\nstream\n" + page_cmds + "\nendstream")

        objects.extend(page_objs)
        objects.extend(stream_objs)

        # Write PDF file
        with open(self.filename, 'wb') as f:
            f.write(b"%PDF-1.4\n")
            offsets = [0]
            
            for i, obj in enumerate(objects):
                offsets.append(f.tell())
                f.write(f"{i+1} 0 obj\n{obj}\nendobj\n".encode('latin1'))

            xref_start = f.tell()
            f.write(b"xref\n0 " + str(len(objects)+1).encode('latin1') + b"\n")
            f.write(b"0000000000 65535 f \n")
            for offset in offsets[1:]:
                f.write(f"{offset:010d} 00000 n \n".encode('latin1'))

            f.write(b"trailer\n<</Size " + str(len(objects)+1).encode('latin1') + b" /Root 1 0 R>>\n")
            f.write(b"startxref\n" + str(xref_start).encode('latin1') + b"\n%%EOF\n")


# ─── BUILDER 1: WEB DEVELOPER PORTFOLIO ─────────────────────────────────────
def create_webdev_pdf(filepath):
    doc = SlidePDFBuilder(filepath, "PORTOFOLIO DANA RIYADI - WEB DEVELOPER")

    # Slide 1: About & Profile
    def s1(builder):
        cmds = []
        # Main Hero Card
        cmds.extend(builder.draw_card(40, 60, 880, 380))
        cmds.extend(builder.draw_badge("PROFILE & ABOUT ME", 70, 395))
        cmds.extend(builder.draw_text("Dana Riyadi", 70, 355, size=24, bold=True, rgb=(0.06, 0.12, 0.3)))
        cmds.extend(builder.draw_text("Graphic Designer & Web Developer", 70, 330, size=14, bold=True, rgb=(0.4, 0.45, 0.55)))

        desc_lines = [
          "Lulusan Ilmu Komputer / Informatika yang berfokus pada Pengembangan Website,",
          "Desain Visual UI/UX, dan Pengelolaan Sistem Media Digital.",
          "",
          "Berpengalaman mengembangkan website berbasis WordPress, Next.js, dan Django,",
          "serta mengintegrasikan visualisasi data interaktif menggunakan Looker Studio & MySQL.",
          "",
          "Kontak & Informasi:",
          "- Email: danariyadi111@gmail.com",
          "- WhatsApp: +62 882-2131-9983",
          "- Lokasi: Kebumen, Jawa Tengah",
          "- Portfolio Website: danariyadi.github.io"
        ]
        y = 295
        for line in desc_lines:
            bold = line.startswith("Kontak") or line.startswith("Lulusan")
            color = (0.12, 0.23, 0.54) if bold else (0.15, 0.2, 0.28)
            cmds.extend(builder.draw_text(line, 70, y, size=11, bold=bold, rgb=color))
            y -= 19

        # Tech Stack Box on right
        cmds.extend(builder.draw_card(530, 90, 360, 320, bg_rgb=(0.96, 0.98, 1.0)))
        cmds.extend(builder.draw_text("Keahlian Utama (Tech Stack)", 550, 370, size=13, bold=True, rgb=(0.12, 0.23, 0.54)))

        skills = [
            ("Front-End Development", "Next.js, React, HTML5, CSS3, JavaScript"),
            ("CMS & E-Commerce", "WordPress, Custom Themes & Plugins"),
            ("Back-End & Database", "Django, MySQL, REST API Integration"),
            ("Data Visualization", "Looker Studio, Business Intelligence Dashboard"),
            ("Visual Design & UI/UX", "Figma, Graphic Design, Composition")
        ]
        sy = 330
        for title, detail in skills:
            cmds.extend(builder.draw_text(f"* {title}", 550, sy, size=10, bold=True, rgb=(0.06, 0.09, 0.16)))
            cmds.extend(builder.draw_text(detail, 565, sy-14, size=9, bold=False, rgb=(0.4, 0.45, 0.55)))
            sy -= 48

        return cmds

    # Slide 2: Experience
    def s2(builder):
        cmds = []
        cmds.extend(builder.draw_card(40, 240, 880, 200))
        cmds.extend(builder.draw_badge("INTERNSHIP | SEP 2025 - JAN 2026", 70, 400))
        cmds.extend(builder.draw_text("Web Developer - Universitas Putra Bangsa", 70, 365, size=16, bold=True, rgb=(0.06, 0.12, 0.3)))
        lines1 = [
            "- Mengembangkan website resmi LP3M UPB berbasis WordPress dan versi Next.js + MySQL.",
            "- Mengintegrasikan Looker Studio untuk visualisasi interaktif data penelitian & pengabdian masyarakat.",
            "- Mengembangkan website Fakultas Ekonomi & Bisnis (FEB) serta Fakultas Sains & Teknologi (FST).",
            "- Mengoptimalkan performa website, responsivitas mobile, serta keamanan sistem CMS."
        ]
        y = 335
        for l in lines1:
            cmds.extend(builder.draw_text(l, 70, y, size=11, rgb=(0.2, 0.25, 0.32)))
            y -= 22

        cmds.extend(builder.draw_card(40, 50, 880, 170))
        cmds.extend(builder.draw_badge("CERTIFIED STUDY | SEP 2024 - DES 2024", 70, 185))
        cmds.extend(builder.draw_text("Platform & Web Developer - PT Maleo Edukasi Teknologi (Educourse.id)", 70, 155, size=16, bold=True, rgb=(0.06, 0.12, 0.3)))
        lines2 = [
            "- Menjalani 840 jam pelatihan intensif pengembangan platform edukasi digital berbasis Python & Django.",
            "- Terpilih sebagai 10 Mahasiswa Terbaik penerima Golden Ticket Awardee MSIB Batch 7 Kampus Merdeka.",
            "- Merancang arsitektur database, RESTful API, serta fitur autentikasi & manajemen pengguna."
        ]
        y = 128
        for l in lines2:
            cmds.extend(builder.draw_text(l, 70, y, size=11, rgb=(0.2, 0.25, 0.32)))
            y -= 22

        return cmds

    # Slide 3: Achievements
    def s3(builder):
        cmds = []
        achievements = [
            ("NASIONAL", "Golden Ticket Studi Independen Web Developer", "Educourse.id x Kampus Merdeka (Batch 7 - 2024)", "Penerima Golden Ticket sebagai pengakuan atas performa terbaik dalam pengembangan platform edukasi digital."),
            ("KAMPUS", "Juara 1 Lomba Fotografi Dies Natalis ke-22", "Universitas Putra Bangsa (2023)", "Meraih Juara 1 dalam kompetisi fotografi literasi digital, menunjukkan komposisi visual & storytelling gambar."),
            ("KAMPUS", "Juara II Pemilihan Mahasiswa Berprestasi", "Universitas Putra Bangsa (2025)", "Meraih Juara 2 Pemilihan Mahasiswa Berprestasi tingkat kampus atas konsistensi akademik & kepemimpinan.")
        ]
        x = 40
        for tag, title, sub, desc in achievements:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge(tag, x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(sub, x+20, 332, size=9, bold=True, rgb=(0.4, 0.45, 0.55)))

            # Wrap desc
            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28:
                    lines.append(cur)
                    cur = w
                else:
                    cur += (" " if cur else "") + w
            if cur: lines.append(cur)

            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18

            x += 302

        return cmds

    # Slide 4: Web Projects Showcase
    def s4(builder):
        cmds = []
        projects = [
            ("Website LP3M Universitas Putra Bangsa", "WordPress & Next.js + Looker Studio", "Dikembangkan dalam dua versi (WordPress & Next.js dengan MySQL). Dilengkapi visualisasi interaktif data riset menggunakan Looker Studio."),
            ("Website Zaza Bakery Kebumen", "Branding & Web Development", "Website profil bisnis kuliner dengan desain responsif, katalog produk interaktif, dan optimasi pengalaman pengguna."),
            ("Website Fakultas (FEB & FST UPB)", "Web Development & Content System", "Pengembangan portal akademik resmi fakultas untuk menyampaikan informasi perkuliahan, prodi, dan pengumuman mahasiswa.")
        ]
        x = 40
        for title, tech, desc in projects:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge("WEB PROJECT", x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(tech, x+20, 332, size=9, bold=True, rgb=(0.12, 0.23, 0.54)))

            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28:
                    lines.append(cur)
                    cur = w
                else:
                    cur += (" " if cur else "") + w
            if cur: lines.append(cur)

            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18

            x += 302

        return cmds

    doc.add_page(1, 4, "PROFIL LENGKAP & KEAHLIAN TINGKAT UTAMA", s1)
    doc.add_page(2, 4, "PENGALAMAN KERJA, MAGANG & STUDI INDEPENDEN", s2)
    doc.add_page(3, 4, "PRESTASI, SERTIFIKASI & PENGHARGAAN", s3)
    doc.add_page(4, 4, "PORTOFOLIO PROYEK WEB DEVELOPMENT", s4)
    doc.build()


# ─── BUILDER 2: DESAIN GRAFIS PORTFOLIO ─────────────────────────────────────
def create_desain_pdf(filepath):
    doc = SlidePDFBuilder(filepath, "PORTOFOLIO DANA RIYADI - DESAIN GRAFIS")

    def s1(builder):
        cmds = []
        cmds.extend(builder.draw_card(40, 60, 880, 380))
        cmds.extend(builder.draw_badge("VISUAL DESIGN & CREATIVE", 70, 395))
        cmds.extend(builder.draw_text("Dana Riyadi", 70, 355, size=24, bold=True, rgb=(0.06, 0.12, 0.3)))
        cmds.extend(builder.draw_text("Graphic Designer & Visual Storyteller", 70, 330, size=14, bold=True, rgb=(0.4, 0.45, 0.55)))

        desc = [
            "Spesialis dalam Pembuatan Konten Visual, Desain Publikasi Media Sosial,",
            "Branding Produk, Banner Event, dan Visual Storytelling.",
            "",
            "Menguasai komposisi tata letak, teori warna, tipografi, serta software desain",
            "seperti Adobe Photoshop, CorelDRAW, Illustrator, dan Canva.",
            "",
            "Kategori Desain yang Dihasilkan:",
            "- Desain Poster Event & Seminar Kampus (19+ Karya)",
            "- Desain Feed Konten Hari Nasional (47+ Karya)",
            "- Desain Media Publikasi Organisasi (11+ Karya)",
            "- Desain Feed Social Media Recap (38+ Karya)"
        ]
        y = 295
        for line in desc:
            bold = line.startswith("Kategori") or line.startswith("Spesialis")
            cmds.extend(builder.draw_text(line, 70, y, size=11, bold=bold, rgb=(0.15, 0.2, 0.28)))
            y -= 19

        return cmds

    def s2(builder):
        cmds = []
        cmds.extend(builder.draw_card(40, 60, 880, 380))
        cmds.extend(builder.draw_badge("PENGALAMAN ORGANISASI & MEDIA", 70, 395))
        cmds.extend(builder.draw_text("Pengalaman Publikasi & Desain Komunikasi Visual", 70, 355, size=16, bold=True, rgb=(0.06, 0.12, 0.3)))
        lines = [
            "1. Tim Pengelola Media Digital & Publikasi Organisasi Kampus:",
            "   - Bertanggung jawab memproduksi visual feed Instagram, e-flyer, dan banner promosi event.",
            "   - Menjaga konsistensi identitas visual dan estetika branding organisasi.",
            "",
            "2. Juara 1 Lomba Fotografi & Literasi Digital (Dies Natalis UPB 2023):",
            "   - Menggabungkan elemen fotografi cerita visual dengan framing komposisi visual yang harmonis.",
            "",
            "3. Desainer Konten Promosi UMKM (Zaza Bakery & Proyek Bisnis):",
            "   - Merancang materi desain kemasan, katalog menu digital, dan spanduk promosi usaha."
        ]
        y = 315
        for l in lines:
            bold = l.startswith("1.") or l.startswith("2.") or l.startswith("3.")
            cmds.extend(builder.draw_text(l, 70, y, size=11, bold=bold, rgb=(0.15, 0.2, 0.28)))
            y -= 21
        return cmds

    def s3(builder):
        cmds = []
        achievements = [
            ("FOTOGRAFI", "Juara 1 Lomba Fotografi Literasi Digital", "Dies Natalis UPB ke-22 (2023)", "Meraih Juara 1 atas kepekaan visual, komposisi pencahayaan, dan kemampuan bercerita melalui media gambar."),
            ("AKADEMIK", "Juara II Pemilihan Mahasiswa Berprestasi", "Universitas Putra Bangsa (2025)", "Pencapaian Mahasiswa Berprestasi tingkat kampus sebagai wujud konsistensi keahlian akademik & visual."),
            ("NASIONAL", "Golden Ticket Awardee Specialist", "Educourse.id x Kampus Merdeka", "Pengakuan performa terbaik nasional dalam proyek pengembangan platform edukasi digital.")
        ]
        x = 40
        for tag, title, sub, desc in achievements:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge(tag, x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(sub, x+20, 332, size=9, bold=True, rgb=(0.4, 0.45, 0.55)))
            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28:
                    lines.append(cur); cur = w
                else: cur += (" " if cur else "") + w
            if cur: lines.append(cur)
            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18
            x += 302
        return cmds

    def s4(builder):
        cmds = []
        cats = [
            ("Koleksi Desain Event", "19+ Desain Poster", "Memproduksi poster publikasi webinar, seminar nasional, kompetisi, dan perlombaan akademik."),
            ("Koleksi Hari Nasional", "47+ Konten Feed", "Desain ucapan peringatan hari besar nasional dan internasional dengan tema estetis."),
            ("Koleksi Media Organisasi", "11+ Visual Recap", "Desain publikasi pengurus organisasi, dokumentasi event, dan materi informasi mahasiswa.")
        ]
        x = 40
        for title, count, desc in cats:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge("DESIGN PORTFOLIO", x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(count, x+20, 332, size=10, bold=True, rgb=(0.12, 0.23, 0.54)))
            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28: lines.append(cur); cur = w
                else: cur += (" " if cur else "") + w
            if cur: lines.append(cur)
            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18
            x += 302
        return cmds

    doc.add_page(1, 4, "PROFIL LENGKAP & SPESIALISASI DESAIN VISUAL", s1)
    doc.add_page(2, 4, "PENGALAMAN MEDIA DIGITAL & DESAIN GRAFIS", s2)
    doc.add_page(3, 4, "PRESTASI & SERTIFIKASI VISUAL", s3)
    doc.add_page(4, 4, "GALERI & KATEGORI KARYA DESAIN GRAFIS", s4)
    doc.build()


# ─── BUILDER 3: UMUM PORTFOLIO ──────────────────────────────────────────────
def create_umum_pdf(filepath):
    doc = SlidePDFBuilder(filepath, "PORTOFOLIO DANA RIYADI - UMUM")

    def s1(builder):
        cmds = []
        cmds.extend(builder.draw_card(40, 60, 880, 380))
        cmds.extend(builder.draw_badge("GENERAL PORTFOLIO", 70, 395))
        cmds.extend(builder.draw_text("Dana Riyadi", 70, 355, size=24, bold=True, rgb=(0.06, 0.12, 0.3)))
        cmds.extend(builder.draw_text("Web Developer & Graphic Designer", 70, 330, size=14, bold=True, rgb=(0.4, 0.45, 0.55)))

        desc = [
            "Portofolio Komprehensif gabungan keahlian Web Development,",
            "Desain Komunikasi Visual, dan Pengalaman Organisasi.",
            "",
            "Pengalaman Utama:",
            "- Web Developer Internship - Universitas Putra Bangsa (WordPress & Next.js)",
            "- Platform & Web Developer - PT Maleo Edukasi Teknologi (Django & Python)",
            "- Desainer Visual & Pengelola Media Digital Organisasi Kampus",
            "",
            "Pencapaian Utama:",
            "- Golden Ticket Awardee MSIB Batch 7 Educourse.id x Kampus Merdeka",
            "- Juara 1 Lomba Fotografi Dies Natalis ke-22 UPB",
            "- Juara II Pemilihan Mahasiswa Berprestasi UPB 2025"
        ]
        y = 295
        for line in desc:
            bold = line.startswith("Pengalaman") or line.startswith("Pencapaian")
            cmds.extend(builder.draw_text(line, 70, y, size=11, bold=bold, rgb=(0.15, 0.2, 0.28)))
            y -= 19
        return cmds

    def s2(builder):
        cmds = []
        cmds.extend(builder.draw_card(40, 240, 880, 200))
        cmds.extend(builder.draw_badge("INTERNSHIP | SEP 2025 - JAN 2026", 70, 400))
        cmds.extend(builder.draw_text("Web Developer - Universitas Putra Bangsa", 70, 365, size=16, bold=True, rgb=(0.06, 0.12, 0.3)))
        lines1 = [
            "- Membangun portal website LP3M UPB (WordPress & Next.js dengan database MySQL).",
            "- Integrasi visualisasi data interaktif penelitian dosen & mahasiswa via Looker Studio.",
            "- Membangun website fakultas (FEB & FST UPB) dengan sistem pengelolaan konten terintegrasi."
        ]
        y = 335
        for l in lines1:
            cmds.extend(builder.draw_text(l, 70, y, size=11, rgb=(0.2, 0.25, 0.32)))
            y -= 22

        cmds.extend(builder.draw_card(40, 50, 880, 170))
        cmds.extend(builder.draw_badge("CERTIFIED STUDY | SEP 2024 - DES 2024", 70, 185))
        cmds.extend(builder.draw_text("Platform Developer - PT Maleo Edukasi Teknologi", 70, 155, size=16, bold=True, rgb=(0.06, 0.12, 0.3)))
        lines2 = [
            "- Mengikuti 840 jam pelatihan intensif spesialis platform edukasi digital berbasis Django.",
            "- Meraih Golden Ticket Awardee sebagai 10 mahasiswa terbaik selama program."
        ]
        y = 128
        for l in lines2:
            cmds.extend(builder.draw_text(l, 70, y, size=11, rgb=(0.2, 0.25, 0.32)))
            y -= 22
        return cmds

    def s3(builder):
        cmds = []
        achievements = [
            ("NASIONAL", "Golden Ticket Studi Independen Web Developer", "Educourse.id x Kampus Merdeka (2024)", "Penghargaan performa terbaik nasional dalam program pengembangan platform edukasi digital."),
            ("KAMPUS", "Juara 1 Lomba Fotografi Dies Natalis UPB", "Universitas Putra Bangsa (2023)", "Meraih Juara 1 lomba fotografi atas kepekaan komposisi visual & cerita gambar."),
            ("KAMPUS", "Juara II Pemilihan Mahasiswa Berprestasi", "Universitas Putra Bangsa (2025)", "Pencapaian Mahasiswa Berprestasi tingkat kampus mencerminkan keahlian akademik & kepemimpinan.")
        ]
        x = 40
        for tag, title, sub, desc in achievements:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge(tag, x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(sub, x+20, 332, size=9, bold=True, rgb=(0.4, 0.45, 0.55)))
            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28: lines.append(cur); cur = w
                else: cur += (" " if cur else "") + w
            if cur: lines.append(cur)
            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18
            x += 302
        return cmds

    def s4(builder):
        cmds = []
        items = [
            ("Proyek Website LP3M & Fakultas", "WordPress, Next.js, Looker Studio", "Portal resmi universitas dengan sistem CMS, visualisasi data riset, dan responsivitas tinggi."),
            ("Website Branding Zaza Bakery", "Web Design & E-Commerce Catalog", "Pengembangan profil bisnis kuliner dengan desain interaktif dan galeri katalog produk."),
            ("Desain Grafis & Media Digital", "Posters, Feed Instagram, Banners", "Lebih dari 100+ karya visual poster event, feed hari besar nasional, dan media organisasi.")
        ]
        x = 40
        for title, tech, desc in items:
            cmds.extend(builder.draw_card(x, 60, 275, 380))
            cmds.extend(builder.draw_badge("PROJECT SHOWCASE", x+20, 395))
            cmds.extend(builder.draw_text(title, x+20, 355, size=13, bold=True, rgb=(0.06, 0.12, 0.3)))
            cmds.extend(builder.draw_text(tech, x+20, 332, size=9, bold=True, rgb=(0.12, 0.23, 0.54)))
            words = desc.split()
            lines = []
            cur = ""
            for w in words:
                if len(cur + " " + w) > 28: lines.append(cur); cur = w
                else: cur += (" " if cur else "") + w
            if cur: lines.append(cur)
            y = 295
            for l in lines:
                cmds.extend(builder.draw_text(l, x+20, y, size=10, rgb=(0.2, 0.25, 0.32)))
                y -= 18
            x += 302
        return cmds

    doc.add_page(1, 4, "PROFIL RINGKAS & SPESIALISASI GABUNGAN", s1)
    doc.add_page(2, 4, "RIWAYAT PENGALAMAN MAGANG & STUDI INDEPENDEN", s2)
    doc.add_page(3, 4, "DAFTAR PRESTASI & PENGHARGAAN UTAMA", s3)
    doc.add_page(4, 4, "RINGKASAN PORTOFOLIO KARYA WEB & DESAIN", s4)
    doc.build()


if __name__ == "__main__":
    downloads_dir = "downloads"
    os.makedirs(downloads_dir, exist_ok=True)

    f_webdev = os.path.join(downloads_dir, "7f2a9c-webdev-portfolio.pdf")
    f_desain = os.path.join(downloads_dir, "3d8e1b-desain-portfolio.pdf")
    f_umum   = os.path.join(downloads_dir, "b91f4a-umum-portfolio.pdf")

    create_webdev_pdf(f_webdev)
    create_desain_pdf(f_desain)
    create_umum_pdf(f_umum)

    print("All 3 landscape presentation PDFs successfully generated!")
