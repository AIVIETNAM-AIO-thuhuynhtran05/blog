---
title: 'Inner join có thể âm thầm làm mất dữ liệu'
description: 'Không có lỗi nào được báo, tổng thu nhập chỉ nhỏ đi.'
date: 2026-11-02
track: sql
category: JOIN
---

Trong project AIV Bank, nối bảng thu nhập với bảng số dư cuối tháng bằng inner join sẽ làm mất 20.031 dòng thu nhập. Đó là các hợp đồng đóng trong tháng: vẫn phát sinh thu nhập nhưng không còn số dư cuối tháng.

Không có lỗi nào được báo, tổng thu nhập chỉ nhỏ đi. Vì vậy, nên kiểm tra các dòng không khớp trước khi chọn kiểu join:

```python
check = income.merge(balance, on=['contract_id', 'month'], how='left', indicator=True)
check['_merge'].value_counts()
```

Trong SQL, cách kiểm tra tương đương là tìm các dòng không có cặp:

```sql
SELECT i.*
FROM income i
LEFT JOIN balance b
  ON i.contract_id = b.contract_id AND i.month = b.month
WHERE b.contract_id IS NULL;
```

Sau khi nối, đối chiếu lại tổng của cột quan trọng với bảng gốc cũng là một cách kiểm tra nhanh.
