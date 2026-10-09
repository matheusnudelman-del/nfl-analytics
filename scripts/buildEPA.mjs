import fs from "node:fs";
import zlib from "node:zlib";
import { Readable } from "node:stream";
import Papa from "papaparse";

const SEASON = 2025;
const PBP_URL = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${SEASON}.csv.gz`;

const response = await fetch(PBP_URL);
if (!response.ok) throw new Error(`Download failed (status ${response.status})`);
const csvStream = Readable.fromWeb(response.body).pipe(zlib.createGunzip());

// An empty set of running totals for one team, on one side of the ball.
function blankTotals() {
  return {
    plays: 0, epa: 0, successes: 0,
    passPlays: 0, passEpa: 0, passSuccesses: 0,
    rushPlays: 0, rushEpa: 0, rushSuccesses: 0,
    thirdDownAttempts: 0, thirdDownConversions: 0,
  };
}

const offense = {};
const defense = {};

// Adds one play to a team's totals.
function addPlay(totals, team, play, epa) {
  const t = (totals[team] ??= blankTotals());
  const success = Number(play.success) === 1 ? 1 : 0;

  t.plays++;
  t.epa += epa;
  t.successes += success;

  if (Number(play.pass) === 1) {
    t.passPlays++;
    t.passEpa += epa;
    t.passSuccesses += success;
  } else {
    t.rushPlays++;
    t.rushEpa += epa;
    t.rushSuccesses += success;
  }

  if (Number(play.down) === 3) {
    t.thirdDownAttempts++;
    if (Number(play.third_down_converted) === 1) t.thirdDownConversions++;
  }
}

// Divides safely: gives 0 instead of an error if there were no plays.
const rate = (part, whole) => (whole > 0 ? part / whole : 0);

// Turns raw totals into the averages and percentages shown on the site.
function summarise(t) {
  return {
    epa: rate(t.epa, t.plays),
    passEpa: rate(t.passEpa, t.passPlays),
    rushEpa: rate(t.rushEpa, t.rushPlays),
    successRate: rate(t.successes, t.plays),
    passSuccessRate: rate(t.passSuccesses, t.passPlays),
    rushSuccessRate: rate(t.rushSuccesses, t.rushPlays),
    thirdDownRate: rate(t.thirdDownConversions, t.thirdDownAttempts),
    passRate: rate(t.passPlays, t.plays),
  };
}

Papa.parse(csvStream, {
  header: true,

  step: ({ data: play }) => {
    const epa = Number(play.epa);
    const isPassOrRun = Number(play.pass) === 1 || Number(play.rush) === 1;
    if (play.season_type !== "REG" || !isPassOrRun || !play.posteam || !play.defteam || Number.isNaN(epa)) return;

    addPlay(offense, play.posteam, play, epa);
    addPlay(defense, play.defteam, play, epa);
  },

  complete: () => {
    const output = { season: SEASON, offense: {}, defense: {}, details: {} };

    for (const team of Object.keys(offense)) {
      const off = summarise(offense[team]);
      const def = summarise(defense[team]);
      output.offense[team] = off.epa;
      output.defense[team] = def.epa;
      output.details[team] = { offense: off, defense: def };
    }

    fs.mkdirSync("app/data", { recursive: true });
    fs.writeFileSync("app/data/epa.json", JSON.stringify(output, null, 2));
    console.log(`Saved stats for ${Object.keys(offense).length} teams`);
  },
});