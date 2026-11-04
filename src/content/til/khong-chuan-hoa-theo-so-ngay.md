---
title: 'Đọc cách dữ liệu được tính trước khi chuẩn hóa'
description: 'Chia theo số ngày sẽ tạo ra một đỉnh NIM giả vào tháng 2.'
date: 2026-11-02
track: business
section: 'Tài chính – ngân hàng'
category: EDA
---

README của bộ dữ liệu AIV Bank gợi ý có thể cân nhắc cột `days_in_month` khi tính biên lãi. Nghe hợp lý, vì tháng 2 ngắn hơn các tháng khác.

Nhưng kiểm tra lại thì lãi trong dữ liệu được tính theo 1/12 năm ở mọi tháng, kể cả tháng 2. Tức là hiệu ứng số ngày đã được san phẳng sẵn rồi.

Ví dụ khoản vay 1.200 tỷ, lãi suất 12%/năm, tháng nào cũng ghi nhận 12 tỷ tiền lãi. Nếu vẫn quy ra năm theo số ngày (`NII / dư nợ × 365 / số ngày`):

| Tháng | Số ngày | NIM quy theo số ngày |
|---|---|---|
| Tháng 1 | 31 | 11,77% |
| Tháng 2 | 28 | **13,04%** |
| Tháng 4 | 30 | 12,17% |

Lãi suất thật vẫn là 12%, nhưng tháng 2 lại cao nhất, chỉ vì mẫu số nhỏ hơn. Đó là một đỉnh NIM giả. Với dữ liệu kiểu này, chỉ cần nhân 12 là đủ.

Cách kiểm tra nhanh: tính `lãi tháng / dư nợ` của cùng một khoản vay qua các tháng. Nếu tháng 2 bằng các tháng khác thì dữ liệu đang tính theo 1/12 năm. Nếu tháng 2 thấp hơn khoảng 28/31 thì dữ liệu tính theo ngày thực tế, lúc đó mới cần chuẩn hóa.

Trước khi áp dụng một phép chuẩn hóa, cần kiểm tra xem dữ liệu được sinh ra theo cách nào. Điều này đúng cả với gợi ý nằm ngay trong tài liệu đi kèm.
