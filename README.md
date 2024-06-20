# D3 Funnel Graph 

![WIP](https://img.shields.io/badge/WIP-red) &nbsp; **This README is WIP and will be updated with all the latest config and features**

Funnel Graph JS is a library for generating a funnel chart. It generates an SVG chart, adds labels, legend and other info.
Some of the features include generating horizontal and vertical funnel charts, applying solid colors and gradients,
possibility to generate a two-dimensional funnel chart. 

This is a fork from the original funnel-graph-js initiated by greghub.  
The project was refactor and most of its code changed using [D3 JS](https://d3js.org/)  
The only part that was preserved was the way greghub created the graph's paths for the two dimention.  
The entire way of displaying this Funnel is using SVG elemenets and not combining HTML and SVG.   
The main reason is to have a single responsive element that can be dynamically updated and resized w/o the need of recreating the graph.  
Tooltip and clickable areas with transition added to the graph.   

[![Demo](https://i.imgur.com/3Zw9m2l.jpg)](https://codepen.io/arik-test/pen/KKLZrVe)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Methods](#methods)

## Installation

You can get the code by installing the NPM package, loading files from a CDN or downloading the repo. 

#### NPM

Run the following script to install:
```
npm i funnel-graph-js
```

#### CDN

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/lastboy/funnel-graph-js@master/dist/css/funnel-graph.min.css">

<script src="https://cdn.jsdelivr.net/gh/lastboy/funnel-graph-js@master/dist/js/funnel-graph.min.js"></script>
```

#### Download

Download the repo ZIP, add `funnel-graph.js` or `funnel-graph.min.js`, and `funnel-graph.min.css`.
Or you can integrate the scss folder with your application

The chart is a SVG element and `colors` property of the options controls the colors of the chart.

CSS:
```html
<link rel="stylesheet" type="text/css" href="../dist/css/funnel-graph.min.css">
```

SCSS:
```
@import "d3-funnel-graph/dist/css/variables.scss"
@import "d3-funnel-graph/dist/css/d3.scss"
```

JS:
```html
<script src="../dist/js/funnel-graph.min.js"></script>
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
