---
title: 'Cộng nhầm một cột, doanh thu đội lên 3,7 lần: xây kho dữ liệu e-commerce bằng dbt'
description: 'Ghi chú project đầu tiên của mình với dbt: từ 31 file CSV đến star schema cho sales analytics, qua ba tầng staging, intermediate và marts.'
date: 2026-11-05
track: data-transformation
section: 'dbt'
tags: [dbt, duckdb, star-schema, data-modeling]
draft: true
---

Tổng tiền của 36.000 đơn hàng là 10,8 triệu. Nhưng chỉ cần join bảng đơn hàng với bảng chi tiết đơn rồi `SUM(total)`, con số nhảy lên 40,2 triệu. Không có lỗi nào được báo cả, chỉ là doanh thu tự nhiên gấp 3,7 lần.

Bài này ghi lại project mình làm để học dbt: biến 31 file CSV của một sàn e-commerce thành các bảng sẵn sàng cho phân tích, và những chỗ mình suýt đo sai trên đường đi.

**Dữ liệu là dữ liệu giả lập.** Gồm 31 bảng, khoảng 264.000 dòng: 7.000 khách hàng, 36.000 đơn hàng, 100.000 dòng chi tiết đơn, từ 01/2021 đến 12/2025. Code ở [GitHub](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/E-commerce-Data-Warehouse-and-Customer-Analytics).

## dbt làm gì trong project này

Pipeline đi theo kiểu ELT: nạp dữ liệu thô vào kho trước, biến đổi sau.

```text
31 file CSV  →  Python nạp vào DuckDB (schema raw)  →  dbt biến đổi  →  bảng phân tích
     E                       L                              T
```

dbt chỉ lo chữ **T**. Nó không tự xử lý dữ liệu, mà biên dịch các file SQL mình viết thành câu lệnh rồi gửi cho DuckDB chạy. Cái hay nằm ở cách nó tổ chức đống SQL đó:

- **Mỗi bảng là một file `.sql`**, quản lý bằng Git như code bình thường.
- **`ref()` thay cho thứ tự chạy.** Mình viết `{{ ref('stg_ecommerce__orders') }}` thay vì tên bảng, dbt tự hiểu bảng nào phụ thuộc bảng nào, dựng thành một đồ thị (DAG) và chạy đúng thứ tự.
- **Test đi kèm model.** Khai báo `unique`, `not_null`, `relationships` trong file YAML, mỗi lần `dbt build` đều kiểm tra lại.
- **Tài liệu tự sinh.** `dbt docs` vẽ ra lineage, nhìn vào biết con số doanh thu đi qua những bảng nào.

## Ba tầng: staging → intermediate → marts

| Tầng | Trả lời câu hỏi | Làm gì | Ví dụ |
|---|---|---|---|
| Staging | Dữ liệu gốc là gì? | Mỗi bảng nguồn một model. Đổi tên cột, ép kiểu, chuẩn hóa, bỏ cột nhạy cảm. Không join. | `stg_ecommerce__orders` |
| Intermediate | Các bảng kết hợp với nhau thế nào? | Join, gom về grain khác, tính cờ nghiệp vụ. Logic dùng chung đặt ở đây. | `int_order_items__enriched` |
| Marts | Người dùng cần xem gì? | Bảng fact và dimension, đặt tên theo ngôn ngữ nghiệp vụ. | `fact_sales`, `dim_product` |

Lý do chia tầng: nếu hệ thống nguồn đổi tên một cột, mình chỉ sửa ở staging. Nếu định nghĩa "đơn đã thanh toán" thay đổi, mình chỉ sửa ở intermediate. Mọi bảng phía sau tự cập nhật theo.

Staging và intermediate để dạng view vì nhẹ, luôn mới. Marts lưu thành table để truy vấn nhanh. Đổi giữa hai kiểu chỉ cần sửa một dòng config, SQL giữ nguyên.

## Star schema cho sales analytics

Ở tầng marts, mình tổ chức theo star schema: một bảng fact ở giữa chứa các con số đo được, xung quanh là các bảng dimension chứa ngữ cảnh để lọc và nhóm.

```text
              dim_date     dim_promotion
                    \       /
  dim_customer —— fact_sales —— dim_product
                    /   |   \
     dim_geography      |    dim_shipping_method
                 dim_order_status
```

Câu hỏi quan trọng nhất khi thiết kế fact là **grain: một dòng trong bảng đại diện cho cái gì?** `fact_sales` có grain là một dòng chi tiết đơn, chi tiết nhất có thể, nên trả lời được cả câu hỏi theo sản phẩm lẫn theo đơn.

Mỗi dimension có một **surrogate key**, là mã băm sinh từ khóa gốc bằng `dbt_utils.generate_surrogate_key`. Bảng fact chỉ giữ các key này. Đơn không dùng mã giảm giá cũng không để key rỗng, mà trỏ vào một dòng "No promotion" trong `dim_promotion`. Nhờ vậy dòng fact nào cũng join được sang đủ mọi dimension.

Ngoài fact chính, project còn có `fact_orders` (một dòng mỗi đơn), `fact_payments`, `fact_shipments`, `fact_returns`. Mỗi bảng giữ grain riêng của nó, và dùng chung các dimension như khách hàng, ngày.

## Bẫy 1: cộng một cột ở sai grain

Quay lại con số 40,2 triệu ở đầu bài. Cột `total` nằm ở grain đơn hàng. Khi join sang bảng chi tiết đơn, mỗi đơn lặp lại theo số dòng sản phẩm của nó, và `total` bị cộng lặp:

```sql
-- Sai: total của một đơn 3 sản phẩm bị cộng 3 lần
SELECT SUM(o.order_total)
FROM fact_orders o
JOIN fact_sales s ON s.order_id = o.order_id;   -- 40,2 triệu

-- Đúng: cộng ở đúng grain của cột
SELECT SUM(order_total) FROM fact_orders;      -- 10,8 triệu
```

Hiện tượng này gọi là **fan-out**. Đơn trung bình có khoảng 3 sản phẩm, đơn lớn có tới 10, nên con số bị thổi lên 3,7 lần. Không có lỗi cú pháp nào, query vẫn chạy bình thường.

Cách mình tránh: ghi rõ grain của từng bảng fact trong tài liệu, và **chỉ cộng một measure ở đúng grain của nó**. Muốn ghép số liệu từ hai fact khác grain, gom cả hai về cùng grain rồi mới join.

Có một chỗ mình phải xử lý ngược lại: dữ liệu chỉ ghi giảm giá ở cấp đơn, còn cột giảm giá ở từng dòng sản phẩm luôn bằng 0. Nên mình chia giảm giá của đơn xuống từng dòng theo tỷ lệ tiền hàng, rồi viết test kiểm tra tổng các dòng cộng lại vẫn khớp với đơn.

## Bẫy 2: "doanh thu" là con số nào?

Cùng một bộ dữ liệu, bốn cách hiểu "doanh thu" cho bốn con số:

| Định nghĩa | Con số |
|---|---|
| Tổng `total` của mọi đơn, kể cả đơn đã hủy | 10,8 triệu |
| Tổng thanh toán có trạng thái `completed` | 10,1 triệu |
| Tổng tiền hàng sau giảm giá của mọi đơn, trước thuế và phí ship | 9,3 triệu |
| Như trên, nhưng chỉ tính đơn đã paid, shipped hoặc delivered | 5,5 triệu |

Con số cao nhất gần gấp đôi con số thấp nhất. Không con số nào sai, chúng trả lời các câu hỏi khác nhau. Nhưng nếu mỗi dashboard tự chọn một cách tính, cuộc họp sẽ tốn thời gian cãi nhau xem số nào đúng.

Mình chọn dòng cuối, gọi là `recognized_revenue`. Trạng thái nào được tính là doanh thu được ghi trong một file seed nhỏ, rồi áp dụng **một lần**, ở **một chỗ** trong tầng intermediate. Mọi bảng phía sau dùng chung. Đây chính là lý do tầng intermediate tồn tại.

## Bẫy 3: dữ liệu sạch vẫn có chỗ lạ

Test khóa của 31 bảng đều qua: không null, không trùng. Nhưng khi đối chiếu chéo thì có 2.258 đơn hàng không có dòng sản phẩm nào. Tiền hàng của các đơn này bằng 0, còn `total` chỉ là phí ship.

Test `unique` và `not_null` không bắt được loại vấn đề này. Nên mình viết thêm test theo logic nghiệp vụ "mỗi đơn phải có ít nhất một sản phẩm", để ở mức **warning**: mỗi lần build đều báo, nhưng không chặn pipeline.

## Kết quả

- 54 model: 31 staging, 5 intermediate, 8 dimension, 5 fact và 5 mart cho sales, khách hàng, vận hành.
- 232 test chạy mỗi lần `dbt build`, gồm cả test khóa ngoại từ mọi fact sang dimension và test logic nghiệp vụ.
- `mart_customer_360` chia khách hàng thành các nhóm RFM như Champions, Loyal, At risk.
- Một snapshot lưu lịch sử giá sản phẩm (SCD type 2).

## Những gì mình chưa làm

- **Incremental model.** Đơn hàng đổi trạng thái sau khi tạo, nhưng dữ liệu nguồn không có cột `updated_at`, nên lọc theo thời gian sẽ bỏ sót các thay đổi đó. Với 100.000 dòng, build lại toàn bộ chỉ mất vài giây, nên mình chưa dùng.
- **Dashboard.** Bước tiếp theo là nối Power BI vào star schema này.

Học tới đâu mình cập nhật tới đó nha!
