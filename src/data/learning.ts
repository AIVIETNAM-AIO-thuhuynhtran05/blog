// Các mục kiến thức của blog, xếp theo level từ dễ đến khó.
// Level của mỗi mục chính là vị trí của nó trong danh sách, muốn đổi level thì đổi thứ tự.
// Mỗi bài viết và TIL khai báo `track` bằng một trong các slug dưới đây.
export const levelTracks = [
  {
    slug: 'excel',
    short: 'Làm sạch và tổng hợp dữ liệu.',
    title: 'Excel',
    summary: 'Làm sạch, tổng hợp và trình bày dữ liệu bằng công cụ phổ biến nhất văn phòng.',
  },
  {
    slug: 'sql',
    short: 'Tự lấy dữ liệu từ database.',
    title: 'SQL',
    summary: 'Tự lấy dữ liệu từ database và trả lời câu hỏi bằng truy vấn.',
  },
  {
    slug: 'powerbi',
    short: 'Biến dữ liệu thành dashboard.',
    title: 'Power BI',
    summary: 'Biến dữ liệu thành dashboard để người khác theo dõi và ra quyết định.',
  },
  {
    slug: 'machine-learning',
    short: 'Dùng mô hình để dự đoán.',
    title: 'Machine Learning',
    summary: 'Dùng mô hình để dự đoán và tìm quy luật mà phân tích mô tả không thấy được.',
  },
  {
    slug: 'business',
    short: 'Biến con số thành quyết định.',
    title: 'Business Domain',
    summary: 'Hiểu ngành và bài toán kinh doanh, để con số trở thành quyết định.',
  },
];

// Mục riêng, không thuộc bậc thang level
export const extraTracks = [
  {
    slug: 'cfa',
    short: 'Tài chính và đầu tư.',
    title: 'CFA',
    summary: 'Những gì mình học về tài chính và đầu tư qua chương trình CFA.',
  },
];

export const tracks = [...levelTracks, ...extraTracks];

export const trackSlugs = tracks.map((t) => t.slug) as [string, ...string[]];

export function getTrack(slug: string) {
  return tracks.find((t) => t.slug === slug)!;
}

export const projects: {
  title: string;
  track: string;
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
}[] = [
  {
    title: 'AIV Bank: danh mục tín dụng khách hàng doanh nghiệp',
    track: 'powerbi',
    summary:
      'EDA và dashboard trên dữ liệu giả lập gồm 10.000 khách hàng, 31.104 hợp đồng, 78 đơn vị kinh doanh. Kết luận chính: vấn đề của 6 tháng đầu 2026 là chất lượng tăng trưởng, không phải quy mô.',
    stack: ['Python', 'pandas', 'matplotlib', 'Power BI'],
    links: [
      { label: 'Đọc phân tích', href: '/blog/aiv-bank-eda' },
      { label: 'Mở dashboard', href: '/projects/aiv-bank/dashboard.html' },
    ],
  },
];
