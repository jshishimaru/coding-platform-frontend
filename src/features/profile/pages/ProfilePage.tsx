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
  User,
  MapPin,
  Link,
  Github,
  Twitter,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";

/* ─── Types ─── */
interface UserProfile {
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  tier: "Grandmaster" | "Master" | "Expert" | "Specialist" | "Pupil" | "Newbie";
  rating: number;
  maxRating: number;
  globalRank: number;
  ratingChange: number;
  joinedAt: Date;
  stats: {
    solved: number;
    totalQuestions: number;
    contests: number;
    accuracy: number;
    streak: number;
  };
}

/* ─── Sample Data ─── */
const profile: UserProfile = {
  username: "madhav_d",
  name: "Madhav Deorah",
  avatarUrl: null,
  bio: "Full-stack developer | Competitive Programmer",
  location: "San Francisco, CA",
  website: "https://madhav.dev",
  github: "madhavdeorah",
  twitter: "madhav_d",
  tier: "Expert",
  rating: 1847,
  maxRating: 1923,
  globalRank: 1402,
  ratingChange: 42,
  joinedAt: new Date("2024-01-15"),
  stats: {
    solved: 487,
    totalQuestions: 2450,
    contests: 34,
    accuracy: 62.5,
    streak: 12,
  },
};

const recentActivity = [
  { id: "1", type: "Contest", name: "ByteCode Weekly #128", result: "Rank 142", date: "2 days ago", change: "+15" },
  { id: "2", type: "Problem", name: "Merge K Sorted Lists", result: "Accepted", date: "3 days ago", change: null },
  { id: "3", type: "Problem", name: "Trapping Rain Water", result: "Wrong Answer", date: "4 days ago", change: null },
  { id: "4", type: "Contest", name: "Educational Round #172", result: "Rank 512", date: "1 week ago", change: "-8" },
  { id: "5", type: "Problem", name: "Two Sum", result: "Accepted", date: "1 week ago", change: null },
];

const skills = [
  { name: "Dynamic Programming", level: 85, type: "strong" },
  { name: "Graph Theory", level: 78, type: "strong" },
  { name: "Strings", level: 45, type: "weak" },
  { name: "Geometry", level: 30, type: "weak" },
];

/* ─── Components ─── */
function StatItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-text-muted">{icon}</span>}
        <span className="text-xl font-bold tabular-nums text-text">{value}</span>
      </div>
    </div>
  );
}

function RatingGraphPlaceholder() {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-bg-secondary/50">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
        [Interactive Rating Graph Placeholder]
      </div>
      {/* Mock line */}
      <svg className="absolute bottom-0 left-0 right-0 h-full w-full opacity-20" preserveAspectRatio="none">
        <path
          d="M0 100 Q 50 50 100 80 T 200 60 T 300 90 T 400 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent"
        />
        <path
           d="M0 100 L 0 100 Q 50 50 100 80 T 200 60 T 300 90 T 400 30 V 128 H 0 Z"
           fill="currentColor"
           className="text-accent"
        />
      </svg>
    </div>
  );
}

/* ─── Page Component ─── */
export function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Row 1 — Identity Hero Island */}
      <Island className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar Block */}
          <div className="aspect-square h-32 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-bg-secondary">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                <User size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Info Block */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text">{profile.name}</h1>
                <p className="text-sm text-text-muted">@{profile.username}</p>
                
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-accent">
                      <Link size={12} />
                      Website
                    </a>
                  )}
                  {profile.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-accent">
                      <Github size={12} />
                      GitHub
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-accent">
                      <Twitter size={12} />
                      Twitter
                    </a>
                  )}
                </div>
              </div>

              {/* Rating Block */}
              <div className="text-right">
                <div className="text-sm font-semibold text-accent">{profile.tier}</div>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-4xl font-bold tabular-nums text-text">{profile.rating}</span>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-success">
                  <TrendingUp size={12} />
                  +{profile.ratingChange}
                </div>
                <div className="mt-1 text-[10px] text-text-muted">
                  Max: <span className="font-semibold text-text">{profile.maxRating}</span>
                </div>
              </div>
            </div>

            {/* Horizontal Stats */}
            <div className="mt-6 flex items-center gap-8 border-t border-border pt-4">
               <StatItem label="Global Rank" value={`#${profile.globalRank}`} icon={<Trophy size={16} />} />
               <StatItem label="Problems Solved" value={profile.stats.solved.toString()} icon={<Target size={16} />} />
               <StatItem label="Contests" value={profile.stats.contests.toString()} icon={<Award size={16} />} />
               <StatItem label="Accuracy" value={`${profile.stats.accuracy}%`} />
               <StatItem label="Max Streak" value={`${profile.stats.streak} days`} icon={<Zap size={16} />} />
            </div>
          </div>
        </div>
      </Island>

      {/* Row 2 — Performance Layer */}
      <div className="grid grid-cols-2 gap-6">
        {/* Rating Progress */}
        <Island>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Rating History</h3>
            <span className="text-xs text-text-muted">Last 6 months</span>
          </div>
          <RatingGraphPlaceholder />
        </Island>

        {/* Strength & Weakness */}
        <Island>
           <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Topic Analysis</h3>
            <span className="text-xs text-text-muted">Based on recent solves</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-success">Strongest</span>
              <div className="flex flex-col gap-2">
                {skills.filter(s => s.type === "strong").map(s => (
                  <div key={s.name} className="flex items-center justify-between rounded bg-bg p-2 text-xs">
                    <span className="font-medium text-text">{s.name}</span>
                    <span className="font-mono text-text-muted">{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
             <div>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-error">Weakest</span>
              <div className="flex flex-col gap-2">
                {skills.filter(s => s.type === "weak").map(s => (
                  <div key={s.name} className="flex items-center justify-between rounded bg-bg p-2 text-xs">
                    <span className="font-medium text-text">{s.name}</span>
                    <span className="font-mono text-text-muted">{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Island>
      </div>

      {/* Row 3 — Activity Layer */}
      <Island>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Recent Activity</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
               <TableHead className="w-32">Type</TableHead>
               <TableHead>Name</TableHead>
               <TableHead className="w-32">Result</TableHead>
               <TableHead className="w-24">Change</TableHead>
               <TableHead className="w-32 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${activity.type === "Contest" ? "bg-accent-subtle text-accent" : "bg-bg text-text-muted"}`}>
                    {activity.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-sm">{activity.name}</TableCell>
                <TableCell>
                   <span className={`text-xs font-semibold ${
                     activity.result.includes("Accepted") ? "text-success" :
                     activity.result.includes("Wrong") ? "text-error" :
                     "text-text"
                   }`}>
                    {activity.result}
                   </span>
                </TableCell>
                <TableCell>
                  {activity.change ? (
                     <span className={`text-xs font-mono font-medium ${activity.change.startsWith("+") ? "text-success" : "text-error"}`}>
                       {activity.change}
                     </span>
                  ) : <span className="text-text-muted">—</span>}
                </TableCell>
                <TableCell className="text-right text-xs text-text-muted">{activity.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Island>
    </div>
  );
}
