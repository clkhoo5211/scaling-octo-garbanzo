// Test MCP category response parsing
const testResponse = `# News from Category: tech

Sources checked: 5

## Yahoo Tech

1. **Elon Musk's pay package is a clear signal that Tesla is done being just a car company**
   - Link: [https://finance.yahoo.com/news/elon-musks-pay-package-is-a-clear-signal-that-tesla-is-done-being-just-a-car-company-110058483.html](https://finance.yahoo.com/news/elon-musks-pay-package-is-a-clear-signal-that-tesla-is-done-being-just-a-car-company-110058483.html)
   - Published: 2025-11-08T11:00:58Z

2. **Spy chiefs launch AI company to protect corporate secrets**
   - Link: [https://finance.yahoo.com/news/spy-chiefs-launch-ai-company-070000760.html](https://finance.yahoo.com/news/spy-chiefs-launch-ai-company-070000760.html)
   - Published: 2025-11-08T07:00:00Z

## TechCrunch

1. **Top 10 AI Tools That Will Transform Your Content Creation in 2025**
   - Link: [https://techncruncher.blogspot.com/2025/01/top-10-ai-tools-that-will-transform.html](https://techncruncher.blogspot.com/2025/01/top-10-ai-tools-that-will-transform.html)
   - Published: Thu, 02 Jan 2025 09:26:00 +0000
   - Summary: <div style="text-align: left;">...

2. **LimeWire AI Studio Review 2023: Details, Pricing &amp; Features**
   - Link: [https://techncruncher.blogspot.com/2023/12/limewire-ai-studio-review-2023-details.html](https://techncruncher.blogspot.com/2023/12/limewire-ai-studio-review-2023-details.html)
   - Published: Tue, 12 Dec 2023 16:10:00 +0000`;

// Test parsing
const sourceRegex = /## ([^\n]+)\n+([\s\S]*?)(?=\n## |$)/g;
const sources = [];
let match;

while ((match = sourceRegex.exec(testResponse)) !== null) {
  const sourceName = match[1].trim();
  const sourceContent = match[2];
  
  if (sourceName.includes('❌') || sourceName.includes('Failed')) {
    continue;
  }
  
  const articleRegex = /(\d+)\. \*\*([^\n]+)\*\*\n+([\s\S]*?)(?=\n\d+\. \*\*|\n## |$)/g;
  const articles = [];
  let artMatch;
  
  while ((artMatch = articleRegex.exec(sourceContent)) !== null) {
    const articleText = artMatch[0];
    const title = artMatch[2].trim();
    
    const linkMatch = articleText.match(/- Link: \[([^\]]+)\]\(([^)]+)\)/);
    const pubDateMatch = articleText.match(/- Published: (.+)/);
    const summaryMatch = articleText.match(/- Summary: ([\s\S]*?)(?=\n-|\n*$)/);
    
    const link = linkMatch?.[2]?.trim() || linkMatch?.[1]?.trim();
    const pubDate = pubDateMatch?.[1]?.trim();
    const summary = summaryMatch?.[1]?.trim();
    
    if (title && link) {
      articles.push({
        title: title.substring(0, 60),
        link: link.substring(0, 60),
        published: pubDate,
        summary: summary ? summary.substring(0, 50) : null,
      });
    }
  }
  
  sources.push({ name: sourceName, articles });
}

console.log('✅ Parsing Test Results:');
console.log(`Found ${sources.length} sources`);
sources.forEach(s => {
  console.log(`\n${s.name}: ${s.articles.length} articles`);
  s.articles.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.title}`);
    console.log(`     Link: ${a.link}`);
    console.log(`     Published: ${a.published}`);
  });
});

