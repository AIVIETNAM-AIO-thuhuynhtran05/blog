// Các mục kiến thức của blog, xếp theo level từ dễ đến khó.
// Level của mỗi mục chính là vị trí của nó trong danh sách, muốn đổi level thì đổi thứ tự.
// Mỗi bài viết và TIL khai báo `track` bằng một trong các slug dưới đây.
export const levelTracks = [
  {
    slug: 'excel',
    short: 'Làm sạch và tổng hợp dữ liệu.',
    title: 'Excel',
    summary: 'Cứ nghĩ chỉ để kẻ bảng với tính tổng, ai ngờ Excel powerful hơn mình tưởng rất nhiều.',
  },
  {
    slug: 'sql',
    short: 'Tự lấy dữ liệu từ database.',
    title: 'SQL',
    summary: 'Tự lấy dữ liệu từ database và trả lời câu hỏi bằng truy vấn.',
  },
  {
    slug: 'data-transformation',
    short: 'Biến dữ liệu thô thành dữ liệu dùng được.',
    title: 'Data Transformation',
    summary: 'Làm sạch và biến đổi dữ liệu thô thành các bảng đáng tin cậy, sẵn sàng cho phân tích và báo cáo.',
  },
  {
    slug: 'powerbi',
    short: 'Biến dữ liệu thành dashboard.',
    title: 'Power BI',
    summary: 'Biến dữ liệu thành dashboard để người khác theo dõi và ra quyết định.',
  },
  {
    slug: 'xac-suat-thong-ke',
    short: 'Đọc đúng ý nghĩa của con số.',
    title: 'Xác suất thống kê',
    summary: 'Nền tảng để đọc đúng ý nghĩa của con số, trước khi học Machine Learning và A/B testing.',
  },
  {
    slug: 'machine-learning',
    short: 'Dùng mô hình để dự đoán.',
    title: 'Machine Learning',
    summary: 'Dùng mô hình để dự đoán và tìm quy luật mà phân tích mô tả không thấy được.',
  },
  {
    slug: 'business',
    short: 'Tài chính, sales, logistics và các ngành khác.',
    title: 'Business Domain',
    summary: 'Hiểu từng ngành làm ăn ra sao, từ tài chính, sales tới logistics, để đọc số cho đúng bối cảnh.',
  },
];

// Mục riêng, không thuộc bậc thang level
export const extraTracks = [
  {
    slug: 'soft-skill',
    short: 'Tư duy và giao tiếp trong công việc.',
    title: 'Soft skill',
    summary: 'Phân tích giỏi mà đặt sai vấn đề thì vẫn đi sai hướng. Nên mình học cách hỏi đúng, nghĩ rõ và nói dễ hiểu.',
  },
  {
    slug: 'cfa',
    short: 'Tài chính và đầu tư.',
    title: 'CFA',
    summary: 'Hiểu dòng tiền và báo cáo tài chính, để những con số mình phân tích có thêm ý nghĩa kinh doanh.',
  },
];

export const tracks = [...levelTracks, ...extraTracks];

// Sách có tab riêng nên không nằm trong các mục. Bài khai báo `section` bằng một trong các phần dưới đây.
export const bookTrack = {
  slug: 'sach-minh-doc',
  short: 'Những gì mình nghĩ sau khi đọc sách.',
  title: 'My thoughts',
  summary: 'Những gì mình nghĩ sau khi đọc sách.',
};

export const bookSections = ['DA - IT', 'Life'];

export const trackSlugs = [...tracks, bookTrack].map((t) => t.slug) as [string, ...string[]];

export function getTrack(slug: string) {
  return [...tracks, bookTrack].find((t) => t.slug === slug)!;
}

// Lời mở đầu hiện trên bảng lộ trình, theo slug. Mỗi chuỗi là một đoạn văn.
export const trackIntros: Record<string, string[]> = {
  'sach-minh-doc': [
    '“Anh Thư đừng quá gồng lên để trở thành một phiên bản hoàn hảo trong mắt ai đó. Nhưng Anh Thư cũng nên học cách hoàn thiện hơn mỗi ngày nhen, từng chút một thôi.”',
    'Cũng đừng đợi mọi thứ hoàn hảo rồi mới bắt đầu, dù là một việc mới hay một mối quan hệ, vì mình lớn lên từ chính những lần sai mà. Chúc Anh Thư bước ra khỏi vùng an toàn nhiều hơn nữa, vì đó cũng là một phần của hành trình làm người lớn. Và làm gì thì hãy dấn thân.',
    'Anh Thư cũng muốn cảm ơn mọi người, và cả những mối quan hệ đã qua, vì đã cho Anh Thư những trải nghiệm quý giá và những bài học từ chính những thiếu sót của mình.',
    'Vì chân thành sẽ chạm tới chân thành ♡',
  ],
  'xac-suat-thong-ke': [
    'Mình từng học xác suất thống kê mà không hiểu học để làm gì, từ mấy mẫu dân số hồi học Y cho tới lúc học IT. Hồi đó mình wondering là học để bỏ vào các mô hình học máy hay gì.',
    'Đến lúc hiểu ra thì lại tiếc. Nhưng sống trong tiếc nuối mãi thì có được gì đâu, nên mình học lại lần nữa, và giờ mình đang đi tìm câu trả lời.',
  ],
  powerbi: [
    'Power BI được mình xem như những lần đầu mình tập viết chữ. Mình chưa định hình được một chữ cụ thể là như nào, cần có gì, mình cứ ghi những gì mình thích, mình có thể, và có thể nó rất nguệch ngoạc.',
    'Nhưng sau đó mình đã học được cách xây một dashboard sao cho logic. Để mình share cho mọi người nhenn!',
  ],
  cfa: [
    'Mình thích dữ liệu tài chính, muốn hiểu dòng tiền của doanh nghiệp, nên mình học CFA.',
    'Hoặc ít nhất, lỡ sau này mình không làm IT nữa mà đi khởi nghiệp chẳng hạn, mình vẫn đọc được báo cáo tài chính công ty mà không cần search GPT.',
  ],
  'soft-skill': [
    'Soft skill là phần mình thấy mình còn thiếu nhiều, nên cũng đang học dần. Học tới đâu mình ghi lại tới đó nha.',
  ],
  sql: [
    'Hồi đi học, SQL với mình chỉ là vài câu lệnh đơn giản. Nên mình cứ tò mò mãi: ngoài kia dữ liệu nhiều đến vậy, người ta dùng SQL thế nào để xử lý hết?',
    'Câu hỏi đó mình để ngỏ suốt mấy năm, cho tới ngày quyết định đi theo data. Và đây là những gì mình đã đi qua để tìm câu trả lời.',
  ],
  'machine-learning': [
    'Mình học ở trường chuyên, tiếp xúc nhiều với các bạn chuyên Toán, và mình nhận ra mình không giỏi toán. Nên khi học IT, mình khá ngại đụng tới Machine Learning hay Data Science, vì nghe kể là ai giỏi toán thì mới học được.',
    'Nhưng sau này mình nghĩ, không giỏi toán chưa phải là lý do để không thử. Cần phần toán nào thì mình học phần đó, bắt đầu từ việc hiểu mô hình làm gì và dùng nó cho đúng.',
    'Nên mí bạn đừng ngại dấn thân nhen!',
  ],
};

// Lộ trình hiện ở trang của mục, theo slug. Mục nào không khai báo thì không hiện.
export const roadmaps: Record<string, { group: string; description: string; topics: string }[]> = {
  excel: [
    {
      group: 'Làm việc với bảng',
      description: 'Tổ chức dữ liệu thành bảng chuẩn, để lọc, sắp xếp và tính toán không bị lỗi.',
      topics: 'Excel Table, sort và filter, kiểu dữ liệu, Data Validation',
    },
    {
      group: 'Hàm thường dùng',
      description: 'Tính toán có điều kiện và tra cứu giữa các bảng, thay vì làm thủ công từng dòng.',
      topics: 'IF, SUMIFS, COUNTIFS, XLOOKUP, hàm xử lý chữ và ngày tháng',
    },
    {
      group: 'Thống kê mô tả',
      description: 'Đọc đúng ý nghĩa của các con số tổng hợp, tránh kết luận sai khi dữ liệu bị lệch.',
      topics: 'Trung bình, trung vị, phân vị, bình quân gia quyền, phân phối lệch',
    },
    {
      group: 'Pivot Table',
      description: 'Tổng hợp dữ liệu theo nhiều chiều bằng thao tác kéo thả, không cần viết công thức.',
      topics: 'Rows, Columns, Values, nhóm theo thời gian, Calculated Field, Slicer',
    },
    {
      group: 'Power Query',
      description: 'Lấy và làm sạch dữ liệu bằng các bước được lưu lại, lần sau chỉ cần bấm Refresh.',
      topics: 'Kết nối nguồn dữ liệu, xóa trùng lặp, unpivot, Merge và Append',
    },
    {
      group: 'Biểu đồ và dashboard',
      description: 'Chọn biểu đồ đúng với câu hỏi, rồi ghép lại thành một trang dễ theo dõi.',
      topics: 'Chọn loại biểu đồ, Pivot Chart, Slicer, bố cục dashboard',
    },
  ],
  sql: [
    {
      group: 'Câu lệnh cơ bản',
      description: 'Lấy đúng cột và đúng dòng cần dùng từ một bảng trong database.',
      topics: 'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, kiểu dữ liệu và NULL',
    },
    {
      group: 'Tổng hợp dữ liệu',
      description: 'Gom các dòng thành nhóm rồi tính chỉ số cho từng nhóm.',
      topics: 'GROUP BY, HAVING, COUNT, SUM, AVG, CASE WHEN',
    },
    {
      group: 'Kết nối bảng',
      description: 'Ghép thông tin từ nhiều bảng theo khóa, và kiểm tra để không mất dòng hay nhân đôi dòng.',
      topics: 'INNER JOIN, LEFT JOIN, self join, UNION, kiểm tra số dòng sau khi join',
    },
    {
      group: 'Subquery và CTE',
      description: 'Chia một truy vấn dài thành các bước nhỏ, để dễ đọc và dễ kiểm tra.',
      topics: 'Subquery, WITH, EXISTS, tổ chức truy vấn nhiều bước',
    },
    {
      group: 'Window function',
      description: 'Tính toán trên một nhóm dòng liên quan mà vẫn giữ nguyên từng dòng, không gộp lại như GROUP BY.',
      topics: 'OVER, PARTITION BY, ROW_NUMBER, RANK, LAG, LEAD, tổng lũy kế, trung bình trượt',
    },
    {
      group: 'Tối ưu truy vấn',
      description: 'Hiểu database thực thi truy vấn thế nào, để truy vấn chạy nhanh trên dữ liệu lớn.',
      topics: 'Thứ tự thực thi, index, execution plan',
    },
  ],
  'data-transformation': [
    {
      group: 'Làm sạch dữ liệu',
      description: 'Xử lý các lỗi trong dữ liệu thô, để kết quả phân tích phía sau không bị sai lệch.',
      topics: 'Giá trị thiếu, trùng lặp, sai kiểu dữ liệu, chuẩn hóa định dạng, giá trị ngoại lai',
    },
    {
      group: 'Biến đổi cấu trúc',
      description: 'Đưa dữ liệu về đúng hình dạng và độ chi tiết mà câu hỏi phân tích cần.',
      topics: 'Join, aggregate, pivot và unpivot, window function, tạo cột tính toán',
    },
    {
      group: 'Power Query',
      description: 'Biến đổi bằng thao tác trên giao diện, không cần code; hợp với dữ liệu vừa và nhỏ trong Excel hay Power BI.',
      topics: 'Merge và Append, unpivot, các bước Applied Steps, Refresh',
    },
    {
      group: 'pandas',
      description: 'Biến đổi bằng Python, linh hoạt và lặp lại được, hay dùng khi phân tích trong notebook.',
      topics: 'merge, groupby, pivot_table, xử lý thời gian, viết hàm làm sạch',
    },
    {
      group: 'dbt',
      description: 'Viết biến đổi bằng SQL ngay trong data warehouse, có quản lý phiên bản, kiểm thử và tài liệu.',
      topics: 'ETL và ELT, model, ref, test, documentation, incremental model',
    },
  ],
  powerbi: [
    {
      group: 'Data model',
      description: 'Tổ chức dữ liệu thành các bảng và quan hệ giữa chúng, nền tảng để số liệu tính đúng và nhanh.',
      topics: 'Star schema, bảng fact và dimension, cardinality, hướng lọc, bảng Date',
    },
    {
      group: 'DAX',
      description: 'Ngôn ngữ viết phép tính trên data model; kết quả thay đổi theo ngữ cảnh lọc của báo cáo.',
      topics: 'Measure và calculated column, filter context và row context, CALCULATE, time intelligence',
    },
    {
      group: 'Semantic layer',
      description: 'Lớp định nghĩa chỉ số và tên gọi dùng chung, để mọi báo cáo cùng ra một con số.',
      topics: 'Measure dùng chung, quy tắc đặt tên, ẩn cột kỹ thuật, shared semantic model, row-level security',
    },
    {
      group: 'Thiết kế báo cáo tối ưu',
      description: 'Sắp xếp báo cáo theo câu hỏi người đọc cần trả lời, đồng thời giữ cho báo cáo tải nhanh.',
      topics: 'Bố cục trang, chọn biểu đồ, drill-through, tooltip, Performance Analyzer',
    },
  ],
  'soft-skill': [
    {
      group: 'Tư duy đặt vấn đề',
      description: 'Xác định đúng câu hỏi cần trả lời trước khi bắt tay phân tích hay tìm giải pháp.',
      topics: 'Làm rõ mục tiêu, phát biểu vấn đề, phân biệt triệu chứng và nguyên nhân, 5 Whys',
    },
    {
      group: 'Phương pháp MECE',
      description: 'Chia vấn đề thành các phần không trùng lặp và không bỏ sót, để phân tích có hệ thống.',
      topics: 'Mutually Exclusive, Collectively Exhaustive, issue tree, cây chỉ số',
    },
    {
      group: 'Tư duy giả thuyết',
      description: 'Đưa ra phán đoán có thể kiểm chứng rồi tìm bằng chứng, thay vì xem hết mọi dữ liệu.',
      topics: 'Đặt giả thuyết, chọn dữ liệu để kiểm chứng, bác bỏ và cập nhật giả thuyết',
    },
    {
      group: 'Trình bày kết luận',
      description: 'Nêu kết luận trước, rồi đưa lý lẽ và bằng chứng, để người nghe ra được quyết định.',
      topics: 'Pyramid Principle, trả lời câu hỏi "so what", kể chuyện bằng dữ liệu',
    },
  ],
  'xac-suat-thong-ke': [
    {
      group: 'Thống kê mô tả',
      description: 'Tóm tắt một tập dữ liệu bằng vài con số, để biết dữ liệu nằm ở đâu và trải rộng thế nào.',
      topics: 'Trung bình, trung vị, phân vị, phương sai, độ lệch chuẩn',
    },
    {
      group: 'Xác suất cơ bản',
      description: 'Đo khả năng xảy ra của một sự kiện, và khả năng đó thay đổi thế nào khi có thêm thông tin.',
      topics: 'Biến cố, xác suất có điều kiện, độc lập, định lý Bayes',
    },
    {
      group: 'Phân phối xác suất',
      description: 'Mô tả các giá trị có thể xảy ra và khả năng của từng giá trị.',
      topics: 'Kỳ vọng, phân phối chuẩn, nhị thức, Poisson, phân phối lệch',
    },
    {
      group: 'Ước lượng',
      description: 'Dùng một mẫu nhỏ để suy ra tổng thể, kèm theo mức độ không chắc chắn.',
      topics: 'Mẫu và tổng thể, định lý giới hạn trung tâm, khoảng tin cậy',
    },
    {
      group: 'Kiểm định giả thuyết',
      description: 'Xét xem một khác biệt quan sát được là có thật hay chỉ do ngẫu nhiên.',
      topics: 'Giả thuyết H0, p-value, sai lầm loại I và II, t-test, chi-square',
    },
    {
      group: 'Tương quan và hồi quy',
      description: 'Đo mức độ hai biến đi cùng nhau, và phân biệt tương quan với nhân quả.',
      topics: 'Hệ số tương quan, tương quan và nhân quả, hồi quy tuyến tính',
    },
  ],
  business: [
    {
      group: 'Tài chính – ngân hàng',
      description: 'Hiểu ngân hàng kiếm tiền từ đâu và rủi ro nằm ở đâu, để đọc đúng các chỉ số tín dụng.',
      topics: 'Dư nợ, NII và NIM, nợ xấu và nhóm nợ, giải ngân và tái tục, báo cáo tài chính',
    },
    {
      group: 'Sales',
      description: 'Biết doanh số đến từ đâu, khách nào mua nhiều, và vì sao tháng này tăng hay giảm.',
      topics: 'Doanh thu, số đơn, giá trị đơn trung bình, phễu bán hàng, tỷ lệ chuyển đổi, tiến độ so với target',
    },
    {
      group: 'Marketing',
      description: 'Đo chiến dịch nào mang về khách thật, và tốn bao nhiêu tiền để có một khách.',
      topics: 'CAC, ROAS, attribution, cohort, retention, churn, RFM',
    },
    {
      group: 'Logistics và chuỗi cung ứng',
      description: 'Theo dõi hàng đi từ kho tới tay khách: chỗ nào chậm, chỗ nào tồn, chỗ nào tốn tiền.',
      topics: 'Tồn kho, vòng quay hàng tồn, lead time, tỷ lệ giao đúng hẹn, chi phí vận chuyển, dự báo nhu cầu',
    },
    {
      group: 'Nhân sự',
      description: 'Nhìn người vào, người ra và năng suất, để biết công ty có đang giữ được người hay không.',
      topics: 'Headcount, tỷ lệ nghỉ việc, thời gian tuyển dụng, chi phí nhân sự, năng suất',
    },
  ],
  'machine-learning': [
    {
      group: 'Làm quen',
      description: 'Mô hình học quy luật từ dữ liệu đã có để dự đoán cho dữ liệu chưa từng thấy.',
      topics: 'Học có giám sát và không giám sát, chia train, validation và test',
    },
    {
      group: 'Mô hình đầu tiên',
      description: 'Hai mô hình tuyến tính dễ diễn giải, làm mốc để so sánh với các mô hình phức tạp hơn.',
      topics: 'Linear Regression dự đoán giá trị số, Logistic Regression ước lượng xác suất',
    },
    {
      group: 'Đánh giá mô hình',
      description: 'Đo sai số và khả năng phân biệt của mô hình trên dữ liệu nó chưa được học.',
      topics: 'MAE, RMSE, R², Confusion matrix, Precision, Recall, F1, ROC-AUC',
    },
    {
      group: 'Mô hình dạng cây',
      description: 'Nắm bắt quan hệ phi tuyến và tương tác giữa các biến, thường mạnh trên dữ liệu dạng bảng.',
      topics: 'Decision Tree, Random Forest, Gradient Boosting',
    },
    {
      group: 'Chẩn đoán và cải thiện',
      description: 'Tìm lý do mô hình kém hoặc tốt đến khó tin, rồi cải thiện khả năng tổng quát hóa.',
      topics: 'Overfitting, bias-variance, data leakage, tạo feature, cross-validation, chỉnh tham số',
    },
    {
      group: 'Gom cụm',
      description: 'Học không có nhãn: nhóm các quan sát giống nhau để phân khúc khách hàng.',
      topics: 'K-means, Hierarchical Clustering, Silhouette, PCA để giảm chiều',
    },
    {
      group: 'Chấm điểm khách hàng',
      description: 'Ước lượng xác suất một hành vi như vỡ nợ hay rời bỏ, rồi xếp hạng để ưu tiên hành động.',
      topics: 'Credit scoring, churn, WoE và IV, scorecard, KS và Gini, hiệu chỉnh xác suất',
    },
    {
      group: 'Dự báo chuỗi thời gian',
      description: 'Dự báo giá trị tương lai từ dữ liệu theo thời gian, phải giữ đúng thứ tự khi chia dữ liệu.',
      topics: 'Xu hướng, mùa vụ, ARIMA, kiểm định walk-forward, MAPE',
    },
    {
      group: 'A/B testing',
      description: 'Thực nghiệm ngẫu nhiên có đối chứng để đo tác động thật của một thay đổi lên người dùng.',
      topics: 'Giả thuyết, cỡ mẫu, p-value, khoảng tin cậy, ý nghĩa thống kê và ý nghĩa kinh doanh',
    },
  ],
};

export const projects: {
  title: string;
  track: string;
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
}[] = [
  {
    title: 'AIV Bank: danh mục tín dụng khách hàng doanh nghiệp',
    track: 'powerbi',
    summary:
      'EDA và dashboard trên dữ liệu giả lập gồm 10.000 khách hàng, 31.104 hợp đồng, 78 đơn vị kinh doanh. Kết luận chính: vấn đề của 6 tháng đầu 2026 là chất lượng tăng trưởng, không phải quy mô.',
    stack: ['Python', 'pandas', 'matplotlib', 'Power BI'],
    links: [
      { label: 'Đọc phân tích', href: '/blog/aiv-bank-eda' },
      { label: 'Mở dashboard', href: '/projects/aiv-bank/dashboard.html' },
    ],
  },
];
