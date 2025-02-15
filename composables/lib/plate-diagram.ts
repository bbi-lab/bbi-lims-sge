import * as d3 from "d3"
import {type ValueFn} from "d3"
import _ from "lodash"

type Accessor<T, Self> = (value?: T) => T | Self
interface CoordinatePair {x: number, y: number}

const VALIDCOLORS = [
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
    x: number,
    y: number,
    color?: string,
    tooltip?: string,
    symbol?: string,
    selected?: boolean,
}

export interface PlateDiagram {
    title?: string,
    id?: string,

    wells: Accessor<PlateDiagramWell[], PlateDiagram>

    render: (container: HTMLElement) => PlateDiagram
}

function numberToChar(number: number) {
    return String.fromCharCode(96 + number).toUpperCase()
}

export default function makePlateDiagram(size: CoordinatePair = {x: 12, y: 8}): PlateDiagram {
    // Container
    let _container: HTMLElement | null = null

    // default plate and well sizes
    let wellSize: CoordinatePair = { x: 20, y: 20 }
    let wellSpacing: CoordinatePair = { x: 0, y: 0 }
    
    // set the dimensions and margins of the graph
    let margin = {top: 80, right: 25, bottom: 30, left: 40}
    const plateWidth = () => wellSize.x * size.x + (wellSpacing.x * size.x)
    const plateHeight = () => wellSize.y * size.y + (wellSpacing.y * size.y)
    
    // populate wells from size
    let wells:PlateDiagramWell[] = []
    for (const x of _.range(1, size.x + 1)) {
        for (const y of _.range(1, size.y + 1)) {
            wells.push({
                x,
                y,
                color: _.sample(VALIDCOLORS), 
                tooltip: `well: ${numberToChar(y)}${x}`,
            })
        }
    }

    const plate: PlateDiagram = {
        wells: (value?: PlateDiagramWell[]) => {
            if (value === undefined) {
              return wells
            }
            wells = value
            return plate
        },

        render: (container: HTMLElement) => {
            _container = container

            if (_container) {
                const svg = d3.select(_container)
                    .append("svg")
                    .attr("width", plateWidth() + margin.left + margin.right)
                    .attr("height", plateHeight() + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")")

                const cols = _.range(1, size.x + 1)
                const rows = _.range(1, size.y + 1)
                
                // Build X scales and axis:
                const x = d3.scaleBand()
                    .range([ 0, plateWidth() ])
                    .domain(_.map(cols, _.toString))
                    .padding(0.1);
                svg.append("g")
                    .style("font-size", 15)
                    .attr("transform", "translate(0," + plateHeight() + ")")
                    .call(d3.axisBottom(x).tickSize(0))
                    .select(".domain").remove()

                // Build Y scales and axis:
                const y = d3.scaleBand()
                    .range([ 0, plateHeight() ])
                    .domain(_.map(rows, _.toString))
                    .padding(0.1);
                svg.append("g")
                    .style("font-size", 15)
                    .call(d3.axisLeft(y).tickSize(0).tickFormat(n => numberToChar(parseInt(n))))
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
                    .style("background-color", "var(--surface-hover)")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")

                // Three function that change the tooltip when user hover / move / leave a cell
                const mouseover = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    if (d.tooltip)
                        tooltip
                            .html(d.tooltip)
                            .style("opacity", 1)
                        d3.select(this)
                            .style("stroke", "black")
                            .style("opacity", 1)
                }
                const mousemove = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    // console.log(event)
                }
                const mouseleave = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    tooltip
                    .style("opacity", 0)
                    d3.select(this)
                    .style("stroke", d.selected ? 'black' : 'none')
                    .style("opacity", 0.8)
                }

                const mouseclick = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    // console.log(d)
                }
                const mousedown = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    // console.log(d)
                }
                const mouseup = function(this: SVGRectElement, event: any, d: PlateDiagramWell) {
                    //console.log(d)
                }

                const getX = (d:PlateDiagramWell) => { return x(_.toString(d.x))! + wellSpacing.x/2 }
                const getY = (d:PlateDiagramWell) => { return y(_.toString(d.y))! + wellSpacing.y/2 }

                // add the squares
                svg.selectAll()
                    .data(wells)
                    .enter()
                    .append("rect")
                        .attr("x", <ValueFn<any, any, any>>getX)
                        .attr("y", <ValueFn<any, any, any>>getY)
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .attr("width", x.bandwidth() - wellSpacing.x )
                        .attr("height", y.bandwidth() - wellSpacing.y)
                        .style("fill", function(d:PlateDiagramWell) { return d.color || "#ddd"})
                        .style("stroke-width", 2)
                        .style("stroke", function(d:PlateDiagramWell) { return d.selected ? 'black' : 'none'})
                        .style("opacity", 0.8)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .on('mousedown', mousedown)
                    .on('mouseup', mouseup)
                    .on('click', mouseclick)
                }
                return plate
            }
    }
    return plate
}
