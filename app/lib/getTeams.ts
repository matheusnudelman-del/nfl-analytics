import Papa from "papaparse";
import epaData from "../data/epa.json";

// The season to show. 2026 is only a few weeks in, so start with 2025.
const SEASON = 2025;

const TEAMS_URL =
  "https://github.com/nflverse/nflverse-data/releases/download/teams/teams_colors_logos.csv";
const GAMES_URL =
  "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";

// The shape of one team, shared by the rest of the site.
export type Team = {
  abbr: string;
  teamName: string;
  conference: "AFC" | "NFC";
  epa: number;
  defEpa: number;
  wins: number;
  losses: number;
  ties: number;
  pointsPerGame: number;
  logo: string;
  teamColour: string;
};

// Downloads a CSV and turns it into rows, e.g. { team_name: "Seattle Seahawks", ... }
async function loadCsv(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`Could not load ${url} (status ${response.status})`);
  }
  const text = await response.text();
  return Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  }).data;
}

// Checks a score cell has a real value (unplayed games are blank or "NA").
const hasScore = (value: string) => value !== "" && value !== "NA";

export async function getTeams(): Promise<Team[]> {
  // Download all three files at the same time.
  const [teamRows, gameRows] = await Promise.all([
    loadCsv(TEAMS_URL),
    loadCsv(GAMES_URL),
  ]);

  // Keep only finished regular-season games from our season.
  const games = gameRows.filter(
    (g) =>
      Number(g.season) === SEASON &&
      g.game_type === "REG" &&
      hasScore(g.home_score) &&
      hasScore(g.away_score)
  );

  // Tally each team's results, keyed by abbreviation (e.g. "KC").
  type Tally = { wins: number; losses: number; ties: number; points: number; games: number };
  const records: Record<string, Tally> = {};
  const blank = (): Tally => ({ wins: 0, losses: 0, ties: 0, points: 0, games: 0 });

  for (const g of games) {
    const home = (records[g.home_team] ??= blank());
    const away = (records[g.away_team] ??= blank());
    const homeScore = Number(g.home_score);
    const awayScore = Number(g.away_score);

    home.points += homeScore;
    away.points += awayScore;
    home.games++;
    away.games++;

    if (homeScore > awayScore) {
      home.wins++;
      away.losses++;
    } else if (awayScore > homeScore) {
      away.wins++;
      home.losses++;
    } else {
      home.ties++;
      away.ties++;
    }
  }

  // EPA per play = total EPA ÷ total plays (passes + sacks + runs).
    const offEpaByTeam: Record<string, number> = epaData.offense;
    const defEpaByTeam: Record<string, number> = epaData.defense;

  // Combine everything. The filter drops old teams (e.g. Oakland) with no games this season.
  return teamRows
    .filter((t) => records[t.team_abbr])
    .map((t) => {
      const r = records[t.team_abbr];
      return {
        abbr: t.team_abbr,
        teamName: t.team_name,
        conference: t.team_conf as "AFC" | "NFC",
        epa: offEpaByTeam[t.team_abbr] ?? 0,
        defEpa: defEpaByTeam[t.team_abbr] ?? 0,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        pointsPerGame: Number((r.points / r.games).toFixed(1)),
        logo: t.team_logo_espn,
        teamColour: t.team_color,
      };
    });
}