"use client";

import { useState } from "react";
import TeamCard from "./TeamCard";
import type { Team } from "./lib/getTeams";

export default function TeamDashboard({ teams }: { teams: Team[] }) {
  const [sortOption, setSortOption] = useState("epa-desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState("All");


  const sortedTeams = [...teams].sort((a, b) => {
    if (sortOption === "alphabetical") {
  return a.teamName.localeCompare(b.teamName);}
    if (sortOption === "epa-asc") {
      return a.epa - b.epa;}

    if (sortOption === "def-epa-best") {
      return a.defEpa - b.defEpa;
    }

    if (sortOption === "wins-desc") {
      return b.wins - a.wins;}

    if (sortOption === "ppg-desc") {
      return b.pointsPerGame - a.pointsPerGame;}

    return b.epa - a.epa;
    }).map((team, index) => ({ ...team, ranking: index + 1 }));
  const filteredTeams = sortedTeams.filter((team) => {
  const matchesSearch = team.teamName
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesConference =
    conferenceFilter === "All" ||
    team.conference === conferenceFilter;

  return matchesSearch && matchesConference;
});

``
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        NFL Analytics Dashboard
      </h1>
    <div className="bg-slate-900 p-6 rounded-xl mb-8">
      <div className="mb-6">
  <label
    htmlFor="search"
    className="mr-3 font-semibold text-slate-300"
  >
    Search team:
  </label>

  <input
    id="search"
    type="text"
    value={searchTerm}
    onChange={(event) =>
      setSearchTerm(event.target.value)
    }
    placeholder="Enter team name..."
    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
  />
</div>
<div className="mb-6">
  <label
    htmlFor="sort"
    className="mr-3 font-semibold text-slate-300"
  >
    Sort teams:
  </label>

  <select
    id="sort"
    value={sortOption}
    onChange={(event) => setSortOption(event.target.value)}
    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white">
    <option value="alphabetical">
      Alphabetical (A-Z)
    </option>
    <option value="epa-desc">Offensive EPA: best to worst</option>
    <option value="def-epa-best">Defensive EPA: best to worst</option>
    <option value="ppg-desc">PPG: highest to lowest</option>
  </select>
</div>

<div className="mb-6">
  <label
    htmlFor="conference"
    className="mr-3 font-semibold text-slate-300"
  >
    Conference:
  </label>

  <select
    id="conference"
    value={conferenceFilter}
    onChange={(event) =>
      setConferenceFilter(event.target.value)}
    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
  >
    <option value="All">All Teams</option>
    <option value="AFC">AFC</option>
    <option value="NFC">NFC</option>
  </select>
</div>
</div>
{filteredTeams.length === 0 && (
  <p className="text-slate-400">No teams match your search.</p> )}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {filteredTeams.map((team) => (
  <TeamCard
    key={team.teamName}
    ranking={team.ranking}
    teamName={team.teamName}
    epa={team.epa}
    defEpa={team.defEpa}
    wins={team.wins}
    losses={team.losses}
    ties={team.ties}
    pointsPerGame={team.pointsPerGame}
    logo={team.logo}
    teamColour={team.teamColour}
  />
))}
      </div>
      
    </main>
  );
}