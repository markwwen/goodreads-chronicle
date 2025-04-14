import React, { useState, useEffect } from "react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { BookOpen } from "lucide-react";
import Papa from "papaparse";



interface BookItem {
  isbn: string;
  authors: string;
  original_publication_year: number;
  title: string;
  title_zh: string;
  image_url: string;
  highlight: boolean;
  country: string;
}

export default function WenhaoChronicle() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // 实际用于过滤的值
  // const [authorFilter, setAuthorFilter] = useState("全部");
  const [yearFilter, setYearFilter] = useState("全部");
  const [data, setData] = useState<BookItem[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // 增加排序方式状态


  useEffect(() => {
    const loadData = async () => {
      const response = await fetch("./data/books_zh.csv");
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData: BookItem[] = result.data.filter((row) => row.original_publication_year !== "").map((row: any) => ({
            isbn: row.isbn,
            authors: row.authors,
            original_publication_year: parseFloat(row.original_publication_year.split(".")[0]),
            title: row.title,
            title_zh: row.title_zh,
            image_url: row.image_url,
            rating: row.average_rating,
            highlight: parseFloat(row.average_rating) >= 4.5,
            country: "未知", // 可拓展自动识别
          }));
          setData(parsedData);
        },
      });
    };
    loadData();
  }, []);

  // const authors = Array.from(new Set(data.map((d) => d.authors)));
 // 提取所有年份并去重，然后根据排序方式排序
 const years = Array.from(new Set(data.map((item) => item.original_publication_year)))
 .filter(Boolean) // 过滤掉无效值（如 null 或 undefined）
 .sort((a, b) => (sortOrder === "asc" ? a - b : b - a)); // 根据排序方式排序



  // 过滤逻辑
  const filtered = data.filter(
    (item) =>
      (yearFilter === "全部" || item.original_publication_year === parseInt(yearFilter)) &&
      (searchQuery === "" ||
        item.authors.includes(searchQuery) ||
        item.title.includes(searchQuery) ||
        item.title_zh.includes(searchQuery) ||
        item.original_publication_year.toString().includes(searchQuery))
  );


  const sorted = [...filtered].sort(
    (a, b) => (sortOrder === "asc" ? a.original_publication_year - b.original_publication_year : b.original_publication_year - a.original_publication_year) // 根据 sortOrder 动态排序
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(query); // 按下回车时更新实际的搜索值
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-200 via-white to-purple-200 rounded-3xl p-8 mb-8 shadow-xl border border-indigo-300 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold mb-3 tracking-tight text-indigo-900 drop-shadow-lg">
          好书编年史
        </h1>
        <p className="text-base max-w-xl">
          本清单取自截止 2017 年 goodreads 上的评分人数 top 10000 的记录，让我们跟随时间的年轮，走进一部部不朽的文学杰作。
        </p>
      </div>
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {/* 切换排序按钮 */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} // 切换排序方式
          className="border rounded p-2 bg-indigo-500 text-white"
        >
          切换年份排序：{sortOrder === "asc" ? "升序" : "降序"}
        </button>
        {/* 年份筛选器 */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="全部">全部年份</option>
          {years.map((year, idx) => (
            <option key={idx} value={year}>
              {year}
            </option>
          ))}
        </select>
        {/* 搜索框 */}
        <input
          type="text"
          className="border p-2 flex-1 min-w-[200px] rounded"
          placeholder="搜索作者、书名或时间（如 1936）"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // 更新输入框的值
          onKeyDown={handleKeyDown} // 按下回车时触发搜索
        />
      </div>

      <VerticalTimeline>
        {sorted.map((item, idx) => (
          <VerticalTimelineElement
            key={idx}
            date={item.original_publication_year}
            icon={<BookOpen />}
            iconStyle={{ background: "#4f46e5", color: "#fff" }}
            contentStyle={{ background: "#f9fafb", color: "#111" }}
            contentArrowStyle={{ borderRight: "7px solid #f9fafb" }}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              {item.title || "无标题"}
            </h3>
            <p className="text-sm text-muted-foreground">译名：《{item.title_zh}》</p>
            <p className="text-sm text-muted-foreground">作者：{item.authors}</p>
            <p className="text-sm text-muted-foreground">评分：{item.rating}</p>
            <p className="text-sm text-gray-500 mt-1">ISBN: {item.isbn.padStart(10, "0")} </p>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="mt-3 rounded-lg shadow-md w-32 h-auto"
              />
            )}
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
}