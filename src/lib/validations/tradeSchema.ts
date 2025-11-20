import { z } from 'zod';

export const tradeSchema = z.object({
  symbol: z.string().min(1, 'يجب اختيار العملة'),
  type: z.enum(['long', 'short'], {
    required_error: 'يجب اختيار نوع الصفقة',
  }),
  entryPrice: z.number({
    required_error: 'سعر الدخول مطلوب',
    invalid_type_error: 'سعر الدخول يجب أن يكون رقم',
  }).positive('سعر الدخول يجب أن يكون موجب'),
  stopLoss: z.number({
    required_error: 'وقف الخسارة مطلوب',
    invalid_type_error: 'وقف الخسارة يجب أن يكون رقم',
  }).positive('وقف الخسارة يجب أن يكون موجب'),
  takeProfits: z.array(
    z.object({
      price: z.number().positive('سعر الهدف يجب أن يكون موجب'),
      percentage: z.number().min(1).max(100, 'النسبة يجب أن تكون بين 1-100'),
    })
  ).min(1, 'يجب إضافة هدف واحد على الأقل'),
  positionSize: z.number({
    required_error: 'حجم الصفقة مطلوب',
    invalid_type_error: 'حجم الصفقة يجب أن يكون رقم',
  }).positive('حجم الصفقة يجب أن يكون موجب'),
  leverage: z.number().min(1).max(125, 'الرافعة المالية يجب أن تكون بين 1-125').default(10),
  notes: z.string().max(500, 'الملاحظات يجب أن تكون أقل من 500 حرف').optional(),
}).refine(
  (data) => {
    if (data.type === 'long') {
      return data.stopLoss < data.entryPrice;
    } else {
      return data.stopLoss > data.entryPrice;
    }
  },
  {
    message: 'وقف الخسارة يجب أن يكون في الاتجاه الصحيح',
    path: ['stopLoss'],
  }
).refine(
  (data) => {
    const allTargetsValid = data.takeProfits.every(tp => {
      if (data.type === 'long') {
        return tp.price > data.entryPrice;
      } else {
        return tp.price < data.entryPrice;
      }
    });
    return allTargetsValid;
  },
  {
    message: 'جميع الأهداف يجب أن تكون في الاتجاه الصحيح',
    path: ['takeProfits'],
  }
);

export type TradeFormData = z.infer<typeof tradeSchema>;
