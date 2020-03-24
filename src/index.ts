// import { call } from './rest';
// import { getHistory, getState, getDetails } from './api';
// import { getData } from './units';

import { resolve } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

import { Game } from './game/Game';
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
    // console.log(game.stateAfterMove(500)?.move?.description());

    // console.log()
    // game.currentState?.territoryStates.forEach((state, territory) => {
    //     console.log(`${territory.name} is controlled by ${state.controlledBy?.name ?? "nobody"} with ${state.unitCount ?? 0} units`);
    // })

    console.log()
    game.currentState?.playerStates.forEach((state, player) => {
        console.log(`${player?.name ?? "Neutral Territory"}:`);
        console.dir(state);
        console.log();
    })

    console.log()
    console.log(game.currentState?.move?.description());

    // console.log(`Rules:`);
    // console.dir(game.rules, { depth: null });
    // console.log();

    // console.log(`Map:`);
    // console.dir(game.map, { depth: 4 });
    // console.log();


    const cachePath = resolve(process.env["CACHE_PATH"] || 'cache');
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }    

    const gameDir = resolve(cachePath, game.id);
    if (!existsSync(gameDir)) {
        mkdirSync(gameDir);
    }

    const movesDir = resolve(gameDir, 'moves');
    if (!existsSync(movesDir)) {
        mkdirSync(movesDir);
    }

    {
        const imageData = await drawMap(game);
        const imagePath = resolve(gameDir, `map.png`);
        writeFileSync(imagePath, imageData);
        console.log(`saved map to: ${imagePath}`);
    }

    {
        const imageData = await drawMap(game, Number(game.currentState.move.id));
        const imagePath = resolve(gameDir, `current.png`);
        writeFileSync(imagePath, imageData);
        console.log(`saved current state to: ${imagePath}`);
    }

    // let n = 0;
    // for (let idx = 0; idx < game.history.length; idx++) {
    // // for (let idx = 500; idx < 600; idx++) {
    //     const imageData = await drawMap(game, idx);
    //     if (imageData) {
    //         const imagePath = resolve(gameDir, "moves", `${n}.png`);
    //         writeFileSync(imagePath, imageData);
    //         console.log(`saved map to: ${imagePath}`);
    //         n++;
    //     }
    // }
}

go();
