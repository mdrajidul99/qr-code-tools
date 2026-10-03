declare module 'bwip-js' {
  export interface ToCanvasOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textxalign?: 'left' | 'center' | 'right' | 'justify' | 'off';
    textyalign?: 'below' | 'above' | 'center' | 'off';
    textsize?: number;
    textcolor?: string;
    barcolor?: string;
    backgroundcolor?: string;
    paddingwidth?: number;
    paddingheight?: number;
    paddingtop?: number;
    paddingleft?: number;
    paddingright?: number;
    paddingbottom?: number;
    rotate?: 'N' | 'R' | 'L' | 'I';
    [key: string]: any;
  }

  export interface ToSvgOptions extends ToCanvasOptions {}

  export function toCanvas(
    canvas: HTMLCanvasElement | string,
    opts: ToCanvasOptions,
    callback?: (err?: Error, cvs?: HTMLCanvasElement) => void
  ): HTMLCanvasElement;

  export function toSVG(opts: ToSvgOptions): string;

  const bwipjs: {
    toCanvas: typeof toCanvas;
    toSVG: typeof toSVG;
  };

  export default bwipjs;
}
