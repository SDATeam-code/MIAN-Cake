
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCustomerMatches = async (batchProduct: any, orders: any[]) => {
  try {
    // Tiền xử lý dữ liệu đơn hàng để AI dễ phân tích
    const customerSummary = orders.reduce((acc: any, order: any) => {
      const phone = order.customerPhone || 'Không số';
      if (!acc[phone]) {
        acc[phone] = {
          name: order.customerName,
          phone: phone,
          totalOrders: 0,
          ordersOfThisCategory: 0,
          lastOrderDate: order.date,
        };
      }
      acc[phone].totalOrders += 1;
      const boughtThisCategory = order.items.some((item: any) => 
        item.productName.toLowerCase().includes(batchProduct.category.toLowerCase()) ||
        item.productName.toLowerCase().includes(batchProduct.name.toLowerCase())
      );
      if (boughtThisCategory) acc[phone].ordersOfThisCategory += 1;
      if (new Date(order.date) > new Date(acc[phone].lastOrderDate)) {
        acc[phone].lastOrderDate = order.date;
      }
      return acc;
    }, {});

    const customersArray = Object.values(customerSummary);

    const prompt = `Phân tích danh sách khách hàng để tìm người phù hợp nhất để mời mua mẻ bánh: "${batchProduct.name}" (Loại: ${batchProduct.category}).
    
    Dữ liệu khách hàng: ${JSON.stringify(customersArray)}
    Ngày hiện tại: ${new Date().toISOString().split('T')[0]}

    QUY TẮC ƯU TIÊN:
    1. ƯU TIÊN CAO NHẤT: Khách hàng thường xuyên mua loại bánh "${batchProduct.category}" (ordersOfThisCategory cao).
    2. ĐIỀU KIỆN KÈM THEO: Đã quá 7 ngày kể từ đơn hàng cuối cùng (lastOrderDate).
    3. Trả về JSON array gồm 3-5 khách hàng tiềm năng nhất.
    
    Định dạng trả về JSON: [{ "phone": "string", "matchScore": number, "reason": "string (vui vẻ, ngắn gọn)" }]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phone: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["phone", "matchScore", "reason"]
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

export const generateChatInsights = async (messages: any[]) => {
  try {
    const chatData = messages.map(m => ({ sender: m.senderName, text: m.text, time: m.time }));
    const prompt = `Bạn là chuyên gia phân tích dịch vụ khách hàng cho tiệm bánh "Bếp Mian". 
    Hãy phân tích danh sách tin nhắn chat sau đây và trả về một bản tóm tắt ngắn gọn.
    
    Dữ liệu chat: ${JSON.stringify(chatData)}
    
    Yêu cầu tóm tắt bằng tiếng Việt, giọng văn chuyên nghiệp nhưng gần gũi, bao gồm 2 phần:
    1. Tóm tắt ý chính (Các câu hỏi phổ biến, xu hướng khách hàng quan tâm).
    2. Vấn đề cần khắc phục/Phàn nàn (Highlight rõ các ý kiến tiêu cực, phàn nàn về giá, chất lượng, hay giao hàng chậm).
    
    Nếu không có phàn nàn, hãy ghi là "Chưa ghi nhận phàn nàn nào".
    Giới hạn kết quả trong khoảng 150 chữ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim();
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Không thể phân tích dữ liệu chat lúc này. Chị vui lòng thử lại sau nhé!";
  }
};
