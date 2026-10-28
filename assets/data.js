export const categories = [
  { id: 'robusta', fa: 'قهوه روبوستا', en: '30/70 ROBUSTA', tone: 'amber', photo: 'robusta-v2.webp', thumb: 'robusta-thumb-v2.webp', items: [
    [10, 'دبل اسپرسو'], [11, 'اسپرسو'], [12, 'لانگ'], [13, 'ماکیاتو'], [14, 'کاپوچینو'], [15, 'موکاچینو']
  ] },
  { id: 'arabica', fa: 'قهوه عربیکا', en: '70/30 ARABICA', tone: 'sage', photo: 'arabica-v2.webp', thumb: 'arabica-thumb-v2.webp', items: [
    [21, 'اسپرسو'], [22, 'لانگ'], [23, 'کافه لاته'], [24, 'کاپوچینو با شیر اضافه']
  ] },
  { id: 'hazelnut', fa: 'نوشیدنی‌های فندقی', en: 'HAZELNUT TOPPING', tone: 'honey', photo: 'hazelnut-v2.webp', thumb: 'hazelnut-thumb-v2.webp', items: [
    [17, 'لاته 70/30'], [18, 'کاپوچینو 30/70'], [44, 'شکلات فندقی'], [20, 'موکاچینو 70/30']
  ] },
  { id: 'decaf', fa: 'قهوه بدون کافئین', en: 'DECAF COFFEE', tone: 'ruby', photo: 'decaf-v2.webp', thumb: 'decaf-thumb-v2.webp', items: [
    [31, 'اسپرسو'], [32, 'آمریکانو'], [33, 'لاته ماکیاتو'], [34, 'کاپوچینو با شیر اضافه'], [35, 'موکاچینو']
  ] },
  { id: 'tea', fa: 'چای و نوشیدنی‌های گرم', en: 'TEA & HOT DRINKS', tone: 'teal', photo: 'cup-teal-v2.webp', thumb: 'cup-teal-thumb-v2.webp', items: [
    [41, 'چای ماسالا'], [42, 'چای کرک'], [37, 'شیر'], [38, 'هات چاکلت'], [39, 'کرم شکلات']
  ] }
];
export const defaults = {
  polls_visible: true, votes_enabled: true, results_visible: true,
  comments_visible: true, comments_enabled: true, club_enabled: true,
  leaderboard_enabled: true, min_votes: 5, support_phone: '',
  support_whatsapp: '', support_hours: ''
};
export const flatDrinks = categories.flatMap((c, ci) => c.items.map(([code, name], i) => ({
  code, name, category: c.id, category_order: ci, item_order: i,
  is_visible: true, votes_enabled: true, show_results: true,
  comments_enabled: true, comments_visible: true,
  likes: 0, dislikes: 0, total: 0, my_vote: 0
})));
