
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCustomerMatches = async (batchName: string, customers: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích độ phù hợp của khách hàng với mẻ bánh "${batchName}". 
      Trả về JSON array gồm: customerId, matchScore (0-100), reason (ngắn gọn, vui vẻ).
      Dữ liệu khách: ${JSON.stringify(customers)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              customerId: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["customerId", "matchScore", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const generateSMSInvite = async (customerName: string, productName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Viết 1 tin nhắn SMS ngắn gọn, thân thiện mời chị ${customerName} mua bánh ${productName} vừa ra lò tại Bếp Mian. Có sử dụng emoji. Không quá 160 ký tự.`,
    });
    return response.text?.trim() || `Chào chị ${customerName}, Bếp Mian có ${productName} nóng hổi vừa ra lò. Mời chị ghé tiệm ạ!`;
  } catch (error) {
    return `Bếp Mian chào chị ${customerName}, mẻ bánh ${productName} thơm ngon đã sẵn sàng phục vụ chị!`;
  }
};

export const generateSmartGreeting = async (context: {
  customerName: string,
  activeOrder?: any,
  lastOrder?: any,
  recentReview?: any,
  priorityProduct?: any,
  isInactive: boolean
}) => {
  try {
    const prompt = `Bạn là trợ lý AI của Bếp bánh Mian. Hãy soạn 1 lời chào ngắn gọn (dưới 60 chữ) cho khách hàng ${context.customerName} dựa trên ngữ cảnh:
    ${context.activeOrder ? `- Chị đang có đơn ${context.activeOrder.productName} ở trạng thái ${context.activeOrder.status}.` : ''}
    ${context.lastOrder && !context.activeOrder ? `- Đơn gần nhất chị mua là ${context.lastOrder.productName}.` : ''}
    ${context.recentReview ? `- Chị vừa có đánh giá: "${context.recentReview.comment}" với ${context.recentReview.rating} sao.` : ''}
    ${context.isInactive && context.priorityProduct ? `- Khách đã lâu không mua, hãy giới thiệu món đang gom đơn: ${context.priorityProduct.name}.` : ''}
    
    Quy tắc:
    1. Nếu có đánh giá xấu, hãy xin lỗi chân thành. Nếu tốt, hãy cảm ơn.
    2. Nếu có đơn đang làm, hãy cập nhật trạng thái.
    3. Luôn kết thúc bằng việc bảo khách chờ một chút để chủ tiệm vào trò chuyện trực tiếp.
    4. Giọng văn ngọt ngào, thân thiện, sử dụng emoji.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim();
  } catch (error) {
    return `Chào chị ${context.customerName}! Bếp Mian đã nhận được tin nhắn, chị chờ em một xíu để chủ tiệm vào tiếp chị ngay nhé! ❤️`;
  }
};
