export class Figure {
    id: number;
    type: string;
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    color: string;
    opacity: number;
    
    constructor(figure) {
        {
            this.id = figure.id || 0;
            this.type = figure.type || 'rectangle';
            this.left = figure.left || 10;
            this.top = figure.top || 10;
            this.width = figure.width || 200;
            this.height = figure.height || 200;
            this.angle = figure.angle || 0;
            this.color = figure.color || '#00FFFF';
            this.opacity = figure.opacity || 100;
        }
    }    
}
  