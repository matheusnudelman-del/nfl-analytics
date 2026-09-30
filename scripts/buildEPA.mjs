import fs from "node:fs";
import zlib from "node:zlib";
import { Readable } from "node:stream";
import Papa from "papaparse";

const SEASON = 2025;
const PBP_URL = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${SEASON}.csv.gz`;

const response = await fetch(PBP_URL);
if (!response.ok) throw new Error(`Download failed (status ${response.status})`);

const csvStream = Readable.fromWeb(response.body).pipe(zlib.createGunzip());

// Two sets of running totals: one for offence, one for defence.
const offense = {};
const defense = {};

// Adds one play's EPA to a team's total in the given set.
function addPlay(totals, team, epa) {
  const t = (totals[team] ??= { epa: 0, plays: 0 });
  t.epa += epa;
  t.plays++;
}

// Turns { KC: { epa: 60, plays: 500 } } into { KC: 0.12 }.
function averages(totals) {
  const result = {};
  for (const [team, t] of Object.entries(totals)) {
    result[team] = t.epa / t.plays;
  }
  return result;
}

Papa.parse(csvStream, {
  header: true,

  step: ({ data: play }) => {
    const epa = Number(play.epa);
    const isPassOrRun = Number(play.pass) === 1 || Number(play.rush) === 1;

    if (
      play.season_type !== "REG" ||
      !isPassOrRun ||
      !play.posteam ||
      !play.defteam ||
      Number.isNaN(epa)
    ) return;

    addPlay(offense, play.posteam, epa); // the team with the ball
    addPlay(defense, play.defteam, epa); // the team defending
  },

  complete: () => {
    const output = {
      season: SEASON,
      offense: averages(offense),
      defense: averages(defense),
    };
    fs.mkdirSync("app/data", { recursive: true });
    fs.writeFileSync("app/data/epa.json", JSON.stringify(output, null, 2));
    console.log(`Saved offensive and defensive EPA/play for ${Object.keys(output.offense).length} teams`);
  },
});