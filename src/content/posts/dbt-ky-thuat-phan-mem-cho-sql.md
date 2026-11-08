---
title: 'dbt: Đưa kỹ thuật phần mềm vào SQL'
description: 'Từ ELT, ref() và DAG đến mô hình hoá dữ liệu, kiểm thử và các tính năng nâng cao. Minh hoạ bằng một project e-commerce chạy trên DuckDB.'
date: 2026-11-06
track: data-transformation
section: 'dbt'
tags: [dbt, elt, data-modeling, data-testing, duckdb]
---

> **Vấn đề đặt ra.** Với một chỉ số trên dashboard, chẳng hạn doanh thu, bài viết xem xét hai câu hỏi: chỉ số đó được tính từ những nguồn dữ liệu nào, và làm thế nào để kiểm chứng tính đúng đắn của nó.

## Mở đầu: một con số, hai đáp án

Thứ Hai đầu tháng, trưởng nhóm kinh doanh mở hai dashboard và thấy hai con số doanh thu tháng trước khác nhau gần 15%. Một bên tính cả đơn bị huỷ, bên kia thì không. Một bên join bảng thanh toán vào từng dòng sản phẩm nên doanh thu bị nhân lên. Cả hai câu SQL đều nằm đâu đó trong một thư mục chung, không có test, không ai biết bảng nào phụ thuộc bảng nào, và người viết đã nghỉ việc.

Đây không phải lỗi của SQL. SQL là một ngôn ngữ tốt. Vấn đề là **cách chúng ta làm việc với SQL**: không quản lý phiên bản, không tách module, không kiểm thử, không tài liệu. Kỹ sư phần mềm đã giải quyết những vấn đề này từ hàng chục năm trước. dbt là công cụ mang các thực hành đó vào thế giới dữ liệu.

### Phạm vi và cấu trúc bài viết

Các thành phần chính của dbt đều tương ứng với những thực hành đã được chuẩn hoá trong kỹ thuật phần mềm. Bảng 1 trình bày sự tương ứng này và vị trí mỗi nội dung được phân tích trong bài.

*Bảng 1. Các thực hành kỹ thuật phần mềm được đề cập trong bài.*

| Thực hành | Vấn đề được giải quyết | Mục |
|---|---|---|
| Quản lý phiên bản (version control) | Truy vết thay đổi và khôi phục phiên bản trước | Phần II |
| Mô-đun hoá (modular code) | Tái sử dụng logic, tránh sao chép mã | Phần II |
| Kiến trúc phân tầng | Phân định trách nhiệm của từng thành phần | Phần III |
| Kiểm thử (unit test, assertion) | Xác minh tính đúng đắn của kết quả | Phần IV |
| Tài liệu hoá | Mô tả ý nghĩa và nguồn gốc của dữ liệu | Phần IV |
| Tích hợp và triển khai liên tục (CI/CD) | Phát hiện lỗi trước khi triển khai lên môi trường production | Phần IV |
| Nguyên tắc DRY, thư viện dùng chung | Hạn chế lặp lại mã | Phần V |

**Dữ liệu minh hoạ.** Các ví dụ được lấy từ một [kho dữ liệu e-commerce](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/E-commerce-Data-Warehouse-and-Customer-Analytics) xây dựng bằng dbt Core trên DuckDB. Bộ dữ liệu là dữ liệu giả lập gồm 31 bảng với khoảng 264.000 dòng, trong đó có 7.000 khách hàng, 36.000 đơn hàng và 100.000 dòng chi tiết đơn hàng. Các khung **Trong project** đối chiếu nội dung lý thuyết với phần cài đặt tương ứng trong project.

## Phần I. Vì sao có dbt

### 1. Từ ETL sang ELT

Trong mô hình truyền thống **ETL** (Extract → Transform → Load), dữ liệu được biến đổi trên một máy chủ trung gian *trước* khi nạp vào kho. Lý do rất thực tế: lưu trữ và tính toán trong data warehouse on-premise rất đắt, nên chỉ dữ liệu đã làm sạch và tổng hợp mới đáng được đưa vào.

Cloud warehouse (Snowflake, BigQuery, Redshift, Databricks) và các engine cột như DuckDB đã thay đổi bài toán: lưu trữ rẻ, tính toán mạnh và co giãn được, lại tách rời nhau. Khi đó cách hợp lý hơn là **ELT**: nạp dữ liệu thô vào trước, rồi biến đổi ngay trong warehouse bằng SQL. Dữ liệu thô luôn còn đó, nên khi logic sai ta chỉ cần chạy lại phần biến đổi, không phải extract lại từ nguồn.

```text
 Nguồn                 ┌────────────────── Warehouse (DuckDB) ──────────────────┐
 CSV, app DB, API      │                        T = dbt                         │        BI
       │    E + L      │   ┌─────┐   ┌──────────────────────────────────────┐   │    dashboard
       └───(Python)───►│   │ raw │──►│ staging → intermediate → marts       │───┼──►
                       │   └─────┘   └──────────────────────────────────────┘   │
                       │          dbt gửi SQL vào, warehouse thực thi           │
                       └────────────────────────────────────────────────────────┘
```

*Hình 1. Luồng ELT trong project: Python lo E và L, dbt lo T ngay trong warehouse.*

### 2. dbt là gì, và không phải là gì

**dbt (data build tool) là chữ T trong ELT.** Nó không kéo dữ liệu từ nguồn, cũng không nạp dữ liệu vào kho. Nó chỉ làm một việc: biến dữ liệu đã có trong warehouse thành các bảng và view sạch, có cấu trúc, sẵn sàng cho phân tích.

| dbt LÀ | dbt KHÔNG PHẢI LÀ |
|---|---|
| Một trình biên dịch: SQL + Jinja → SQL thuần | Một database hay engine xử lý dữ liệu |
| Một trình điều phối thứ tự chạy model (DAG) | Công cụ extract/load (đó là việc của Fivetran, Airbyte, script Python…) |
| Một framework test và tài liệu cho dữ liệu | Công cụ BI hay vẽ dashboard |
| Có bản mã nguồn mở (dbt Core) và bản dịch vụ (dbt Cloud) | Bộ lập lịch đa năng (thường chạy kèm Airflow, Dagster, cron…) |

> **Nhận xét.** Bản thân dbt không xử lý dữ liệu. Mọi phép tính đều do warehouse (DuckDB, Snowflake, BigQuery…) thực hiện trên câu SQL mà dbt sinh ra. Do đó hiệu năng của pipeline phụ thuộc vào warehouse chứ không phụ thuộc vào dbt. Khi chuyển project sang một warehouse khác, phần thay đổi chủ yếu là cấu hình kết nối, cùng một số hàm SQL đặc thù của từng hệ quản trị.

> **Trong project.** Bước E và L do script `scripts/load_csvs.py` đảm nhiệm: 31 file CSV được nạp nguyên trạng vào schema `raw` của DuckDB, mỗi file tương ứng với một bảng (ví dụ `orders.csv` → `raw.orders`). Bước T do dbt đảm nhiệm. Toàn bộ kho dữ liệu được lưu trong một file duy nhất là `warehouse/ecommerce.duckdb`.

### 3. Analytics Engineer: vai trò mới

Khi việc biến đổi dữ liệu chỉ còn là viết SQL, người làm việc này không nhất thiết phải là Data Engineer chuyên về hạ tầng. dbt Labs đã phổ biến khái niệm **Analytics Engineer**: người đứng giữa Data Engineer (lo pipeline, hạ tầng) và Data Analyst (lo câu hỏi kinh doanh). Họ viết SQL như analyst nhưng làm việc theo quy trình của kỹ sư phần mềm: Git, code review, test, CI.

## Phần II. dbt hoạt động thế nào

### 4. Model: chỉ là một câu SELECT

Đơn vị cơ bản của dbt là **model**: một file `.sql` chứa đúng một câu `SELECT`. Không có `CREATE TABLE`, không có `INSERT`. Tên file chính là tên bảng/view sẽ được tạo. dbt lo phần "bọc" câu SELECT thành lệnh tạo object phù hợp.

Code bạn viết, `models/staging/stg_orders.sql`:

```sql
with source as (
    select * from {{ source('shop', 'orders') }}
)
select
    id                          as order_id,
    customer_id,
    cast(order_date as date)    as order_date,
    lower(status)               as status,
    subtotal
from source
```

Thứ dbt thực sự gửi cho DuckDB, `target/run/.../stg_orders.sql`:

```sql
create or replace view "shop"."dev"."stg_orders" as (
    with source as (
        select * from "shop"."raw"."orders"
    )
    select
        id as order_id,
        ...
    from source
);
```

Bên trên là thứ bạn viết. Bên dưới là thứ dbt gửi đi sau khi chạy `dbt run` (hoặc chỉ compile bằng `dbt compile`). Toàn bộ "phép màu" của dbt nằm trong khoảng cách giữa hai khung này: Jinja `{{ ... }}` được thay bằng tên bảng thật, và câu SELECT được bọc thành lệnh tạo view.

#### Cấu trúc project và các lệnh cơ bản

```text
my_project/
├── dbt_project.yml        # cấu hình project
├── models/
│   ├── staging/           # stg_*.sql + _sources.yml
│   ├── intermediate/      # int_*.sql
│   └── marts/             # fact_*, dim_* + schema.yml
├── tests/                 # singular tests
├── macros/                # hàm Jinja
├── snapshots/             # SCD Type 2
└── seeds/                 # CSV nhỏ
# profiles.yml: kết nối + target dev/prod
```

| Lệnh | Việc làm |
|---|---|
| `dbt compile` | Chỉ sinh SQL, không chạy |
| `dbt run` | Tạo/cập nhật các model |
| `dbt test` | Chạy các test |
| `dbt build` | run + test + seed + snapshot theo thứ tự DAG |
| `dbt docs generate` | Sinh tài liệu và lineage |

### 5. source(), ref() và DAG

Có hai hàm Jinja quan trọng nhất trong dbt:

- `{{ source('shop', 'orders') }}` trỏ tới **dữ liệu thô** được khai báo trong file YAML. Đây là điểm bắt đầu của DAG. Khai báo source còn cho phép kiểm tra độ "tươi" của dữ liệu bằng `dbt source freshness`.
- `{{ ref('stg_orders') }}` trỏ tới **một model khác**. Đây là cách các model nối với nhau.

```yaml
# models/staging/_sources.yml
sources:
  - name: shop
    schema: raw
    tables:
      - name: orders
      - name: order_items
      - name: payments
```

Bạn không bao giờ phải khai báo "chạy A trước B". Mỗi lần viết `ref()`, bạn đã ngầm khai báo một phụ thuộc. dbt đọc tất cả các `ref()` và `source()` trong project và dựng chúng thành một **DAG** (Directed Acyclic Graph, đồ thị có hướng không chu trình), rồi chạy theo đúng thứ tự, song song khi có thể.

```text
 source          staging              intermediate            marts
 ──────          ───────              ────────────            ─────
 orders      ──► stg_orders       ──► int_orders ─────────┐
 order_items ──► stg_order_items ─────────────────────────┼──► fact_sales
 payments    ──► stg_payments     ──► int_payments_agg ───┘
                                          (──► int_orders)
 products    ──► stg_products     ────────────────────────────► dim_products
 customers   ──► stg_customers    ────────────────────────────► dim_customers
```

*Hình 2. DAG minh hoạ. Mỗi mũi tên là một lời gọi `ref()` hoặc `source()`. dbt tự suy ra thứ tự chạy.*

`ref()` còn làm thêm một việc: nó chuyển tên model thành tên đầy đủ `database.schema.table` theo **target** đang chạy (khai báo trong `profiles.yml`). Chạy với `--target dev` thì `ref('stg_orders')` trỏ tới schema dev, chạy với `--target prod` thì trỏ tới schema prod. Code không đổi một ký tự nào. Cách đặt tên schema có thể tuỳ chỉnh qua macro `generate_schema_name`.

> **Nhận xét.** Vì dbt biết toàn bộ đồ thị phụ thuộc, nó có sẵn **lineage**. Câu hỏi "con số doanh thu này đến từ đâu?" giờ có câu trả lời trực quan: lần ngược từ `fact_sales` về tận file CSV gốc. Ta cũng có thể chọn chạy một phần đồ thị: `dbt build -s +fact_sales` chạy `fact_sales` cùng mọi thứ phía trước nó, còn `-s stg_orders+` chạy mọi thứ phía sau.

### 6. Materialization: cùng một SQL, nhiều cách lưu

Materialization quyết định câu SELECT của model được lưu trong warehouse dưới dạng nào.

| Loại | Bản chất | Khi nào dùng | Trong project |
|---|---|---|---|
| **view** | Chỉ lưu câu query; tính lại mỗi lần đọc | Nhẹ, luôn mới | staging, intermediate |
| **table** | Chạy query và lưu kết quả; build lại toàn bộ mỗi lần | Được đọc nhiều, cần nhanh | toàn bộ marts (dim, fact, mart) |
| **incremental** | Lần đầu tạo bảng; các lần sau chỉ xử lý dòng mới/thay đổi | Bảng lớn, dữ liệu tăng dần | chưa dùng (xem bên dưới) |
| **ephemeral** | Không tạo object; được chèn vào model khác dưới dạng CTE | Logic phụ, dùng tạm | chưa dùng |

Với view, table và ephemeral, chuyển qua lại chỉ cần đổi một dòng config, không phải viết lại SQL. Config có thể đặt cho cả thư mục trong `dbt_project.yml`:

```yaml
# dbt_project.yml
models:
  my_project:
    staging:      { +materialized: view }
    intermediate: { +materialized: view }
    marts:        { +materialized: table }
```

Incremental thì khác: ngoài config, bạn phải tự viết điều kiện lọc dữ liệu mới bằng `is_incremental()` và chọn `unique_key` để dbt biết dòng nào cần cập nhật.

```sql
-- models/marts/fact_sales.sql
{{ config(materialized='incremental', unique_key='order_item_id') }}

select ... from {{ ref('int_orders') }}
{% if is_incremental() %}
  -- {{ this }} là chính bảng fact_sales đang có trong warehouse
  where updated_at > (select max(updated_at) from {{ this }})
{% endif %}
```

Ở lần chạy đầu tiên, bảng chưa tồn tại nên `is_incremental()` trả về false và dbt xử lý toàn bộ dữ liệu. Từ lần thứ hai, dbt chỉ lấy những dòng có `updated_at` lớn hơn mốc lớn nhất đang có trong bảng. Incremental là materialization dễ sai nhất, và cả hai lỗi thường gặp đều nằm ở điều kiện lọc này.

**Lỗi 1: dữ liệu đến trễ bị bỏ qua vĩnh viễn.** Dữ liệu đến trễ là những dòng phát sinh sớm nhưng được nạp vào kho muộn, chẳng hạn do hệ thống đối tác gửi chậm hoặc pipeline hôm trước bị lỗi.

| Thời điểm | Sự kiện | Mốc `max(updated_at)` |
|---|---|---|
| Ngày 10, chạy dbt | Nạp các đơn đến hết ngày 10 | 10/11 |
| Ngày 11 | Đơn #A (`updated_at` = 11/11) được nạp vào nguồn | |
| Ngày 11 | Đơn #B (`updated_at` = 09/11) được nạp vào nguồn muộn | |
| Ngày 11, chạy dbt | Điều kiện `updated_at > 10/11` lấy #A và bỏ qua #B | 11/11 |
| Các ngày sau | Mốc chỉ tăng lên, #B không bao giờ thoả điều kiện | |

Đơn #B có trong dữ liệu thô nhưng không bao giờ vào bảng, và dbt không báo lỗi. Cách phòng là lọc lùi một khoảng an toàn để mỗi lần chạy xử lý lại dữ liệu của vài ngày gần nhất:

```sql
where updated_at > (select max(updated_at) - interval 3 day from {{ this }})
```

**Lỗi 2: thiếu `unique_key` làm dữ liệu bị chèn trùng.** Khi không có `unique_key`, dbt chỉ thêm dòng mới vào bảng. Khi có `unique_key`, dbt merge: khoá đã tồn tại thì cập nhật, chưa có thì thêm mới.

| Lần chạy | Dữ liệu mới | Không có `unique_key` | Có `unique_key='order_id'` |
|---|---|---|---|
| Ngày 10 | #100, `paid` | #100 paid | #100 paid |
| Ngày 11 | #100, `shipped` | #100 paid, #100 shipped (trùng) | #100 shipped |

Đơn #100 xuất hiện hai lần nên doanh thu bị tính đôi. Giống fan-out, lỗi này chỉ làm sai con số mà không làm câu query thất bại.

> **Chú ý.** Hai cách phòng phải đi cùng nhau. Lọc lùi 3 ngày nghĩa là chủ động lấy lại các dòng đã nạp, nên bắt buộc phải có `unique_key` để các dòng đó được ghi đè thay vì chèn trùng. Khi bảng đã sai, hoặc khi đổi logic SQL hay thêm cột, chạy `dbt build --full-refresh` để dbt bỏ qua logic incremental và dựng lại bảng từ đầu.

> **Trong project.** `fact_sales` vẫn là `table`, không phải incremental. Lý do nằm ở dữ liệu nguồn: bảng `raw.orders` chỉ có `created_at` (thời điểm tạo đơn), không có `updated_at` (thời điểm sửa gần nhất). Khi đơn đổi trạng thái, cột `order_status_id` thay đổi nhưng `created_at` giữ nguyên, nên không có cột nào cho biết dòng nào vừa thay đổi.
>
> Nếu dùng `created_at` làm điều kiện lọc, đơn #100 sẽ đi như sau:
>
> | Ngày | Trong nguồn | Điều kiện `created_at > max(created_at)` | Trong `fact_sales` |
> |---|---|---|---|
> | 01/11 | #100 được tạo, `pending` | Lấy #100 | #100 `pending` |
> | 03/11 | #100 chuyển sang `paid`, `created_at` vẫn là 01/11 | Mốc đã là 02/11, bỏ qua #100 | #100 `pending` |
> | 05/11 | #100 chuyển sang `shipped` | Bỏ qua #100 | #100 `pending` |
>
> Đơn #100 kẹt ở `pending`. Theo seed `order_status_mapping`, trạng thái này có `counts_as_revenue = false`, nên doanh thu của đơn không bao giờ được ghi nhận dù khách đã thanh toán và nhận hàng. Lọc lùi một khoảng an toàn cũng không giải quyết được: trạng thái có thể đổi sau vài tuần (giao hàng, hoàn tiền), nên khoảng lùi phải dài bằng toàn bộ lịch sử, tức là build lại cả bảng.
>
> Một hướng khác là lấy thời điểm thay đổi từ bảng `raw.audit_logs`, nơi ghi lại các thao tác `insert`, `update`, `delete` kèm `performed_at`. Kiểm tra cho thấy hướng này cũng không dùng được: trong 421 bản ghi `update` trên bảng orders, chỉ 37 bản ghi khớp với một đơn có thật, và 20 trong số đó có `performed_at` sớm hơn `created_at` của đơn.
>
> Vì vậy `table` là lựa chọn hợp lý. Với khoảng 100.000 dòng, DuckDB build lại toàn bộ trong vài giây, và mỗi lần build đều phản ánh trạng thái mới nhất của mọi đơn. Incremental chỉ đáng cân nhắc khi bảng đủ lớn để build toàn bộ trở nên chậm, và nguồn có cột thời điểm cập nhật đáng tin cậy.

## Phần III. Thiết kế dữ liệu

### 7. Kiến trúc phân tầng: staging → intermediate → marts

Code phần mềm thường được chia tầng: tầng truy cập dữ liệu, tầng logic nghiệp vụ, tầng hiển thị. Model dbt cũng vậy. Mỗi tầng chỉ làm một loại việc, nên khi có lỗi ta biết ngay phải tìm ở đâu, và khi nguồn thay đổi thì chỉ phải sửa ở một chỗ.

```text
 ┌──────────────┐    ┌─────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
 │ raw / source │    │ staging             │    │ intermediate         │    │ marts                │
 │ dữ liệu thô, │──► │ làm sạch, 1:1 nguồn │──► │ join, logic, đổi     │──► │ fact, dim cho người  │
 │ không sửa    │    │ "nguyên liệu đã     │    │ grain                │    │ dùng                 │
 │              │    │  sơ chế"            │    │ "các bước nấu"       │    │ "món ăn lên bàn"     │
 └──────────────┘    └─────────────────────┘    └──────────────────────┘    └──────────────────────┘
                      materialized: view         ephemeral / view            table / incremental
                      gọi: source()              gọi: ref(stg / int)         gọi: ref(int / stg)
```

*Hình 3. Ba tầng model và quy ước đi kèm. Dữ liệu chảy một chiều từ trái sang phải. Không tầng nào được `ref()` ngược về tầng phía sau nó.*

Cấu trúc thư mục gợi ý (theo hướng dẫn của dbt Labs): staging chia theo **hệ thống nguồn**, còn intermediate và marts chia theo **mảng nghiệp vụ**.

```text
models/
├── staging/
│   └── shop/                       # 1 thư mục = 1 hệ thống nguồn
│       ├── _shop__sources.yml      # khai báo source
│       ├── _shop__models.yml       # mô tả + test cho các stg
│       ├── stg_orders.sql
│       ├── stg_order_items.sql
│       └── stg_payments.sql
├── intermediate/
│   └── finance/                    # 1 thư mục = 1 mảng nghiệp vụ
│       ├── int_payments_agg.sql
│       └── int_orders.sql
└── marts/
    ├── finance/  fact_sales.sql
    └── core/     dim_customers.sql, dim_products.sql
```

Quy ước đặt tên đầy đủ của dbt Labs là `stg_<nguồn>__<thực thể>` (ví dụ `stg_shop__orders`), có hai dấu gạch dưới để tách tên nguồn. Project nhỏ một nguồn có thể dùng `stg_orders`. Quan trọng nhất là cả project dùng một quy ước thống nhất.

#### 7.1 Staging: chuẩn hoá dữ liệu nguồn

**Mục đích:** biến mỗi bảng thô thành một phiên bản sạch, đặt tên chuẩn, đúng kiểu dữ liệu. Đây là "khối nguyên tử" mà mọi model phía sau xây lên. Mỗi bảng nguồn có **đúng một** model staging, và staging là **tầng duy nhất được gọi `source()`**.

| NÊN làm ở staging | KHÔNG làm ở staging |
|---|---|
| Đổi tên cột: `id` → `order_id` | Join với bảng khác |
| Ép kiểu: chuỗi → `date`, `decimal` | Tổng hợp (`group by`), vì sẽ đổi grain |
| Chuẩn hoá giá trị: `lower()`, `trim()`, đổi đơn vị (xu → đồng) | Logic nghiệp vụ như "doanh thu thuần", "khách VIP" |
| Phân loại đơn giản bằng `case when` trên một cột | Lọc bỏ dòng theo quy tắc nghiệp vụ |

```sql
-- models/staging/shop/stg_payments.sql
with source as (                                -- CTE 1: lấy nguồn
    select * from {{ source('shop', 'payments') }}
),
renamed as (                                    -- CTE 2: làm sạch
    select
        id                              as payment_id,
        order_id,
        lower(trim(payment_method))     as payment_method,
        amount_cents / 100.0            as amount,      -- đổi đơn vị
        cast(created_at as timestamp)   as paid_at
    from source
)
select * from renamed
```

**Materialization:** `view`. Staging không cần lưu riêng một bản dữ liệu; nó luôn phản ánh bảng thô mới nhất. **Test tối thiểu:** `unique` và `not_null` trên khoá chính của mỗi model staging. Lỗi dữ liệu nguồn nên bị bắt ở đây, càng sớm càng tốt.

> **Nhận xét.** Staging nằm giữa hệ thống nguồn và phần còn lại của project. Nếu nguồn đổi tên cột hay đổi tiền từ xu sang đồng, bạn chỉ cần sửa một file staging, các model phía sau không phải sửa gì.

#### 7.2 Intermediate: tích hợp dữ liệu và logic nghiệp vụ

**Mục đích:** chứa những bước biến đổi có mục đích rõ ràng nằm giữa dữ liệu sạch và sản phẩm cuối. Đây là nơi đặt các phép join, tính toán nghiệp vụ, và quan trọng nhất là **đưa dữ liệu về đúng grain** trước khi ghép. Mỗi model intermediate nên trả lời được câu: "model này làm một việc gì?"

Những việc điển hình ở tầng này:

- **Đổi grain:** tổng hợp payments từ "1 dòng / lần thanh toán" về "1 dòng / đơn hàng" (chính là cách chống fan-out ở mục 9).
- **Ghép nhiều nguồn** thành một thực thể hoàn chỉnh: đơn hàng + thanh toán + trạng thái giao hàng.
- **Đặt định nghĩa nghiệp vụ một lần:** "doanh thu thuần" là gì, đơn nào được tính.
- **Pivot, unpivot, tách** những logic quá dài khỏi model marts để dễ đọc và dễ test.

```sql
-- models/intermediate/finance/int_orders.sql
with orders   as (select * from {{ ref('stg_orders') }}),
     payments as (select * from {{ ref('int_payments_agg') }})   -- đã ở grain đơn hàng

select
    o.order_id,
    o.customer_id,
    o.order_date,
    o.status,
    coalesce(p.total_paid, 0)                       as total_paid,
    -- Định nghĩa doanh thu thuần nằm ở ĐÚNG MỘT chỗ trong project
    case when o.status in ('cancelled', 'returned') then 0
         else o.subtotal end                        as net_revenue
from orders o
left join payments p using (order_id)               -- 1:1, không fan-out
```

**Đặt tên:** nên dùng động từ hoặc mô tả hành động, ví dụ `int_payments_pivoted_to_orders`, `int_orders_joined_with_payments`, để người đọc đoán được model làm gì chỉ qua cái tên. **Materialization:** `ephemeral` (chỉ được chèn như CTE vào model phía sau) hoặc `view` (khi muốn query trực tiếp để debug). Tầng này **không** dành cho người dùng cuối hay dashboard.

> **Chú ý.** Không phải project nào cũng cần intermediate cho mọi thứ. Nếu một mart chỉ cần join hai model staging đơn giản thì làm thẳng ở mart. Hãy tạo intermediate khi (1) logic quá dài làm model marts khó đọc, (2) cùng một logic được dùng lại ở nhiều mart, hoặc (3) cần đổi grain trước khi join.

#### 7.3 Marts: dữ liệu phục vụ phân tích

**Mục đích:** bảng cuối cùng mà người dùng, dashboard và nhóm khác đọc. Mỗi mart đại diện cho một **thực thể hoặc sự kiện nghiệp vụ** (khách hàng, sản phẩm, giao dịch bán hàng), thường ở dạng rộng và đã denormalize để query đơn giản, không phải join thêm.

```sql
-- models/marts/finance/fact_sales.sql
{{ config(materialized='table') }}

select
    i.order_item_id,                        -- grain: 1 dòng / sản phẩm trong đơn
    o.order_id,
    o.customer_id,
    i.product_id,
    o.order_date,
    i.quantity,
    i.price * i.quantity                    as gross_revenue
from {{ ref('stg_order_items') }} i
join {{ ref('int_orders') }} o using (order_id)   -- nhiều item : 1 đơn → giữ grain item
where o.status not in ('cancelled', 'returned')
```

- **Đặt tên:** theo ngôn ngữ nghiệp vụ. Kiểu Kimball dùng `fact_` / `dim_`; kiểu dbt Labs dùng tên thực thể đơn giản như `orders`, `customers`. Chọn một kiểu và dùng nhất quán.
- **Materialization:** `table` cho nhanh khi đọc; `incremental` khi bảng lớn.
- **Chất lượng:** đây là tầng cần tài liệu, test, và contract đầy đủ nhất, vì người khác phụ thuộc trực tiếp vào nó.

> **Chú ý.** Đừng tạo mart theo từng dashboard (`orders_for_ceo_dashboard`, `orders_for_marketing_v2`). Mỗi bảng sẽ có một định nghĩa hơi khác nhau, và ta quay lại đúng vấn đề "hai dashboard, hai con số" ở phần mở đầu. Mart nên xoay quanh **thực thể**; dashboard tự lọc và nhóm trên đó.

#### 7.4 Quy tắc phụ thuộc giữa các tầng

| Model ở tầng | Được phép gọi | Không được gọi |
|---|---|---|
| **staging** | `source()` | `ref()` tới bất kỳ model nào khác |
| **intermediate** | `ref()` tới staging và intermediate khác | `source()`; ref tới marts |
| **marts** | `ref()` tới intermediate, staging, (hạn chế) marts khác | `source()` |

Nói gọn: **dữ liệu chảy một chiều**. Nếu một model marts gọi thẳng `source()`, nó bỏ qua lớp làm sạch, và khi nguồn đổi thì lỗi sẽ xuất hiện ở chỗ không ai ngờ. Có thể kiểm tra tự động các quy tắc này bằng package `dbt_project_evaluator`.

#### 7.5 Liên hệ với kiến trúc Medallion

Nếu bạn từng nghe về Lakehouse, mô hình Medallion của Databricks có ý tưởng tương tự. Hai cách gọi không khớp tuyệt đối, nhưng có thể đối chiếu như sau:

| Medallion | dbt | Ý nghĩa chung |
|---|---|---|
| Bronze | raw / source | Dữ liệu thô, giữ nguyên như nguồn |
| Silver | staging (+ một phần intermediate) | Đã làm sạch, chuẩn hoá, có thể đã ghép |
| Gold | marts | Sẵn sàng cho phân tích và báo cáo |

> **Trong project.** Project có 54 model: **31 staging** (mỗi bảng CSV một model), **5 intermediate** và **18 marts** (8 dimension, 5 fact ở `core/`, cộng 5 bảng ở `sales/`, `customer/`, `operations/`). Ví dụ `int_orders__enriched` được đặt ở intermediate vì hai lý do: nó được dùng lại ở nhiều nơi (`fact_orders`, `fact_sales` qua `int_order_items__enriched`, `dim_customer` qua `int_customers__order_history`), và nó là nơi duy nhất quyết định đơn nào được tính doanh thu.

```text
models/
├── staging/ecommerce/      _ecommerce__sources.yml, _ecommerce__models.yml
│                           stg_ecommerce__orders.sql, stg_ecommerce__order_items.sql, … (31 file)
├── intermediate/           int_orders__enriched.sql, int_order_items__enriched.sql,
│                           int_orders__payments_agg.sql, int_customers__order_history.sql,
│                           int_addresses__geography.sql
└── marts/
    ├── core/               dim_date, dim_customer, dim_product, dim_geography, dim_promotion,
    │                       dim_order_status, dim_payment_method, dim_shipping_method,
    │                       fact_sales, fact_orders, fact_payments, fact_shipments, fact_returns
    ├── sales/              mart_sales_daily, mart_product_performance
    ├── customer/           mart_customer_360
    └── operations/         fact_inventory_current, fact_support_tickets
```

### 8. Marts và star schema (Kimball)

Tầng marts thường được thiết kế theo **star schema** của Ralph Kimball:

- **Fact table** ghi lại *sự kiện* có thể đo đếm: mỗi dòng là một lần bán, một lần thanh toán… Chứa các chỉ số (số lượng, số tiền) và khoá ngoại tới dimension.
- **Dimension table** mô tả *ngữ cảnh* của sự kiện: ai mua (customer), mua gì (product), khi nào (date). Đây là các cột dùng để lọc và nhóm.

```text
   ┌───────────────────────┐                         ┌───────────────────────┐
   │ dim_customers         │                         │ dim_products          │
   │ tên, thành phố,       │     ┌───────────────┐   │ tên, danh mục, giá    │
   │ phân khúc             │─────│ fact_sales    │───│                       │
   └───────────────────────┘     │ order_item_id │   └───────────────────────┘
                                 │   (grain)     │
                                 │ customer_id   │
                                 │ product_id    │
                                 │ order_date    │
                                 │ quantity,     │
                                 │ revenue       │
                                 └───────┬───────┘
                                 ┌───────┴───────┐
                                 │ dim_date      │
                                 │ ngày, tháng,  │
                                 │ quý, thứ      │
                                 └───────────────┘
```

*Hình 4. Star schema: một fact ở giữa, các dimension xung quanh.*

> **Trong project.** `fact_sales` ở grain một dòng cho mỗi sản phẩm trong đơn, nối tới 7 dimension qua surrogate key: `dim_date`, `dim_customer`, `dim_product`, `dim_geography` (địa điểm giao hàng), `dim_promotion`, `dim_shipping_method` và `dim_order_status`. Bốn fact còn lại (`fact_orders`, `fact_payments`, `fact_shipments`, `fact_returns`) giữ grain riêng của mình nhưng dùng chung các dimension này. Đơn không có mã giảm giá trỏ tới dòng "No promotion" (`coupon_id = -1`) trong `dim_promotion` thay vì để khoá null, nên mọi dòng fact đều join được với mọi dimension.

### 9. Grain và lỗi fan-out

**Grain** là câu trả lời cho câu hỏi: *"Một dòng trong bảng này đại diện cho cái gì?"* Ví dụ: một dòng của `stg_orders` là một đơn hàng; một dòng của `stg_order_items` là một sản phẩm trong đơn; một dòng của `stg_payments` là một lần thanh toán. Đây là khái niệm quan trọng nhất khi mô hình hoá, vì mọi phép join đều có thể âm thầm thay đổi grain.

Xét đơn hàng **#1001**: có **3 sản phẩm** (subtotal = 300) và được trả bằng **2 lần thanh toán** (200 + 100). Nếu join thẳng payments vào order_items theo `order_id`:

```sql
-- SAI: join hai bảng cùng "nhiều" theo order_id
select i.order_item_id, p.amount
from {{ ref('stg_order_items') }} i
join {{ ref('stg_payments') }} p
  on i.order_id = p.order_id
-- 3 item × 2 payment = 6 dòng
-- sum(amount) = (200 + 100) × 3 = 900
```

| item | payment | amount |
|---|---|---|
| A | P1 | 200 |
| A | P2 | 100 |
| B | P1 | 200 |
| B | P2 | 100 |
| C | P1 | 200 |
| C | P2 | 100 |
| **Tổng** | | **900 (thực tế 300)** |

Đây gọi là **fan-out**: một quan hệ một-nhiều bị nhân với một quan hệ một-nhiều khác, số dòng tăng lên, và mọi phép `sum()` phía sau đều bị đội lên. Câu SQL vẫn chạy bình thường, không báo lỗi, nên chỉ nhìn kết quả thì khó biết là sai.

Fan-out nhân cả hai phía. Trong bảng trên, mỗi payment lặp lại 3 lần (theo số item), và mỗi item cũng lặp lại 2 lần (theo số payment). Nếu tính thêm `sum(i.price * i.quantity)` trên cùng kết quả join, subtotal 300 sẽ thành 600.

#### 9.1 Vì sao lỗi này khó phát hiện

Hệ số nhân của mỗi đơn bằng số dòng ở phía "nhiều" còn lại. Trong dữ liệu thật, phần lớn đơn chỉ có một lần thanh toán, nên hệ số là 1 và các đơn đó vẫn ra đúng. Chỉ những đơn trả nhiều lần (trả góp, chia hai thẻ, dùng thêm ví hoặc voucher) mới bị cộng dư. Tổng doanh thu vì vậy chỉ lệch vài phần trăm, đủ nhỏ để nhìn dashboard không thấy gì bất thường, nhưng sẽ không khớp khi đối chiếu với số liệu kế toán.

Lỗi cũng có thể xuất hiện muộn. Lúc viết model, hệ thống thanh toán chỉ cho trả một lần, join thẳng vẫn đúng. Vài tháng sau có thêm tính năng trả góp, model không đổi một dòng nào nhưng con số bắt đầu sai.

#### 9.2 Cách sửa: gom về cùng grain rồi mới join

Đưa từng bảng về **cùng grain** trước khi join. Ở đây grain chung là đơn hàng, nên gom payments và order_items về một dòng mỗi `order_id`:

```sql
-- models/intermediate/int_payments_agg.sql
select order_id, sum(amount) as total_paid     -- grain: 1 dòng / order
from {{ ref('stg_payments') }}
group by order_id
```

```sql
-- models/intermediate/int_order_items_agg.sql
select
    order_id,
    count(*)                as item_count,
    sum(price * quantity)   as items_total     -- grain: 1 dòng / order
from {{ ref('stg_order_items') }}
group by order_id
```

Sau đó join cả hai vào `stg_orders`. Mỗi bên chỉ có tối đa một dòng cho mỗi `order_id`, nên số dòng của kết quả bằng đúng số đơn hàng:

```sql
-- models/marts/fact_orders.sql (rút gọn)
select
    o.order_id,
    i.item_count,
    i.items_total,
    coalesce(p.total_paid, 0) as total_paid
from {{ ref('stg_orders') }} o
left join {{ ref('int_order_items_agg') }} i on i.order_id = o.order_id
left join {{ ref('int_payments_agg') }}    p on p.order_id = o.order_id
```

| order_id | item_count | items_total | total_paid |
|---|---|---|---|
| 1001 | 3 | 300 | 300 |

Dùng `left join` để giữ lại các đơn chưa có thanh toán; với các đơn này `total_paid` là null nên cần `coalesce` về 0.

Trường hợp cần giữ grain dòng sản phẩm (như `fact_sales`) mà vẫn muốn có thông tin thanh toán, không gắn thẳng `total_paid` vào từng dòng, vì cộng lại sẽ bị nhân theo số dòng sản phẩm. Có hai cách:

- Để số tiền cấp đơn ở fact cấp đơn (`fact_orders`). Ai cần thì join ở grain đơn hàng.
- Phân bổ số tiền về từng dòng theo tỷ lệ, ví dụ `total_paid * line_total / items_total`. Khi đó tổng các dòng của một đơn bằng đúng `total_paid` và cột này cộng được ở grain dòng.

#### 9.3 Những cách sửa nhanh nên tránh

- `sum(distinct p.amount)`: chỉ đúng khi các khoản tiền khác nhau. Đơn trả hai lần, mỗi lần 100, sẽ chỉ được tính 100.
- `select distinct` sau khi join: `distinct` chỉ bỏ một dòng khi nó giống hệt một dòng khác ở tất cả các cột được select. Kết quả phụ thuộc vào việc select những cột nào. Với 6 dòng sau khi join của đơn #1001:

  | Cột được select | Số dòng sau `distinct` | Tổng amount | Nhận xét |
  |---|---|---|---|
  | item, payment, amount | 6 | 900 | Sai. `A, P1, 200` và `B, P1, 200` khác cột item nên không dòng nào bị bỏ |
  | payment, amount | 2 | 300 | Đúng, nhưng kết quả chỉ là bảng payments ban đầu, join với order_items không còn tác dụng gì |
  | amount | 2 | 300 | Đúng ở ví dụ này chỉ vì hai lần thanh toán có số tiền khác nhau |

  Trường hợp chỉ giữ cột amount sẽ sai giống `sum(distinct)` khi hai lần thanh toán cùng số tiền. Ví dụ đơn trả 2 lần, mỗi lần 100:

  | payment | amount |
  |---|---|
  | P1 | 100 |
  | P2 | 100 |

  `select distinct amount` chỉ còn một dòng 100, tổng ra 100 thay vì 200.
- Chia ngược lại, ví dụ `sum(p.amount) / count(distinct i.order_item_id)`. Ý tưởng là mỗi payment bị lặp lại đúng bằng số item của đơn, nên chia lại cho số item. Cách này chỉ đúng khi hệ số nhân đó cố định. Để thấy khi nào nó sai, xét dữ liệu của ba đơn:

  `order_items`:

  | order_id | item | price |
  |---|---|---|
  | 1001 | A | 100 |
  | 1001 | B | 100 |
  | 1001 | C | 100 |
  | 1002 | D | 50 |

  `payments`:

  | order_id | payment | amount |
  |---|---|---|
  | 1001 | P1 | 200 |
  | 1001 | P2 | 100 |
  | 1002 | P3 | 50 |
  | 1003 | P4 | 80 |

  Đơn #1001 có 3 item và trả 2 lần, đơn #1002 có 1 item và trả 1 lần, đơn #1003 đã thanh toán nhưng chưa có item nào (ví dụ dữ liệu item về trễ).

  Chỉ xét riêng đơn #1001, phép chia cho kết quả đúng: sau join có 6 dòng như bảng ở đầu mục, `sum(amount)` = 900, có 3 item, 900 / 3 = 300.

  Trường hợp 1: tính trên nhiều đơn cùng lúc. Khi tính tổng doanh thu cho cả #1001 và #1002:

  | Đơn | Số item | Số payment | Số dòng sau join | sum(amount) sau join | Giá trị đúng |
  |---|---|---|---|---|---|
  | #1001 | 3 | 2 | 6 | 900 | 300 |
  | #1002 | 1 | 1 | 1 | 50 | 50 |
  | Cả hai đơn | 4 | 3 | 7 | 950 | 350 |

  Chia trên cả bảng ra 950 / 4 = 237,5, trong khi đúng là 350. Lý do là đơn #1001 bị nhân 3 còn đơn #1002 bị nhân 1, không có một số chung nào để chia. Muốn đúng phải chia trong từng đơn (`group by order_id`) rồi mới cộng lại, tức là group by hai tầng.

  Trường hợp 2: join thêm một bảng một-nhiều thứ ba. Giả sử đơn #1001 được giao làm 2 lần, S1 và S2. Mỗi dòng trong 6 dòng cũ lại nhân đôi theo shipment:

  | item | payment | shipment | amount |
  |---|---|---|---|
  | A | P1 | S1 | 200 |
  | A | P1 | S2 | 200 |
  | A | P2 | S1 | 100 |
  | A | P2 | S2 | 100 |
  | B | P1 | S1 | 200 |
  | B | P1 | S2 | 200 |
  | B | P2 | S1 | 100 |
  | B | P2 | S2 | 100 |
  | C | P1 | S1 | 200 |
  | C | P1 | S2 | 200 |
  | C | P2 | S1 | 100 |
  | C | P2 | S2 | 100 |

  `sum(amount)` = 1800, chia cho 3 item ra 600 thay vì 300. Phải chia thêm cho số shipment, và mỗi lần join thêm bảng lại phải sửa công thức.

  Trường hợp 3: đơn không có item. Đơn #1003 khi `left join` với `order_items` chỉ có một dòng, cột item là null:

  | order_id | item | payment | amount |
  |---|---|---|---|
  | 1003 | null | P4 | 80 |

  `count(distinct i.order_item_id)` bằng 0, nên 80 / 0 báo lỗi chia cho 0 hoặc ra null tuỳ warehouse. Khoản thanh toán 80 bị mất khỏi báo cáo hoặc làm hỏng cả câu query.

  Ngoài ra, người đọc code sau này cũng khó hiểu vì sao phải chia cho số item, vì phép chia này thực chất là để sửa lỗi nhân dòng.

Riêng `count(distinct o.order_id)` thì vẫn đúng sau fan-out, vì nó đếm khoá chứ không cộng giá trị.

#### 9.4 Thực tế làm như thế nào

Gom về cùng grain rồi mới join là cách làm chuẩn trong các project dbt:

- Project mẫu `jaffle_shop` của dbt Labs làm đúng như vậy: model `customers` gom orders và payments trong các CTE riêng về một dòng mỗi khách hàng rồi mới join.
- Hướng dẫn cấu trúc project của dbt đặt bước này vào tầng intermediate và gợi ý ghi grain đích vào tên model, ví dụ `int_payments_pivoted_to_orders`. Project này dùng `int_orders__payments_agg`.
- Mỗi model mart ghi rõ grain trong description và có test `unique` + `not_null` trên khoá grain. Nếu grain gồm nhiều cột thì dùng `dbt_utils.unique_combination_of_columns`. Đây là cách bắt fan-out hiệu quả nhất, vì test fail ngay ở lần build đầu tiên có dữ liệu bị nhân.
- Với các chỉ số quan trọng như doanh thu, nhiều team viết thêm singular test so tổng ở mart với tổng ở staging. Nếu lệch quá ngưỡng cho phép thì build thất bại.
- Một số công cụ BI và semantic layer cũng xử lý lỗi này. Looker có symmetric aggregates để tính đúng tổng sau khi join một-nhiều. dbt Semantic Layer (MetricFlow) không cho phép các kiểu join có thể làm nhân dòng. Tuy vậy, khi người dùng tự viết SQL trên warehouse hoặc kéo bảng ra Excel thì không có lớp nào xử lý giúp, nên mart vẫn cần đúng grain ngay từ đầu.

> **Điểm nhấn.** Trước mỗi phép join, hãy tự hỏi: *"grain của hai bên là gì, và grain của kết quả là gì?"* Ghi grain vào phần mô tả của mỗi model, và dùng test để khoá nó lại: `unique` trên khoá của grain sẽ fail ngay lập tức nếu fan-out xảy ra (xem Phần IV).

> **Trong project.** `order_total` là số tiền ở grain đơn hàng, nằm trong `fact_orders`. Nếu join `fact_orders` với `fact_sales` (grain dòng sản phẩm) rồi `sum(order_total)`, mỗi đơn bị lặp lại một lần cho mỗi dòng sản phẩm: tổng tăng từ **10,8 triệu lên 40,2 triệu, gấp 3,7 lần**, và không có lỗi nào được báo. File `analyses/fanout_revenue_inflation.sql` đặt hai con số này cạnh nhau. Cách phòng trong project: số tiền cấp đơn (phí ship, thuế, tổng đơn) chỉ nằm ở `fact_orders`; `fact_sales` chỉ chứa các chỉ số cộng được ở cấp dòng, và payments được gom về một dòng mỗi đơn trong `int_orders__payments_agg` trước khi join.

## Phần IV. Dữ liệu đáng tin cậy

Phần II và III cho biết mỗi con số được tính từ đâu. Phần này nói về cách kiểm tra con số đó có đúng không. Dữ liệu trong dbt được tạo ra bằng code, nên cũng cần được test như code.

### 10. Data tests: kiểm tra dữ liệu thật

Data test là các **khẳng định (assertion)** chạy trên dữ liệu thật sau khi model được build. Về bản chất, mỗi test là một câu SELECT tìm các dòng vi phạm: **trả về 0 dòng nghĩa là pass**.

**Generic tests** là test có sẵn, khai báo bằng YAML. dbt có bốn test cài sẵn: `unique`, `not_null`, `accepted_values` và `relationships`.

```yaml
# models/marts/schema.yml
models:
  - name: fact_sales
    description: "Mỗi dòng là một sản phẩm trong một đơn hàng."
    columns:
      - name: order_item_id
        data_tests: [unique, not_null]        # khoá grain → chặn fan-out
      - name: status
        data_tests:
          - accepted_values:
              values: ['completed', 'shipped', 'cancelled', 'returned']
      - name: customer_id
        data_tests:
          - relationships:                    # khoá ngoại phải tồn tại
              to: ref('dim_customers')
              field: customer_id
```

Các phiên bản dbt cũ dùng khoá `tests:`; từ dbt 1.8 tên khuyến nghị là `data_tests:`.

**Singular tests** là một file SQL tự viết trong thư mục `tests/`, dùng cho logic nghiệp vụ mà test có sẵn không diễn tả được:

```sql
-- tests/assert_items_sum_to_subtotal.sql
-- Tổng tiền các item phải bằng subtotal của order. Trả về các đơn bị lệch.
select o.order_id, o.subtotal, sum(i.price * i.quantity) as items_total
from {{ ref('stg_orders') }} o
join {{ ref('stg_order_items') }} i using (order_id)
group by o.order_id, o.subtotal
having abs(o.subtotal - sum(i.price * i.quantity)) > 0.01
```

Mỗi test có thể đặt `severity: warn` (chỉ cảnh báo) hoặc `error` (mặc định, làm build thất bại), và `store_failures: true` để lưu các dòng lỗi vào một bảng cho dễ điều tra.

### 11. Unit tests: kiểm tra logic, không phải dữ liệu

Data test hỏi "dữ liệu hôm nay có đúng không?". **Unit test** (có từ dbt 1.8) hỏi một câu khác: "*logic SQL của tôi có đúng không?*". Bạn đưa vào một vài dòng dữ liệu giả và khai báo kết quả mong đợi. dbt chạy model trên dữ liệu giả đó và so sánh. Unit test chạy được ngay cả khi chưa có dữ liệu thật, rất hợp để bắt các trường hợp biên.

```yaml
unit_tests:
  - name: revenue_excludes_cancelled_orders
    model: int_orders
    given:
      - input: ref('stg_orders')
        rows:
          - {order_id: 1, status: 'completed', subtotal: 100}
          - {order_id: 2, status: 'cancelled', subtotal: 50}
    expect:
      rows:
        - {order_id: 1, net_revenue: 100}
        - {order_id: 2, net_revenue: 0}
```

| | Data test | Unit test |
|---|---|---|
| Kiểm tra | Dữ liệu thật sau khi build | Logic của model trên dữ liệu giả |
| Bắt được | Dữ liệu nguồn bẩn, fan-out, khoá ngoại mồ côi | Sai công thức, sai điều kiện, trường hợp biên |
| Chạy khi | Mỗi lần build | Chủ yếu trong lúc phát triển và CI |

### 12. Model contracts: cam kết về "hình dạng"

Test kiểm tra *giá trị* sau khi build. **Contract** (có từ dbt 1.5) kiểm tra *hình dạng* ngay lúc build: model phải trả về đúng các cột, đúng kiểu dữ liệu đã khai báo, nếu không dbt sẽ dừng trước khi tạo bảng. Contract hợp với các model marts mà dashboard hay nhóm khác phụ thuộc vào. Mức hỗ trợ ràng buộc (not_null, primary_key…) tuỳ vào từng warehouse.

```yaml
models:
  - name: fact_sales
    config:
      contract: { enforced: true }
    columns:
      - name: order_item_id
        data_type: integer
        constraints: [{ type: not_null }]
      - name: revenue
        data_type: decimal(18,2)
```

> **Nhận xét.** Ba lớp bảo vệ bổ sung cho nhau: **unit test** bảo vệ logic, **contract** bảo vệ cấu trúc, **data test** bảo vệ dữ liệu. Không lớp nào thay thế được lớp nào.

> **Trong project.** Project có **232 data test**, và tất cả được chạy lại mỗi lần `dbt build`. Một model lỗi sẽ khiến các model phía sau nó bị bỏ qua (skip), nên dữ liệu sai không lan xuống dashboard. Các test gồm:
>
> - `unique` + `not_null` trên khoá chính của mọi source, model staging, dimension và fact.
> - `relationships` từ mọi khoá ngoại của fact tới dimension tương ứng.
> - `accepted_values` trên các cột trạng thái, mức ưu tiên, phân khúc RFM.
> - 3 singular test cho quy tắc nghiệp vụ: tổng các dòng sản phẩm phải khớp với tiền của đơn (`assert_fact_sales_reconciles_to_orders`), đơn pending, cancelled, refunded không được đóng góp doanh thu (`assert_no_revenue_from_non_revenue_statuses`), và một test chỉ cảnh báo cho đơn không có sản phẩm nào (`warn_orders_without_items`).
>
> Project chưa dùng unit test và contract; đó là hai bước tiếp theo hợp lý cho `int_orders__enriched` và `fact_sales`.

Kết quả lần `dbt build` gần nhất:

```text
[WARNING]: in test warn_orders_without_items (tests\warn_orders_without_items.sql)
[WARNING]: Got 2258 results, configured to warn if != 0

Done. PASS=287 WARN=1 ERROR=0 SKIP=0 NO-OP=0 REUSED=0 TOTAL=288
```

288 bước gồm 54 model, 1 seed, 1 snapshot và 232 test. Cảnh báo duy nhất là có chủ đích: dữ liệu giả lập có 2.258 đơn chỉ có phí ship mà không có sản phẩm nào. Test đặt `severity: warn` để báo vấn đề mỗi lần build mà không chặn pipeline.

### 13. Documentation và lineage

Các `description` bạn viết trong YAML, cùng với DAG mà dbt đã biết, được dbt biến thành một website tài liệu bằng `dbt docs generate` và `dbt docs serve`. Mỗi model có mô tả, danh sách cột, các test đang áp dụng, SQL gốc và SQL đã compile, cùng biểu đồ lineage tương tác.

Lineage của `fact_sales` trong project, rút gọn:

```text
raw.orders ────────► stg_ecommerce__orders ─────────┐
raw.order_statuses ► stg_ecommerce__order_statuses ─┤
seed order_status_mapping ──────────────────────────┼─► int_orders__enriched ──┐
raw.payments ──────► stg_ecommerce__payments ──► int_orders__payments_agg ─┘   │
                                                                               ▼
raw.order_items ───► stg_ecommerce__order_items ──────────────────► int_order_items__enriched ──┐
raw.order_returns ─► stg_ecommerce__order_returns ─────────────────────────┘                    ├─► fact_sales
raw.addresses ─────► stg_ecommerce__addresses ──► int_addresses__geography ─────────────────────┘
```

> **Nhận xét.** Lineage trả lời câu hỏi thứ nhất nêu ở phần mở đầu, tức nguồn gốc của chỉ số doanh thu. Trong dbt docs, lineage của `fact_sales` cho thấy dữ liệu đi từ `int_order_items__enriched`, qua `int_orders__enriched` (nơi seed `order_status_mapping` xác định đơn nào được tính doanh thu), về các model staging và cuối cùng là các bảng raw. Vì tài liệu được sinh trực tiếp từ code, nó luôn phản ánh đúng trạng thái hiện tại của project.

### 14. CI/CD

Vì mọi thứ là file trong Git, một Pull Request có thể tự động chạy `dbt build` trên một schema tạm trước khi merge. Với project lớn, dbt hỗ trợ **Slim CI**: chỉ build những model đã thay đổi và những model phụ thuộc vào chúng, bằng cách so sánh với trạng thái của production:

```bash
dbt build --select state:modified+ --defer --state ./prod-artifacts
```

Nếu một thay đổi làm hỏng test ở bất kỳ model nào phía sau, PR sẽ bị chặn, và lỗi được phát hiện trước khi đến tay người dùng.

## Phần V. Tính năng nâng cao

### 15. Jinja và macros: SQL có biến, vòng lặp, hàm

**Jinja** là một ngôn ngữ template mã nguồn mở viết bằng Python, ban đầu được dùng để sinh trang HTML trong các web framework như Flask. Một template Jinja là văn bản thông thường có chèn các đoạn mã; khi template được render, các đoạn mã này được thực thi và thay bằng kết quả. dbt áp dụng cơ chế đó cho SQL: mỗi model là một template, và bước compile render template thành câu SQL thuần trước khi gửi tới warehouse. Nhờ vậy SQL, vốn không có biến, vòng lặp hay hàm do người dùng định nghĩa, có thêm các cấu trúc lập trình này. Warehouse không xử lý Jinja; nó chỉ nhận câu SQL đã được render.

Jinja có ba loại cú pháp:

| Cú pháp | Chức năng | Ví dụ |
|---|---|---|
| `{{ ... }}` | Biểu thức: tính một giá trị và chèn kết quả vào SQL | `{{ ref('stg_orders') }}` |
| `{% ... %}` | Câu lệnh: điều kiện, vòng lặp, gán biến, định nghĩa macro; không tự chèn gì vào SQL | `{% if is_incremental() %}` |
| `{# ... #}` | Chú thích; bị loại bỏ hoàn toàn khi compile | `{# giải thích macro #}` |

Ví dụ, dòng `{{ to_money('total') }} as order_total` trong một model staging được render thành `cast(total as decimal(18, 2)) as order_total`. Có thể xem kết quả render của mọi model bằng `dbt compile`, trong thư mục `target/compiled/`. Các hàm `ref()` và `source()` ở Phần II thực chất cũng là hàm Jinja do dbt cung cấp.

**Macro** là hàm Jinja tái sử dụng, đặt trong thư mục `macros/`. Đây là cách dbt hiện thực nguyên tắc DRY.

Vòng lặp, ví dụ pivot theo phương thức thanh toán:

```sql
{% set methods = ['card', 'bank', 'cod'] %}
select order_id,
{% for m in methods %}
    sum(case when method = '{{ m }}' then amount else 0 end) as {{ m }}_amount
    {%- if not loop.last %},{% endif %}
{% endfor %}
from {{ ref('stg_payments') }}
group by order_id
```

Macro và cách dùng trong model:

```sql
-- macros/to_vnd.sql
{% macro to_vnd(col, rate=25000) %}
    round({{ col }} * {{ rate }}, 0)
{% endmacro %}

-- trong model
select
    order_id,
    {{ to_vnd('subtotal') }} as subtotal_vnd
from {{ ref('stg_orders') }}
```

> **Chú ý.** Jinja mạnh nhưng dễ làm code khó đọc. Nếu đồng nghiệp phải chạy `dbt compile` mới hiểu model làm gì, có lẽ bạn đã dùng Jinja quá tay.

> **Trong project.** Có ba macro, đều ngắn: `to_money(col)` ép cột tiền về `decimal(18,2)` ở mọi model staging; `date_key(col)` đổi ngày thành số nguyên dạng `YYYYMMDD` để khớp với `dim_date.date_key`; và `generate_schema_name` ghi đè cách đặt tên schema mặc định, để model trong `marts/core/` vào đúng schema `core` thay vì `analytics_core`.

### 16. Snapshots: lưu lịch sử thay đổi (SCD Type 2)

Bảng nguồn thường chỉ giữ trạng thái *hiện tại*: khi giá sản phẩm đổi từ 100 lên 120, giá trị cũ mất luôn. **Snapshot** chụp lại bảng mỗi lần chạy `dbt snapshot`, và khi một dòng thay đổi, nó đóng phiên bản cũ và mở phiên bản mới. Đây là mô hình **Slowly Changing Dimension Type 2**.

```sql
-- snapshots/products_snapshot.sql
{% snapshot products_snapshot %}
{{ config(target_schema='snapshots', unique_key='product_id',
          strategy='check', check_cols=['price']) }}
select * from {{ source('shop', 'products') }}
{% endsnapshot %}
```

| product_id | price | dbt_valid_from | dbt_valid_to |
|---|---|---|---|
| P01 | 100 | 2026-01-01 | 2026-03-15 |
| P01 | 120 | 2026-03-15 | *null (đang hiệu lực)* |

Nhờ đó ta trả lời được câu hỏi "đơn hàng tháng Hai được bán với giá nào?", điều mà bảng nguồn không còn biết. Từ dbt 1.9, snapshot cũng có thể khai báo bằng YAML.

> **Trong project.** `snap_products` được khai báo bằng YAML, đọc từ `stg_ecommerce__products`, dùng strategy `check` trên ba cột `price`, `compare_at_price` và `is_active` (nguồn không có cột `updated_at` nên không dùng được strategy `timestamp`). `dim_product` chỉ giữ giá hiện tại (SCD Type 1); lịch sử giá nằm riêng trong snapshot.

### 17. Seeds, packages, exposures

- **Seeds:** file CSV nhỏ trong thư mục `seeds/`, nạp bằng `dbt seed` và dùng như model qua `ref()`. Hợp với bảng tra cứu ít thay đổi: mã tỉnh, bảng quy đổi trạng thái. Không dùng seed để nạp dữ liệu nghiệp vụ lớn.
- **Packages:** "thư viện" của dbt, khai báo trong `packages.yml` và cài bằng `dbt deps`. Phổ biến nhất là `dbt_utils` (ví dụ test `unique_combination_of_columns`, macro `generate_surrogate_key`) và `dbt_expectations` (bộ test kiểu Great Expectations).
- **Exposures:** khai báo trong YAML rằng một dashboard hay ứng dụng phụ thuộc vào model nào. Dashboard sẽ xuất hiện ở cuối lineage, nên khi sửa một model bạn biết ngay dashboard nào bị ảnh hưởng.

```yaml
# packages.yml
packages:
  - package: dbt-labs/dbt_utils
    version: [">=1.0.0", "<2.0.0"]
```

> **Trong project.** Seed `order_status_mapping.csv` là chỗ đặt định nghĩa doanh thu. Mỗi trạng thái đơn có một cột `counts_as_revenue`, và chỉ `paid`, `shipped`, `delivered` được tính:
>
> | status_name | fulfillment_stage | counts_as_revenue |
> |---|---|---|
> | pending | awaiting_payment | false |
> | paid | paid | true |
> | shipped | in_transit | true |
> | delivered | completed | true |
> | cancelled | cancelled | false |
> | refunded | refunded | false |
>
> Package `dbt_utils` được dùng để sinh surrogate key cho mọi dimension bằng `generate_surrogate_key`.

## Kết luận: nhìn lại bản đồ

Bảng 2 tổng hợp cách dbt hiện thực từng thực hành đã nêu ở Bảng 1.

*Bảng 2. Các thực hành kỹ thuật phần mềm và cách hiện thực trong dbt.*

| Software engineering | Trong dbt |
|---|---|
| Version control | Mỗi model là một file `.sql`, quản lý bằng Git, review qua Pull Request |
| Modular code | Mỗi model một trách nhiệm, nối với nhau bằng `ref()`; dbt tự dựng DAG |
| Kiến trúc phân tầng | staging → intermediate → marts; star schema ở marts |
| Test | Data tests (generic + singular), unit tests, model contracts |
| Documentation | `description` trong YAML + `dbt docs` với lineage tự sinh |
| CI/CD | `dbt build` trong pipeline, Slim CI với `state:modified+` |
| DRY, thư viện | Jinja macros; packages như `dbt_utils`, `dbt_expectations` |

Hai câu hỏi đặt ra ở phần mở đầu được giải quyết như sau: **nguồn gốc** của chỉ số doanh thu được xác định qua lineage, còn **tính đúng đắn** của nó được kiểm chứng bằng test, contract và CI.

### Bài học rút ra

<figure class="mindmap">
<div class="mindmap-scroll">
<svg viewBox="0 0 860 420" role="img" aria-label="Sơ đồ tư duy năm bài học: 1. Grain trước, join sau; 2. Một định nghĩa doanh thu; 3. Incremental khi thật cần; 4. Staging mỏng, marts rõ nghĩa; 5. Mỗi test một giả định" xmlns="http://www.w3.org/2000/svg">
<path class="mm-link" d="M510 210 C542.0 210 542.0 32 574 32"/>
<path class="mm-link" d="M510 210 C542.0 210 542.0 172 574 172"/>
<path class="mm-link" d="M510 210 C542.0 210 542.0 312 574 312"/>
<path class="mm-link" d="M350 210 C318.0 210 318.0 102 286 102"/>
<path class="mm-link" d="M350 210 C318.0 210 318.0 242 286 242"/>
<rect class="mm-center" x="350" y="176" width="160" height="68" rx="34"/>
<text class="mm-center-text" x="430" y="205" text-anchor="middle">Bài học</text>
<text class="mm-center-sub" x="430" y="227" text-anchor="middle">từ dbt project</text>
<rect class="mm-box" x="574" y="16" width="270" height="32" rx="16"/>
<circle class="mm-num-bg" cx="590" cy="32" r="11"/>
<text class="mm-num" x="590" y="36.5" text-anchor="middle">1</text>
<text class="mm-title" x="608" y="37">Grain trước, join sau</text>
<line class="mm-stem" x1="590" y1="48" x2="590" y2="110"/>
<line class="mm-stem" x1="590" y1="66" x2="600" y2="66"/>
<text class="mm-leaf" x="606" y="70">Ghi grain vào mô tả mỗi model</text>
<line class="mm-stem" x1="590" y1="88" x2="600" y2="88"/>
<text class="mm-leaf" x="606" y="92">Test unique trên khoá grain</text>
<line class="mm-stem" x1="590" y1="110" x2="600" y2="110"/>
<text class="mm-leaf" x="606" y="114">Một join sai: doanh thu ×3,7</text>
<rect class="mm-box" x="574" y="156" width="270" height="32" rx="16"/>
<circle class="mm-num-bg" cx="590" cy="172" r="11"/>
<text class="mm-num" x="590" y="176.5" text-anchor="middle">2</text>
<text class="mm-title" x="608" y="177">Một định nghĩa doanh thu</text>
<line class="mm-stem" x1="590" y1="188" x2="590" y2="250"/>
<line class="mm-stem" x1="590" y1="206" x2="600" y2="206"/>
<text class="mm-leaf" x="606" y="210">4 cách tính: từ 10,77 đến 5,49 triệu</text>
<line class="mm-stem" x1="590" y1="228" x2="600" y2="228"/>
<text class="mm-leaf" x="606" y="232">Định nghĩa ở một chỗ duy nhất</text>
<line class="mm-stem" x1="590" y1="250" x2="600" y2="250"/>
<text class="mm-leaf" x="606" y="254">Nơi khác đều ref() tới đó</text>
<rect class="mm-box" x="574" y="296" width="270" height="32" rx="16"/>
<circle class="mm-num-bg" cx="590" cy="312" r="11"/>
<text class="mm-num" x="590" y="316.5" text-anchor="middle">3</text>
<text class="mm-title" x="608" y="317">Incremental khi thật cần</text>
<line class="mm-stem" x1="590" y1="328" x2="590" y2="390"/>
<line class="mm-stem" x1="590" y1="346" x2="600" y2="346"/>
<text class="mm-leaf" x="606" y="350">Bắt đầu bằng table</text>
<line class="mm-stem" x1="590" y1="368" x2="600" y2="368"/>
<text class="mm-leaf" x="606" y="372">Chuyển khi bảng thật sự lớn</text>
<line class="mm-stem" x1="590" y1="390" x2="600" y2="390"/>
<text class="mm-leaf" x="606" y="394">Cần unique_key, xử lý dữ liệu trễ</text>
<rect class="mm-box" x="16" y="86" width="270" height="32" rx="16"/>
<circle class="mm-num-bg" cx="32" cy="102" r="11"/>
<text class="mm-num" x="32" y="106.5" text-anchor="middle">5</text>
<text class="mm-title" x="50" y="107">Mỗi test một giả định</text>
<line class="mm-stem" x1="32" y1="118" x2="32" y2="180"/>
<line class="mm-stem" x1="32" y1="136" x2="42" y2="136"/>
<text class="mm-leaf" x="48" y="140">Test điều mình thật sự dựa vào</text>
<line class="mm-stem" x1="32" y1="158" x2="42" y2="158"/>
<text class="mm-leaf" x="48" y="162">232 test, mỗi test giữ một điều</text>
<line class="mm-stem" x1="32" y1="180" x2="42" y2="180"/>
<text class="mm-leaf" x="48" y="184">Số lượng test không phải mục tiêu</text>
<rect class="mm-box" x="16" y="226" width="270" height="32" rx="16"/>
<circle class="mm-num-bg" cx="32" cy="242" r="11"/>
<text class="mm-num" x="32" y="246.5" text-anchor="middle">4</text>
<text class="mm-title" x="50" y="247">Staging mỏng, marts rõ nghĩa</text>
<line class="mm-stem" x1="32" y1="258" x2="32" y2="320"/>
<line class="mm-stem" x1="32" y1="276" x2="42" y2="276"/>
<text class="mm-leaf" x="48" y="280">Staging: chỉ làm sạch</text>
<line class="mm-stem" x1="32" y1="298" x2="42" y2="298"/>
<text class="mm-leaf" x="48" y="302">Intermediate: logic nghiệp vụ</text>
<line class="mm-stem" x1="32" y1="320" x2="42" y2="320"/>
<text class="mm-leaf" x="48" y="324">Marts: đặt tên theo nghiệp vụ</text>
</svg>
</div>
</figure>

*Hình 5. Năm bài học rút ra từ project. Chi tiết từng ý ở bên dưới.*

**1. Grain trước, join sau.** Mọi lỗi số liệu khó tìm nhất đều bắt đầu từ một phép join làm thay đổi grain mà không ai để ý. Trong project, một phép join sai đủ để doanh thu đội lên 3,7 lần mà không có lỗi nào. Ghi grain vào mô tả của mỗi model, và đặt test `unique` trên khoá của grain.

**2. "Doanh thu" phải được định nghĩa một lần.** Gross hay net? Có tính đơn huỷ, đơn hoàn trả, phí vận chuyển, giảm giá không? Cùng một bộ dữ liệu trong project cho ra bốn con số "doanh thu" rất khác nhau:

| Định nghĩa | Số tiền |
|---|---|
| Tổng tiền mọi đơn, bất kể trạng thái | 10,77 triệu |
| Các lần thanh toán thành công | 10,06 triệu |
| Doanh thu thuần, bất kể trạng thái (trước thuế và phí ship) | 9,32 triệu |
| **Doanh thu ghi nhận** (đơn paid, shipped, delivered; trước thuế và phí ship) | **5,49 triệu** |

Định nghĩa phải nằm ở **một** chỗ duy nhất, có tài liệu và test, và mọi nơi khác đều `ref()` tới nó. Trong project, chỗ đó là seed `order_status_mapping` cộng với model `int_orders__enriched`.

**3. Incremental là tối ưu, không phải mặc định.** Bắt đầu bằng `table`. Chỉ chuyển sang incremental khi bảng thực sự lớn, và khi đó phải có chiến lược cho dữ liệu đến trễ và có `unique_key`.

**4. Staging mỏng, marts rõ nghĩa.** Staging chỉ làm sạch, không chứa logic nghiệp vụ. Logic nằm ở intermediate. Marts được đặt tên bằng ngôn ngữ của người dùng nghiệp vụ.

**5. Test là hợp đồng, không phải thủ tục.** Mỗi test nên tương ứng với một giả định mà bạn thực sự dựa vào. 232 test pass có ý nghĩa vì mỗi test bảo vệ một điều cụ thể, không phải vì con số lớn.
