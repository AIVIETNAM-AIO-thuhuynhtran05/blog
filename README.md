# anhthu.ipynb

Blog cá nhân về hành trình học dữ liệu, xây bằng [Astro](https://astro.build).

## Chạy trên máy

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # build ra dist/
npm run preview  # xem bản đã build
```

## Viết bài

| Muốn làm gì | Sửa ở đâu |
|---|---|
| Thêm bài dài | Tạo `.md` trong `src/content/posts/` |
| Thêm ghi chú ngắn (hiện với nhãn "Ghi chú") | Tạo `.md` trong `src/content/til/` |
| Tên blog, tác giả, link liên hệ, Open to Work | `src/site.config.ts` |
| Các mục và project | `src/data/learning.ts` |
| Trang About | `src/pages/about.astro` |

Bài viết mới bắt đầu bằng phần khai báo như sau. Tên file sẽ thành đường dẫn của bài.

```md
---
title: 'Tiêu đề bài'
description: 'Một câu tóm tắt, hiện khi chia sẻ link và trên Google'
date: 2026-11-15
track: sql
tags: [join, window-function]
cover: /images/ten-anh.png
featured: true
draft: true
---
```

`draft: true` chỉ hiện khi chạy `npm run dev`, bản build public sẽ bỏ qua. Ghi chú ngắn dùng `title`, `description`, `date`, `track` và `category`.

`description` là phụ đề hiện dưới tiêu đề. `cover` là ảnh bìa, không bắt buộc; bài không có ảnh sẽ dùng ảnh bìa chữ theo mục. `featured: true` ghim bài vào ô lớn giữa trang chủ, chỉ nên đặt cho một bài.

`track` quyết định bài nằm ở mục nào: `excel`, `sql`, `data-transformation`, `powerbi`, `xac-suat-thong-ke`, `machine-learning`, `business`, `soft-skill` hoặc `cfa`. Bài sẽ tự hiện ở trang của mục đó, ví dụ `/sql`.

Với mục có bảng lộ trình, thêm `section: 'Tên nhóm'` để bài hiện đúng ở nhóm đó trong bảng. Tên nhóm phải giống y như `group` trong `roadmaps` ở `src/data/learning.ts`; bài không có `section` hoặc gõ sai tên sẽ hiện ở dưới bảng.

Ảnh đặt trong `public/images/` rồi chèn bằng `![mô tả](/images/ten-anh.png)`. Công thức viết bằng `$...$` hoặc `$$...$$`.

## Đưa lên mạng bằng GitHub Pages

1. Tạo repo public tên `blog`, để trống, không thêm README hay `.gitignore`. Địa chỉ gốc `<username>.github.io` đang là trang portfolio ở repo riêng, đừng push blog vào repo đó.
2. Trong thư mục blog, chạy:
   ```sh
   git init -b main
   git add .
   git commit -m "Khởi tạo blog"
   git remote add origin https://github.com/<username>/blog.git
   git push -u origin main
   ```
3. Trên GitHub, vào **Settings → Pages → Source** và chọn **GitHub Actions**.

Từ đó mỗi lần push lên `main`, blog tự build và cập nhật tại `https://<username>.github.io/blog/`.

Đường dẫn con lấy theo tên repo. Khi viết bài vẫn dùng link như `/about` hay `/images/a.png`, bước build sẽ tự thêm đường dẫn con.
