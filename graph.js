// 1 - Set up dimensions:
const dims = { height: 300, width: 300, radius: 150 }
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }

// 2 - Create SVG container
const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150)

// 3 - Create group which contains graph elements to append to SVG
const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`)

// 4 - Set up pie generators
const pie = d3.pie()
    .sort(null)
    .value(d => d.cost)

// 5 - Set up arc generator
const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 3);

// 9 - Create ordinal scales
// const pastel1 = ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]
// const color = d3.scaleOrdinal(pastel1)
const color = d3.scaleOrdinal(d3['schemePastel1'])  // schemePastel1, schemeCategory10, schemeAccent, schemeSet2 

// 14a - Legend setup
const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 40}, 10)`);

const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(color)

// 17 - Tooltip setup
const tip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        let content = `
            <div class="name">
                Item: <span class="yellow-text text-darken-1">${d.data.name}</span>
            </div>
        `;
        content += `
            <div class="cost">
                Item Cost: <span class="yellow-text text-darken-1">$${d.data.cost}</span> 
            </div>
        `;
        content += `
            <div class="delete">
                (Click slice to delete)
            </div>            
        `;
        return content;
    })

graph.call(tip);


// 7 - Create update function to draw paths on the screen:
const update = (data) => {
    
    // 10a - Update color scale domain and set 
    //      up enter selection (step 10b)
    color.domain(data.map(d => d.name))

    // 14b - Update and call legend
    legendGroup.call(legend)
    legendGroup.selectAll('text').attr('fill', '#bbdefb');

    // 8 -  Join enhanced (pie) data to path elements 
    const paths = graph.selectAll('path')
        .data(pie(data));

    // PROJECT CHALLENGE:
    // Handle the exit selection:
    paths.exit()
    .transition().duration(750)
        // 12b - Apply tween to exit selection
        .attrTween('d', arcTweenExit)
        .remove()
        

    // Handle the current DOM path updates:
    paths.attr('d', arcPath)
        .transition().duration(750)
        .attrTween('d', arcTweenUpdate);


    paths.enter()
        .append('path')
            .attr('class', 'arc')
            // .attr('d', arcPath)  // not needed after transition tween implemented
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            // 10b - Define a fill color for each path as its appended to the DOM
            .attr('fill', d => color(d.data.name))
            // 11b - Apply `arcTweenEnter` to enter selection
            // 13b 
            .each(function(d) { this._current = d })  // Original data when path element first enters into the DOM
            .transition().duration(750)
                .attrTween('d', arcTweenEnter)

    // 15a - Add event listener for mouseover events
    graph.selectAll('path')
        // .on('mouseover', handleMouseOver)  // Updated to implement tooltip
        .on('mouseover', (d, i, n) => {
            tip.show(d, n[i]);
            handleMouseOver(d, i, n);
        })
        .on('mouseout', (d, i, n) => {
            tip.hide();
            handleMouseOut(d, i, n);
        })
        .on('click', handleClick)
}

// Data array to store data retrieved from FireStore database
let data = [];

// 6 -  Set up real time database listener >> grab data 
//      from db > loop over response > create a data object 
//      with data + id > add switch statement to determine what 
//      action to do based on change type > 
db.collection('expenses').onSnapshot(resp => {
    resp.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id }
        
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id === doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });
    update(data);
})

// 11a - Set up arc enter tween for transition (it will constantly be updating when called)
const arcTweenEnter = (d) => {  // 'd': passed in data - rename?
    let i = d3.interpolate(d.endAngle, d.startAngle);  // Set the interpolation

    return function(t) {  // 't': the "ticker", a value between 0 and 1; 0=transition start, 1=transition end
        d.startAngle = i(t);  // Update the value of the start angle over time
        return arcPath(d)  // Draw the path
    }
}

// 12a - Set up arc exit tween
const arcTweenExit = (d) => {
    let i = d3.interpolate(d.startAngle, d.endAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
}

// 13a - Create custom tween for updating chart transition
function arcTweenUpdate(d) {

    // interpolate between the _current object and d object
    let i = d3.interpolate(this._current, d);
    // update the current prop with the new updated data
    this._current = d;
    
    return function(t) {
        return arcPath(i(t));
    }
}

// 15b - Define event handlers
const handleMouseOver = (d, i, n) => {
    d3.select(n[i])
        .transition('sliceHighlight').duration(300)
            // .attr('fill', '#bbdefb') 
            .attr('fill', '#263238') 
}

const handleMouseOut = (d, i, n) => {
    d3.select(n[i])
        .transition('sliceHighlight').duration(300)
            .attr('fill', color(d.data.name))
}

const handleClick = (d) => {
    const id = d.data.id;
    alert('are you sure')
    db.collection('expenses').doc(id).delete();
}