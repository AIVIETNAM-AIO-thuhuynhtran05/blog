---
title: 'Đọc cách dữ liệu được tính trước khi chuẩn hóa'
description: 'Chia theo số ngày sẽ tạo ra một đỉnh NIM giả vào tháng 2.'
date: 2026-11-02
track: business
category: EDA
---

README của bộ dữ liệu AIV Bank gợi ý có thể cân nhắc cột `days_in_month` khi tính biên lãi. Nghe hợp lý, vì tháng 2 ngắn hơn các tháng khác.

Nhưng kiểm tra lại thì lãi trong dữ liệu được tính theo 1/12 năm ở mọi tháng, kể cả tháng 2. Nếu chia theo số ngày, tháng 2 sẽ hiện một đỉnh NIM giả.

Trước khi áp dụng một phép chuẩn hóa, cần kiểm tra xem dữ liệu được sinh ra theo cách nào. Điều này đúng cả với gợi ý nằm ngay trong tài liệu đi kèm.
