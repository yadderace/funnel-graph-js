# D3 Funnel Graph 

![npm](https://img.shields.io/npm/v/d3-funnel-graph.svg)
![GitHub file size in bytes](https://img.shields.io/github/size/lastboy/funnel-graph-js/dist/js/funnel-graph.min.js.svg)
![GitHub](https://img.shields.io/github/license/lastboy/funnel-graph-js.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/lastboy/funnel-graph-js.svg)

Funnel Graph JS is a library for generating funnel charts using SVG, utilizing [D3 JS](https://d3js.org/)  
It supports horizontal and vertical funnel charts, offers options for solid colors and gradients, and can generate two-dimensional funnel charts.


This project is a fork of the [funnel-graph-js](https://github.com/greghub/funnel-graph-js) project initiated by greghub. It has been entirely refactored using [D3.js](https://d3js.org/), although the core code that creates the paths remains unchanged.   
The funnel graph is created as a single SVG unit, without combining any HTML elements except for the tooltip. This approach ensures a single responsive graph that can be dynamically updated and resized without needing to recreate the graph.   

New features have been added:  
* No need to recreate the graph on update
* Responsive graph including the text informations and dividers
* Text information can be displayed or hidden
* Tooltip over each area path
* Clickable areas with configurable callbacks
  
[![Demo](https://i.imgur.com/mmb1xCr.gif)](https://codepen.io/arik-test/pen/KKLZrVe)

## Vue support 
There's no need to use the Vue in specific project: [vue-funnel-graph-js](https://github.com/greghub/vue-funnel-graph-js)  
This project is using dynamic data and configuration updates. It is very simple to integrate with any FE JS framework.

Vue2 Example: https://codepen.io/arik-test/pen/qBGYjyG

## Installation

```
npm i d3-funnel-graph
```

JS ES6+:
```js
import FunnelGraph from 'd3-funnel-graph';
// or import "d3-funnel-graph/dist/css/funnel-graph.min.css"
```

SCSS:
```
@import "d3-funnel-graph/dist/scss/variables.scss"
@import "d3-funnel-graph/dist/scss/d3.scss"
```

## Usage

```js
var graph = new FunnelGraph({
    container: '.funnel',
    gradientDirection: 'horizontal',
    data: {...},
    displayPercent: true,
    direction: 'horizontal'
});

graph.draw();
// use graph.destroy() for cleanup
```

## FunnelGraph Class Configuration

* **container** selector name (e.g. ".selector")
* **width** of the chart in pixels (e.g. 600)
* **height** of the chart in pixels(e.g. 400)
* **labels** to be displayed on each section (e.g ['Impressions', ...])
* [TBD] **subLabels** to used in the tooltip for two dimentions chart (e.g. ['Direct', ...])
* **colors** overrides the defaults [ ['#000', ... ], ]
* **values** of the graph (e.g. [ [3500, ...], ])
* **margin** for the info text (e.g { ?top, ?right, ?bottom, ?left, text })
* **gradientDirection** ('vertical' | 'horizontal')
* **callbacks** of the user actions 
        * on path click ( e.g. { 'click': () => {} } )
* **displayPercent** should be displayed  [true | false],
* **details** should be displayed [ true | false ]
* **tooltip** should be displayed [ true | false ]

## Updatable FunnelGraph configuration
* width
* height
* margin
* values
* labels
* subLabels
* colors
* details
* tooltip


## Other Download and Import Options

Go to the code section of the repository and download the ZIP file.    
Then, Use the provided resources according to your environment. You can use them directly in plain HTML or by importing (ES6+) them into your project.

CDN:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/lastboy/funnel-graph-js@master/dist/css/funnel-graph.min.css">

<script src="https://cdn.jsdelivr.net/gh/lastboy/funnel-graph-js@master/dist/js/funnel-graph.min.js"></script>
```

CSS:
```html
<link rel="stylesheet" type="text/css" href="../dist/css/funnel-graph.min.css">
```

JS:
```html
<script src="../dist/js/funnel-graph.min.js"></script>
```