type TeamCardProps = {
  teamName: string;
  ranking: number;
  epa: number;
  defEpa: number;
  wins: number;
  losses: number;
  ties: number;
  pointsPerGame: number;
  logo: string;
  teamColour: string;
};

export default function TeamCard({
  teamName,
  ranking,
  epa,
  defEpa,
  wins,
  losses,
  ties,
  pointsPerGame,
  logo,
  teamColour,
}: TeamCardProps) {
  return (
        <div className="bg-slate-900 p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
      <h2 className="text-xl font-semibold">
         <span className="text-white">
           #{ranking}
          </span>{" "}
          <span style={{ color: teamColour }}>
            {teamName}
          </span>
      </h2>
        
        <img
         src={logo}
         alt={teamName}
         className="h-10 w-14 mb-4"
        />
      </div>
      <p className="mt-4 text-green-400 text-2xl">
        Off EPA/Play: {epa.toFixed(2)}
      </p>
      <p className="mt-1 text-sky-400 text-2xl">
        Def EPA/Play: {defEpa.toFixed(2)}
      </p>
      
        <p className="mt-2 text-lg">
          Record: {wins}-{losses}{ties > 0 ? `-${ties}` : ""}
        </p>
     
      
        <p className="mt-2 text-lg">
          PPG: {pointsPerGame}
        </p>
      
    </div>
  );
}
    
