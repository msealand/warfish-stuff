import { call } from './rest';
import { readCache, writeCache } from './cache';

async function _getHistory(gameId: string, start: number = 0, count: number = 1500) {
    if (start == -1) console.log(`getting last move`);
    else console.log(`getting moves ${start} - ${start + count}`);

    return await call(gameId, `services/rest`, {
        gid: gameId,
        _method: 'warfish.tables.getHistory',
        start: start,
        num: count,
        _format: 'json'
    }); 
}

export async function getHistory(gameId: string) {
    const history = JSON.parse((await readCache(gameId, "history.json")) ?? `{ "lastMove": 0, "moves": [] }`);
    const lastMoveData = await _getHistory(gameId, -1, 1);
    const totalMoves = Number(lastMoveData.movelog.total) - 1;

    if (totalMoves > history.lastMove) {
        const count = Math.min((totalMoves - history.lastMove) + 1, 1500);
        const newHistory = await _getHistory(gameId, history.lastMove, count);
        const newMoves = (newHistory.movelog._content.m || []).map((m) => {
            return Object.assign({}, m, { id: Number(m.id) });
        });
        history.moves.push(...newMoves);
        history.moves.sort((a, b) => a.id - b.id);
        history.lastMove = history.moves[history.moves.length - 1].id;

        await writeCache(gameId, JSON.stringify(history), "history.json");

        if (history.lastMove < totalMoves) {
            return await getHistory(gameId);
        }
    }
    return history;
}

export async function getState(gameId: string) {
    return await call(gameId, `services/rest`, {
        gid: gameId,
        _method: 'warfish.tables.getState',
        sections: `cards,board,details,players`,
        _format: 'json'
    });
}

export async function getDetails(gameId: string) {
    return await call(gameId, `services/rest`, {
        gid: gameId,
        _method: 'warfish.tables.getDetails',
        sections: `board,continents,rules,map`,
        _format: 'json'
    }, 'details.json');
}
