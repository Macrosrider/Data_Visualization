let svgHeight = 500;
let svgWidth = 950;
let xScale, yScale;
let xTranslare = 10;
let yTranslate = 30;
let csv_data = d3.csv("data.csv");

function get_data(data){
    let tp = [];
    let yr = [];
    let population = [];
    for(let i = 0; i < data.length; i++){
        yr.push(parseInt(data[i].year));
        tp.push(data[i].type);
        population.push(data[i].population / 1000);
    }
    return [tp, yr, population]
}

function setup_axis(xScale, yScale, svg, yr){
    xScale = d3.scaleLinear().domain([d3.min(yr), d3.max(yr)]).range([0, svgWidth - 200]);
    yScale = d3.scaleLinear().domain([15, 50]).range([svgHeight - 60, 60]);

    let x_axis = d3.axisBottom().scale(xScale).tickValues([1950, 1991, 2020, 2100])
        .tickSizeInner(-svgHeight)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(d3.format(".0f"));

    let y_axis = d3.axisLeft().scale(yScale).tickValues([15, 20, 25, 30, 35, 40, 45, 50])
        .tickFormat(d3.format(".0f"))
        .tickSizeInner(-svgWidth + 190)
        .tickSizeOuter(0)
        .tickPadding(10);
    svg.append('g').attr('transform', 'translate(30,' + (svgHeight - 20) +')').call(x_axis).select('.domain').remove();
    svg.append('g').attr('transform', 'translate(30, 10)').call(y_axis).select('.domain').remove();


    return [xScale, yScale]
}

function generate_line(year, population, type, xTranslate, yTranslate, scale, criteria){
    let line = [];
    for(let i =0; i < type.length; i++) {
        if (type[i] === criteria) {
            line.push({"x": scale[0](year[i]) + yTranslate, "y": scale[1](population[i]) + xTranslate})
        }
    }
    return line
}

function draw_line(svg, lineData, cl, criteria){
    let lineFunction = d3.line()
                             .x(function(d) { return d.x; })
                             .y(function(d) { return d.y; })
                             .curve(d3.curveLinear);

    let svgContainer = svg.append('g');
    let text_class;
    let x = 15;
    let y = 0;

    if(criteria.includes("variant")){
        text_class = "text_red"
    }else{
        text_class = "text_gray"
    }

    svgContainer.append("path")
                .attr("d", lineFunction(lineData))
                .attr('class', cl);

    if(criteria === "estimate"){
        //pass
    }else{
        if(criteria === 'medium variant'){
            y -= 10;
        }else if(criteria === "constant fertility") {
            y -= 1;
        }else{
            y += 5;
        }
        svgContainer.append("text")
            .attr("x", lineData[lineData.length - 1].x + x)
            .attr("y", lineData[lineData.length - 1].y + y)
            .attr("class", text_class)
            .text(criteria);
    }
}

function draw_graph(svg, year, population, tp, xTranslate, yTranslate, scales) {
    let types = d3.set(tp).values();
    let line;
    let cl = 'blue_line';
    for(let i = 0; i < types.length; i++){
        line = generate_line(year, population, tp, xTranslate, yTranslate, scales, types[i]);
        draw_line(svg, line, cl, types[i]);
        cl = 'red_line';
    }
}

csvdata = csv_data.then(function(data) {
    let parsed_data = get_data(data);
    let tp = parsed_data[0];
    let yr = parsed_data[1];
    let population = parsed_data[2];

    let svg = d3.select('svg').attr('width', svgWidth).attr('height', svgHeight);
    let scales = setup_axis(xScale, yScale, svg, yr);

    let text_labels = svg.append('g');

    text_labels.append("text")
        .attr("x", (scales[0](1991) /100 * 95))
        .attr("y", 20)
        .attr("font-family", "Ubuntu Mono")
        .attr("fill", "#3288bd")
        .text("estimate");

    text_labels.append("text")
        .attr("x", scales[0](2020) + ((scales[0](2100) - scales[0](2020)) / 2))
        .attr("y", 20)
        .attr("font-family", "Ubuntu Mono")
        .attr("fill", "#d53e4f")
        .text("projection");

    draw_graph(svg, yr, population, tp, xTranslare, yTranslate, scales);
});