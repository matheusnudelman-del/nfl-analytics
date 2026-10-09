import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeams, getTeamDetails, type SideStats } from "../../lib/getTeams";

// Builds all team pages ahead of time, one per team.
export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((team) => ({ abbr: team.abbr }));
}

// Formatting helpers.
const formatEpa = (n: number) => (n > 0 ? "+" : "") + n.toFixed(2);
const formatPercent = (n: number) => (n * 100).toFixed(1) + "%";

// Each row of the stats table: its label, which stat to show, and how to format it.
const rows: { label: string; key: keyof SideStats; format: (n: number) => string }[] = [
  { label: "EPA/play", key: "epa", format: formatEpa },
  { label: "Pass EPA/play", key: "passEpa", format: formatEpa },
  { label: "Rush EPA/play", key: "rushEpa", format: formatEpa },
  { label: "Success rate", key: "successRate", format: formatPercent },
  { label: "Pass success rate", key: "passSuccessRate", format: formatPercent },
  { label: "Rush success rate", key: "rushSuccessRate", format: formatPercent },
  { label: "3rd down conversion", key: "thirdDownRate", format: formatPercent },
  { label: "Pass rate", key: "passRate", format: formatPercent },
];

export default async function TeamPage({
  params,
}: {
  params: Promise<{ abbr: string }>;
}) {
  const { abbr } = await params;
  const team = (await getTeams()).find((t) => t.abbr === abbr);
  const details = getTeamDetails(abbr);

  if (!team || !details) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <Link href="/" className="text-slate-400 hover:text-white">
        ← Back to all teams
      </Link>

      <div className="flex items-center gap-4 mt-6 mb-8">
        <img src={team.logo} alt={team.teamName} className="h-20 w-20 object-contain" />
        <div>
          <h1 className="text-4xl font-bold">{team.teamName}</h1>
          <p className="text-slate-400 mt-1">
            {team.conference} · Record {team.wins}-{team.losses}
            {team.ties > 0 ? `-${team.ties}` : ""} · {team.pointsPerGame} PPG
          </p>
        </div>
      </div>

      <table className="w-full max-w-2xl bg-slate-900 rounded-xl overflow-hidden">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="p-4">Stat</th>
            <th className="p-4">Offence</th>
            <th className="p-4">Defence (allowed)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-800 last:border-0">
              <td className="p-4 text-slate-300">{row.label}</td>
              <td className="p-4">{row.format(details.offense[row.key])}</td>
              <td className="p-4">{row.format(details.defense[row.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}