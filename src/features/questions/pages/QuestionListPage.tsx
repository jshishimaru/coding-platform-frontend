import { useState } from "react";
import { Island } from "@/components/ui/Island";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Search,
  ChevronDown,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

/* ─── Types ─── */
interface Question {
  id: string;
  title: string;
  rating: number;
  tags: string[];
  solved: boolean;
  popularity: number;
}

interface TopicGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  tags: { name: string; solved: number; total: number }[];
}

/* ─── Sample Data ─── */
const questions: Question[] = [
  { id: "1", title: "Two Sum", rating: 800, tags: ["Array", "Hash Map"], solved: true, popularity: 98 },
  { id: "2", title: "Longest Substring Without Repeating Characters", rating: 1400, tags: ["String", "Sliding Window"], solved: false, popularity: 87 },
  { id: "3", title: "Median of Two Sorted Arrays", rating: 2100, tags: ["Binary Search", "Array"], solved: false, popularity: 72 },
  { id: "4", title: "Valid Parentheses", rating: 900, tags: ["Stack", "String"], solved: true, popularity: 95 },
  { id: "5", title: "Merge K Sorted Lists", rating: 1900, tags: ["Linked List", "Heap"], solved: false, popularity: 68 },
  { id: "6", title: "Container With Most Water", rating: 1300, tags: ["Array", "Two Pointers"], solved: true, popularity: 82 },
  { id: "7", title: "Trapping Rain Water", rating: 1800, tags: ["Array", "Stack"], solved: false, popularity: 76 },
  { id: "8", title: "Reverse Linked List", rating: 800, tags: ["Linked List"], solved: true, popularity: 99 },
];

const topicGroups: TopicGroup[] = [
  {
    id: "continue",
    title: "Continue Learning",
    icon: <Target size={18} />,
    tags: [
      { name: "Array", solved: 12, total: 24 },
      { name: "String", solved: 8, total: 18 },
      { name: "Stack", solved: 5, total: 12 },
      { name: "Two Pointers", solved: 3, total: 8 },
    ],
  },
  {
    id: "popular",
    title: "Popular Topics",
    icon: <TrendingUp size={18} />,
    tags: [
      { name: "Hash Map", solved: 6, total: 15 },
      { name: "Binary Search", solved: 4, total: 14 },
      { name: "Sliding Window", solved: 5, total: 10 },
      { name: "DP", solved: 2, total: 22 },
    ],
  },
  {
    id: "recommended",
    title: "Recommended For You",
    icon: <Sparkles size={18} />,
    tags: [
      { name: "Linked List", solved: 8, total: 16 },
      { name: "Tree", solved: 3, total: 19 },
      { name: "Graph", solved: 1, total: 18 },
      { name: "Heap", solved: 2, total: 9 },
    ],
  },
];

const userProgress = {
  solved: 42,
  total: 387,
  currentTier: "Specialist",
  weakestTopic: "Dynamic Programming",
};

/* ─── Difficulty Rating Helpers ─── */
function getRatingColor(rating: number): string {
  if (rating < 1100) return "text-success";
  if (rating < 1500) return "text-warning";
  if (rating < 2000) return "rgb(255, 140, 60)";
  return "text-error";
}

function RatingBadge({ rating }: { rating: number }) {
  const color = getRatingColor(rating);
  return (
    <span 
      className="text-xs font-semibold tabular-nums"
      style={{ color: color.startsWith("rgb") ? color : undefined }}
    >
      {rating}
    </span>
  );
}

/* ─── Topic Group Panel ─── */
function TopicGroupPanel({ group }: { group: TopicGroup }) {
  return (
    <Island className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
          {group.icon}
        </div>
        <h3 className="text-sm font-semibold text-text">{group.title}</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {group.tags.map((tag) => {
          const percentage = Math.round((tag.solved / tag.total) * 100);
          return (
            <div
              key={tag.name}
              className="group relative cursor-pointer rounded-lg border border-border bg-bg px-3 py-1.5 transition-colors hover:border-accent"
            >
              <div className="text-xs font-medium text-text">{tag.name}</div>
              <div className="mt-0.5 text-[10px] text-text-muted">
                {tag.solved}/{tag.total} · {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </Island>
  );
}

/* ─── Tag Pill ─── */
function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-block rounded bg-bg px-2 py-0.5 text-xs text-text-muted">
      {label}
    </span>
  );
}

/* ─── Page Component ─── */
export function QuestionListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const progressPercentage = Math.round((userProgress.solved / userProgress.total) * 100);

  return (
    <div className="space-y-6">
      {/* Row 1 — Control Islands */}
      <div className="grid grid-cols-12 gap-6">
        {/* Search Panel */}
        <div className="col-span-5">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Search
            </h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search questions or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </Island>
        </div>

        {/* Difficulty Filter Panel */}
        <div className="col-span-4">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Difficulty
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {["all", "800-1000", "1100-1400", "1500-1900", "2000+"].map((range) => (
                <button
                  key={range}
                  onClick={() => setRatingFilter(range)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    ratingFilter === range
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border bg-bg text-text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  {range === "all" ? "All" : range}
                </button>
              ))}
            </div>
          </Island>
        </div>

        {/* Progress Summary Panel */}
        <div className="col-span-3">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Progress
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold tabular-nums text-text">{userProgress.solved}</span>
                  <span className="text-xs text-text-muted">/ {userProgress.total}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg">
                  <div 
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-text-muted">Tier: <span className="font-semibold text-accent">{userProgress.currentTier}</span></span>
              </div>
            </div>
          </Island>
        </div>
      </div>

      {/* Row 2 — Smart Topic Panels */}
      <div className="grid grid-cols-3 gap-6">
        {topicGroups.map((group) => (
          <TopicGroupPanel key={group.id} group={group} />
        ))}
      </div>

      {/* Row 3 — Main Question Workspace */}
      <Island>
        {/* Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">All Questions</h3>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-bg py-1.5 pl-3 pr-9 text-xs text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="rating">Sort by Rating</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="completion">Sort by Status</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Questions Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-20">Rating</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-16 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id} className="cursor-pointer">
                <TableCell className="font-mono text-xs text-text-muted">{q.id}</TableCell>
                <TableCell className="font-medium text-sm">{q.title}</TableCell>
                <TableCell>
                  <RatingBadge rating={q.rating} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {q.tags.slice(0, 2).map((tag) => (
                      <TagPill key={tag} label={tag} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {q.solved && (
                    <span className="text-sm font-medium text-success">✓</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Island>
    </div>
  );
}
