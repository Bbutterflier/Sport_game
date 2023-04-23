// SSR
import {GetServerSideProps} from 'next'
import Link from "next/link";

const teams = {
    1: {
        teamId: 1,
        leagueId: 413226994,
        name: 'Team One'
    },
    2: {
        teamId: 2,
        leagueId: 191948199,
        name: 'Team Two'
    },
    3: {
        teamId: 5,
        leagueId: 1859285208,
        name: 'Team Three'
    },
    4: {
        teamId: 8,
        leagueId: 191948199,
        name: 'Team Four'
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query, params } = context;
    const req = context.req;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const teamIndex = +(params?.teamIndex as string);
    const teamId = teams[teamIndex].teamId;
    const leagueId = teams[teamIndex].leagueId;
    const apiUrl = `${protocol}://${host}/api/report?teamId=${teamId}&leagueId=${leagueId}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    return {
        props: {
            data,
            teamIndex,
            teamId,
            leagueId,
        },
    };
};

function formatPct(percentRosted: number) {
    // Round to 2 digits after decimal and convert to percentage
    return (percentRosted * 100).toFixed(2) + "%";
}

function roundNumber(number: number, digits: number = 0) {
    return number.toFixed(digits);
}

function PlayersTable(props: { freeAgents: any, leagueId: number, teamId: number, highlightColumn: string, displayMode: string }) {

    const renderPlayerRow = (player) => (
        <PlayerRow player={player} leagueId={props.leagueId} teamId={props.teamId} highlightColumn={props.highlightColumn} actionText="Add" actionUrl="rosterfix" />
    );
    const renderPlayerRowCurrentPlayersOut = (player) => (
        <CurrentPlayerOutRow player={player} leagueId={props.leagueId} teamId={props.teamId} highlightColumn={props.highlightColumn} actionText="Add" actionUrl="rosterfix" />
    );

    const renderPlayerRowFunction = {
        normal: renderPlayerRow,
        currentPlayersOut: renderPlayerRowCurrentPlayersOut,
    }

    const renderPlayerHeaderFunction = {
        normal: <tr>
            <th>Name</th>
            <th>Positions</th>
            <th>Health</th>
            <th>Team</th>
            <th>Status</th>
            <th>Availability</th>
            <th>Roster %</th>
            <th>Roster +/-</th>
            <th>Total</th>
            <th>Avg</th>
        </tr>,
        currentPlayersOut: <tr>
            <th>Name</th>
            <th>Positions</th>
            <th>Health</th>
            <th>Team</th>
            <th>Availability</th>
            <th>Action</th>
            <th>Roster %</th>
            <th>Roster +/-</th>
            <th>Total</th>
            <th>Avg</th>
            <th>Notes</th>
        </tr>,
    }

    if (props.freeAgents?.length > 0) {
        return <table border={1}>
            <thead>
            {renderPlayerHeaderFunction[props.displayMode]}
            </thead>
            <tbody>
            {props.freeAgents?.map(renderPlayerRowFunction[props.displayMode])}
            </tbody>
        </table>;
    }
    return <>No player in this list</>;
}

function formatInjuryStatus(injuryStatus: string) {
    switch (injuryStatus) {
        case 'ACTIVE': return 'Healthy';
        case 'TEN_DAY_DL': return 'IL10';
        case 'FIFTEEN_DAY_DL': return 'IL15';
        case 'THIRTY_DAY_DL': return 'IL30';
        case 'SIXTY_DAY_DL': return 'IL60';
        case 'DAY_TO_DAY': return 'DTD';
        case 'SUSPENSION': return 'SSPD';
        default: return injuryStatus;
    }
}

function formatPlayerStatus(status) {
    return status === 'WAIVERS' ? 'WA' : 'FA';
}

const PlayerRow = ({ player, actionText, actionUrl, highlightColumn, leagueId, teamId }) => (
    <tr key={player.id}>
        <td><Link href={`https://www.espn.com/mlb/player/stats/_/id/${player.id}`} target="_blank">{player.fullName}</Link></td>
        <td>{player.positions.join(', ')}</td>
        <td>{formatInjuryStatus(player.injuryStatus)}</td>
        <td>{player.proTeamId}</td>
        <td>{formatPlayerStatus(player.status)}</td>
        <td>
            {actionText && (
                <Link
                    href={`https://fantasy.espn.com/baseball/${actionUrl}?leagueId=${leagueId}&seasonId=2023&teamId=${teamId}&players=${player.id}&type=${actionText.toLowerCase()}`}
                    target={'_blank'}
                >
                    {actionText}
                </Link>
            )}
        </td>
        <td style={highlightColumn === 'rostered' ? { backgroundColor: 'lightgreen' } : {}}>{formatPct(player.percentRosted)}</td>
        <td style={highlightColumn === 'change' ? { backgroundColor: 'lightblue' } : {}}>{formatPct(player.percentChange)}</td>
        <td>{player.appliedTotal2023}</td>
        <td style={highlightColumn === 'average' ? { backgroundColor: 'lightyellow' } : {}}>{roundNumber(player.appliedAverage2023, 1)}</td>
    </tr>
);

const CurrentPlayerOutRow = ({ player, actionText, actionUrl, highlightColumn, leagueId, teamId }) => (
    <tr key={player.id}>
        <td><Link href={`https://www.espn.com/mlb/player/stats/_/id/${player.id}`} target="_blank">{player.fullName}</Link></td>
        <td>{player.positions.join(', ')}</td>
        <td>{formatInjuryStatus(player.injuryStatus)}</td>
        <td>{player.proTeamId}</td>
        <td>
            {player.injured && <>IL</>}
        </td>
        <td>
            {actionText && (
                <Link
                    href={`https://fantasy.espn.com/baseball/${actionUrl}?leagueId=${leagueId}&seasonId=2023&teamId=${teamId}&players=${player.id}&type=${actionText.toLowerCase()}`}
                    target={'_blank'}
                >
                    {actionText}
                </Link>
            )}</td>
        <td style={highlightColumn === 'rostered' ? { backgroundColor: 'lightgreen' } : {}}>{formatPct(player.percentRosted)}</td>
        <td style={highlightColumn === 'change' ? { backgroundColor: 'lightblue' } : {}}>{formatPct(player.percentChange)}</td>
        <td>{player.appliedTotal2023}</td>
        <td style={highlightColumn === 'average' ? { backgroundColor: 'lightyellow' } : {}}>{roundNumber(player.appliedAverage2023, 1)}</td>
        <td>{player.seasonOutlook}</td>
    </tr>
);

export default function Report({ data, teamIndex, teamId, leagueId }) {
    if (!data) return null;

    return (
        <>
            <h1>Report</h1>
            <p>
                Sport: Fantasy Baseball<br />
                Team: {teams[teamIndex].name} (ESPN)<br />
                Report For: {new Date().toLocaleString()}
            </p>

            <h2>Top 10 Available Players by % Rostered Across All Leagues</h2>
            <PlayersTable freeAgents={data.freeAgents} leagueId={leagueId} teamId={teamId} highlightColumn="rostered" displayMode="normal" />

            <h2>Top 10 Available Players Rising in Popularity</h2>
            <PlayersTable freeAgents={data.freeAgentsRising} leagueId={leagueId} teamId={teamId} highlightColumn="change" displayMode="normal" />

            <h2>Top 10 Available Players by Average Points over past 15 Days</h2>
            <PlayersTable freeAgents={data.freeAgentsByAveragePoints} leagueId={leagueId} teamId={teamId} highlightColumn="rostered" displayMode="normal" />

            <h2>Current Players OUT</h2>
            <PlayersTable freeAgents={data.playersOut} leagueId={leagueId} teamId={teamId} highlightColumn="rostered" displayMode="currentPlayersOut" />

            <h2>Current Benched Players w/Game Scheduled</h2>
            <PlayersTable freeAgents={data.playersOnTheBench} leagueId={leagueId} teamId={teamId} highlightColumn="rostered" displayMode="normal" />

            <h2>Probable Starting Pitchers on the Bench</h2>
            <PlayersTable freeAgents={data.playersOnTheBench?.filter(player => player.probablePitcher)} leagueId={leagueId} teamId={teamId} highlightColumn="rostered" displayMode="normal" />
        </>
    );
}