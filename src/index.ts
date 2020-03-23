// import { call } from './rest';
import { getHistory, getState, getDetails } from './api';
// import { getData } from './units';

import { Game } from './game';
import { drawMap } from './drawMap';

const gameId = process.argv[2];
if (!gameId) { console.log(`No gameId`); process.exit(-1); }

async function go() {
    // const detilas = await getDetails(gameId);
    // console.dir(detilas, { depth: 2 });    
    
    // console.log()

    // const gameStateData = await getState(gameId);
    // console.dir(gameStateData, { depth: null });

    // console.log()

    // const history = await getHistory(gameId);
    // console.dir(history, { depth: null });

    // const data = await getData(gameId);
    // console.dir(data, { depth: null });

    const game = await Game.ForId(gameId);

    // console.log(`Rules:`);
    // console.dir(game.rules, { depth: null });
    // console.log();

    // console.log(`Map:`);
    // console.dir(game.map, { depth: 4 });
    // console.log();

    // drawMap(game);
}

go();
