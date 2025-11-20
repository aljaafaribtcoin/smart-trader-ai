import { z } from 'zod';

export const watchlistSchema = z.object({
  symbol: z.string().min(1, 'يجب اختيار العملة'),
  timeframe: z.string().min(1, 'يجب اختيار الإطار الزمني'),
  priceAlert: z.number().positive('سعر التنبيه يجب أن يكون موجب').optional(),
  alertType: z.enum(['above', 'below']).optional(),
  notes: z.string().max(200, 'الملاحظات يجب أن تكون أقل من 200 حرف').optional(),
});

export type WatchlistFormData = z.infer<typeof watchlistSchema>;
