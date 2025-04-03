import * as d3 from "d3"
import {type ValueFn} from "d3"
import _ from "lodash"
import type { PlateWithPlateDiagramWells } from "~/components/PlateDiagram.vue"

type Accessor<T, Self> = (value?: T) => T | Self

interface CoordinatePair {x: number, y: number}

export const VALID_WELL_COLORS = [
    "#F0A3FF",
    "#0075DC",
    "#993F00",
    "#4C005C",
    "#005C31",
    "#2BCE48",
    "#FFCC99",
    "#94FFB5",
    "#8F7C00",
    "#9DCC00",
    "#C20088",
    "#003380",
    "#FFA405",
    "#FFA8BB",
    "#426600",
    "#FF0010",
    "#5EF1F2",
    "#00998F",
    "#E0FF66",
    "#740AFF",
    "#990000",
    "#FFFF80",
    "#FFE100",
    "#FF5005"
]

export interface PlateDiagramWell {
    id: string,
    x: number,
    y: number,
    color?: string,
    tooltip?: string,
    symbol?: string,
    selected: boolean,
    inSelectionRange: boolean,
}

export interface PlateDiagram {
    title?: string,
    id?: string,

    wells: (value: PlateDiagramWell[]) => PlateDiagram

    render: (container: HTMLElement) => PlateDiagram

    wellRangeSelected: Accessor<((wells: PlateDiagramWell[]) => void) | null, PlateDiagram>
    updateWellContents: (updatedWells: PlateDiagramWell[]) => PlateDiagram

    clearSelection: () => PlateDiagram
    selectAllWells: () => PlateDiagram
}

export function wellCoordinateToChar(number: number) {
    return String.fromCharCode(96 + number).toUpperCase()
}

export function makePlateDiagram(): PlateDiagram {
    // Container
    let _container: HTMLElement | null = null

    let svg: d3.Selection<SVGGElement, any, any, any> | null = null

    // select wells
    let wellRangeSelected: ((wells: PlateDiagramWell[]) => void) | null = null
    let wellSelectionStart: PlateDiagramWell | null = null

    // default plate and well sizes
    let wellSize: CoordinatePair = { x: 20, y: 20 }
    let wellSpacing: CoordinatePair = { x: 0, y: 0 }

    let plate: PlateWithPlateDiagramWells = {
        id: '',
        name: '',
        pcrExperimentId: null,
        sizeX: 12,
        sizeY: 8,
        wells: [],  // wells to be set via wells() method
    }
    // set the dimensions and margins of the graph
    let margin = {top: 10, right: 10, bottom: 20, left: 20}
    const plateWidth = () => wellSize.x * plate.sizeX + (wellSpacing.x * plate.sizeX)
    const plateHeight = () => wellSize.y * plate.sizeY + (wellSpacing.y * plate.sizeY)

    const updateWellOutlines: (svg: d3.Selection<SVGGElement, any, any, any>) => void = (svg) => {
        if (svg) {
            svg.selectAll<SVGRectElement, PlateDiagramWell>('rect')
                .each(function(d: PlateDiagramWell, i: number, nodes: ArrayLike<SVGRectElement>) {
                    d3.select(this)
                        .style('stroke', <ValueFn<any, any, string>>wellOutlineColor)
                    // raise the selected wells so their outlines aren't obscured by those of unselected wells
                    if (d.inSelectionRange || d.selected) {
                        d3.select(this)
                            .style('opacity', 1.0)
                            .raise()
                    } else {
                        d3.select(this)
                            .style('opacity', 0.8)
                    }
                })
        }
    }

    const updateWellDisplay: (svg: d3.Selection<SVGGElement, any, any, any>, updatedWells: PlateDiagramWell[]) => void = (svg, updatedWells) => {
        if (svg && updatedWells) {
            svg.selectAll<SVGRectElement, PlateDiagramWell>('rect')
                .each(function(d: PlateDiagramWell, i: number, nodes: ArrayLike<SVGRectElement>) {
                    if (_.map(updatedWells, (x) => x.id).includes(d.id)){
                        const updatedColor = _.find(updatedWells, (x) => x.id == d.id)?.color
                        const updatedTooltip = _.find(updatedWells, (x) => x.id == d.id)?.tooltip
                        if (updatedColor) {
                            d3.select(this)
                                .style('fill', updatedColor)
                        }
                        if (updatedTooltip) {
                            d3.select(this)
                                .attr('tooltip', updatedTooltip)
                        }
                    }
                })
        }
    }

    const wellOutlineColor: (w:PlateDiagramWell) => string = (w: PlateDiagramWell) => {
        return w.inSelectionRange ? 'var(--p-text-muted-color)' : (w.selected ? 'var(--p-text-color)' : 'var(--surface-ground)')
    }

    const plateDiagram: PlateDiagram = {
        wells: (value: PlateDiagramWell[]) => {
            plate.wells = value
            return plateDiagram
        },

        wellRangeSelected: (value?: ((wells: PlateDiagramWell[]) => void) | null) => {
            if (value === undefined) {
              return wellRangeSelected
            }
            wellRangeSelected = value
            if (svg) updateWellOutlines(svg)
            return plateDiagram
        },

        updateWellContents: (value?: PlateDiagramWell[]) => {
            if (svg && value) updateWellDisplay(svg, value)
            return plateDiagram
        },

        clearSelection: () => {
            plate.wells.forEach(well => well.selected = false)
            if (svg) updateWellOutlines(svg)
            return plateDiagram
        },

        selectAllWells: () => {
            plate.wells.forEach(well => well.selected = true)
            if (svg) updateWellOutlines(svg)
            return plateDiagram
        },

        render: (container: HTMLElement) => {
            _container = container

            if (_container) {
                svg = d3.select(_container)
                    .append("svg")
                    .attr("width", plateWidth() + margin.left + margin.right)
                    .attr("height", plateHeight() + margin.top + margin.bottom)
                    .append("g")
                    .attr("class", "plate-diagram-nodes")
                    .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")")

                const cols = _.range(1, plate.sizeX + 1)
                const rows = _.range(1, plate.sizeY + 1)

                const selectRow: (event: MouseEvent) => void = (event: MouseEvent) => {
                    const rowNumber = d3.select(event.target as SVGRectElement).datum()
                    plate.wells.forEach(well => {
                        if (well.y == rowNumber) {
                            well.selected = event.metaKey ? !well.selected : true
                        } else if (!event.metaKey) {
                            well.selected = false
                        }
                    })
                    if (wellRangeSelected) wellRangeSelected(plate.wells.filter(w => w.selected))

                    if (svg) updateWellOutlines(svg)
                }

                const selectColumn: (event: MouseEvent) => void = (event: MouseEvent) => {
                    const colNumber = d3.select(event.target as SVGRectElement).datum()
                    plate.wells.forEach(well => {
                        if (well.x == colNumber) {
                            well.selected = event.metaKey ? !well.selected : true
                        } else if (!event.metaKey) {
                            well.selected = false
                        }
                    })
                    if (wellRangeSelected) wellRangeSelected(plate.wells.filter(w => w.selected))

                    if (svg) updateWellOutlines(svg)
                }

                // Build X scales and axis:
                const x = d3.scaleBand()
                    .range([ 0, plateWidth() ])
                    .domain(_.map(cols, _.toString))
                svg.append("g")
                    .style("font-size", 15)
                    .style("user-select", "none")
                    .attr("transform", "translate(0," + plateHeight() + ")")
                    .call(d3.axisBottom(x).tickSize(0))
                    .on('click', function(event) {
                        selectColumn(event)
                    })
                    .select(".domain").remove()

                // Build Y scales and axis:
                const y = d3.scaleBand()
                    .range([ 0, plateHeight() ])
                    .domain(_.map(rows, _.toString))
                svg.append("g")
                    .style("font-size", 15)
                    .style("user-select", "none")
                    .call(d3.axisLeft(y).tickSize(0).tickFormat(n => wellCoordinateToChar(parseInt(n))))
                    .on('click', function(event) {
                        selectRow(event)
                    })
                    .select(".domain").remove()

                // Build color scale
                const myColor = d3.scaleSequential()
                    .interpolator(d3.interpolateInferno)
                    .domain([1,100])

                // create a tooltip
                const tooltip = d3.select(_container)
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("user-select", "none")
                    .style("color", "color-mix(in srgb, var(--p-surface-0) calc(100%* var(--tw-text-opacity, 1)), transparent)")
                    .style("background-color", "color-mix(in srgb, var(--p-surface-700) calc(100%* var(--tw-bg-opacity, 1)), transparent)")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("border-color", "color-mix(in srgb, var(--p-surface-700) calc(100%* var(--tw-bg-opacity, 1)), transparent)")
                    .style("padding", "5px")

                // Three function that change the tooltip when user hover / move / leave a cell
                const mouseover = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    const tooltipText = d3.select(this).attr("tooltip")
                    if (w.tooltip)
                        tooltip
                            .html(tooltipText)
                            .style("opacity", 1)
                            .style("pointer-events", "none")
                            .style("left", (event.pageX + 20) + "px")
                            .style("top", (event.pageY - 20) + "px")
                            .raise()
                    d3.select(this)
                        .style("stroke", "var(--p-text-color)")
                        .style("opacity", 1)
                        .raise()
                }

                const mousemove = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    if (wellSelectionStart) {
                        const startX = _.min([wellSelectionStart!.x, w.x])!
                        const endX = _.max([wellSelectionStart!.x, w.x])!
                        const startY = _.min([wellSelectionStart!.y, w.y])!
                        const endY = _.max([wellSelectionStart!.y, w.y])!

                        plate.wells.forEach(well => {
                            if (_.inRange(well.x, startX, endX+1) &&
                                _.inRange(well.y, startY, endY+1)) {
                                    well.inSelectionRange = true
                                } else {
                                    well.inSelectionRange = false
                                }
                        })
                        if (svg) updateWellOutlines(svg)
                    }
                }

                const mouseleave = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    tooltip.style("opacity", 0)
                    if (svg) updateWellOutlines(svg)
                }

                const mouseclick = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    // mouseclick events also correspond with mousedown and mouseup, so click behavior is being handled there
                    // console.log('click')
                }
                const mousedown = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    wellSelectionStart = w
                    plate.wells.forEach(well => {
                        well.inSelectionRange = false
                    })
                    if (svg) updateWellOutlines(svg)
                }
                const mouseup = function(this: SVGRectElement, event: MouseEvent, w: PlateDiagramWell) {
                    if (wellSelectionStart) {
                        // if mouseup and mousedown are the same well, treat as a click
                       if (wellSelectionStart == w && !event.metaKey) {
                            plate.wells.forEach(well => { if (well !== w) {well.selected = false} else {well.selected = true} })
                        } else if (wellSelectionStart == w && event.metaKey) {
                            w.selected = !w.selected
                        } else {
                            // toggle wells in selection range if meta key is pressed, otherwise just select them
                            plate.wells.forEach(well => {
                                if (well.inSelectionRange) {
                                    well.selected = event.metaKey ? !well.selected : true
                                } else if (well.selected && !event.metaKey) {
                                    well.selected = false
                                }
                                well.inSelectionRange = false
                            })
                        }
                    }
                    if (wellRangeSelected) wellRangeSelected(plate.wells.filter(w => w.selected))
                    wellSelectionStart = null
                    plate.wells.forEach(w => w.inSelectionRange = false)
                    if (svg) updateWellOutlines(svg)
                }

                const getX = (w:PlateDiagramWell) => { return x(_.toString(w.x))! + wellSpacing.x/2 }
                const getY = (w:PlateDiagramWell) => { return y(_.toString(w.y))! + wellSpacing.y/2 }
                const xCoord = (w:PlateDiagramWell) => { return w.x }
                const yCoord = (w:PlateDiagramWell) => { return w.y }

                // add the squares
                svg.selectAll()
                    .data(plate.wells)
                    .enter()
                    .append("rect")
                        .attr("x", <ValueFn<any, any, any>>getX)
                        .attr("y", <ValueFn<any, any, any>>getY)
                        .attr("xcoord", <ValueFn<any, any, any>>xCoord)
                        .attr("ycoord", <ValueFn<any, any, any>>yCoord)
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .attr('tooltip', function(w:PlateDiagramWell) { return w.tooltip || ""})
                        .attr("width", x.bandwidth() - wellSpacing.x)
                        .attr("height", y.bandwidth() - wellSpacing.y)
                        .style("fill", function(w:PlateDiagramWell) { return w.color || "#ddd"})
                        .style("stroke-width", 2)
                        .style("opacity", 0.8)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .on('mousedown', mousedown)
                    .on('mouseup', mouseup)
                    .on('click', mouseclick)
                }
                if (svg) updateWellOutlines(svg)
                return plateDiagram
            }
    }
    return plateDiagram
}
