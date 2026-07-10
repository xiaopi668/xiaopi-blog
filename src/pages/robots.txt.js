export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://xiaopi.blog/sitemap-index.xml
`,
    {
      headers: { 'Content-Type': 'text/plain' },
    }
  );
}
