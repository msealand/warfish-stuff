import { Game, Territory } from "./game";

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
    CreateNewGame = "m",
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

export function actionToString(action: GameAction): string {
    switch (action) {
        case GameAction.Attack: return "Attack";
        case GameAction.EliminatePlayerBonusUnits: return "Eliminate Player Bonus Units";
        case GameAction.CaptureTerritory: return "Capture Territory";
        case GameAction.DeclineToJoinAGame: return "Decline To Join A Game";
        case GameAction.EliminatePlayer: return "Eliminate Player";
        case GameAction.Transfer: return "Transfer";
        case GameAction.AwardedCard: return "Awarded Card";
        case GameAction.CaptureCards: return "Capture Cards";
        case GameAction.CaptureReserveUnits: return "Capture Reserve Units";
        case GameAction.JoinGame: return "Join Game";
        case GameAction.SeatOrderForBlindAtOnceRound: return "Seat Order For Blind At Once Round";
        case GameAction.BlindTerritorySelect: return "Blind Territory Select";
        case GameAction.Message: return "Message";
        case GameAction.CreateNewGame: return "Create New Game";
        case GameAction.AssignSeatPosition: return "Assign Seat Position";
        case GameAction.PlaceUnit: return "Place Unit";
        case GameAction.BlindAtOnceTransfer: return "Blind At Once Transfer";
        case GameAction.ReshuffleCards: return "Reshuffle Cards";
        case GameAction.StartGame: return "Start Game";
        case GameAction.SelectTerritory: return "Select Territory";
        case GameAction.UseCards: return "Use Cards";
        case GameAction.BlindAtOnceAttack: return "Blind At Once Attack";
        case GameAction.Win: return "Win";
        case GameAction.TerritorySelectedAsNeutral: return "Territory Selected As Neutral";
        case GameAction.BonusUnits: return "Bonus Units";
        case GameAction.Surrender: return "Surrender";
        case GameAction.Booted: return "Booted";
        case GameAction.GameTerminated: return "Game Terminated";
        case GameAction.TeamWin: return "Team Win";
        default: return "Unknown";
    }
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
        }
    }

    constructor(data: any, game: Game) {
        this.date = new Date(data.t * 1000);
    }

    readonly action: GameAction;
    readonly date: Date;
}

class GameMoveAttack extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.defenderDice = data.dd.split(',').map(Number);
        this.defenderLosses = Number(data.dl);

        this.attackerDice = data.ad.split(',').map(Number);
        this.attackerLosses = Number(data.al);

        this.fromTerritory = game.map.territories.get(data.fcid);
        this.toTerritory = game.map.territories.get(data.tcid);
    }

    readonly defenderDice: Array<number>;
    readonly defenderLosses: number;

    readonly attackerDice: Array<number>;
    readonly attackerLosses: number;

    readonly fromTerritory: Territory;
    readonly toTerritory: Territory;
}
class GameMoveEliminatePlayerBonusUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveCaptureTerritory extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveDeclineToJoinAGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveEliminatePlayer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveTransfer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);

        this.units = Number(data.num);

        this.fromTerritory = game.map.territories.get(data.fcid);
        this.toTerritory = game.map.territories.get(data.tcid);
    }

    readonly units: number;

    readonly fromTerritory: Territory;
    readonly toTerritory: Territory;
}
class GameMoveAwardedCard extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveCaptureCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveCaptureReserveUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveJoinGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveSeatOrderForBlindAtOnceRound extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveBlindTerritorySelect extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveMessage extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveCreateNewGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveAssignSeatPosition extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMovePlaceUnit extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveBlindAtOnceTransfer extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveReshuffleCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveStartGame extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveSelectTerritory extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveUseCards extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveBlindAtOnceAttack extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveWin extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveTerritorySelectedAsNeutral extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveBonusUnits extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveSurrender extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveBooted extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveGameTerminated extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
class GameMoveTeamWin extends GameMove { 
    constructor(data: any, game: Game) {
        super(data, game);
    }
}
