---
title: 'Dư nợ bình quân tăng 13,3%, thu nhập lãi chỉ tăng 2,8%: EDA danh mục tín dụng AIV Bank'
description: 'Một case study EDA trên dữ liệu ngân hàng giả lập: tách hiệu ứng cơ cấu và hiệu ứng biên, cô lập một khoản vay làm méo số nợ xấu, và vì sao trung bình đánh lừa ở dữ liệu lệch.'
date: 2026-11-02
cover: /images/aiv-bank/xu-huong-du-no-nii.png
featured: true
track: business
tags: [eda, python, banking]
---

Một ngân hàng cho vay nhiều hơn 13,3% nhưng thu nhập lãi chỉ tăng 2,8%. Tiền đã đi đâu? Bài này đi theo câu hỏi đó qua một project EDA, và ghi lại những chỗ mà cách đo sai có thể dẫn tới kết luận sai.

**AIV Bank là dữ liệu giả lập.** Bộ dữ liệu gồm 10.000 khách hàng doanh nghiệp, 31.104 hợp đồng và 78 đơn vị kinh doanh, với số dư từ 31/12/2023 đến 30/06/2026. Kỳ so sánh chính là 6 tháng đầu 2026 với 6 tháng đầu 2025. Nếu muốn xem số liệu trực quan, có thể mở [dashboard của project](/projects/aiv-bank/dashboard.html).

## Vài khái niệm cần biết

| Chỉ tiêu | Ý nghĩa | Cách tính |
|---|---|---|
| Dư nợ | Số tiền khách đang vay tại một ngày chốt | Tổng số dư, không cộng qua các tháng |
| NII | Thu nhập lãi thuần | Tổng trong kỳ |
| NFI | Thu nhập ngoài lãi, chủ yếu là phí | Tổng trong kỳ |
| TOI | Tổng thu nhập | NII + NFI |
| NIM | Biên lãi: mỗi đồng dư nợ tạo ra bao nhiêu thu nhập lãi một năm | NII / tổng dư nợ bình quân các tháng × 12 |
| OD3-5 | Tỷ lệ nợ xấu | Dư nợ nhóm 3-5 / tổng dư nợ |

## Kiểm tra dữ liệu: dữ liệu sạch vẫn có bẫy

Các kiểm tra cơ bản đều qua: không có giá trị null, không trùng khóa, các số chính khớp với sheet QC đi kèm. Nhưng dữ liệu sạch không có nghĩa là dùng kiểu gì cũng đúng. Có bốn bẫy nằm ở cách đo:

- **Inner join làm mất thu nhập.** 20.031 dòng thu nhập thuộc hợp đồng đóng trong tháng nên không có số dư cuối tháng. Nối trong giữa hai bảng sẽ âm thầm bỏ các dòng này.
- **Số giải ngân không phải vốn mới.** 91,5% hợp đồng đã đóng là tái tục, nên số hợp đồng và doanh số giải ngân bị thổi lên nhiều so với dòng vốn thực.
- **Không nên chuẩn hóa NII theo số ngày.** Lãi trong dữ liệu được tính theo 1/12 năm ở mọi tháng, kể cả tháng 2. Chia theo số ngày sẽ tạo ra một đỉnh NIM giả vào tháng 2.
- **Thuộc tính khách hàng là giá trị hiện tại.** Phân khúc và xếp hạng không có lịch sử, nên mọi so sánh theo thời gian đang ngầm giả định các giá trị này không đổi.

## Quy mô tăng, thu nhập lãi không tăng theo

![Chỉ số dư nợ bình quân, NFI, NII và số khách hàng từ 03/2024 đến 06/2026. Dư nợ đạt 137, NFI 136, NII 114 và số khách hàng còn dư nợ 96.](/images/aiv-bank/xu-huong-du-no-nii.png)

Đưa mọi thứ về cùng chỉ số 100 tại tháng 3/2024 thì câu chuyện hiện ra ngay. NII chững lại từ giữa 2025 trong khi dư nợ bình quân vẫn tăng đều. NII tháng 6/2026 (131,9 tỷ) còn thấp hơn tháng 6/2025 (133,7 tỷ), dù dư nợ lớn hơn 10,9%.

Kết quả là NIM giảm từ 1,84% xuống 1,67%. Số khách hàng còn dư nợ cũng giảm từ 9.180 (12/2023) xuống 8.778 (06/2026), nên toàn bộ tăng trưởng đến từ dư nợ trên mỗi khách hàng. Tổng thu nhập TOI vẫn tăng 5,7%, nhưng đó là nhờ phí: NFI tăng 12,9%.

## NIM giảm 0,17 điểm %: do cơ cấu hay do biên?

Khi một tỷ lệ bình quân giảm, có hai khả năng rất khác nhau:

1. **Hiệu ứng cơ cấu:** danh mục dịch chuyển sang các nhóm vốn có biên thấp, còn biên từng nhóm không đổi.
2. **Hiệu ứng biên:** chính biên trong từng nhóm thu hẹp lại.

Hai nguyên nhân dẫn tới hai hành động khác nhau, nên cần tách chúng ra. Gọi $w_i$ là tỷ trọng dư nợ của nhóm $i$, $n_i$ là NIM của nhóm đó, và $N_0$ là NIM toàn danh mục kỳ gốc:

$$
\Delta \text{NIM} =
\underbrace{\sum_i (w_{1i} - w_{0i})(n_{0i} - N_0)}_{\text{cơ cấu}}
+ \underbrace{\sum_i w_{1i}(n_{1i} - n_{0i})}_{\text{biên}}
$$

Trừ $N_0$ trong vế cơ cấu không làm thay đổi tổng, vì các chênh lệch tỷ trọng cộng lại bằng 0. Việc này giúp đọc được đóng góp từng nhóm: tăng tỷ trọng ở nhóm có biên thấp hơn mặt bằng thì mang dấu âm.

```python
def bridge(dim):
    g0 = Y25.groupby(dim).agg(n=('nii_mtd', 'sum'), a=('avg_balance_vnd', 'sum'))
    g1 = Y26.groupby(dim).agg(n=('nii_mtd', 'sum'), a=('avg_balance_vnd', 'sum'))
    x = pd.DataFrame(index=g0.index.union(g1.index))
    x['w0'] = (g0.a / g0.a.sum()).reindex(x.index).fillna(0)
    x['w1'] = (g1.a / g1.a.sum()).reindex(x.index).fillna(0)
    x['nim0'] = (g0.n / g0.a * 1200).reindex(x.index)
    x['nim1'] = (g1.n / g1.a * 1200).reindex(x.index)
    # Nhóm mới hoặc đã hết lấy NIM hiện có làm gốc,
    # để không tính nhầm cả nhóm thành hiệu ứng biên
    n0 = x.nim0.fillna(x.nim1)
    n1 = x.nim1.fillna(x.nim0)
    N0 = (x.w0 * n0).sum()
    x['Cơ cấu'] = (x.w1 - x.w0) * (n0 - N0)
    x['Biên'] = x.w1 * (n1 - n0)
    return x
```

Kết quả nhất quán dù cắt theo chiều nào. Hiệu ứng cơ cấu chỉ từ −0,01 đến −0,02 điểm % khi cắt theo phân khúc, kỳ hạn hay loại tiền, và −0,05 khi cắt theo chương trình ưu đãi, trong tổng mức giảm −0,17. **Phần lớn mức giảm nằm ở biên thu hẹp ngay trong từng nhóm.**

Cắt theo chương trình cho thấy rõ nơi biên bị mất:

- Hai chương trình ưu đãi mới, CT0701 và CT0801, chiếm khoảng 11,5% dư nợ bình quân nhưng đóng góp −0,10 điểm %.
- Nhóm không ưu đãi đóng góp thêm −0,09 điểm %. Mức giảm nằm ở ngắn hạn VND (2,06% xuống 1,83%), còn trung dài hạn VND vẫn giữ biên (2,52% lên 2,55%).
- Hai phần trên cộng lại là −0,19, nên các chương trình còn lại bù ngược khoảng +0,02 để ra tổng −0,17.

Có một giả thuyết khác cần loại trừ: nợ xấu không dự thu lãi kéo NIM xuống. Khoảng cách giữa NIM phần nợ nhóm 1-2 và NIM toàn danh mục giữ nguyên 0,23 điểm % ở cả hai kỳ, nên nợ xấu không phải động lực của mức giảm.

## Một khoản vay có thể đổi cả câu chuyện

![Tỷ lệ OD3-5 và OD2 theo tháng, báo cáo và sau khi loại khoản vay 390 tỷ. Tháng 6/2026, OD3-5 báo cáo là 2,63%, loại khoản này còn 2,24%.](/images/aiv-bank/no-xau-loai-khoan-390-ty.png)

Nhìn số báo cáo, nợ xấu tháng 6/2026 tăng từ 2,38% lên 2,63%. Loại riêng một khoản vay 390 tỷ thì tỷ lệ này lại *giảm* từ 2,39% xuống 2,24%. Cách đọc đúng là một khoản xấu đi, không phải toàn danh mục xấu đi trong tháng 6.

Khoản này còn làm méo các lát cắt nhỏ hơn: Bắc Ninh hiện 16,0% nợ xấu (loại ra còn 1,6%), ngành điện tử hiện 9,2% (loại ra còn 0,2%). Nếu không tách nó ra, rất dễ kết luận sai rằng ngành điện tử hoặc địa bàn Bắc Ninh đang có vấn đề.

Tách được nhiễu rồi mới thấy tín hiệu đáng lo hơn, và tín hiệu đó nằm ở xu hướng nền:

- Nợ xấu **Bất động sản** tăng từ 3,06% lên 6,15% trong 12 tháng, không liên quan đến khoản 390 tỷ.
- **Xóa nợ** 6 tháng đầu 2026 là 547 tỷ, so với 217 tỷ cùng kỳ. Tỷ lệ nợ xấu trông phẳng một phần là nhờ nợ được đưa ra khỏi sổ.
- **Định nghĩa cũng đổi con số:** quy toàn bộ dư nợ của khách hàng về nhóm xấu nhất của họ thì OD3-5 là 3,80% thay vì 2,63%.

Cùng một danh mục, cùng một thời điểm, có ba con số nợ xấu: 2,63%, 2,24% và 3,80%. Không con số nào sai, chúng trả lời ba câu hỏi khác nhau. Báo cáo nên ghi rõ đang dùng cách nào.

## Đừng mô tả dữ liệu lệch bằng trung bình

![Phân bố dư nợ mỗi khách hàng trên thang log có dạng gần hình chuông, P50 là 2,8 tỷ và P99 là 142 tỷ. Bên phải là khoảng phân vị dư nợ theo phân khúc, chồng lấn mạnh.](/images/aiv-bank/phan-bo-du-no-kh.png)

Dư nợ trung bình mỗi khách hàng là 11,2 tỷ, nhưng trung vị chỉ 2,8 tỷ, và 75% khách hàng có dư nợ dưới 7,7 tỷ. Con số 11,2 tỷ không đại diện cho khách hàng nào phổ biến. Trên thang log, phân bố có dạng gần hình chuông, tức gần log-chuẩn.

Độ tập trung cũng cao: 20% khách hàng lớn nhất giữ 80,8% dư nợ, và 20% khách hàng có thu nhập cao nhất tạo 82,5% TOI. Dù vậy, rủi ro tập trung theo từng tên vẫn thấp, vì top 10 khách hàng chỉ chiếm 9,8% dư nợ. Hai điều này không mâu thuẫn: nhóm đầu bảng đông người nên không ai quá lớn.

## Những gì dữ liệu chưa trả lời được

Phần này quan trọng không kém phần kết quả:

- **Ưu đãi có đáng không?** 84,6% hợp đồng CT0701 và 95,3% hợp đồng CT0801 là tái tục. Nhưng dữ liệu không cho biết nếu không có ưu đãi thì khách có ở lại hay không, nên chưa thể kết luận đây là mất thu nhập ròng.
- **Vì sao spread giải ngân mới giảm?** Spread ngắn hạn VND giảm từ 1,92 xuống khoảng 1,70 điểm %. Đây có thể là áp lực giá hoặc dịch chuyển sang ưu đãi sâu hơn, dữ liệu chưa đủ để tách hai nguyên nhân này.
- **Dữ liệu giả lập có quy luật riêng.** Một số điểm lạ, như chi nhánh tỉnh NAN02 đứng thứ 3 toàn hệ thống, có thể là quy luật được cài vào khi sinh dữ liệu.

## Kết luận

Vấn đề chính của AIV Bank trong nửa đầu 2026 là **chất lượng tăng trưởng, không phải quy mô**. Dư nợ tăng hai chữ số, nhưng NII gần như đi ngang vì biên thu hẹp, tệp khách hàng co lại, và rủi ro nền tăng ở một số mảng dù tỷ lệ nợ xấu chung trông ổn định.

Về phương pháp, có bốn thói quen đáng mang sang lần EDA sau:

1. Dữ liệu sạch rồi vẫn phải hỏi: con số này đang đo cái gì?
2. Khi một tỷ lệ bình quân thay đổi, tách cơ cấu và biên trước khi kết luận.
3. Khi một chỉ số nhảy đột ngột, kiểm tra xem có phải một vài bản ghi đang kéo nó không.
4. Ghi rõ những gì dữ liệu không trả lời được.
