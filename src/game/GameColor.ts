export class GameColor {
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.red = Number(data.red);
        this.green = Number(data.green);
        this.blue = Number(data.blue);
    }
    readonly id: string;
    readonly name: string;
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    cssColor(): string {
        return `rgb(${this.red},${this.green},${this.blue})`;
    }
}
