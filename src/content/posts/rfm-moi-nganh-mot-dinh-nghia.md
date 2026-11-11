---
title: 'Khách 200 ngày chưa mua có đáng lo không? RFM mỗi ngành định nghĩa một kiểu'
description: 'Các lựa chọn khi định nghĩa RFM, cách các ngành bán lẻ, thời trang, điện tử, thuê bao, ngân hàng và vay tiêu dùng điều chỉnh R, F, M, và cách kiểm tra một định nghĩa RFM bằng backtest.'
date: 2026-11-11
track: business
section: 'Marketing'
tags: [rfm, customer-analytics, segmentation]
---

Trong [project kho dữ liệu e-commerce](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/E-commerce-Data-Warehouse-and-Customer-Analytics), mình chia khách hàng theo RFM. Khi viết phần quy tắc nghiệp vụ, mình nhận ra gần như mọi chi tiết của RFM đều là một lựa chọn: tính trong bao lâu, đơn nào được tính, tiền tính theo số nào, ngưỡng đặt ở đâu. Mỗi ngành chọn khác nhau, vì chu kỳ mua và cách doanh nghiệp kiếm tiền khác nhau.

Bài này ghi lại các lựa chọn đó, cách một số ngành định nghĩa RFM, và cách kiểm tra một định nghĩa có dùng được không.

## RFM là gì

RFM chia khách hàng theo ba chỉ số:

| Chỉ số | Ý nghĩa | Cách tính thường gặp |
|---|---|---|
| R (Recency) | Lần mua gần nhất cách đây bao lâu | Số ngày từ lần mua gần nhất đến ngày mốc |
| F (Frequency) | Mua bao nhiêu lần | Số đơn trong khoảng thời gian xét |
| M (Monetary) | Mang lại bao nhiêu tiền | Tổng doanh thu trong khoảng thời gian xét |

Mỗi chỉ số được chấm điểm từ 1 đến 5, rồi tổ hợp điểm được gắn tên nhóm. Ví dụ, R cao và F cao là Champions (khách tốt nhất), R thấp nhưng F cao là At risk (từng mua nhiều nhưng lâu rồi không quay lại).

## Những chỗ phải tự quyết định

| Lựa chọn | Các cách thường gặp | Phụ thuộc vào |
|---|---|---|
| Khoảng thời gian xét | Toàn bộ lịch sử, hoặc 12 hay 24 tháng gần nhất | Chu kỳ mua. Ngành mua thưa cần cửa sổ dài hơn, nếu không khách bình thường cũng bị loại. |
| Ngày mốc | Ngày chạy báo cáo, hoặc ngày cuối của dữ liệu | Dữ liệu còn đang cập nhật hay là dữ liệu lịch sử |
| Thế nào là một lần mua | Đơn đã thanh toán, đã giao, có trừ đơn hoàn hay không | Quy tắc ghi nhận doanh thu của doanh nghiệp |
| M tính theo | Doanh thu thuần, tổng tiền khách trả (gồm thuế, phí ship), hoặc lợi nhuận | Doanh nghiệp quan tâm doanh số hay lợi nhuận. Ngành biên lợi nhuận khác nhau nhiều giữa các sản phẩm thì nên dùng lợi nhuận. |
| Cách chấm điểm | Chia theo phân vị (mỗi mức 20% khách), hoặc ngưỡng cố định | Ngưỡng cố định ổn định qua các tháng và dễ giải thích. Phân vị tự điều chỉnh theo dữ liệu nhưng ngưỡng đổi mỗi lần chạy. |
| Cách gắn tên nhóm | 6 đến 11 nhóm trên lưới R × F, M dùng để ưu tiên | Doanh nghiệp có bao nhiêu chiến dịch chăm sóc khác nhau |

Trong project e-commerce, mình chọn: xét toàn bộ 2021–2025, ngày mốc là ngày đơn cuối cùng, chỉ tính đơn paid, shipped, delivered, M là tổng tiền khách trả. F dùng ngưỡng cố định 1, 2, 3–4, 5–7, 8+ đơn vì số đơn nhỏ và rời rạc. R và M chia theo phân vị vì dữ liệu giả lập không có ngưỡng nào do business đặt.

## Lựa chọn quan trọng nhất: thế nào là "lâu không mua"

Cùng 200 ngày chưa mua, ở ngành này là khách sắp rời bỏ, ở ngành khác là khách bình thường. Ngưỡng recency nên đặt theo khoảng cách giữa hai lần mua của khách trong ngành đó, không dùng một con số chung.

Một cách đơn giản là tính khoảng cách trung vị giữa hai lần mua liên tiếp của cùng một khách, rồi coi khách chưa mua lâu hơn vài lần khoảng cách đó là đáng chú ý. Trong dữ liệu e-commerce của mình, khoảng cách này có trung vị 132 ngày và trung bình 224 ngày.

## RFM theo từng ngành

| Ngành | Chu kỳ mua thường gặp | R | F | M | Chú ý |
|---|---|---|---|---|---|
| Siêu thị, tạp hóa, F&B | Hằng tuần | Tính theo tuần; 30 ngày không mua đã đáng chú ý | Số lần mua mỗi tháng | Doanh thu, hoặc lợi nhuận gộp vì biên mỗi nhóm hàng khác nhau | Khách mua đều nhưng giá trị nhỏ, F quan trọng hơn M |
| Thời trang, mỹ phẩm | Vài tháng một lần | Ngưỡng thường từ 3 đến 6 tháng | Số đơn trong 12 tháng | Doanh thu thuần, trừ hàng trả | Tỷ lệ trả hàng cao, không trừ đơn hoàn thì M bị thổi lên |
| Điện tử, nội thất | Vài năm một lần | 1 năm không mua là bình thường; R ít giá trị | Thường chỉ 1–2 lần, F gần như không phân biệt được khách | Doanh thu, kèm bảo hành và phụ kiện | Hay thay F bằng mua kèm phụ kiện hoặc dịch vụ sau bán |
| Sàn thương mại điện tử đa ngành | Khác nhau theo ngành hàng | Nên tính riêng theo ngành hàng, hoặc so với nhịp mua của chính khách | Số đơn | Doanh thu thuần hoặc phí sàn thu được | Gộp mọi ngành hàng thì ngưỡng R không hợp với nhóm nào |
| Thuê bao (phần mềm, viễn thông, streaming) | Trả tiền định kỳ tự động | Không dùng ngày thanh toán; thay bằng lần sử dụng gần nhất | Tần suất sử dụng (số lần đăng nhập, số phút dùng) | Doanh thu định kỳ mỗi tháng (MRR) | Khách vẫn trả tiền nhưng không dùng là dấu hiệu sắp hủy |
| Ngân hàng bán lẻ, thẻ | Giao dịch liên tục | Lần giao dịch gần nhất | Số giao dịch mỗi tháng | Phí và lãi thu được, hoặc số dư bình quân | Khách nhiều giao dịch nhỏ có thể mang lại ít hơn khách ít giao dịch nhưng số dư lớn |
| Vay tiêu dùng | Theo kỳ hạn khoản vay, 6–36 tháng | Tính từ ngày tất toán khoản gần nhất | Số khoản vay đã giải ngân | Lợi nhuận sau tổn thất dự kiến | Bắt buộc thêm chiều rủi ro trả nợ (xem phần dưới) |

## Vay tiêu dùng: RFM phải đi kèm rủi ro

Vay tiêu dùng khác bán lẻ ở ba điểm:

- Doanh nghiệp có tiền rải theo từng kỳ trả góp, không có ngay lúc giải ngân.
- Khách có thể gây lỗ: không trả nợ thì mất cả gốc.
- Khách đang trả góp là khách đang hoạt động, dù khoản vay giải ngân đã lâu.

Vì vậy định nghĩa lại cả ba chỉ số:

| Chỉ số | Bán lẻ | Vay tiêu dùng |
|---|---|---|
| R | Số ngày từ đơn gần nhất | Số ngày từ lúc tất toán khoản vay gần nhất. Khách còn khoản vay chưa tất toán thì chưa tính R. |
| F | Số đơn | Số khoản vay đã giải ngân. Vay lại hoặc vay thêm (top-up) là dấu hiệu khách gắn bó. |
| M | Tổng tiền đã chi | Lãi thu được trừ chi phí vốn và tổn thất dự kiến. Khách vay 100 triệu rồi không trả gây lỗ, còn khách vay 10 triệu và trả đủ thì có lãi. |

Nếu dùng RFM nguyên bản, khách giải ngân 18 tháng trước với kỳ hạn 24 tháng, vẫn trả đều mỗi tháng, sẽ bị chấm R thấp và xếp vào nhóm ngủ đông.

Chiều thứ tư là hành vi trả nợ:

- DPD (days past due): số ngày quá hạn hiện tại và DPD cao nhất trong lịch sử.
- Tỷ lệ kỳ trả đúng hạn trên tổng số kỳ.
- Tất toán trước hạn: doanh nghiệp mất phần lãi dự kiến, và thường là dấu hiệu khách chuyển sang nơi khác vay rẻ hơn. Trong ngành này, đây mới là tín hiệu rời bỏ.
- Nhóm nợ trên CIC (Trung tâm Thông tin tín dụng), dùng trong xét duyệt và khi chào vay lại.

Phân khúc thường kết hợp giá trị với rủi ro:

| | Trả nợ tốt | Trả nợ kém |
|---|---|---|
| Mang lại lãi cao | Chào vay lại, cân nhắc nâng hạn mức | Theo dõi chặt, không chào thêm |
| Mang lại lãi thấp | Chào vay lại có kiểm soát | Chuyển sang thu hồi nợ |

Ngành này cũng có các phân tích riêng thay cho cohort của bán lẻ:

- **Vintage analysis:** gom khoản vay theo tháng giải ngân, theo dõi tỷ lệ quá hạn 30 hoặc 90 ngày theo số tháng kể từ giải ngân, để so chất lượng xét duyệt giữa các giai đoạn.
- **Roll rate:** tỷ lệ khoản vay chuyển từ nhóm quá hạn này sang nhóm nặng hơn, ví dụ từ 1–30 ngày sang 31–60 ngày.
- **Tỷ lệ vay lại:** trong số khách đã tất toán, bao nhiêu phần trăm vay khoản mới trong 3, 6 hoặc 12 tháng.

Chú ý: ngành vay chịu quản lý chặt về dữ liệu cá nhân và hoạt động chào vay. Phân khúc dùng cho chiến dịch phải qua bộ phận quản lý rủi ro và pháp chế, không chỉ dựa vào điểm số.

## Định nghĩa xong vẫn phải kiểm tra

Định nghĩa nào cũng phải trả lời được câu hỏi: nhóm bị gắn nhãn At risk có thật sự mua ít đi về sau không? Cách kiểm tra là backtest:

1. Chọn một ngày mốc trong quá khứ, chỉ dùng dữ liệu trước ngày đó để tính RFM.
2. Xem hành vi thật của từng nhóm sau ngày mốc.
3. So trong cùng nhóm tần suất, để biết mỗi chỉ số có thêm thông tin riêng hay chỉ lặp lại chỉ số khác.

Mình làm thử với dữ liệu e-commerce, ngày mốc 31/12/2023, theo dõi số đơn trong 2024–2025:

| Lần mua gần nhất | Số khách | Số đơn TB trong 2024–2025 |
|---|---|---|
| Trong 90 ngày | 1.007 | 4,48 |
| 91–365 ngày | 1.872 | 2,93 |
| Hơn 365 ngày | 1.930 | 2,30 |

Bảng này có vẻ đúng lý thuyết: khách mua gần đây mua nhiều gấp đôi. Nhưng ba nhóm khác nhau về tần suất ngay từ đầu. Số đơn trung bình trong 2021–2023 của ba nhóm lần lượt là 3,40, 2,24 và 1,45. Khách mua 20 đơn trong 3 năm gần như chắc chắn có một đơn trong 90 ngày cuối, nên nhóm "mua gần đây" chủ yếu là khách mua nhiều. Tần suất ảnh hưởng tới cả recency lẫn số đơn về sau, làm hai thứ trông như có quan hệ.

Tách hai yếu tố bằng cách chỉ so khách có cùng số đơn trong 2021–2023:

| Số đơn 2021–2023 | Mua trong 90 ngày | 91–365 ngày | Hơn 365 ngày |
|---|---|---|---|
| 1 đơn | 1,99 | 2,12 | 2,05 |
| 2–3 đơn | 2,76 | 2,67 | 2,74 |
| 4–6 đơn | 4,77 | 4,93 | 3,93 (55 khách) |

Đọc theo cột, số đơn về sau tăng rõ theo tần suất. Đọc theo hàng, trong cùng mức tần suất, khách lâu không mua vẫn mua lại như khách vừa mua. Trong dữ liệu này, R không thêm thông tin khi đã biết F. M cũng gần như trùng F, vì giá trị mỗi đơn của một khách giữa hai giai đoạn gần như không tương quan (hệ số 0,01).

Lý do nằm ở dữ liệu giả lập: mỗi khách được gán một tốc độ mua, và các đơn rơi ngẫu nhiên theo tốc độ đó. Khách không có giai đoạn chán rồi bỏ đi. Với dữ liệu thật, kết quả có thể khác, nhưng bước so trong cùng nhóm tần suất vẫn cần làm trước khi kết luận R có tác dụng.

## Khi định nghĩa RFM cho một doanh nghiệp

- Hỏi chu kỳ mua của ngành, rồi đo khoảng cách giữa hai lần mua trong dữ liệu để đặt ngưỡng R.
- Thống nhất thế nào là một lần mua và M tính theo doanh thu hay lợi nhuận, giống như quy tắc ghi nhận doanh thu.
- Với ngành có rủi ro tín dụng hoặc thuê bao, thay R, F, M bằng chỉ số phù hợp (tất toán, sử dụng, MRR) và thêm chiều rủi ro.
- Backtest trước khi dùng nhãn nhóm để chạy chiến dịch.

Học tới đâu mình cập nhật tới đó nha!
