import { getDetails, getHistory, getState } from '../warfish/api';
import { GameMove } from './GameMoves';
import { Rules } from './Rules';
import { GameMap } from './GameMap';
import { Player } from './Player';
import { GameState, TerritoryState } from './GameState';
import { Territory } from './Territory';

function loadMapWithBoardData(map: GameMap, data: any) {
    const cleanData: any = {};

    Object.assign(cleanData, data);
    delete cleanData._content;
    Object.assign(cleanData, data._content);

    const borders = cleanData.border;
    borders.forEach((border) => {
        const territoryA = map.territories.get(border.a);
        const territoryB = map.territories.get(border.b);
        territoryA.addBorderingTerritory(territoryB);
    })
}

export class Game {

    static async ForId(gameId: string): Promise<Game> {
        const game = new Game(gameId);
        await game.load();
        return game;
    }

    private constructor(gameId: string) {
        this.id = gameId;
    }

    readonly id: string;
    readonly rules: Rules;
    readonly map: GameMap;

    readonly players = new Map<string, Player>();
    readonly history = new Array<GameState>();

    stateAfterMove(moveIdx: number): GameState | undefined {
        if (moveIdx < this.history.length) {
            return this.history[moveIdx];
        }
    }

    get currentState(): GameState | undefined {
        return this.history.length ? this.history[this.history.length - 1] : undefined;
    }

    private async load() {
        const details = await getDetails(this.id);

        // Cast to any to get around readonly
        (this as any).rules = new Rules(details.rules);
        delete details.rules;

        const continentData = details.continents._content.continent;
        (this as any).map = new GameMap(details.map, continentData);

        delete details.map;
        delete details.continents;

        loadMapWithBoardData(this.map, details.board);
        delete details.board;

        const gameStateData = await getState(this.id);
        const players = (gameStateData.players._content.player || []).map((p) => new Player(p, this));
        players.forEach((p) => this.players.set(p.id, p));

        const history = await getHistory(this.id);

        history.moves.forEach((m) => {
            const move = GameMove.FromData(m, this);
            if (move) {
                const state = move.apply(this.currentState);
                this.assertValidState();
                this.history.push(state);
            }
        })
    }

    // <Debugging Stuff>
    private dumpHistoryOfTerritory(territory: Territory) {
        let ps: TerritoryState;
        this.history.forEach((h) => {
            const ts = h.getTerritoryState(territory);
            if (!ps || (ts.controlledBy != ps.controlledBy) || (ts.unitCount != ps.unitCount)) {
                console.log(`${h.move.id}: ${h.move.description()}`);
                console.log(`${territory.name}, controlled by ${ts.controlledBy?.name ?? "nobody"} has ${ts.unitCount} units`);
                console.log();
                ps = ts;
            }
        })
    }

    private assertValidState() {
        const cs = this.currentState;
        if (!cs) return;

        cs.territoryStates.forEach((state, territory) => {
            if ((state?.unitCount ?? 0) < 0) {
                console.log();
                console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
                console.log();

                console.log(`INVALID STATE FROM MOVE (${cs.move.id})`);
                console.log();
                
                console.log(cs.move.description());
                console.log(`${territory.name}, controlled by ${state.controlledBy?.name ?? "nobody"} has ${state.unitCount} units`);
                console.dir(cs.move, { depth: 1 }); 

                console.log();
                console.log(`History of ${territory.name}:`);
                console.log();
                this.dumpHistoryOfTerritory(territory);

                console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
                console.log();
                throw new Error('Invalid State');
            }
        });
    }
    // </Debugging Stuff>
}
