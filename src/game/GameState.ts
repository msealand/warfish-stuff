import { GameMove } from "./GameMoves";
import { Player } from "./Player";
import { Territory } from "./Territory";
import { threadId } from "worker_threads";


export class PlayerState {

    constructor(previousState?: PlayerState) {
        if (previousState) {
            this.attacks = previousState.attacks;
            this.defends = previousState.defends;
            this.wins = previousState.wins;
            this.losses = previousState.losses;
            this.territoriesWon = previousState.territoriesWon;
            this.territoriesLost = previousState.territoriesLost
            this.attackDiceCounts = Array.from(previousState.attackDiceCounts);
            this.defenceDiceCounts = Array.from(previousState.defenceDiceCounts);
        }
    }

    territoriesWon: number = 0;
    territoriesLost: number = 0;

    attacks: number = 0;
    defends: number = 0;

    wins: number = 0;
    losses: number = 0;

    attackDiceCounts = (new Array(6)).fill(0, 0, 6);
    defenceDiceCounts = (new Array(6)).fill(0, 0, 6);
}

export class TerritoryState {

    constructor(previousState?: TerritoryState) {
        if (previousState) {
            this.controlledBy = previousState.controlledBy;
            this.unitCount = previousState.unitCount;
        }
    }

    controlledBy: Player | undefined;
    unitCount: number = 0;

}

export class GameState {

    constructor(move: GameMove, previousState?: GameState) {

        // Copy in the previous state...
        previousState?.territoryStates.forEach((state, territory) => {
            this.territoryStates.set(territory, new TerritoryState(state));
        })
        previousState?.playerStates.forEach((state, player) => {
            this.playerStates.set(player, new PlayerState(state));
        })

        this.previousState = previousState;
        this.move = move;
    }

    readonly previousState: GameState;
    readonly move: GameMove;

    readonly territoryStates = new Map<Territory, TerritoryState>();
    readonly playerStates = new Map<Player, PlayerState>();

    getTerritoryState(territory: Territory): TerritoryState {
        if (!this.territoryStates.has(territory)) {
            this.territoryStates.set(territory, new TerritoryState());
        }
        return this.territoryStates.get(territory);
    }

    getPlayerState(player: Player): PlayerState {
        if (!this.playerStates.has(player)) {
            this.playerStates.set(player, new PlayerState());
        }
        return this.playerStates.get(player);
    }
}
