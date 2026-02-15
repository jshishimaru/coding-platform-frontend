import { Island } from "@/components/ui/Island";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

/* ─── Mock Data ─── */
interface Problem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

const problems: Problem[] = [
  { id: "142", title: "Linked List Cycle II", difficulty: "medium", tags: ["Linked List", "Two Pointers"] },
  { id: "76", title: "Minimum Window Substring", difficulty: "hard", tags: ["String", "Sliding Window"] },
  { id: "206", title: "Reverse Linked List", difficulty: "easy", tags: ["Linked List", "Recursion"] },
];

const diffColor: Record<Problem["difficulty"], string> = {
  easy: "text-success",
  medium: "text-warning",
  hard: "text-error",
};

export function RecommendedProblemsPanel() {
  return (
    <Island className="h-full">
      <h3 className="mb-2 text-sm font-semibold text-text">
        Recommended Problems
      </h3>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24">Difficulty</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-text-muted">{p.id}</TableCell>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>
                <span className={`text-xs font-medium capitalize ${diffColor[p.difficulty]}`}>
                  {p.difficulty}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-block rounded bg-bg px-2 py-0.5 text-xs text-text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Island>
  );
}
