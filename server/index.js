import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const client = new Anthropic();

const metricNumber = z.number().finite().nullable();

const GroupSummarySchema = z.object({
  name: z.string().max(200),
  verdict: z.enum(['working', 'average', 'not-working', 'insufficient']),
  index: metricNumber,
  campaigns: z.number().int().nonnegative(),
  spend: metricNumber,
  impressions: metricNumber,
  engagementRate: metricNumber,
  ctr: metricNumber,
  leadRate: metricNumber,
  leads: metricNumber,
  conversions: metricNumber,
  revenue: metricNumber,
  cpl: metricNumber,
  roas: metricNumber,
});

const AnalyzeRequestSchema = z.object({
  goal: z.string().max(50),
  baseline: GroupSummarySchema,
  tactics: z.array(GroupSummarySchema).max(100),
  platforms: z.array(GroupSummarySchema).max(100),
  combos: z.array(GroupSummarySchema).max(500),
  pillars: z.array(GroupSummarySchema).max(20).default([]),
  strategies: z
    .array(
      z.object({
        name: z.string().max(200),
        objective: z.string().max(50),
        status: z.string().max(50),
        kpi: z.string().max(50),
        target: z.union([z.number(), z.literal('')]),
        hypothesis: z.string().max(2000),
      })
    )
    .max(50),
});

const InsightItemSchema = z.object({
  name: z.string(),
  evidence: z.string(),
});

const MarketingInsightsSchema = z.object({
  summary: z.string(),
  working: z.array(InsightItemSchema),
  notWorking: z.array(InsightItemSchema),
  recommendations: z.array(
    z.object({
      action: z.string(),
      rationale: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  experiments: z.array(
    z.object({
      hypothesis: z.string(),
      howToTest: z.string(),
    })
  ),
});

const SYSTEM_PROMPT = `You are a performance-marketing analyst for a luxury real estate brokerage, reviewing its marketing results across social media platforms and other channels.

You receive aggregated results grouped by tactic, by platform, by platform+tactic combination, and by content pillar (Listings, Educational, Market authority, Hyperlocal, Client wins, Lifestyle; organic content only). Each group has:
- index: a performance index where 100 is the account's overall average and higher is better. It is a weighted blend of engagement rate, click-through rate, lead rate, cost per lead and ROAS, weighted by the business's stated optimization goal.
- verdict: "working" (index >= 115), "not-working" (index <= 85), "average", or "insufficient" (too few impressions to judge).
- raw totals and rates. Rates are fractions (0.05 = 5%). cpl and roas only count paid campaigns and are null for organic-only groups.

Your job is to tell the owner, in plain language, which tactics are working, which are not, and what to do next. Ground every claim in the numbers you were given and cite them (e.g. "CPL $25 vs $43 average"). Prefer platform+tactic combinations over broad categories when the combination explains a result better. Do not draw conclusions from groups marked "insufficient"; suggest getting more data instead. Consider the owner's written strategies and whether results support their hypotheses. Keep the summary to 2-3 sentences. Give at most 5 items per list, ordered by importance. Recommendations should be specific actions (shift budget, change creative, stop, scale), not generic advice.`;

app.post('/api/analyze-marketing', async (req, res) => {
  const parsedRequest = AnalyzeRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    return res.status(400).json({ error: 'Invalid analysis request.' });
  }
  const input = parsedRequest.data;
  if (!input.tactics.length) {
    return res.status(400).json({ error: 'Add some campaigns before running an analysis.' });
  }

  try {
    const response = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Optimization goal: ${input.goal}\n\nMarketing results (JSON):\n${JSON.stringify(
            {
              overall: input.baseline,
              byTactic: input.tactics,
              byPlatform: input.platforms,
              byPlatformAndTactic: input.combos,
              byContentPillar: input.pillars,
              strategies: input.strategies,
            },
            null,
            2
          )}`,
        },
      ],
      output_config: {
        effort: 'high',
        format: betaZodOutputFormat(MarketingInsightsSchema),
      },
    });

    if (response.stop_reason === 'refusal') {
      return res.status(502).json({ error: 'The analysis request was declined. Try again with different data.' });
    }
    if (!response.parsed_output) {
      return res.status(502).json({ error: 'Model response could not be parsed.' });
    }

    res.json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('Anthropic authentication error:', error.message);
      return res.status(500).json({ error: 'Server is missing a valid ANTHROPIC_API_KEY.' });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limited, please try again shortly.' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', error.status, error.message);
      return res.status(502).json({ error: 'The analysis service failed.' });
    }
    // Missing credentials surface here as a plain Error from the SDK.
    console.error('Unexpected error analyzing marketing data:', error);
    res.status(500).json({ error: 'Unexpected server error. Check that ANTHROPIC_API_KEY is set and see the server logs.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`GreenTree marketing analysis server listening on http://localhost:${PORT}`);
});
