import { Component, OnInit } from '@angular/core';

import 'fabric';
import { ApiService } from './api.service';
import { Figure } from './figure.model'
declare const fabric: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  private figures:Figure[];
  private canvas: any;
  private props: any = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ''
  };

  private textString: string;
  private url: string = '';
  private size: any = {
    width: 500,
    height: 600
  };

  private json: any;
  private globalEditor: boolean = false;
  private figureEditor: boolean = false;
  private selected: any;

  constructor(private apiServe: ApiService) { }

  ngOnInit() {

    //setup front side canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue'
    });


    this.canvas.on({
      'object:moving': (e) => { },
      'object:modified': (e) => { },
      'object:selected': (e) => {

        let selectedObject = e.target;
        this.selected = selectedObject
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        // selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

        this.resetPanels();

        if (selectedObject.type !== 'group' && selectedObject) {

          this.getId();
          this.getOpacity();

          switch (selectedObject.type) {
            case 'rect':
            case 'circle':
            case 'triangle':
              this.figureEditor = true;
              this.getFill();
              break;
          }
        }
      },
      'selection:cleared': (e) => {
        this.selected = null;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // get references to the html canvas element & its context
    // this.canvas.on('mouse:down', (e) => {
    // let canvasElement: any = document.getElementById('canvas');
    // console.log(canvasElement)
    // });
    this.getFigures();
  }

  getFigures() {
    this.apiServe.getFigures().subscribe(
      res =>{
        this.figures = [...res];
        //console.log(this.figures);
        this.addFiguresToCanvas(this.figures);
      },
      err =>{
        console.log(err);
      }
    );
  }

  createFigure(figure:Figure) {
    this.apiServe.createFigure(figure).subscribe(
      res=>{
        let newFigure:Figure = { ...res };
        this.figures.push( newFigure );
        this.FigureAdd( newFigure );
      },
      err =>{
        console.log(err);
      }
    )
  }

  updateFigure(figure:any) {

    let selFigure:Figure = this.figures.find( f => f.id = figure.id );
    let updateFigure: Figure = new Figure({
        id:figure.id, 
        type:figure.type, 
        top:figure.top, 
        left:figure.left, 
        width: figure.width, 
        height:figure.height, 
        angle: figure.angle, 
        color: figure.fill,
        opacity:figure.opacity * 100});

    this.apiServe.updateFigure(updateFigure).subscribe(
      res=>{
        selFigure = updateFigure;   
      },
      err =>{
        console.log(err);
      }
    )
  }
  
  deleteFigure(activeObject:any) {
    this.apiServe.removeFigure(activeObject.id).subscribe(
      res=>{
        let index = this.figures.findIndex( f => f.id == activeObject.id );
        this.figures.splice(index, 1);
        this.canvas.remove( activeObject );
      },
      err =>{
        console.log(err);
      }
    )
  }
  /*------------------------Block elements------------------------*/

  //Block "Size"

  changeSize(event: any) {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }


  addFiguresToCanvas(figures:Figure[]){
    figures.forEach( figure =>{
      this.FigureAdd( figure );
      //console.log(figure);
    });
  }
  FigureAdd(figure:Figure){
    let add: any;

    switch (figure.type){
      case 'rect':     
        add = new fabric.Rect({
          id: figure.id,
          width: figure.width, 
          height: figure.height, 
          left: figure.left, 
          top: figure.top, 
          angle: figure.angle,
          fill: figure.color,
          opacity: figure.opacity / 100.0
        });    
        break;
      case 'triangle':
        add = new fabric.Triangle({
          id: figure.id,          
          width: figure.width, 
          height: figure.height, 
          left: figure.left, 
          top: figure.top, 
          angle: figure.angle,
          fill: figure.color,
          opacity: figure.opacity / 100.0
        });        
        break;
      case 'circle':
        add = new fabric.Circle({
          id: figure.id,
          radius: figure.width / 2,          
          width: figure.width,
          height: figure.height, 
          left: figure.left, 
          top: figure.top, 
          angle: figure.angle,
          fill: figure.color,
          opacity: figure.opacity /100.0
        });      
        break;
    }
    //console.log(add);
    add.lockScalingX = true;
    add.lockScalingY = true;

    this.extend(add, figure.id);
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
    add.on('mouseup',      this.figureChanged.bind(this, add));
  }

  figureChanged(figure){
    this.updateFigure( figure );
  }


  //Block "Add figure"
  addFigure(figureType) {
    let newFigure = new Figure({type:figureType});
    this.createFigure( newFigure );
  }

  /*Canvas*/

  cleanSelect() {
    this.canvas.deactivateAllWithDispatch().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.deactivateAllWithDispatch().renderAll();
    this.canvas.setActiveObject(obj);
  }

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  /*------------------------Global actions for element------------------------*/

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return '';

    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  }


  setActiveStyle(styleName, value, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return;

    if (object.setSelectionStyles && object.isEditing) {
      var style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    }
    else {
      object.set(styleName, value);
    }
    //console.log(object);
    this.updateFigure(object);
    object.setCoords();
    this.canvas.renderAll();
  }


  getActiveProp(name) {
    var object = this.canvas.getActiveObject();
    if (!object) return '';

    return object[name] || '';
  }

  setActiveProp(name, value) {
    var object = this.canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  clone() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'rect':
          clone = new fabric.Rect(activeObject.toObject());
          break;
        case 'circle':
          clone = new fabric.Circle(activeObject.toObject());
          break;
        case 'triangle':
          clone = new fabric.Triangle(activeObject.toObject());
          break;
      }
      if (clone) {
        clone.set({ left: 10, top: 10 });

        let newFigure = new Figure({
          type:activeObject.type, 
          top:10, 
          left:10, 
          width: activeObject.width, 
          height:activeObject.height, 
          angle: activeObject.angle, 
          color: activeObject.fill,
          opacity:activeObject.opacity * 100});
        
        this.createFigure( newFigure );
        //console.log(newFigure);
        //this.canvas.add(clone);
        //this.selectItemAfterAdded(clone);
      }
    }
  }

  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    let val = this.props.id;
    let complete = this.canvas.getActiveObject().toObject();
    //console.log(complete);
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  setFill() {
    this.setActiveStyle('fill', this.props.fill, null);
  }

  /*System*/

  removeSelected() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();
    //console.log(activeObject);
    //console.log(activeGroup);
    if (activeObject) {
      this.deleteFigure( activeObject );
    } 
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      let self = this;
      objectsInGroup.forEach(function (object) {
        self.canvas.remove(object);
      });
    }
  }

  resetPanels() {
    this.figureEditor = false;
  }

}
