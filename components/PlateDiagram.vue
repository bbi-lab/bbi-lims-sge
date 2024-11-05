<script setup>
import * as d3 from 'd3'
import _ from 'lodash'
import { RecordService } from '@/utils/service/RecordService'

const config = useRuntimeConfig()

const props = defineProps({
  plateId: String,
  wellHeight: {type: Number, default: 20},
  wellWidth: {type: Number, default: 20},
  wellSpacing: {type: Number, default: 0},
})

onMounted(async() => {
    const plate = await RecordService.getRecord(
        `${config.public.apiBase}/plates`,
        props.plateId,
        { wells: {"columns": {"x": true, "y": true}}}
    )
    drawPlate(plate)
})

function drawPlate(plate) {
    // set the dimensions and margins of the graph
    const margin = {top: 80, right: 25, bottom: 30, left: 40}
    const plateWidth = props.wellWidth * plate.sizeX  
    const plateHeight = props.wellHeight * plate.sizeY 
    
    // append the svg object to the body of the page
    const svg = d3.select('#plate-diagram-div')
        .append("svg")
        .attr("width", plateWidth + margin.left + margin.right)
        .attr("height", plateHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
     
    // TODO - calculate these
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([ 0, plateWidth ])
        .domain(cols)
        .padding(0.1);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + plateHeight + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()


    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([ 0, plateHeight ])
        .domain(rows)
        .padding(0.15);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

    // Build color scale
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([1,100])

    // create a tooltip
    const tooltip = d3.select("#plate-diagram-div")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(d) {
        tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    const mousemove = function(d) {
        tooltip
        .html("The exact value of<br>this cell is: " + d.value)
        .style("left", (d3.pointer(this)[0]+70) + "px")
        .style("top", (d3.pointer(this)[1]) + "px")
    }
    const mouseleave = function(d) {
        tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    // // add the squares
    svg.selectAll()
        .data(plate.wells)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x) })
        .attr("y", function(d) { return x(d.y) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return '#ddd'})  // change to function
        .style("stroke-width", 2)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
    }
</script>


<template>
    <div class="flex justify-center">
        <div id="plate-diagram-div" />
    </div>
</template>
