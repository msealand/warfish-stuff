import { call } from './rest';

export async function getHistory(gameId: string, start: number = 0, count: number = 1500) {
    return await call(gameId, `services/rest`, {
        gid: gameId,
        _method: 'warfish.tables.getHistory',
        start: start,
        num: count,
        _format: 'json'
    }); 
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
