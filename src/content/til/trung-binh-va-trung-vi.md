---
title: 'Trung bình 11,2 tỷ không có nghĩa là khách hàng điển hình vay 11,2 tỷ'
description: 'Một nhóm nhỏ khách rất lớn kéo trung bình lên gấp 4 lần trung vị.'
date: 2026-11-02
cover: /images/aiv-bank/phan-bo-du-no-kh.png
track: excel
category: Thống kê mô tả
---

Dư nợ mỗi khách hàng trong [case study AIV Bank](/blog/aiv-bank-eda) có trung bình 11,2 tỷ, trung vị 2,8 tỷ, và P99 là 142 tỷ. Một nhóm nhỏ khách rất lớn kéo trung bình lên gấp 4 lần trung vị.

Trong Excel, chỉ cần đặt hai hàm cạnh nhau là thấy dữ liệu có lệch hay không:

```text
=AVERAGE(B2:B10001)
=MEDIAN(B2:B10001)
=PERCENTILE.INC(B2:B10001, 0.99)
```

Với dữ liệu lệch phải như vậy, nên mô tả "khách hàng điển hình" bằng trung vị và các phân vị. Khi vẽ phân bố hoặc so sánh các nhóm, thử dùng thang log: phân bố này trên thang log có dạng gần hình chuông, nghĩa là gần log-chuẩn.
