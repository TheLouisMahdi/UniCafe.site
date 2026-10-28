from pathlib import Path
root = Path(__file__).resolve().parents[1]
descriptions = {
 'index': 'UniCafe؛ قهوه ایتالیایی در کتابخانه دانشگاه زنجان. منوی نوشیدنی‌ها، رأی‌گیری، باشگاه مشتریان و پشتیبانی.',
 'drinks': 'منوی ۲۴ نوشیدنی UniCafe؛ رأی مثبت یا منفی بدهید و نظر خود را برای تأیید مدیر ثبت کنید.',
 'about': 'داستان واقعی UniCafe در کتابخانه دانشگاه زنجان، از مرداد ۱۴۰۱ تا مهر ۱۴۰۵.',
 'club': 'عضویت رایگان در باشگاه مشتریان UniCafe با رضایت آگاهانه و نگهداری خصوصی اطلاعات.',
 'contact': 'تماس با پشتیبانی UniCafe، کپی شماره‌های تماس و ارسال پیام خصوصی ناشناس.',
 'admin': 'ورود امن مدیر UniCafe؛ مدیریت نظرات، رأی‌گیری، پیام‌ها و باشگاه مشتریان.'
}
import re
for page, description in descriptions.items():
 p = root / f'{page}.html'
 s = p.read_text(encoding='utf-8')
 s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{description}">',s)
 title = re.search(r'<title>(.*?)</title>',s)[1]
 if 'og:title' not in s:
  s = s.replace('  <title>', f'  <meta property="og:title" content="{title}">\n  <meta property="og:description" content="{description}">\n  <meta property="og:type" content="website">\n  <meta property="og:locale" content="fa_IR">\n  <title>')
 if page == 'admin' and 'name="robots"' not in s:
  s = s.replace('  <title>', '  <meta name="robots" content="noindex,nofollow">\n  <title>')
 for asset in ['styles.css','reference.css','app.js','config.js']:
  s = s.replace(f'assets/{asset}"', f'assets/{asset}?v=go-live-1"')
 p.write_text(s,encoding='utf-8')
