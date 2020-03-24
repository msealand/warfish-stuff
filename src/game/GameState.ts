import { GameMove } from "./GameMoves";
import { Player } from "./Player";
import { Territory } from "./Territory";


// export class PlayerState {

//     readonly isTurn: boolean;
//     readonly eliminated: boolean;

// }

export class TerritoryState {

    constructor(controlledBy: Player | undefined = undefined, unitCount: number = 0) {
        this.controlledBy = controlledBy;
        this.unitCount = unitCount;
    }

    controlledBy: Player | undefined;
    unitCount: number = 0;

}

export class GameState {

    constructor(move: GameMove, previousState?: GameState) {

        // Copy in the previous state...
        previousState?.territoryStates.forEach((state, territory) => {
            this.territoryStates.set(territory, new TerritoryState(state.controlledBy, state.unitCount));
        })

        this.previousState = previousState;
        this.move = move;
    }

    readonly previousState: GameState;
    readonly move: GameMove;
    readonly territoryStates = new Map<Territory, TerritoryState>();

    getTerritoryState(territory): TerritoryState {
        if (!this.territoryStates.has(territory)) {
            this.territoryStates.set(territory, new TerritoryState());
        }
        return this.territoryStates.get(territory);
    }

}
