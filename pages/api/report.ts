import {NextApiRequest, NextApiResponse} from "next";

const startUrl = (leagueId: number) => `https://fantasy.espn.com/apis/v3/games/flb/seasons/2023/segments/0/leagues/${leagueId}`;

// Map of positions
const positions: { [key: string]: string } = {0: 'C', 1: '1B', 2: '2B', 3: '3B', 4: 'SS', 5: 'OF', 14: 'SP', 15: 'RP'};

// Map of teams
const teams: { [key: number]: string } = {
    29: 'Ari',
    15: 'Atl',
    1: 'Bal',
    2: 'Bos',
    16: 'ChC',
    4: 'ChW',
    17: 'Cin',
    5: 'Cle',
    27: 'Col',
    6: 'Det',
    18: 'Hou',
    7: 'KC',
    3: 'LAA',
    19: 'LAD',
    28: 'Mia',
    8: 'Mil',
    9: 'Min',
    21: 'NYM',
    10: 'NYY',
    11: 'Oak',
    22: 'Phi',
    23: 'Pit',
    25: 'SD',
    12: 'Sea',
    26: 'SF',
    24: 'StL',
    30: 'TB',
    13: 'Tex',
    14: 'Tor',
    20: 'Wsh',
    0: 'FA'
};

// Map of headers
const headersByScoringPeriod: { [key: number]: any } = {
    2: {
        "players": {
            "filterStatus": {"value": ["FREEAGENT", "WAIVERS"]},
            "filterSlotIds": {"value": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19]},
            "filterRanksForScoringPeriodIds": {"value": [2]},
            "limit": 10,
            "offset": 0,
            "sortPercOwned": {"sortAsc": false, "sortPriority": 1},
            "sortDraftRanks": {"sortPriority": 100, "sortAsc": true, "value": "STANDARD"},
            "filterRanksForRankTypes": {"value": ["STANDARD"]},
            "filterStatsForTopScoringPeriodIds": {
                "value": 5,
                "additionalValue": ["002023", "102023", "002022", "012023", "022023", "032023", "042023", "062023", "010002023"]
            }
        }
    },
    6: {
        "players": {
            "filterStatus": {"value": ["FREEAGENT", "WAIVERS"]},
            "filterSlotIds": {"value": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19]},
            "filterRanksForScoringPeriodIds": {"value": [7]},
            "limit": 10,
            "offset": 0,
            "sortPercChanged": {"sortAsc": false, "sortPriority": 1},
            "sortDraftRanks": {"sortPriority": 100, "sortAsc": true, "value": "STANDARD"},
            "filterRanksForRankTypes": {"value": ["STANDARD"]},
            "filterStatsForTopScoringPeriodIds": {
                "value": 5,
                "additionalValue": ["002023", "102023", "002022", "012023", "022023", "032023", "042023", "062023", "010002023"]
            }
        }
    },
    7: {
        "players": {
            "filterStatus": {"value": ["FREEAGENT", "WAIVERS"]},
            "filterSlotIds": {"value": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19]},
            "filterRanksForScoringPeriodIds": {"value": [7]},
            "limit": 10,
            "offset": 0,
            "sortAppliedStatAverage": {"sortAsc": false, "sortPriority": 1, "value": "022023"},
            "sortDraftRanks": {"sortPriority": 100, "sortAsc": true, "value": "STANDARD"},
            "filterRanksForRankTypes": {"value": ["STANDARD"]},
            "filterStatsForTopScoringPeriodIds": {
                "value": 5,
                "additionalValue": ["002023", "102023", "002022", "012023", "022023", "032023", "042023", "062023", "010002023"]
            }
        }
    },
}

function getHeaders(batterOrPitcher: 'batter' | 'pitcher', scoringPeriod: number) {
    const slotIds = {
        'batter': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19],
        'pitcher': [13, 14, 15]
    }
    const filterSlotIds = slotIds[batterOrPitcher];
    return {
        "players": {
            "filterStatus": {"value": ["FREEAGENT", "WAIVERS"]},
            "filterSlotIds": {"value": filterSlotIds},
            "filterRanksForScoringPeriodIds": {"value": [scoringPeriod]},
            "limit": 10,
            "offset": 0,
            "sortPercOwned": {"sortAsc": false, "sortPriority": 1},
            "sortDraftRanks": {"sortPriority": 100, "sortAsc": true, "value": "STANDARD"},
            "filterRanksForRankTypes": {"value": ["STANDARD"]},
            "filterStatsForTopScoringPeriodIds": {
                "value": 5,
                "additionalValue": ["002023", "102023", "002022", "012023", "022023", "032023", "042023", "062023", "010002023"]
            }
        }
    } as any;
}

function findPositions(slots: number[]): string[] {
    return slots.map((slot) => positions[slot]).filter((slot) => slot !== undefined);
}

function getTeam(proTeamId: number) {
    return teams[proTeamId];
}

async function fetchData(url, filter) {
    const headers = {'x-fantasy-filter': JSON.stringify(filter)};
    const response = await fetch(url, {headers});
    return await response.json();
}

function mapPlayerData(entry) {
    return {
        id: entry.player.id,
        fullName: entry.player.fullName,
        percentRosted: entry.player.ownership.percentOwned / 100,
        percentChange: entry.player.ownership.percentChange / 100,
        appliedTotal2023: entry.player.stats.find((s) => s.externalId === '2023').appliedTotal,
        appliedAverage2023: entry.player.stats.find((s) => s.externalId === '2023').appliedAverage,
        positions: findPositions(entry.player.eligibleSlots),
        injured: entry.player.injured,
        injuryStatus: entry.player.injuryStatus,
        proTeamId: getTeam(entry.player.proTeamId),
        status: entry.status,
        seasonOutlook: entry.player.seasonOutlook,
        defaultPositionId: entry.player.defaultPositionId,
    };
}

function isProbablePitcher(entry, games) {
    return games.some((game) => entry.player.starterStatusByProGame[game.id] === 'PROBABLE');
}

async function getGames(today: Date) {
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    const url = `https://site.api.espn.com/apis/fantasy/v2/games/flb/games?useMap=true&dates=${formattedDate}&pbpOnly=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data.events.map((game) => ({
        id: game.id,
        date: game.date,
    }))
}

async function getFreeAgents(scoringPeriod: number, leagueId: number) {
    const url = `${startUrl(leagueId)}?scoringPeriodId=${scoringPeriod}&view=kona_player_info`;
    const data = await fetchData(url, headersByScoringPeriod[scoringPeriod]);
    return data.players.map(mapPlayerData);
}

async function getCurrentPlayersOut(teamId: number, scoringPeriod: number, leagueId: number) {
    const url = `${startUrl(leagueId)}?rosterForTeamId=${teamId}&view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav`;
    const headers = {
        'x-fantasy-filter': JSON.stringify({"players": {"filterRanksForScoringPeriodIds": {"value": [scoringPeriod]}}})
    };
    const response = await fetch(url, {headers});
    const data = await response.json();
    return data.teams
        .filter(t => t.id === teamId)
        .map(({roster}) => roster?.entries?.map(({playerPoolEntry}) => playerPoolEntry)).flat()
        .filter(entry => entry.player.injured)
        .map(mapPlayerData);
}

async function getPlayersOnTheBench(teamId: number, games: any[], leagueId: number) {
    const url = `${startUrl(leagueId)}?rosterForTeamId=${teamId}&view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav`;
    const headers = {
        'x-fantasy-filter': JSON.stringify({"players": {}})
    };
    const response = await fetch(url, {headers});
    const data = await response.json();
    return data.teams
        .filter(t => t.id === teamId)
        .map(({roster}) => roster)[0]?.entries?.filter(({lineupSlotId}) => lineupSlotId == 16)
        .map(({playerPoolEntry}) => playerPoolEntry).map((entry) => ({
            ...mapPlayerData(entry),
            probablePitcher: isProbablePitcher(entry, games)
        }));
}

/**
 * Main function to handle the request.
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {method} = req;

    switch (method) {
        case 'GET':
            try {
                const teamId = req.query.teamId as string;
                const leagueId = +(req.query.leagueId as string);
                const games = await getGames(new Date());
                const [freeAgents, freeAgentsRising, freeAgentsByAveragePoints, playersOut, playersOnTheBench] =
                    await Promise.all([
                        getFreeAgents(2, leagueId),
                        getFreeAgents(6, leagueId),
                        getFreeAgents(7, leagueId),
                        getCurrentPlayersOut(+teamId, 8, leagueId),
                        getPlayersOnTheBench(+teamId, games, leagueId)
                    ]);
                res.status(200).json({
                    freeAgents,
                    freeAgentsRising,
                    freeAgentsByAveragePoints,
                    playersOnTheBench,
                    playersOut,
                });
            } catch (error) {
                console.error(error);
                res.status(400).json({success: false});
            }
            break;
        case 'POST':
            try {
                const {name, email, message} = req.body;

                if (!name || !email || !message) {
                    return res.status(400).json({success: false});
                }

                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                const msg = {
                    to: 'test@whatever.email',
                    from: email,
                    subject: `Report For: ${new Date().toLocaleString()}`,
                    text: message,
                    html: message
                };
                await sgMail.send(msg);

                res.status(200).json({success: true});
            } catch (error) {
                console.error(error);

                res.status(400).json({success: false});
            }
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}