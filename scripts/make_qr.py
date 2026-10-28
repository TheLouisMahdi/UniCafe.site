"""Generate a real QR for the deployed site. Requires: pip install 'qrcode[pil]'"""
import sys
from pathlib import Path
from urllib.parse import urlparse


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/make_qr.py https://your-live-site.example')
    url = sys.argv[1].strip()
    parsed = urlparse(url)
    if parsed.scheme != 'https' or not parsed.netloc:
        raise SystemExit('Use the final HTTPS URL of the deployed UniCafe site.')
    import qrcode
    from qrcode.image.svg import SvgPathImage
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=20, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    base = Path(__file__).resolve().parent.parent / 'qr'
    base.mkdir(exist_ok=True)
    qr.make_image(fill_color='#080808', back_color='white').convert('RGB').save(base / 'unicafe-qr.png', dpi=(600, 600))
    svg = qr.make_image(image_factory=SvgPathImage).to_string().decode('utf-8')
    # A white background is required for reliably scanning the QR on dark print.
    svg = svg.replace('>', '><rect width="100%" height="100%" fill="white"/>', 1)
    (base / 'unicafe-qr.svg').write_text(svg, encoding='utf-8')
    print('Created qr/unicafe-qr.png and qr/unicafe-qr.svg for', url)


if __name__ == '__main__':
    main()
