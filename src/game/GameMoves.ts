import { Game } from "./Game";
import { Player } from "./Player";
import { Territory } from "./Territory";
import { GameState } from "./GameState";

export enum GameAction {
    Attack = "a",
    EliminatePlayerBonusUnits = "b",
    CaptureTerritory = "c",
    DeclineToJoinAGame = "d",
    EliminatePlayer = "e",
    Transfer =  "f",
    AwardedCard = "g",
    CaptureCards = "h",
    CaptureReserveUnits = "i",
    JoinGame = "j",
    SeatOrderForBlindAtOnceRound = "k",
    BlindTerritorySelect = "l",
    Message = "m",
    CreateNewGame = "n",
    AssignSeatPosition = "o",
    PlaceUnit = "p",
    BlindAtOnceTransfer = "q",
    ReshuffleCards = "r",
    StartGame = "s",
    SelectTerritory = "t",
    UseCards = "u",
    BlindAtOnceAttack = "v",
    Win = "w",
    TerritorySelectedAsNeutral = "y",
    BonusUnits = "z",
    Surrender = "sr",
    Booted = "bt",
    GameTerminated = "tg",
    TeamWin = "tw"
}

export class GameMove {

    static FromData(data: any, game: Game): GameMove {
        const action = data.a as GameAction;
        switch (action) {
            case GameAction.Attack: return new GameMoveAttack(data, game);
            case GameAction.EliminatePlayerBonusUnits: return new GameMoveEliminatePlayerBonusUnits(data, game);
            case GameAction.CaptureTerritory: return new GameMoveCaptureTerritory(data, game);
            case GameAction.DeclineToJoinAGame: return new GameMoveDeclineToJoinAGame(data, game);
            case GameAction.EliminatePlayer: return new GameMoveEliminatePlayer(data, game);
            case GameAction.Transfer: return new GameMoveTransfer(data, game);
            case GameAction.AwardedCard: return new GameMoveAwardedCard(data, game);
            case GameAction.CaptureCards: return new GameMoveCaptureCards(data, game);
            case GameAction.CaptureReserveUnits: return new GameMoveCaptureReserveUnits(data, game);
            case GameAction.JoinGame: return new GameMoveJoinGame(data, game);
            case GameAction.SeatOrderForBlindAtOnceRound: return new GameMoveSeatOrderForBlindAtOnceRound(data, game);
            case GameAction.BlindTerritorySelect: return new GameMoveBlindTerritorySelect(data, game);
            case GameAction.Message: return new GameMoveMessage(data, game);
            case GameAction.CreateNewGame: return new GameMoveCreateNewGame(data, game);
            case GameAction.AssignSeatPosition: return new GameMoveAssignSeatPosition(data, game);
            case GameAction.PlaceUnit: return new GameMovePlaceUnit(data, game);
            case GameAction.BlindAtOnceTransfer: return new GameMoveBlindAtOnceTransfer(data, game);
            case GameAction.ReshuffleCards: return new GameMoveReshuffleCards(data, game);
            case GameAction.StartGame: return new GameMoveStartGame(data, game);
            case GameAction.SelectTerritory: return new GameMoveSelectTerritory(data, game);
            case GameAction.UseCards: return new GameMoveUseCards(data, game);
            case GameAction.BlindAtOnceAttack: return new GameMoveBlindAtOnceAttack(data, game);
            case GameAction.Win: return new GameMoveWin(data, game);
            case GameAction.TerritorySelectedAsNeutral: return new GameMoveTerritorySelectedAsNeutral(data, game);
            case GameAction.BonusUnits: return new GameMoveBonusUnits(data, game);
            case GameAction.Surrender: return new GameMoveSurrender(data, game);
            case GameAction.Booted: return new GameMoveBooted(data, game);
            case GameAction.GameTerminated: return new GameMoveGameTerminated(data, game);
            case GameAction.TeamWin: return new GameMoveTeamWin(data, game);
            default: { console.log(`Unknown move`); console.dir(data); }
        }
    }

    constructor(data: any, game: Game) {
        Object.assign(this, data);

        this.id = data.id;
        this.date = new Date(data.t * 1000);
    }

    readonly id: string;

    readonly action: GameAction;
    readonly date: Date;

    description(): string {
        return `${this.constructor.name} ${JSON.stringify(this)}`;
    }

    apply(previousSate?: GameState): GameState { 
        return new GameState(this, previousSate);
    }
}

export class GameMoveAttack extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.defender = game.players.get(data.ds);
        this.defenderDice = data.dd.split(',').map(Number);
        this.defenderUnits = this.defenderDice.length // <-- really?
        this.defenderLosses = Number(data.dl);

        this.attacker = game.players.get(data.s);
        this.attackerDice = data.ad.split(',').map(Number);
        this.attackerUnits = this.attackerDice.length; // <-- really?
        this.attackerLosses = Number(data.al);

        this.fromTerritory = game.map.territories.get(data.fcid);
        this.toTerritory = game.map.territories.get(data.tcid);
        
        // console.log(this.constructor.name);
        // console.dir(data, { depth: null });
    }

    readonly defender: Player;
    readonly defenderDice: Array<number>;
    readonly defenderUnits: number;
    readonly defenderLosses: number;

    readonly attacker: Player;
    readonly attackerDice: Array<number>;
    readonly attackerUnits: number;
    readonly attackerLosses: number;

    readonly fromTerritory: Territory;
    readonly toTerritory: Territory;

    description(): string {
        return `${this.attacker?.name} attcked ${this.defender?.name ?? "Neutral Territory"} with ${this.attackerUnits} units (${this.toTerritory?.name} -> ${this.fromTerritory?.name})
${this.attacker?.name} lost ${this.attackerLosses} units
${this.defender?.name ?? "Neutral Territory"} lost ${this.defenderLosses} units`
    }

    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const fromTerritoryState = newGameState.getTerritoryState(this.fromTerritory);
        fromTerritoryState.unitCount -= this.attackerLosses;

        const toTerritoryState = newGameState.getTerritoryState(this.toTerritory);
        toTerritoryState.unitCount -= this.defenderLosses;

        if (toTerritoryState.unitCount == 0) {
            toTerritoryState.controlledBy = this.attacker;

            const unitsToTransfer = (this.attackerUnits - this.attackerLosses);
            toTerritoryState.unitCount = unitsToTransfer;
            fromTerritoryState.unitCount -= unitsToTransfer;
        }

        const attackerState = newGameState.getPlayerState(this.attacker);
        attackerState.attacks += this.attackerUnits;
        attackerState.losses += this.attackerLosses;
        attackerState.wins += this.defenderLosses;
        this.attackerDice.forEach((d) => {
            attackerState.attackDiceCounts[d-1]++;
        })
        attackerState.attackedPlayer.set(this.defender, (attackerState.attackedPlayer.get(this.defender) ?? 0) + 1);

        const defenderState = newGameState.getPlayerState(this.defender);
        defenderState.defends += this.defenderUnits;
        defenderState.losses += this.defenderLosses;
        defenderState.wins += this.attackerLosses;
        this.defenderDice.forEach((d) => {
            defenderState.defenceDiceCounts[d-1]++;
        })

        return newGameState;
    }
}

export class GameMoveEliminatePlayerBonusUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveCaptureTerritory extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.attacker = game.players.get(data.s);
        this.defender = game.players.get(data.ds);
        this.capturedTerritory = game.map.territories.get(data.cid);
    }

    readonly attacker: Player;
    readonly defender: Player;

    readonly capturedTerritory: Territory

    description(): string {
        return `${this.attacker?.name} captured ${this.capturedTerritory?.name} from ${this.defender?.name}`;
    }

    // Unit transfer happens in the attack move
    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const fromTerritoryState = newGameState.getTerritoryState(this.capturedTerritory);
        fromTerritoryState.controlledBy = this.attacker;
        
        const attackerState = newGameState.getPlayerState(this.attacker);
        attackerState.territoriesWon++;

        const defenderState = newGameState.getPlayerState(this.defender);
        defenderState.territoriesLost++;

        return newGameState;
    }
}

export class GameMoveDeclineToJoinAGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveEliminatePlayer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.attacker = game.players.get(data.s);
        this.defender = game.players.get(data.es);
    }

    readonly attacker: Player;
    readonly defender: Player;

    description(): string {
        return `${this.attacker?.name} eliminated ${this.defender?.name}`;
    }
}

export class GameMoveTransfer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.units = Number(data.num);

        this.fromTerritory = game.map.territories.get(data.fcid);
        this.toTerritory = game.map.territories.get(data.tcid);
    }

    readonly player: Player;
    readonly units: number;

    readonly fromTerritory: Territory;
    readonly toTerritory: Territory;

    description(): string {
        return `${this.player?.name} transfered ${this.units} from ${this.fromTerritory?.name} to ${this.toTerritory?.name}`;
    }

    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const fromTerritoryState = newGameState.getTerritoryState(this.fromTerritory);
        fromTerritoryState.unitCount -= this.units;

        const toTerritoryState = newGameState.getTerritoryState(this.toTerritory);
        toTerritoryState.unitCount += this.units;

        return newGameState;
    }
}

export class GameMoveAwardedCard extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
    }

    readonly player: Player;

    description(): string {
        return `${this.player?.name} was awarded a card`;
    }
}

export class GameMoveCaptureCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.attacker = game.players.get(data.s);
        this.defender = game.players.get(data.ds);
        this.cardsCapturedCount = Number(data.num);
    }

    readonly attacker: Player;
    readonly defender: Player;

    readonly cardsCapturedCount: number;

    description(): string {
        return `${this.attacker?.name} captured ${this.cardsCapturedCount} cards from ${this.defender?.name}`;
    }

}

export class GameMoveCaptureReserveUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveJoinGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
    }

    readonly player: Player;

    description(): string {
        return `${this.player?.name} joined`;
    }
}

export class GameMoveSeatOrderForBlindAtOnceRound extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveBlindTerritorySelect extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveMessage extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.message = data._content;
    }

    readonly player: Player
    readonly message: string

    description(): string {
        return `${this.player?.name} post message "${this.message}"`
    }
}

export class GameMoveCreateNewGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveAssignSeatPosition extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.position = Number(data.s);
    }

    readonly player: Player;
    readonly position: number;

    description(): string {
        return `${this.player?.name} is in position ${this.position}`;
    }
}

export class GameMovePlaceUnit extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.territory = game.map.territories.get(data.cid);
        this.units = Number(data.num);
    }

    readonly player: Player;
    readonly territory: Territory;
    readonly units: number;

    description(): string {
        return `${this.player?.name} placed ${this.units} units on ${this.territory?.name}`
    }   
    
    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const territoryState = newGameState.getTerritoryState(this.territory);
        territoryState.unitCount += this.units;

        return newGameState;
    }
}

export class GameMoveBlindAtOnceTransfer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveReshuffleCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }

    description(): string {
        return `cards re-shuffled`
    }
}

export class GameMoveStartGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }

    description(): string {
        return `start game`;
    }
}

export class GameMoveSelectTerritory extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.territory = game.map.territories.get(data.cid);
    }

    readonly player: Player;
    readonly territory: Territory;

    description(): string {
        return `${this.player?.name} selected ${this.territory?.name}`
    }

    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const territoryState = newGameState.getTerritoryState(this.territory);
        territoryState.controlledBy = this.player;
        territoryState.unitCount = 1;

        return newGameState;
    }
}

export class GameMoveUseCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.units = Number(data.num);
    }

    readonly player: Player;
    readonly units: number;

    description(): string {
        return `${this.player?.name} used cards and received ${this.units} units`;
    }
}

export class GameMoveBlindAtOnceAttack extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveWin extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.winner = game.players.get(data.s);
    }

    readonly winner: Player;

    description(): string {
        return `${this.winner?.name} won`;
    }
}

export class GameMoveTerritorySelectedAsNeutral extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.territory = game.map.territories.get(data.cid);
    }

    readonly territory: Territory

    description(): string {
        return `${this.territory?.name} is neutral territory`
    }

    apply(previousSate?: GameState): GameState { 
        const newGameState = super.apply(previousSate);

        const territoryState = newGameState.getTerritoryState(this.territory);
        territoryState.unitCount = 3;

        return newGameState;
    }
}

export class GameMoveBonusUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.player = game.players.get(data.s);
        this.units = Number(data.num);
    }

    readonly player: Player;
    readonly units: number;

    description(): string {
        return `${this.player.name} was awarded ${this.units} units`
    }
}

export class GameMoveSurrender extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveBooted extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveGameTerminated extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}

export class GameMoveTeamWin extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
