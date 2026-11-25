const PRIVATE = ['/admin', '/admin/', '/api/', '/checkout', '/order-success/'];

// AI search / answer engines are explicitly welcome (GEO/AEO): they can only quote what they can crawl.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ['/', '/llms.txt'], disallow: PRIVATE },
    ],
    sitemap: 'https://www.kitepk.com/sitemap.xml',
    host: 'https://www.kitepk.com',
  };
}
