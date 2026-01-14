/**
 * Danh sách câu hỏi gợi mở cho nhật ký dẫn dắt
 * Giúp người dùng tự suy ngẫm và khám phá bản thân
 */

export interface GuidedPrompt {
  id: string;
  question: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'emotion' | 'challenge';
  description?: string;
}

export const GUIDED_PROMPTS: GuidedPrompt[] = [
  // Suy ngẫm (Reflection)
  {
    id: 'ref_01',
    question: 'Hôm nay điều gì khiến bạn suy nghĩ nhiều nhất?',
    category: 'reflection',
    description: 'Phản ánh về những suy nghĩ chính trong ngày',
  },
  {
    id: 'ref_02',
    question: 'Khoảnh khắc nào trong ngày khiến bạn cảm thấy đặc biệt?',
    category: 'reflection',
    description: 'Ghi nhận những khoảnh khắc đáng nhớ',
  },
  {
    id: 'ref_03',
    question: 'Bạn đã làm gì khác so với mọi ngày?',
    category: 'reflection',
    description: 'Nhận diện sự thay đổi trong thói quen',
  },
  {
    id: 'ref_04',
    question: 'Điều gì trong ngày hôm nay bạn muốn nhớ mãi?',
    category: 'reflection',
    description: 'Lưu giữ kỷ niệm đáng nhớ',
  },

  // Biết ơn (Gratitude)
  {
    id: 'gra_01',
    question: 'Hôm nay bạn biết ơn điều gì nhất?',
    category: 'gratitude',
    description: 'Thực hành lòng biết ơn',
  },
  {
    id: 'gra_02',
    question: 'Ai là người đã khiến ngày của bạn tốt đẹp hơn?',
    category: 'gratitude',
    description: 'Ghi nhận những người xung quanh',
  },
  {
    id: 'gra_03',
    question: 'Ba điều nhỏ nhặt khiến bạn mỉm cười hôm nay là gì?',
    category: 'gratitude',
    description: 'Tìm niềm vui trong những điều nhỏ bé',
  },

  // Phát triển bản thân (Growth)
  {
    id: 'grow_01',
    question: 'Bạn học được gì về bản thân hôm nay?',
    category: 'growth',
    description: 'Tự nhận thức và phát triển',
  },
  {
    id: 'grow_02',
    question: 'Kỹ năng hoặc kiến thức nào bạn đã cải thiện hôm nay?',
    category: 'growth',
    description: 'Theo dõi sự tiến bộ',
  },
  {
    id: 'grow_03',
    question: 'Nếu được làm lại, bạn sẽ làm gì khác đi?',
    category: 'growth',
    description: 'Học hỏi từ kinh nghiệm',
  },
  {
    id: 'grow_04',
    question: 'Thành tựu nhỏ nào trong ngày khiến bạn tự hào?',
    category: 'growth',
    description: 'Ghi nhận những tiến bộ',
  },
  {
    id: 'grow_05',
    question: 'Bạn đã vượt qua điều gì khó khăn hôm nay?',
    category: 'growth',
    description: 'Nhận ra sức mạnh của bản thân',
  },

  // Cảm xúc (Emotion)
  {
    id: 'emo_01',
    question: 'Cảm xúc chủ đạo của bạn hôm nay là gì? Tại sao?',
    category: 'emotion',
    description: 'Nhận diện và hiểu cảm xúc',
  },
  {
    id: 'emo_02',
    question: 'Điều gì khiến bạn cảm thấy hạnh phúc hoặc buồn nhất hôm nay?',
    category: 'emotion',
    description: 'Khám phá nguồn gốc cảm xúc',
  },
  {
    id: 'emo_03',
    question: 'Bạn đã xử lý cảm xúc tiêu cực như thế nào hôm nay?',
    category: 'emotion',
    description: 'Rèn luyện kỹ năng quản lý cảm xúc',
  },
  {
    id: 'emo_04',
    question: 'Cảm xúc nào xuất hiện bất ngờ với bạn hôm nay?',
    category: 'emotion',
    description: 'Tăng cường tự nhận thức',
  },

  // Thử thách (Challenge)
  {
    id: 'cha_01',
    question: 'Điều gì làm bạn chưa hài lòng trong ngày hôm nay?',
    category: 'challenge',
    description: 'Nhận diện vấn đề cần giải quyết',
  },
  {
    id: 'cha_02',
    question: 'Khó khăn lớn nhất bạn gặp phải hôm nay là gì?',
    category: 'challenge',
    description: 'Đối mặt với thử thách',
  },
  {
    id: 'cha_03',
    question: 'Bạn cần hỗ trợ gì để ngày mai tốt hơn?',
    category: 'challenge',
    description: 'Xác định nhu cầu hỗ trợ',
  },
  {
    id: 'cha_04',
    question: 'Điều gì khiến bạn cảm thấy lo lắng hoặc căng thẳng?',
    category: 'challenge',
    description: 'Nhận diện nguồn gốc stress',
  },
  {
    id: 'cha_05',
    question: 'Bạn muốn cải thiện điều gì trong ngày mai?',
    category: 'challenge',
    description: 'Lập kế hoạch cải thiện',
  },
];

/**
 * Lấy câu hỏi gợi mở ngẫu nhiên
 */
export function getRandomPrompt(): GuidedPrompt {
  const randomIndex = Math.floor(Math.random() * GUIDED_PROMPTS.length);
  return GUIDED_PROMPTS[randomIndex];
}

/**
 * Lấy câu hỏi gợi mở theo ngày (deterministic)
 * Đảm bảo mỗi ngày có 1 câu hỏi cố định
 */
export function getPromptOfTheDay(date: Date = new Date()): GuidedPrompt {
  // Tạo seed từ ngày để có câu hỏi cố định mỗi ngày
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const index = seed % GUIDED_PROMPTS.length;
  return GUIDED_PROMPTS[index];
}

/**
 * Lấy câu hỏi theo category
 */
export function getPromptsByCategory(category: GuidedPrompt['category']): GuidedPrompt[] {
  return GUIDED_PROMPTS.filter(prompt => prompt.category === category);
}

/**
 * Lấy câu hỏi theo ID
 */
export function getPromptById(id: string): GuidedPrompt | undefined {
  return GUIDED_PROMPTS.find(prompt => prompt.id === id);
}
