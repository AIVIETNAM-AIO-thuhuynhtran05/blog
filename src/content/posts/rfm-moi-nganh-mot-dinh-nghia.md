---
title: 'RFM ở các ngành khác nhau và cách kiểm tra bằng backtest'
description: 'Các lựa chọn khi định nghĩa RFM, cách các ngành bán lẻ, thời trang, điện tử, thuê bao, ngân hàng và vay tiêu dùng điều chỉnh R, F, M, và cách kiểm tra một định nghĩa RFM bằng backtest.'
date: 2026-11-11
track: business
section: 'Phân tích khách hàng'
tags: [rfm, customer-analytics, segmentation]
---

Mình dùng RFM ở ba project: [kho dữ liệu e-commerce](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/E-commerce-Data-Warehouse-and-Customer-Analytics), [Vin Datathon](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/Vin-Datathon) về một doanh nghiệp thời trang online, và [vay tiêu dùng ở cuộc thi ITB](https://github.com/AIVIETNAM-AIO-thuhuynhtran05/ITB-Round-2-Customer-Financial-Health-Engagement-Scoring). Làm ba project, mình nhận ra gần như mọi chi tiết của RFM đều là một lựa chọn: tính trong bao lâu, đơn nào được tính, tiền tính theo số nào, ngưỡng đặt ở đâu. Mỗi ngành chọn khác nhau, vì chu kỳ mua và cách doanh nghiệp kiếm tiền khác nhau.

Bài này ghi lại các lựa chọn đó, cách một số ngành định nghĩa RFM, và cách kiểm tra một định nghĩa có dùng được không.

## RFM là gì

RFM chia khách hàng theo ba chỉ số:

| Chỉ số | Ý nghĩa | Cách tính thường gặp |
|---|---|---|
| R (Recency) | Lần mua gần nhất cách đây bao lâu | Số ngày từ lần mua gần nhất đến ngày mốc |
| F (Frequency) | Mua bao nhiêu lần | Số đơn trong khoảng thời gian xét |
| M (Monetary) | Mang lại bao nhiêu tiền | Tổng doanh thu trong khoảng thời gian xét |

Mỗi chỉ số được chấm điểm từ 1 đến 5, rồi tổ hợp điểm được gắn tên nhóm. Ví dụ, R cao và F cao là Champions (khách tốt nhất), R thấp nhưng F cao là At risk (từng mua nhiều nhưng lâu rồi không quay lại).

Làm RFM thường gồm năm bước:

1. Tính giá trị R, F, M của từng khách. Đây là số gốc: số ngày, số đơn, số tiền.
2. Đổi giá trị thành điểm từ 1 đến 5.
3. Gắn tên nhóm cho các tổ hợp điểm.
4. Vẽ biểu đồ để xem mỗi nhóm lớn cỡ nào, ví dụ treemap trong Power BI hoặc Tableau.
5. Chọn hành động cho từng nhóm.

Ba chỉ số, mỗi chỉ số 5 mức, cho ra 125 tổ hợp. Con số này quá nhiều để mỗi tổ hợp có một chiến dịch riêng. Cách hay dùng là lấy trung bình điểm F và M làm một trục, R làm trục còn lại, rồi chia lưới 5 × 5 thành các vùng. Mỗi vùng là một nhóm. Một cách chia hay gặp là 11 nhóm, có thể gom lại thành các nhóm chính như sau:

| Nhóm | Đặc điểm | Hướng chăm sóc |
|---|---|---|
| **Champions** | Mua gần đây, mua thường xuyên, chi nhiều | Chương trình khách hàng thân thiết, gợi ý sản phẩm giá trị cao hơn; không cần giảm giá |
| **Loyal, Potential Loyalist** | Mua thường xuyên, hoặc mới mua và đã mua hơn một lần | Ưu đãi khi đơn vượt một mức giá trị, chương trình giới thiệu bạn bè |
| **Recent, Promising** | Mới mua nhưng chưa mua thường xuyên | Cảm ơn và xin ý kiến sau đơn đầu, gợi ý sản phẩm liên quan |
| **Needing Attention, At Risk, Can't Lose Them** | Từng mua nhiều nhưng lâu chưa quay lại | Hỏi lý do khách không quay lại; đưa ra giá trị phù hợp thay vì giảm giá đại trà |
| **About to Sleep, Hibernating, Lost** | Lâu không mua, trước đó mua ít và chi ít | Kênh chi phí thấp như email, retargeting; ưu đãi ngắn hạn |

Mục tiêu chung là tăng tỷ lệ khách ở nhóm Champions và giảm các nhóm phía dưới. Khi chạy chiến dịch, nên thử trên một nhóm nhỏ trước, theo dõi tỷ lệ mở và tỷ lệ click nếu gửi email, rồi mới mở rộng.

## Những chỗ cần được định nghĩa

| Lựa chọn | Các cách thường gặp | Phụ thuộc vào |
|---|---|---|
| Khoảng thời gian xét | Toàn bộ lịch sử, hoặc 12 hay 24 tháng gần nhất | Chu kỳ mua. Ngành mua thưa cần cửa sổ dài hơn, nếu không khách bình thường cũng bị loại. |
| Ngày mốc | Ngày chạy báo cáo, hoặc ngày cuối của dữ liệu | Dữ liệu còn đang cập nhật hay là dữ liệu lịch sử |
| Thế nào là một lần mua | Đơn đã thanh toán, đã giao, có trừ đơn hoàn hay không | Quy tắc ghi nhận doanh thu của doanh nghiệp |
| M tính theo | Doanh thu thuần, tổng tiền khách trả (gồm thuế, phí ship), hoặc lợi nhuận | Doanh nghiệp quan tâm doanh số hay lợi nhuận. Ngành biên lợi nhuận khác nhau nhiều giữa các sản phẩm thì nên dùng lợi nhuận. |
| Cách chấm điểm | Chia theo phân vị (mỗi mức 20% khách), hoặc ngưỡng cố định | Ngưỡng cố định ổn định qua các tháng và dễ giải thích. Phân vị tự điều chỉnh theo dữ liệu nhưng ngưỡng đổi mỗi lần chạy. |
| Cách gắn tên nhóm | 6 đến 11 nhóm trên lưới R × F, M dùng để ưu tiên; hoặc phân cụm K-Means trên giá trị R, F, M rồi đặt tên từng cụm | Doanh nghiệp có bao nhiêu chiến dịch chăm sóc khác nhau |

### Ba cách chấm điểm

- **Ngưỡng cố định.** Business đặt mốc cho từng mức, ví dụ mua trong 30 ngày được 5 điểm R. Mốc phụ thuộc vào ngành. Hàng giá trị nhỏ, mua thường xuyên như cà phê, kem đánh răng thì tính theo ngày hoặc tuần. Hàng giá trị lớn, cân nhắc lâu như ô tô, đồ điện gia dụng thì tính theo năm. Đặt sai mốc thì xếp sai khách.
- **Phân vị.** Sắp xếp khách theo từng chỉ số rồi chia thành 5 phần có số khách bằng nhau. Cách này không cần hiểu sâu về ngành, nhưng khoảng giá trị của mỗi mức không đều nhau.
- **K-Means.** Dùng thẳng giá trị R, F, M thay vì điểm, để thuật toán tự chia cụm. Số cụm chọn bằng elbow hoặc silhouette. M thường lệch nhiều nên cần biến đổi, ví dụ lấy log, rồi chuẩn hóa trước. Phân cụm xong vẫn phải xem đặc điểm từng cụm để đặt tên. Vin Datathon dùng cách này.

Trong project e-commerce, mình chọn: xét toàn bộ 2021–2025, ngày mốc là ngày đơn cuối cùng, chỉ tính đơn paid, shipped, delivered, M là tổng tiền khách trả. F dùng ngưỡng cố định 1, 2, 3–4, 5–7, 8+ đơn vì số đơn nhỏ và rời rạc. R và M chia theo phân vị vì dữ liệu giả lập không có ngưỡng nào do business đặt.

Ở Vin Datathon, M là tiền khách trả trừ tiền hoàn của đơn, vì ngành thời trang trả hàng nhiều. RFM không chấm điểm 1–5 mà dùng làm đầu vào cho K-Means. Khách chưa có đơn tạo doanh thu, kể cả khách đã đặt đơn nhưng không thanh toán, thì không tính RFM mà được gán nhóm bằng luật trước khi phân cụm.

## Lựa chọn quan trọng nhất: thế nào là "lâu không mua"

Cùng 200 ngày chưa mua, ở ngành này là khách sắp rời bỏ, ở ngành khác là khách bình thường. Ngưỡng recency nên đặt theo khoảng cách giữa hai lần mua của khách trong ngành đó, không dùng một con số chung.

Một cách đơn giản là tính khoảng cách trung vị giữa hai lần mua liên tiếp của cùng một khách, rồi coi khách chưa mua lâu hơn vài lần khoảng cách đó là đáng chú ý. Trong dữ liệu e-commerce của mình, khoảng cách này có trung vị 132 ngày và trung bình 224 ngày.

## RFM theo từng ngành

Mỗi ngành có chu kỳ mua riêng, nên cần chú ý những điểm khác nhau:

| Ngành | Chu kỳ mua thường gặp | Chú ý |
|---|---|---|
| **Siêu thị, tạp hóa, F&B** | Hằng tuần | Khách mua đều nhưng giá trị nhỏ, F quan trọng hơn M |
| **Thời trang, mỹ phẩm** | Vài tháng một lần | Tỷ lệ trả hàng cao, không trừ đơn hoàn thì M bị thổi lên |
| **Điện tử, nội thất** | Vài năm một lần | Hay thay F bằng mua kèm phụ kiện hoặc dịch vụ sau bán |
| **Sàn thương mại điện tử đa ngành** | Khác nhau theo ngành hàng | Gộp mọi ngành hàng thì ngưỡng R không hợp với nhóm nào |
| **Thuê bao (phần mềm, viễn thông, streaming)** | Trả tiền định kỳ tự động | Khách vẫn trả tiền nhưng không dùng là dấu hiệu sắp hủy |
| **Ngân hàng bán lẻ, thẻ** | Giao dịch liên tục | Khách nhiều giao dịch nhỏ có thể mang lại ít hơn khách ít giao dịch nhưng số dư lớn |
| **Vay tiêu dùng** | Theo kỳ hạn khoản vay, 6–36 tháng | Bắt buộc thêm chiều rủi ro trả nợ (xem phần dưới) |

Từ đó, R, F, M được tính như sau:

| Ngành | R | F | M |
|---|---|---|---|
| **Siêu thị, tạp hóa, F&B** | Tính theo tuần; 30 ngày không mua đã đáng chú ý | Số lần mua mỗi tháng | Doanh thu, hoặc lợi nhuận gộp vì biên mỗi nhóm hàng khác nhau |
| **Thời trang, mỹ phẩm** | Ngưỡng thường từ 3 đến 6 tháng | Số đơn trong 12 tháng | Doanh thu thuần, trừ hàng trả |
| **Điện tử, nội thất** | 1 năm không mua là bình thường; R ít giá trị | Thường chỉ 1–2 lần, F gần như không phân biệt được khách | Doanh thu, kèm bảo hành và phụ kiện |
| **Sàn thương mại điện tử đa ngành** | Nên tính riêng theo ngành hàng, hoặc so với nhịp mua của chính khách | Số đơn | Doanh thu thuần hoặc phí sàn thu được |
| **Thuê bao (phần mềm, viễn thông, streaming)** | Không dùng ngày thanh toán; thay bằng lần sử dụng gần nhất | Tần suất sử dụng (số lần đăng nhập, số phút dùng) | Doanh thu định kỳ mỗi tháng (MRR) |
| **Ngân hàng bán lẻ, thẻ** | Lần giao dịch gần nhất | Số giao dịch mỗi tháng | Phí và lãi thu được, hoặc số dư bình quân |
| **Vay tiêu dùng** | Tính từ ngày tất toán khoản gần nhất | Số khoản vay đã giải ngân | Lợi nhuận sau tổn thất dự kiến |

Với thuê bao, đếm F theo số lần thanh toán dễ hiểu sai. Hai khách cùng đăng ký một tạp chí 100.000 đồng mỗi tháng: một người trả theo tháng, một người trả một lần cho cả năm. Cả hai có M là 1,2 triệu, nhưng người đầu có F = 12, người sau có F = 1, dù mức gắn bó có thể như nhau. Vì vậy ngành này đo F bằng mức sử dụng.

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

Trong project ITB, nhóm mình cũng không dùng RFM nguyên bản. F được đo bằng số tháng có hoạt động và số hợp đồng ký trong 24 tháng, còn RFM xếp hạng đơn giản chỉ dùng làm mốc so sánh. Khách vừa kết thúc khoản vay có khả năng vay mới cao gấp 1,64 lần, nên thời điểm tất toán quan trọng hơn ngày giải ngân.

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

## Recency và Frequency khác nhau thế nào

Hai chỉ số này dễ bị nhầm vì cùng nói về việc khách mua hàng, nhưng trả lời hai câu hỏi khác nhau:

- **Recency** cho biết khách còn đang mua không: lần mua gần nhất cách đây bao lâu.
- **Frequency** cho biết khách mua đều tới mức nào: trong một khoảng thời gian, khách mua bao nhiêu lần.

Ví dụ, lấy ngày mốc là 30/6:

- Khách A mua 3 lần trong tháng 1, rồi từ đó không mua nữa. A có F cao nhưng R thấp, vì đã 5 tháng không quay lại.
- Khách B chỉ mua 1 lần, vào ngày 28/6. B có R cao nhưng F thấp.

Nếu chỉ nhìn F thì A tốt hơn B, còn nếu chỉ nhìn R thì B tốt hơn A. Thật ra A từng là khách mua nhiều nhưng có thể đã bỏ đi, còn B là khách mới, chưa biết có quay lại không. Cần cả hai chỉ số mới thấy được điều này: A thuộc nhóm At risk, B thuộc nhóm khách mới.

Hai chỉ số này cũng không hoàn toàn tách rời. Khách mua càng nhiều thì càng dễ có một đơn gần đây, nên R và F thường đi cùng nhau. Khi thấy khách có R tốt mua nhiều hơn về sau, chưa chắc là nhờ R; có thể chỉ vì họ vốn là khách mua nhiều. Phần dưới mình kiểm tra điều này.

## Kiểm tra định nghĩa bằng backtest

Định nghĩa xong, mình muốn biết nhóm At risk có thật sự mua ít đi về sau không. Cách làm là backtest:

1. Chọn một ngày trong quá khứ làm mốc, chỉ dùng dữ liệu trước ngày đó để tính RFM.
2. Xem sau ngày mốc, mỗi nhóm thật sự mua bao nhiêu.
3. So những khách có cùng tần suất với nhau, để xem R có cho thêm thông tin không.

Mình thử với dữ liệu e-commerce, lấy mốc 31/12/2023 và đếm số đơn của mỗi khách trong 2024–2025:

| Lần mua gần nhất | Số khách | Số đơn TB trong 2024–2025 |
|---|---|---|
| Trong 90 ngày | 1.007 | 4,48 |
| 91–365 ngày | 1.872 | 2,93 |
| Hơn 365 ngày | 1.930 | 2,30 |

Nhìn bảng thì khách mua gần đây mua nhiều gần gấp đôi khách lâu không mua. Nhưng ba nhóm này vốn đã khác nhau từ trước: số đơn trung bình trong 2021–2023 lần lượt là 3,40, 2,24 và 1,45. Khách mua nhiều thì dễ có một đơn trong 90 ngày cuối, nên nhóm "mua gần đây" phần lớn là khách mua nhiều.

Vì vậy mình chỉ so những khách có cùng số đơn trong 2021–2023:

| Số đơn 2021–2023 | Mua trong 90 ngày | 91–365 ngày | Hơn 365 ngày |
|---|---|---|---|
| 1 đơn | 1,99 | 2,12 | 2,05 |
| 2–3 đơn | 2,76 | 2,67 | 2,74 |
| 4–6 đơn | 4,77 | 4,93 | 3,93 (55 khách) |

Mỗi hàng là những khách có cùng số đơn trước đó. Trong cùng một hàng, khách lâu không mua vẫn mua lại gần bằng khách vừa mua. Còn đi từ hàng trên xuống hàng dưới thì số đơn về sau tăng rõ. Nghĩa là trong dữ liệu này, biết F rồi thì R không cho thêm thông tin. M cũng gần như trùng với F, vì giá trị mỗi đơn của một khách ở hai giai đoạn gần như không liên quan (hệ số tương quan 0,01).

Mình nghĩ lý do nằm ở dữ liệu giả lập: mỗi khách được gán sẵn một tốc độ mua, rồi đơn hàng được tạo ngẫu nhiên theo tốc độ đó, nên không có khách nào chán rồi bỏ đi. Với dữ liệu thật, kết quả có thể khác. Nhưng trước khi kết luận R có tác dụng, mình vẫn nên so trong cùng nhóm tần suất như trên.

## Những chỗ dễ bị bias

Ngoài chuyện R bị F ảnh hưởng như ở trên, còn vài chỗ khác dễ làm kết quả bị lệch.

### Khách mới có ít thời gian để mua

Lấy ngày mốc 31/12/2025:

- Khách X mua lần đầu ngày 01/11/2025, đến nay có 2 đơn.
- Khách Y mua lần đầu tháng 01/2023, đến nay có 12 đơn.

Đếm số đơn thì Y có F = 12, X có F = 2, nên X bị xếp là khách mua ít. Nhưng X mới có 2 tháng để mua, còn Y đã có 3 năm. So như vậy là chưa công bằng với X.

Có ba cách xử lý:

1. **Tách khách mới ra nhóm riêng.** Khách có lần mua đầu cách ngày mốc chưa tới một chu kỳ mua thì chưa chấm F. Chu kỳ mua nên lấy từ dữ liệu, ví dụ khoảng cách trung vị giữa hai lần mua. Ở dữ liệu e-commerce của mình là 132 ngày.
2. **Đổi F thành số đơn mỗi tháng.** Y có 12 đơn trong 36 tháng, tức 0,33 đơn/tháng. Với khách rất mới, nên tính thời gian gắn bó ít nhất bằng một chu kỳ mua, nếu không khách mua 1 đơn hôm qua sẽ có F rất cao.
3. **So trên cùng một khoảng thời gian.** Chỉ đếm số đơn trong 12 tháng đầu kể từ lần mua đầu của mỗi khách. Cách này chỉ dùng được cho khách đã gắn bó đủ 12 tháng.

Mình làm cách 1 trước bằng luật, rồi mới chấm RFM cho những khách còn lại:

```
Toàn bộ khách
│
├─ Luật 1: chưa có đơn tạo doanh thu         → nhóm "Chưa mua"
│
├─ Luật 2: mua lần đầu chưa tới 1 chu kỳ     → nhóm "Khách mới"
│
└─ Còn lại → chấm R, F, M (hoặc K-Means)     → Champions, Loyal, At risk...
```

Luật chạy theo thứ tự, nên mỗi khách chỉ vào một nhóm. Nếu để khách mới trong tập chấm điểm, họ sẽ bị dồn vào các mức F thấp và kéo lệch ngưỡng phân vị. Với K-Means, họ có thể thành một cụm riêng chỉ vì mới, không phải vì hành vi. Vin Datathon cũng tách khách chưa mua ra trước khi phân cụm vì lý do này. Ở project ITB, nhóm Insufficient History (19% khách) cũng được xử lý riêng.

Nhóm Khách mới thay đổi theo mỗi lần chạy: khách đủ một chu kỳ thì lần sau được chấm RFM như mọi người. Trong nhóm này vẫn có thể chia tiếp, ví dụ khách mới mua 1 đơn cần được nhắc mua đơn thứ hai, còn khách mới đã mua 2 đơn trở lên đã bắt đầu thành khách quen.

### Nhiều khách có cùng F khi chia phân vị

Phần lớn khách thường chỉ mua 1 hoặc 2 lần. Khi chia F theo phân vị, đường cắt có thể rơi vào giữa những khách cùng F = 1, nên hai khách giống hệt nhau lại có điểm khác nhau. Vì vậy ở project e-commerce, mình dùng ngưỡng cố định cho F (1, 2, 3–4, 5–7, 8+ đơn).

### Đánh giá chiến dịch không có nhóm đối chứng

Nhóm đang rất tốt thường kém đi một chút ở kỳ sau, còn nhóm At risk tự có một phần quay lại dù không làm gì. Nếu chỉ so trước và sau chiến dịch, chiến dịch kéo khách quay lại sẽ trông hiệu quả hơn thực tế. Gửi ưu đãi cho Champions rồi thấy họ mua nhiều cũng chưa chắc là nhờ ưu đãi, vì họ vốn đã mua nhiều. Cách tránh là giữ lại một phần khách trong mỗi nhóm không tác động để so. Ở project ITB, nhóm mình đề xuất giữ 10% khách làm nhóm đối chứng.

### Dùng dữ liệu sau ngày mốc khi backtest

Khi backtest, dữ liệu trước ngày mốc phải đúng như lúc đó. Ví dụ một đơn bị hoàn sau ngày mốc thì tại ngày mốc nó vẫn là đơn thành công. Nếu lấy trạng thái đơn mới nhất, kết quả backtest sẽ đẹp hơn thực tế.

## Hạn chế của RFM

- RFM chỉ dùng ba chỉ số hành vi trong quá khứ. Nó cho biết khách đang ở nhóm nào, không cho biết vì sao khách mua hay bỏ đi.
- RFM không tính các yếu tố bên ngoài như khuyến mãi trước đó hay mùa vụ. Khách mua nhiều trong một đợt sale lớn có thể bị xếp vào nhóm tốt hơn thực tế.
- Khách chưa mua lần nào không có RFM, nên cần một cách phân nhóm khác cho họ.
- Nhóm điểm thấp vẫn có thể có khách tiềm năng, dễ bị bỏ qua nếu chỉ nhìn điểm.

## Làm RFM bằng công cụ gì

- **Excel, Google Sheets:** R là ngày mốc trừ ngày mua gần nhất (tìm bằng MAXIFS), F đếm bằng COUNTIF, M cộng bằng SUMIF. Chia phân vị dùng PERCENTILE hoặc RANK, gắn tên nhóm dùng IFS. Cách này hợp với dữ liệu nhỏ, nhưng tính tay dễ sai.
- **SQL, Python:** hợp khi dữ liệu lớn và cần chạy lại định kỳ. Ở project e-commerce, mình tính RFM trong model `mart_customer_360` của dbt.
- **Power BI, Tableau:** vẽ treemap để thấy nhóm nào đông, nhóm nào mang lại nhiều doanh thu.
- **Phần mềm CRM:** một số phần mềm có sẵn tính năng tính điểm RFM.

## Khi định nghĩa RFM cho một doanh nghiệp

- Hỏi chu kỳ mua của ngành, rồi đo khoảng cách giữa hai lần mua trong dữ liệu để đặt ngưỡng R.
- Thống nhất thế nào là một lần mua và M tính theo doanh thu hay lợi nhuận, giống như quy tắc ghi nhận doanh thu.
- Với ngành có rủi ro tín dụng hoặc thuê bao, thay R, F, M bằng chỉ số phù hợp (tất toán, sử dụng, MRR) và thêm chiều rủi ro.
- Backtest trước khi dùng nhãn nhóm để chạy chiến dịch.

Học tới đâu mình cập nhật tới đó nha!
