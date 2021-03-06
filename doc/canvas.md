tabris.js canvas
================

Canvas is a composite which allows the user to draw on it using a canvas context. Canvas context provides a drawing API. It is a subset of the HTML5 CanvasRenderingContext2D.

To create the canvas context, invoke the following method:

```javascript
tabris.getContext(canvas, width, height);
```

* canvas - the canvas composite
* width - the width of the drawable area
* height - the height of the drawable area

*Pre-Release Note: This method will likely be moved to the canvas itself.*

The following CanvasRenderingContext2D methods are supported:

* save
* restore
* beginPath
* closePath
* lineTo
* moveTo
* bezierCurveTo
* quadraticCurveTo
* rect
* arc
* scale
* rotate
* translate
* transform
* setTransform
* clearRect
* fillRect
* strokeRect
* fillText
* strokeText
* fill
* stroke
* measureText

Supported properties:

* lineWidth
* lineCap
* lineJoin
* fillStyle
* strokeStyle
* textAlign
* textBaseline
