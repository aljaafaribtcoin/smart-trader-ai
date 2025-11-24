import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateSignalRequest {
  symbols?: string[];
  timeframes?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: GenerateSignalRequest = await req.json().catch(() => ({}));
    const symbols = body.symbols || ['BTCUSDT', 'ETHUSDT'];
    const timeframes = body.timeframes || ['1d', '4h'];

    console.log('[generate-signals] Starting signal generation for:', symbols, timeframes);

    const generatedSignals = [];

    for (const symbol of symbols) {
      for (const timeframe of timeframes) {
        console.log(`[generate-signals] Analyzing ${symbol} ${timeframe}...`);

        // 1. Fetch technical indicators
        const { data: indicators } = await supabaseClient
          .from('technical_indicators')
          .select('*')
          .eq('symbol', symbol)
          .eq('timeframe', timeframe)
          .order('calculated_at', { ascending: false })
          .limit(1)
          .single();

        // 2. Fetch detected patterns
        const { data: patterns } = await supabaseClient
          .from('patterns')
          .select('*')
          .eq('symbol', symbol)
          .eq('timeframe', timeframe)
          .eq('status', 'active')
          .order('detected_at', { ascending: false })
          .limit(5);

        // 3. Fetch recent candles for context
        const { data: candles } = await supabaseClient
          .from('market_candles')
          .select('*')
          .eq('symbol', symbol)
          .eq('timeframe', timeframe)
          .order('timestamp', { ascending: false })
          .limit(50);

        // 4. Fetch current price
        const { data: priceData } = await supabaseClient
          .from('market_prices')
          .select('price, change_24h')
          .eq('symbol', symbol)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        if (!indicators || !candles || candles.length < 20) {
          console.log(`[generate-signals] Insufficient data for ${symbol} ${timeframe}`);
          continue;
        }

        const currentPrice = priceData?.price || candles[0].close;

        // 5. Prepare context for AI
        const analysisContext = {
          symbol,
          timeframe,
          currentPrice,
          priceChange24h: priceData?.change_24h || 0,
          indicators: {
            rsi: indicators.rsi,
            macd: {
              value: indicators.macd_value,
              signal: indicators.macd_signal,
              histogram: indicators.macd_histogram,
            },
            ema: {
              ema20: indicators.ema_20,
              ema50: indicators.ema_50,
              ema200: indicators.ema_200,
            },
            bollinger: {
              upper: indicators.bb_upper,
              middle: indicators.bb_middle,
              lower: indicators.bb_lower,
            },
            stochastic: {
              k: indicators.stochastic_k,
              d: indicators.stochastic_d,
            },
            atr: indicators.atr,
          },
          patterns: patterns?.map(p => ({
            name: p.pattern_name,
            type: p.pattern_type,
            confidence: p.confidence,
            target: p.target_price,
            stopLoss: p.stop_loss,
          })) || [],
          recentCandles: candles.slice(0, 10).map(c => ({
            timestamp: c.timestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
          })),
        };

        // 6. Call Lovable AI for analysis
        const aiPrompt = `أنت محلل تداول خبير. قم بتحليل البيانات التالية وإنشاء توصية تداول دقيقة:

السوق: ${symbol}
الإطار الزمني: ${timeframe}
السعر الحالي: ${currentPrice}
التغير 24 ساعة: ${analysisContext.priceChange24h?.toFixed(2)}%

المؤشرات الفنية:
- RSI: ${indicators.rsi?.toFixed(2)} ${indicators.rsi > 70 ? '(تشبع شرائي)' : indicators.rsi < 30 ? '(تشبع بيعي)' : '(محايد)'}
- MACD: ${indicators.macd_value?.toFixed(4)} (Signal: ${indicators.macd_signal?.toFixed(4)}, Histogram: ${indicators.macd_histogram?.toFixed(4)})
- EMA20: ${indicators.ema_20?.toFixed(2)}, EMA50: ${indicators.ema_50?.toFixed(2)}, EMA200: ${indicators.ema_200?.toFixed(2)}
- Bollinger Bands: Upper ${indicators.bb_upper?.toFixed(2)}, Middle ${indicators.bb_middle?.toFixed(2)}, Lower ${indicators.bb_lower?.toFixed(2)}
- Stochastic: K=${indicators.stochastic_k?.toFixed(2)}, D=${indicators.stochastic_d?.toFixed(2)}
- ATR: ${indicators.atr?.toFixed(4)}

الأنماط المكتشفة:
${patterns && patterns.length > 0 ? patterns.map(p => `- ${p.pattern_name} (${p.pattern_type}, ثقة: ${p.confidence}%)`).join('\n') : 'لا توجد أنماط نشطة'}

آخر 5 شموع:
${candles.slice(0, 5).map((c, i) => `${i + 1}. Open: ${c.open}, High: ${c.high}, Low: ${c.low}, Close: ${c.close}, Volume: ${c.volume}`).join('\n')}

قم بتحليل هذه البيانات وحدد:
1. الاتجاه (LONG أو SHORT)
2. نقطة الدخول (من - إلى) بناءً على الدعم/المقاومة الحالي
3. ثلاثة أهداف للربح (TP1, TP2, TP3) واقعية ومدروسة
4. وقف الخسارة دقيق بناءً على ATR
5. درجة الثقة (0-100)
6. نسبة المخاطرة للعائد
7. السيناريو الرئيسي (تفصيلي، 2-3 جمل)
8. السيناريو البديل (إذا فشل السيناريو الرئيسي)
9. العوامل الداعمة (3-5 نقاط)
10. الكلمات المفتاحية (tags)

تأكد من أن التوصية:
- مبنية على تحليل تقني صلب
- نقاط الدخول والخروج واقعية ومدروسة
- نسبة المخاطرة للعائد جيدة (1:2 على الأقل)
- السيناريوهات واضحة وقابلة للتنفيذ`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'أنت محلل تداول محترف متخصص في التحليل الفني وقراءة المؤشرات والأنماط. تقدم توصيات دقيقة ومدروسة مع تحليل شامل.',
              },
              {
                role: 'user',
                content: aiPrompt,
              },
            ],
            tools: [
              {
                type: 'function',
                function: {
                  name: 'create_trading_signal',
                  description: 'Create a structured trading signal with entry, exit points and analysis',
                  parameters: {
                    type: 'object',
                    properties: {
                      direction: {
                        type: 'string',
                        enum: ['LONG', 'SHORT'],
                        description: 'Trading direction',
                      },
                      entry_from: {
                        type: 'number',
                        description: 'Entry zone lower bound',
                      },
                      entry_to: {
                        type: 'number',
                        description: 'Entry zone upper bound',
                      },
                      stop_loss: {
                        type: 'number',
                        description: 'Stop loss price',
                      },
                      tp1: {
                        type: 'number',
                        description: 'First take profit target',
                      },
                      tp2: {
                        type: 'number',
                        description: 'Second take profit target',
                      },
                      tp3: {
                        type: 'number',
                        description: 'Third take profit target',
                      },
                      confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 100,
                        description: 'Confidence level (0-100)',
                      },
                      risk_reward: {
                        type: 'number',
                        description: 'Risk to reward ratio',
                      },
                      main_scenario: {
                        type: 'string',
                        description: 'Main trading scenario explanation',
                      },
                      alternative_scenario: {
                        type: 'string',
                        description: 'Alternative scenario if main fails',
                      },
                      supporting_factors: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of supporting factors for the signal',
                      },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Relevant tags for the signal',
                      },
                    },
                    required: [
                      'direction',
                      'entry_from',
                      'entry_to',
                      'stop_loss',
                      'tp1',
                      'tp2',
                      'tp3',
                      'confidence',
                      'risk_reward',
                      'main_scenario',
                      'supporting_factors',
                      'tags',
                    ],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: 'function', function: { name: 'create_trading_signal' } },
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('[generate-signals] AI API error:', aiResponse.status, errorText);
          
          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: 'Payment required. Please add credits to your Lovable workspace.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

        if (toolCall?.function?.arguments) {
          const signalData = JSON.parse(toolCall.function.arguments);

          const signal = {
            symbol,
            direction: signalData.direction,
            entry_from: signalData.entry_from,
            entry_to: signalData.entry_to,
            stop_loss: signalData.stop_loss,
            tp1: signalData.tp1,
            tp2: signalData.tp2,
            tp3: signalData.tp3,
            confidence: signalData.confidence,
            risk_reward: signalData.risk_reward,
            status: 'active',
            main_scenario: signalData.main_scenario,
            alternative_scenario: signalData.alternative_scenario || null,
            supporting_factors: signalData.supporting_factors,
            tags: signalData.tags,
          };

          generatedSignals.push(signal);
          console.log(`[generate-signals] Generated signal for ${symbol} ${timeframe}:`, signal.direction);
        }
      }
    }

    // Save signals to database
    if (generatedSignals.length > 0) {
      const { data: insertedSignals, error: insertError } = await supabaseClient
        .from('trading_signals')
        .insert(generatedSignals)
        .select();

      if (insertError) {
        console.error('[generate-signals] Error saving signals:', insertError);
      } else {
        console.log(`[generate-signals] Saved ${generatedSignals.length} signals`);

        // Create notifications for high-confidence signals
        const highConfidenceSignals = insertedSignals.filter(s => s.confidence >= 75);
        
        if (highConfidenceSignals.length > 0) {
          const notifications = highConfidenceSignals.map(signal => ({
            user_id: signal.user_id || 'system',
            title: `🎯 توصية جديدة: ${signal.symbol}`,
            message: `توصية ${signal.direction} على ${signal.symbol} بثقة ${signal.confidence}%`,
            type: 'trade',
            metadata: {
              signal_id: signal.id,
              symbol: signal.symbol,
              direction: signal.direction,
              confidence: signal.confidence,
            },
            action_url: '/signals',
          }));

          await supabaseClient.from('notifications').insert(notifications);
        }
      }
    }

    // Update sync status
    await supabaseClient
      .from('data_sync_status')
      .upsert({
        data_type: 'trading_signals',
        symbol: symbols.join(','),
        timeframe: timeframes.join(','),
        source: 'generate-signals',
        status: 'success',
        last_sync_at: new Date().toISOString(),
        metadata: { signals_generated: generatedSignals.length },
      });

    return new Response(
      JSON.stringify({
        success: true,
        signalsGenerated: generatedSignals.length,
        signals: generatedSignals,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-signals] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
