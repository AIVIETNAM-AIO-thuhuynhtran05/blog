---
title: 'Lãi suất 11,39% và 9,3% đều đúng, vì trả lời hai câu hỏi khác nhau'
description: 'Một con số nói về hợp đồng, con số kia nói về từng đồng đang cho vay.'
date: 2026-11-02
track: excel
section: 'Thống kê mô tả'
category: Thống kê mô tả
---

Cùng một danh mục, lãi suất trung vị theo hợp đồng là 11,39%, còn lãi suất bình quân gia quyền theo dư nợ khoảng 9,3%. Khoảng cách này xuất hiện vì hợp đồng lớn thường ngắn hạn và có lãi suất thấp.

- Trung vị theo hợp đồng trả lời: một hợp đồng điển hình có lãi suất bao nhiêu?
- Bình quân gia quyền theo dư nợ trả lời: mỗi đồng đang cho vay thu lãi bao nhiêu?

Trong Excel, với lãi suất ở cột B và dư nợ ở cột C:

```text
=MEDIAN(B2:B31105)
=SUMPRODUCT(B2:B31105, C2:C31105) / SUM(C2:C31105)
```

Khi đọc một con số bình quân, hãy hỏi nó được tính theo đơn vị nào.
