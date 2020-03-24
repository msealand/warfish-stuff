// Copied from https://gist.github.com/mjackson/5311255, then modified
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    r = (r / 255.0);
    g = (g / 255.0);
    b = (b / 255.0);
  
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2.0;
  
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = (d == 0) ? 0 : d / (1.0 - Math.abs(2.0 * l - 1.0));
  
        switch (max) {
            case r: h = ((g - b) / d) % 6.0; break;
            case g: h = ((b - r) / d) + 2.0; break;
            case b: h = ((r - g) / d) + 4.0; break;
        }
  
        h = h * 60.0;
        if (h < 0) h += 360.0;
    }
  
    return { h, s, l };
}


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

    hsl(): { h: number, s: number, l: number } {
        const hsl = rgbToHsl(this.red, this.green, this.blue);

        // console.log(`(${this.red}, ${this.green}, ${this.blue}) -> (${hsl.h}, ${hsl.s}, ${hsl.l})`);

        return hsl;
    }

    cssRGBColor(): string {
        return `rgb(${this.red},${this.green},${this.blue})`;
    }

    cssHSLColor(): string {
        const { h, s, l } = this.hsl();
        return `hsl(${h},${s},${l})`;
    }
}
