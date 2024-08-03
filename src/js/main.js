/* eslint-disable no-trailing-spaces */
/* global HTMLElement */
import { roundPoint, formatNumber } from './number';
import { getDefaultColors } from './colors';
import { getCrossAxisPoints, getPathDefinitions } from './path'
import { createRootSVG, updateRootSVG, getContainer, drawPaths, gradientMakeVertical, gradientMakeHorizontal, drawInfo, destroySVG, getRootSvg } from './d3'
import { nanoid } from 'nanoid';
import { normalizeArray } from "./utils"

/**
 * Funnel graph class
 * 
 * @param options {
 * 
 *      container: '.selector'
 *      width: ...
 *      height: ...
 *      labels: ['Impressions', ...],
 *      subLabels: ['Direct', ...],
 *      colors: [
 *          ['#000', ...
 *      ],
 *      values: [
 *          [3500, ...
 *      ],
 *      displayPercent: false,
 *      margin: { ?top, ?right, ?bottom, ?left, text },
 *      gradientDirection: 'vertical',
 *      callbacks: {
 *          'click': () => {}
 *      }
 *      details: false
 *      tooltip: true,
 *      responsive: false
 * }
 *  TODO: outlines: for two dimensions graph display
 */
class FunnelGraph {
    constructor(options) {

        this.id = this.generateId(),
            this.containerSelector = options.container;
        this.gradientDirection = (options.gradientDirection && options.gradientDirection === 'vertical')
            ? 'vertical'
            : 'horizontal';
            
        const availablePctModes = ['max', 'previous', 'first'];
        this.setPctMode((options.hasOwnProperty("pctMode") && availablePctModes.includes(options.pctMode)) 
            ? options.pctMode 
            : 'max');
        this.setResponsive(options.hasOwnProperty("responsive") ? options.responsive : false);
        this.setDetails(options.hasOwnProperty('details') ? options.details : true);
        this.setTooltip(options.hasOwnProperty('tooltip') ? options.tooltip : true);
        this.setDirection((options.hasOwnProperty('direction') && options.direction === 'horizontal') 
            ? 'horizontal' 
            : 'vertical');
        this.setValues(options?.data?.values || []);
        this.setLabels(options?.data?.labels || []);
        this.setSubLabels(options?.data?.subLabels || []);
        this.percentages = this.createPercentages();
        this.colors = options?.data?.colors || getDefaultColors(this.is2d() ? this.getSubDataSize() : 2);
        this.displayPercent = options.displayPercent || false;

        // Defining colors
        this.setBackgroundColor(this.validateHexColor(options.backgroundColor) ? options.backgroundColor : 'transparent');
        this.setTitleColor(this.validateHexColor(options.titleColor) ? options.titleColor : '#05df9d');
        this.setLabelColor(this.validateHexColor(options.labelColor) ? options.labelColor : '#ffffff');
        this.setPercentageColor(this.validateHexColor(options.percentageColor) ? options.percentageColor : '#9896dc');
        
        this.margin = { top: 120, right: 60, bottom: 60, left: 60, text: 10 };
        this.setMargin(options?.margin);

        let height = options.height || getContainer(this.containerSelector).clientHeight;
        let width = options.width || getContainer(this.containerSelector).clientWidth;

        this.callbacks = options?.callbacks;

        this.height = height;
        this.width = width;

        this.origHeight = height;
        this.origWidth = width;

        this.subLabelValue = options.subLabelValue || 'percent';

        if (this.isVertical()) {
            this.makeVertical(true);
        } else {
            this.makeHorizontal(true)
        }

        /**
         * Helper for the dividers location 
         * Main use for the tooltip sections over the paths 
         */ 
        this.linePositions = [];
    }

    validateHexColor(hex) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    }

    destroy() {
        const destroy = destroySVG({ context: this.getContext() });
        if (destroy) {
            destroy();
        }
    }

    getId() {
        return this.id;
    }

    showTooltip() {
        return this.tooltip;
    }

    showDetails() {
        return this.details;
    }

    showPctMode() {
        return this.pctMode;
    }

    getContainerSelector(){
        return this.containerSelector;
    }

    generateId() {
        return `id_${nanoid()}`;
    }

    getColors() {
        return this.colors;
    }

    getGradientDirection() {
        return this.gradientDirection;
    }

    getDirection(direction) {
        if (!direction || (direction && direction !== 'horizontal' && direction !== 'vertical')) {
            return 'horizontal';
        }

        return direction;
    }

    getGraphType() {
        return this.values && this.values[0] instanceof Array ? '2d' : 'normal';
    }

    is2d() {
        return this.getGraphType() === '2d';
    }

    isVertical() {
        return this.direction === 'vertical';
    }

    setDirection(d) {
        this.direction = d;
    }

    setHeight(h) {
        this.height = h;

    }

    setWidth(w) {
        this.width = w;
    }

    setTooltip(bool) {
        this.tooltip = bool;
    }

    setDetails(bool) {
        this.details = bool;
    }

    setPctMode(mode) {
        this.pctMode = mode;
    }

    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    getBackgroundColor() {
        return this.backgroundColor;
    }

    setTitleColor(titleColor) {
        this.titleColor = titleColor;
    }

    getTitleColor() {
        return this.titleColor;
    }

    setLabelColor(labelColor) {
        this.labelColor = labelColor;
    }

    getLabelColor() {
        return this.labelColor;
    }

    setPercentageColor(percentageColor) {
        this.percentageColor = percentageColor;
    }

    getPercentageColor() {
        return this.percentageColor;
    }

    /**
     * Get the graph width
     * 
     * @param {*} margin included if true or else return the original width
     * @returns 
     */
    getWidth(margin = true) {
        const width = margin ? (this.margin.left + this.margin.right) : 0;
        return this.width + width;
    }

    /**
     * Get the graph height
     * 
     * @param {*} margin included if true or else return the original width
     * @returns 
     */
    getHeight(margin = true) {
        const height = margin ? (this.margin.top + this.margin.bottom) : 0;
        return this.height + height;
    }

    getDimensions({ context, margin = true }) {
        const id = context.getId();
        const d3Svg = getRootSvg(id);
    
        if (!d3Svg?.node()) {
            return { 
                width: context.getWidth(margin), 
                height: context.getHeight(margin) 
            }
        }

        const boundingRect = d3Svg.node().getBoundingClientRect();

        // Calculate the scale factors
        const xFactor =  boundingRect.width / context.getWidth(true);
        const yFactor =  boundingRect.height / context.getHeight(true);

        let width = boundingRect.width;
        let height = boundingRect.height;

        const marginObj = context.getMargin();
        width += margin ? ((marginObj.left) + (marginObj.right)) : 0;
        height += margin ? ((marginObj.tooltip) + (marginObj.bottom)) : 0;

        return { width, height, xFactor, yFactor, left: boundingRect.left, top: boundingRect.top, x: boundingRect.x , y: boundingRect.y };
    }

    /**
     * Get the margin object { top: , right: , bottom: , left:  }
     */
    getMargin() {
        return this.margin;
    }

    setMargin(margin) {
        if (margin && typeof margin === 'object') {
            this.margin = { ...this.margin, ...margin };
        }
    }

    getDataSize() {
        return this.values.length;
    }

    getSubDataSize() {
        // TODO:
       return this.values?.[0]?.length || 0;
    }

    getValues() {
        return this.values;
    }

    getLabels() {
        return this.labels;
    }

    getSubLabels() {
        return this.subLabels;
    }

    getCallBacks() {
        return this.callbacks;
    }

    setLinePositions(position) {
        this.linePositions = position || [];
    }

    getLinePositions() {
        return this.linePositions;
    }

    getResponsive() {
        return this.responsive;
    }

    setResponsive(value) {
        this.responsive = value;
    }

    getValues2d() {
        const values = [];

        (this.values || []).forEach((valueSet) => {
            values.push(valueSet.reduce((sum, value) => sum + value, 0));
        });

        return values;
    }

    getPercentages2d() {
        const percentages = [];

        this.values.forEach((valueSet) => {
            const total = valueSet.reduce((sum, value) => sum + value, 0);
            percentages.push(valueSet.map(value => (total === 0 ? 0 : roundPoint(value * 100 / total))));
        });

        return percentages;
    }

    setSubLabels(subLabels) {
        subLabels = normalizeArray(subLabels)
        this.subLabels = subLabels;
    }

    setLabels(labels) {

        labels = normalizeArray(labels)
        this.labels = labels; 
    }

    setValues(values) {

        values = normalizeArray(values)
        this.values = values;
    }

    createPercentages() {
        let values = [];

        if (this.is2d()) {
            values = this.getValues2d();
        } else {
            values = [...this.values];
        }

        if (this.pctMode === 'max') {
            // Calculate percentage relative to the maximum value
            const max = Math.max(...values);
            values = values.map(value => (value === 0 ? 0 : roundPoint(value * 100 / max)));
        } else if (this.pctMode === 'previous') {
            // Calculate percentage relative to the previous value
            values = values.map((value, index) => {
                if (index === 0) return 100; // The first item relative to itself is always 100%
                const previousValue = values[index - 1];
                return (previousValue === 0 ? 0 : roundPoint(value * 100 / previousValue));
            });
        } else if (this.pctMode === 'first') {
            // Calculate percentage relative to the first value
            const firstValue = values[0];
            values = values.map(value => (firstValue === 0 ? 0 : roundPoint(value * 100 / firstValue)));
        }

        return values;
    }

    makeVertical(force = false) {
        if (!force && this.direction === 'vertical') return true;

        this.setDirection('vertical');
        this.setWidth(this.origHeight);
        this.setHeight(this.origWidth);

        updateRootSVG({
            context: this.getContext()
        })

        this.updateData();
    }

    makeHorizontal(force = false) {
        if (!force && this.direction === 'horizontal') return true;

        this.setDirection('horizontal');
        this.setWidth(this.origWidth);
        this.setHeight(this.origHeight);

        updateRootSVG({
            context: this.getContext()
        })

        this.updateData();
    }

    toggleDirection() {
        if (this.direction === 'horizontal') {
            this.makeVertical();
        } else {
            this.makeHorizontal();
        }
    }

    gradientMakeVertical() {
        if (this.gradientDirection === 'vertical') {
            return true;
        }
        this.gradientDirection = 'vertical';

        gradientMakeVertical({ id: this.id });

        return true;
    }

    gradientMakeHorizontal() {
        if (this.gradientDirection === 'horizontal') {
            return true;
        }
        this.gradientDirection = 'horizontal';

        gradientMakeHorizontal({ id: this.id });

        return true;
    }


    gradientToggleDirection() {
        if (this.gradientDirection === 'horizontal') {
            this.gradientMakeVertical();
        } else {
            this.gradientMakeHorizontal();
        }
    }

    /**
     * Get class context 
     */
    getContext() {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
          .filter(prop => typeof this[prop] === 'function' && prop !== 'constructor');
        
        const boundMethods = {};
        for (const method of methods) {
          boundMethods[method] = this[method].bind(this);
        }
    
        return boundMethods;
      }

    /**
     * Get the graph information 
     * 
     * @returns the information fot the graph object
     *  {label: , subLabel: , value: , percentage: } 
     */
    getInfo() {
        const data = this.percentages;
        return data.map((percentage, index) => {

            const infoItem = { label: undefined, subLabel: undefined, value: undefined, percentage: undefined };

            // update value 
            const valueNumber = this.is2d() ? this.getValues2d()[index] : this.values[index];
            infoItem.value = formatNumber(valueNumber);

            // update label
            infoItem.label = this.labels?.[index] || 'NA';

            // update percentage if set to true
            if (this.displayPercent) {
                infoItem.percentage = `${percentage.toString()}%`
            }

            return infoItem;

        });
    }

    /**
     * Calculate the paths and draw the svg elements
     * Get the info and draw the vertical svg lines with the relevant text
     */
    drawGraph() {

        const crossAxisPoints = getCrossAxisPoints({
            context: this.getContext()
        });

        const definitions = getPathDefinitions({
            context: this.getContext(),
            crossAxisPoints
        });


        drawPaths({
            context: this.getContext(),
            definitions,
          
        });

        drawInfo({
            context: this.getContext()
        });

    }

    /**
     * Create the main SVG and draw the graph
     */
    draw() {
        createRootSVG({
            context: this.getContext()
        });

        this.drawGraph();
    }

    /**
     * Redraw the graph and info according to the incoming data changes
     * 
     * @param {*} d {
     *      width: ...
     *      height: ...
     *      margin: ...
     *      values: ...
     *      labels: ...
     *      subLabels: ...
     *      colors: ...
     *      details: ...
     *      tooltip: ...
     * }
     */
    updateData(d) {

        if (d) {
            if (typeof d.responsive !== 'undefined') {
                this.setResponsive(d.responsive);
            }   

            if (typeof d.width !== 'undefined') {
                this.setWidth(d.width);
            }   

            if (typeof d.height !== 'undefined') {
                this.setHeight(d.height);
            }  

            if (typeof d.margin !== 'undefined') {
                this.setMargin(d.margin);
            }   

            if (typeof d.details !== 'undefined') {
                this.setDetails(d.details);
            }   

            if (typeof d.tooltip !== 'undefined') {
                this.setTooltip(d.tooltip);
            }   

            if (typeof d.values !== 'undefined') {
                // Update values
                this.setValues([ ...d.values ]);
            }

            if (typeof d.labels !== 'undefined') {
                // Update labels if specified in the new data
                this.setLabels([ ...d.labels ]);
            }

            if (typeof d.colors !== 'undefined') {
                // Update colors if specified, or use default colors as a fallback
                this.colors = d.colors || getDefaultColors(this.is2d() ? this.getSubDataSize() : 2);
            }

            if (typeof d.pctMode !== 'undefined') {
                this.setPctMode(d.pctMode);
            }

            // Calculate percentages for the graph based on the updated or existing values
            this.percentages = this.createPercentages();

            if (typeof d.subLabels !== 'undefined') {
                // Update subLabels if specified in the new data
                this.setSubLabels([ ...d.subLabels ]);
            }
        }

        this.drawGraph();
    }
}

export default FunnelGraph;
