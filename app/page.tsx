import TeamDashboard from "./TeamDashboard";
import { getTeams } from "./lib/getTeams";

export default async function Home() {
  const teams = await getTeams();
  return <TeamDashboard teams={teams} />;
}