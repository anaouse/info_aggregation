import Source, { type SourceData } from "@/source";

const mockSources: SourceData[] = [
  {
    source_name: "Hacker News",
    url: "https://news.ycombinator.com",
  },
  {
    source_name: "GitHub Trending",
    url: "https://github.com/trending",
  },
  {
    source_name: "React Blog",
    url: "https://react.dev/blog",
  },
  {
    source_name: "Vite",
    url: "https://vitejs.dev",
  },
  {
    source_name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
  },
];

export default function App() {
  return (
    <div className="app">
      <h1>信息源聚合</h1>
      <div className="source-list">
        {mockSources.map((source) => (
          <Source key={source.url} data={source} />
        ))}
      </div>
    </div>
  );
}
