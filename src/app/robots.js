export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/checkout', '/order-success/'],
      },
    ],
    sitemap: 'https://www.kitepk.com/sitemap.xml',
  };
}
