export const site = {
  title: 'anhthu.ipynb',
  author: 'Anh Thư',
  // Khẩu hiệu dưới tên blog, viết như một dòng comment trong notebook
  motto: '# learning by sharing ♡',
  description:
    'Anh Thư chia sẻ những gì mình học và những trải nghiệm cá nhân trên hành trình làm việc với dữ liệu.',
  // Câu mô tả blog, hiện ở đầu trang chủ
  tagline:
    'Mình chia sẻ những gì mình học và những trải nghiệm cá nhân. Như vậy mình có thể học lại một lần nữa, cũng như thỏa niềm đam mê viết lách của mình.',
  // Câu chuyện của tác giả, hiện ở trang Giới thiệu
  intro:
    'Hello mn, mình là Anh Thư. Từ một sinh viên y thích văn, thích viết và thích những gì có bằng chứng cụ thể, mình chuyển qua IT, rồi tự nhiên mê dữ liệu lúc nào không hay.',
  // Bật khi bạn sẵn sàng nhận việc: hiện thêm một khối ở trang chủ
  openToWork: false,
  // Nhạc qua trình phát của YouTube, mở bằng nút ở đầu trang. start và end là giây bắt đầu và kết thúc của đoạn phát.
  music: {
    title: 'Hai Mươi Hai (22)',
    artist: 'AMEE, Hứa Kim Tuyền',
    youtubeId: 'V-oIstk3FNo',
    start: 65,
    end: 81,
  },
  // Góp ý dưới mỗi bài bằng giscus. Khung góp ý chỉ hiện khi đã điền categoryId.
  comments: {
    repo: 'AIVIETNAM-AIO-thuhuynhtran05/blog',
    repoId: 'R_kgDOVfw44g',
    category: 'Announcements',
    categoryId: 'DIC_kwDOVfw44s4DKMuC',
  },
  // Điền link nào thì link đó hiện ở footer, để trống thì ẩn
  socials: {
    email: '',
    github: '',
    linkedin: '',
  },
};

export const nav = [
  { href: '/about', label: 'Giới thiệu' },
  { href: '/', label: 'Trang chủ' },
  { href: '/muc', label: 'Các mục' },
  { href: '/projects', label: 'Project' },
  { href: '/sach-minh-doc', label: 'My thoughts' },
];
