import { PrismaClient, SupportCategory } from '@prisma/client';

const prisma = new PrismaClient();

const supportContents = [
  // EMOTION_MANAGEMENT - Quản lý cảm xúc
  {
    title: 'Kỹ thuật hít thở sâu để giảm căng thẳng',
    content: `# Kỹ thuật hít thở sâu để giảm căng thẳng

## Tại sao hít thở sâu quan trọng?
Hít thở sâu giúp cơ thể thư giãn, giảm cortisol (hormone căng thẳng) và tăng lưu lượng oxy đến não.

## Các bước thực hiện:
1. **Tìm một nơi yên tĩnh**: Ngồi hoặc nằm ở tư thế thoải mái
2. **Hít vào qua mũi**: Đếm từ 1 đến 4, cảm nhận không khí lấp đầy phổi
3. **Giữ hơi thở**: Đếm từ 1 đến 7
4. **Thở ra qua miệng**: Đếm từ 1 đến 8, thả lỏng toàn bộ cơ thể
5. **Lặp lại**: Thực hiện 5-10 lần

## Lợi ích:
- Giảm căng thẳng nhanh chóng
- Cải thiện tập trung
- Giúp ngủ ngon hơn
- Giảm huyết áp

## Thời điểm thực hiện:
- Khi cảm thấy lo âu hoặc căng thẳng
- Trước khi ngủ
- Sau những cuộc họp căng thẳng
- Bất cứ khi nào cần thư giãn

**Ghi nhớ**: Thực hành đều đặn mỗi ngày sẽ mang lại hiệu quả tốt nhất!`,
    category: SupportCategory.EMOTION_MANAGEMENT,
  },
  {
    title: 'Nhận diện và quản lý cảm xúc tiêu cực',
    content: `# Nhận diện và quản lý cảm xúc tiêu cực

## Bước 1: Nhận diện cảm xúc
Đặt tên cho cảm xúc bạn đang trải qua:
- Tức giận
- Buồn bã
- Lo âu
- Thất vọng
- Ghen tị

## Bước 2: Chấp nhận cảm xúc
✅ Cảm xúc tiêu cực là bình thường
✅ Không cố gắng đè nén
✅ Cho phép bản thân cảm nhận

## Bước 3: Tìm nguyên nhân
- Điều gì đã kích hoạt cảm xúc này?
- Có suy nghĩ nào không hợp lý không?
- Có mẫu hình lặp lại không?

## Bước 4: Áp dụng kỹ thuật quản lý
1. **Viết nhật ký cảm xúc**: Ghi lại những gì bạn cảm thấy
2. **Nói chuyện với người tin tưởng**: Chia sẻ cảm xúc
3. **Tập thể dục**: Giải tỏa qua hoạt động thể chất
4. **Mindfulness**: Sống trong hiện tại, không phán xét

## Khi nào cần hỗ trợ chuyên môn?
- Cảm xúc tiêu cực kéo dài hơn 2 tuần
- Ảnh hưởng đến công việc, học tập
- Có ý nghĩ tự làm hại bản thân
- Không thể kiểm soát cảm xúc

**Liên hệ ngay**: Tổ chức hỗ trợ tinh thần hoặc bác sĩ tâm lý`,
    category: SupportCategory.EMOTION_MANAGEMENT,
  },
  {
    title: '5 bài tập Mindfulness đơn giản mỗi ngày',
    content: `# 5 bài tập Mindfulness đơn giản mỗi ngày

## 1. Mindful Morning (3 phút)
Sau khi thức dậy, ngồi yên và:
- Cảm nhận hơi thở tự nhiên
- Đặt ý định cho ngày mới
- Tạo một nụ cười nhẹ nhàng

## 2. Mindful Eating (10 phút)
Trong bữa ăn:
- Tắt điện thoại, TV
- Nhìn vào thức ăn, đánh giá màu sắc
- Nhai chậm, cảm nhận hương vị
- Biết ơn nguồn thức ăn

## 3. Body Scan (5 phút)
- Nằm hoặc ngồi thoải mái
- Chú ý từng bộ phận cơ thể
- Từ đầu xuống chân
- Thả lỏng mọi căng thẳng

## 4. Mindful Walking (10 phút)
Khi đi bộ:
- Cảm nhận từng bước chân
- Chú ý cảm giác bàn chân chạm đất
- Quan sát xung quanh không phán xét
- Đồng bộ hơi thở với bước chân

## 5. Gratitude Practice (2 phút)
Trước khi ngủ:
- Liệt kê 3 điều biết ơn trong ngày
- Có thể là điều nhỏ nhất
- Cảm nhận lòng biết ơn

## Lợi ích của Mindfulness:
✨ Giảm stress và lo âu
✨ Tăng khả năng tập trung
✨ Cải thiện giấc ngủ
✨ Nâng cao hạnh phúc

**Bắt đầu từ hôm nay!**`,
    category: SupportCategory.EMOTION_MANAGEMENT,
  },

  // ADAPTATION_SKILLS - Kỹ năng thích nghi
  {
    title: 'Xây dựng khả năng phục hồi tinh thần',
    content: `# Xây dựng khả năng phục hồi tinh thần (Resilience)

## Resilience là gì?
Khả năng phục hồi nhanh chóng sau khó khăn, thất bại hay thay đổi lớn trong cuộc sống.

## 7 trụ cột của Resilience:

### 1. Tư duy tích cực
- Nhìn thấy cơ hội trong thử thách
- Học hỏi từ thất bại
- Tin vào khả năng vượt qua

### 2. Kết nối xã hội
- Duy trì mối quan hệ tốt
- Sẵn sàng nhờ giúp đỡ
- Cho và nhận hỗ trợ

### 3. Chăm sóc bản thân
- Ngủ đủ giấc (7-8 tiếng)
- Ăn uống lành mạnh
- Tập thể dục đều đặn

### 4. Mục tiêu rõ ràng
- Đặt mục tiêu có thể đạt được
- Chia nhỏ thành từng bước
- Theo dõi tiến độ

### 5. Kỹ năng giải quyết vấn đề
- Phân tích tình huống
- Cân nhắc các lựa chọn
- Hành động quyết đoán

### 6. Quản lý cảm xúc
- Nhận diện cảm xúc
- Thể hiện một cách lành mạnh
- Không để cảm xúc chi phối

### 7. Ý nghĩa và mục đích
- Tìm ý nghĩa trong công việc
- Kết nối với giá trị cá nhân
- Đóng góp cho cộng đồng

## Bài tập phát triển Resilience:
📝 Viết nhật ký hàng ngày
🎯 Đối mặt với sợ hãi nhỏ
🤝 Tham gia hoạt động nhóm
📚 Học kỹ năng mới

**Nhớ rằng**: Resilience là kỹ năng có thể rèn luyện!`,
    category: SupportCategory.ADAPTATION_SKILLS,
  },
  {
    title: 'Thích nghi với môi trường làm việc mới',
    content: `# Thích nghi với môi trường làm việc mới

## Tháng đầu tiên - Quan sát và học hỏi

### Tuần 1-2: Làm quen
✅ Học tên đồng nghiệp
✅ Hiểu cơ cấu tổ chức
✅ Nắm quy trình làm việc
✅ Quan sát văn hóa công ty

### Tuần 3-4: Tích cực tham gia
✅ Đặt câu hỏi khi cần
✅ Chủ động trong công việc
✅ Tham gia hoạt động nhóm
✅ Xây dựng mối quan hệ

## Chiến lược thành công:

### 1. Tạo ấn tượng tốt
- Đúng giờ
- Trang phục phù hợp
- Thái độ tích cực
- Sẵn sàng học hỏi

### 2. Giao tiếp hiệu quả
- Lắng nghe nhiều hơn nói
- Đặt câu hỏi thông minh
- Phản hồi kịp thời
- Tôn trọng ý kiến khác

### 3. Quản lý kỳ vọng
- Hiểu rõ trách nhiệm
- Đặt mục tiêu thực tế
- Cập nhật tiến độ
- Không ngại yêu cầu hỗ trợ

### 4. Xây dựng mạng lưới
- Kết nối với mentor
- Tham gia các nhóm
- Networking trong công ty
- Duy trì mối quan hệ

## Vượt qua thử thách:

### Cảm giác lạc lõng
✨ Bình thường và tạm thời
✨ Mọi người đều trải qua
✨ Sẽ cải thiện theo thời gian

### Áp lực công việc
✨ Ưu tiên nhiệm vụ
✨ Quản lý thời gian tốt
✨ Nhờ giúp đỡ khi cần

### So sánh với người khác
✨ Mỗi người có tốc độ riêng
✨ Tập trung vào phát triển bản thân
✨ Học hỏi từ người giỏi

**Kiên nhẫn**: 3-6 tháng để thích nghi hoàn toàn!`,
    category: SupportCategory.ADAPTATION_SKILLS,
  },

  // MOTIVATION - Động viên tinh thần
  {
    title: '10 câu châm ngôn tạo động lực mỗi ngày',
    content: `# 10 câu châm ngôn tạo động lực mỗi ngày

## 1. "Thành công không phải điểm đến, mà là hành trình"
Tận hưởng quá trình phát triển, không chỉ kết quả cuối cùng.

## 2. "Mỗi ngày là một khởi đầu mới"
Hôm qua đã qua, hôm nay là cơ hội mới để thay đổi.

## 3. "Bạn mạnh mẽ hơn những gì bạn nghĩ"
Tiềm năng của bạn vượt xa giới hạn bạn đặt ra.

## 4. "Thất bại là bài học, không phải kết thúc"
Mỗi thất bại dạy bạn cách làm tốt hơn lần sau.

## 5. "Hành động nhỏ hôm nay, thay đổi lớn ngày mai"
Bắt đầu từ việc nhỏ, kiên trì sẽ thấy kết quả.

## 6. "So sánh bản thân hôm nay với hôm qua"
Không so sánh với người khác, chỉ cần tiến bộ hơn chính mình.

## 7. "Khó khăn tạo ra sức mạnh"
Những thử thách giúp bạn trưởng thành và vững vàng hơn.

## 8. "Tin vào bản thân là nửa thành công"
Tự tin là chìa khóa để vượt qua mọi thử thách.

## 9. "Mọi chuyên gia đều từng là người mới bắt đầu"
Đừng sợ, hãy bắt đầu và tiếp tục học hỏi.

## 10. "Bạn xứng đáng với những điều tốt đẹp"
Tin rằng bạn xứng đáng và sẽ đạt được mục tiêu.

---

💪 **Lời khuyên**: Chọn 1 câu yêu thích, viết ra giấy và đặt ở nơi nhìn thấy mỗi ngày!

🌟 **Thực hành**: Đọc to câu châm ngôn mỗi sáng trước khi bắt đầu ngày mới.`,
    category: SupportCategory.MOTIVATION,
  },
  {
    title: 'Vượt qua giai đoạn mất động lực',
    content: `# Vượt qua giai đoạn mất động lực

## Nhận diện dấu hiệu mất động lực:
⚠️ Trì hoãn công việc liên tục
⚠️ Cảm thấy mệt mỏi không lý do
⚠️ Mất hứng thú với công việc
⚠️ Khó tập trung
⚠️ Ngủ nhiều hoặc ít bất thường

## Nguyên nhân phổ biến:

### 1. Burnout - Kiệt sức
- Làm việc quá tải
- Không có thời gian nghỉ ngơi
- Áp lực liên tục

### 2. Mất phương hướng
- Không rõ mục tiêu
- Công việc không có ý nghĩa
- Thiếu thử thách

### 3. Vấn đề cá nhân
- Căng thẳng gia đình
- Vấn đề sức khỏe
- Tài chính không ổn định

## 7 bước lấy lại động lực:

### Bước 1: Chấp nhận tình trạng
Mất động lực là bình thường, không tự trách mình.

### Bước 2: Tìm nguyên nhân gốc rễ
Viết ra những gì khiến bạn mất động lực.

### Bước 3: Nghỉ ngơi thực sự
- Tắt điện thoại 1-2 giờ
- Không nghĩ về công việc
- Làm điều bạn thích

### Bước 4: Đặt lại mục tiêu nhỏ
- Bắt đầu với việc dễ
- Chia nhỏ công việc lớn
- Kỷ niệm chiến thắng nhỏ

### Bước 5: Thay đổi môi trường
- Sắp xếp lại bàn làm việc
- Làm việc ở địa điểm mới
- Thêm cây xanh, ánh sáng

### Bước 6: Kết nối với người khác
- Chia sẻ cảm giác
- Tìm người mentor
- Tham gia nhóm có cùng mục tiêu

### Bước 7: Tự thưởng cho bản thân
- Hoàn thành việc → thưởng ngay
- Không cần quà to
- Tạo thói quen tích cực

## Hoạt động tái tạo năng lượng:
🏃 Tập thể dục nhẹ nhàng
🎵 Nghe nhạc yêu thích
📚 Đọc sách truyền cảm hứng
🌳 Đi dạo ngoài trời
🧘 Thiền hoặc yoga

## Khi nào cần hỗ trợ?
Nếu mất động lực kéo dài > 2 tuần và ảnh hưởng nghiêm trọng đến cuộc sống, hãy tìm đến:
- Người thân, bạn bè
- Tư vấn viên tâm lý
- Nhóm hỗ trợ

**Nhớ**: Giai đoạn này sẽ qua, bạn sẽ mạnh mẽ trở lại! 💪`,
    category: SupportCategory.MOTIVATION,
  },

  // GUIDANCE - Định hướng tích cực
  {
    title: 'Lập kế hoạch phát triển bản thân',
    content: `# Lập kế hoạch phát triển bản thân

## Tại sao cần kế hoạch phát triển?
✨ Định hướng rõ ràng
✨ Theo dõi tiến độ
✨ Duy trì động lực
✨ Đạt được mục tiêu

## 5 bước lập kế hoạch hiệu quả:

### Bước 1: Tự đánh giá (Self-Assessment)

#### Hỏi bản thân:
- Điểm mạnh của tôi là gì?
- Điểm yếu cần cải thiện?
- Đam mê thực sự của tôi?
- Giá trị sống quan trọng nhất?

#### Công cụ hữu ích:
- SWOT cá nhân (Strengths, Weaknesses, Opportunities, Threats)
- Bánh xe cuộc sống (Life Wheel)
- Bài test tính cách

### Bước 2: Đặt mục tiêu SMART

**S - Specific** (Cụ thể)
❌ "Tôi muốn giỏi tiếng Anh"
✅ "Tôi muốn đạt IELTS 7.0"

**M - Measurable** (Đo lường được)
✅ Có thể theo dõi tiến độ
✅ Biết khi nào hoàn thành

**A - Achievable** (Khả thi)
✅ Thực tế với nguồn lực hiện tại
✅ Không quá dễ, không quá khó

**R - Relevant** (Liên quan)
✅ Phù hợp với mục tiêu lớn hơn
✅ Có ý nghĩa với bản thân

**T - Time-bound** (Có thời hạn)
✅ Deadline rõ ràng
✅ Tạo cảm giác cấp bách

### Bước 3: Chia nhỏ thành hành động

#### Mục tiêu 1 năm → 4 mục tiêu quý
#### Mục tiêu quý → 3 mục tiêu tháng
#### Mục tiêu tháng → 4 mục tiêu tuần
#### Mục tiêu tuần → 7 hành động ngày

**Ví dụ:**
- Mục tiêu 1 năm: Đọc 50 quyển sách
- Mục tiêu quý: 12-13 quyển
- Mục tiêu tháng: 4 quyển
- Mục tiêu tuần: 1 quyển
- Hành động ngày: Đọc 30 phút/ngày

### Bước 4: Tạo thói quen hỗ trợ

#### Thói quen buổi sáng:
- 6:00 - Thức dậy
- 6:15 - Tập thể dục 30 phút
- 6:45 - Thiền 10 phút
- 7:00 - Đọc sách 30 phút

#### Thói quen buổi tối:
- Viết nhật ký
- Ôn lại ngày
- Lên kế hoạch ngày mai

### Bước 5: Theo dõi và điều chỉnh

#### Theo dõi hàng ngày:
📝 Checklist công việc
📊 Theo dõi thời gian
📈 Ghi nhận tiến độ

#### Review hàng tuần:
- Đạt được gì?
- Khó khăn gì?
- Cần điều chỉnh gì?

#### Review hàng tháng:
- So sánh với mục tiêu
- Kỷ niệm thành công
- Điều chỉnh kế hoạch nếu cần

## Template kế hoạch phát triển:

### Lĩnh vực 1: Sự nghiệp
- Mục tiêu 1 năm:
- Hành động cụ thể:
- Nguồn lực cần:
- Thời hạn:

### Lĩnh vực 2: Sức khỏe
- Mục tiêu 1 năm:
- Hành động cụ thể:
- Nguồn lực cần:
- Thời hạn:

### Lĩnh vực 3: Học tập
- Mục tiêu 1 năm:
- Hành động cụ thể:
- Nguồn lực cần:
- Thời hạn:

### Lĩnh vực 4: Tài chính
- Mục tiêu 1 năm:
- Hành động cụ thể:
- Nguồn lực cần:
- Thời hạn:

### Lĩnh vực 5: Mối quan hệ
- Mục tiêu 1 năm:
- Hành động cụ thể:
- Nguồn lực cần:
- Thời hạn:

## Mẹo giữ động lực:
🎯 Visualize thành công mỗi ngày
🏆 Kỷ niệm mỗi cột mốc
📸 Chụp ảnh tiến trình
🤝 Chia sẻ với người khác
📚 Đọc câu chuyện truyền cảm hứng

**Bắt đầu ngay hôm nay!** Bạn không cần hoàn hảo, chỉ cần bắt đầu. 🚀`,
    category: SupportCategory.WORK_SKILLS,
  },
  {
    title: 'Work-Life Balance - Cân bằng cuộc sống',
    content: `# Work-Life Balance - Cân bằng cuộc sống

## Tại sao Work-Life Balance quan trọng?
⚡ Tránh kiệt sức (burnout)
💼 Năng suất làm việc cao hơn
❤️ Sức khỏe thể chất và tinh thần tốt
👨‍👩‍👧‍👦 Quan hệ gia đình hạnh phúc
😊 Hạnh phúc và thỏa mãn

## Dấu hiệu mất cân bằng:
⚠️ Thường xuyên làm thêm giờ
⚠️ Bỏ bê gia đình, bạn bè
⚠️ Không có thời gian cho sở thích
⚠️ Cảm thấy kiệt sức liên tục
⚠️ Sức khỏe giảm sút

## 10 nguyên tắc cân bằng:

### 1. Đặt ranh giới rõ ràng
✅ Giờ làm việc: 8:00 - 17:00
✅ Sau giờ: Không check email công việc
✅ Cuối tuần: Dành cho gia đình
✅ Học cách nói "không"

### 2. Ưu tiên sức khỏe
🏃 Tập thể dục 30 phút/ngày
🥗 Ăn uống lành mạnh
😴 Ngủ đủ 7-8 tiếng
💧 Uống đủ nước

### 3. Quản lý thời gian hiệu quả
⏰ Sử dụng lịch/calendar
📝 To-do list hàng ngày
🎯 Ưu tiên công việc quan trọng
⛔ Loại bỏ việc không cần thiết

### 4. Tách biệt công việc và cuộc sống
🏠 Có không gian làm việc riêng
👔 Thay đồ sau giờ làm
📱 Tắt thông báo công việc
🚶 Nghi thức kết thúc ngày làm việc

### 5. Dành thời gian cho gia đình
👨‍👩‍👧 Bữa tối cùng gia đình
🎮 Chơi với con hàng ngày
💑 Date night với bạn đời
☎️ Gọi điện cho bố mẹ

### 6. Theo đuổi sở thích
🎸 Âm nhạc, nghệ thuật
📚 Đọc sách
🏊 Thể thao
🌱 Làm vườn

### 7. Nghỉ ngơi định kỳ
☕ Break 10 phút mỗi 2 giờ
🌳 Đi dạo giữa ngày
🏖️ Nghỉ phép đầy đủ
🧘 Thiền mỗi ngày

### 8. Kết nối xã hội
☕ Gặp gỡ bạn bè
🎉 Tham gia hoạt động nhóm
🤝 Networking
💬 Trò chuyện, chia sẻ

### 9. Học cách ủy quyền
👥 Phân công công việc
🙋 Nhờ giúp đỡ khi cần
💼 Không cần làm mọi thứ một mình

### 10. Tự chăm sóc bản thân
💆 Massage, spa
📖 Đọc sách yêu thích
🎬 Xem phim
🛁 Thư giãn

## Thực hành hàng tuần:

### Thứ 2-5: Làm việc
- Tập trung công việc trong giờ
- Break thường xuyên
- Kết thúc đúng giờ

### Thứ 6:
- Hoàn tất công việc còn lại
- Dọn dẹp bàn làm việc
- Lên kế hoạch tuần sau
- Bắt đầu nghỉ ngơi

### Thứ 7:
- Dành cho gia đình
- Hoạt động ngoài trời
- Sở thích cá nhân

### Chủ nhật:
- Thư giãn tối đa
- Chuẩn bị tuần mới
- Tự chăm sóc bản thân

## Chiến lược cho môi trường làm việc:

### Remote/WFH:
- Tạo không gian làm việc riêng
- Thay đồ như đi làm
- Giờ giấc cố định
- Tắt laptop sau giờ

### Văn phòng:
- Đi làm đúng giờ, về đúng giờ
- Không mang việc về nhà
- Tận dụng giờ nghỉ trưa
- Tham gia hoạt động công ty

## Lợi ích của cân bằng:

### Cho bản thân:
✨ Hạnh phúc và thỏa mãn
✨ Sức khỏe tốt
✨ Năng suất cao
✨ Sáng tạo hơn

### Cho công việc:
✨ Hiệu quả làm việc tăng
✨ Ít sai sót
✨ Quyết định tốt hơn
✨ Gắn kết lâu dài

### Cho gia đình:
✨ Quan hệ gần gũi
✨ Hỗ trợ lẫn nhau
✨ Kỷ niệm đẹp
✨ Hạnh phúc chung

## Đo lường cân bằng:
Tự hỏi bản thân mỗi tuần:
1. Tôi có đủ thời gian ngủ không?
2. Tôi có tập thể dục không?
3. Tôi có thời gian cho gia đình không?
4. Tôi có theo đuổi sở thích không?
5. Tôi có cảm thấy hạnh phúc không?

Nếu có >= 4 câu "CÓ" → Đang cân bằng tốt ✅
Nếu có <= 2 câu "CÓ" → Cần điều chỉnh ngay ⚠️

**Nhớ**: Bạn chỉ sống một lần, hãy sống trọn vẹn! 🌈`,
    category: SupportCategory.HEALTH_WELLNESS,
  },
];

async function seedSupportContent() {
  console.log('🌱 Seeding support content...');

  try {
    // Find any user with admin permissions (CREATE_SUPPORT_CONTENT)
    const adminUser = await prisma.user.findFirst({
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!adminUser) {
      console.error('❌ No users found in database. Please create a user first.');
      console.log('💡 Tip: Login to the app first, then run this seed again.');
      return;
    }

    console.log(`✅ Found user: ${adminUser.email} (${adminUser.id})`);

    // Create support contents
    for (const content of supportContents) {
      const created = await prisma.supportContent.create({
        data: {
          ...content,
          createdBy: adminUser.id,
        },
      });
      console.log(`✅ Created: ${created.title}`);
    }

    console.log('\n🎉 Support content seeding completed!');
    console.log(`📊 Total articles: ${supportContents.length}`);
    console.log(`📁 Categories:`);
    console.log(`   - EMOTION_MANAGEMENT: 3 articles`);
    console.log(`   - ADAPTATION_SKILLS: 2 articles`);
    console.log(`   - MOTIVATION: 2 articles`);
    console.log(`   - GUIDANCE: 2 articles`);
  } catch (error) {
    console.error('❌ Error seeding support content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedSupportContent();
}

export { seedSupportContent };
