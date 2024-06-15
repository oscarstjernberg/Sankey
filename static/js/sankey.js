function drawSankey(data) {
    const width = 1200;
    const height = 400;

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    
    const node_profit_color = "#72da72";
    const node_expense_color = "#ff3333";
    // Custom colors for specific nodes
    const nodeColors = {
        "Total Revenue": "#999999",
        "Cost Of Revenue": node_expense_color,
        "Gross Profit": node_profit_color,
        "Operating Income": node_profit_color,
        "Operating Expenses": node_expense_color,
        "Net Income": node_profit_color,
        "Taxes": node_expense_color,
        "Research And Development": node_expense_color,
        "Selling General And Administration": node_expense_color,
    };

    const link_profit_color = "#aeeaae";
    const link_expense_color = "#ff9999";
    // Custom colors for specific links
    const linkColors = {
        "Total Revenue -> Gross Profit": link_profit_color,
        "Total Revenue -> Cost Of Revenue": link_expense_color,
        "Gross Profit -> Operating Income": link_profit_color,
        "Gross Profit -> Operating Expenses": link_expense_color,
        "Operating Income -> Net Income": link_profit_color,
        "Operating Income -> Taxes": link_expense_color,
        "Operating Expenses -> Research And Development": link_expense_color,
        "Operating Expenses -> Selling General And Administration": link_expense_color,
    };

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const sankey = d3.sankey()
        .nodeWidth(10)
        .nodePadding(50)
        .extent([[1, 1], [width - 1, height - 80]]);

    let { nodes, links } = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d))
    });

    // Custom alignment for nodes
    nodes.forEach(node => {
        if (node.name === "Cost Of Revenue") {
            const grossProfitNode = nodes.find(n => n.name === "Gross Profit");
            node.x0 = grossProfitNode.x0;
            node.x1 = grossProfitNode.x1;
        }
    });

    svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => nodeColors[d.name] || color(d.name))
        .attr("stroke", "#000");

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply")
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => {
            const linkKey = `${d.source.name} -> ${d.target.name}`;
            return linkColors[linkKey] || color(d.source.name);
        })
        .attr("stroke-width", d => Math.max(1, d.width));

    const nodeGroup = svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("g")
        .data(nodes)
        .join("g");

    nodeGroup.append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2 - 5)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);

    nodeGroup.append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2 + 10)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => formatValue(d.value));
}

function formatValue(value) {
    return d3.format(",.0f")(value);  // Format the value to have commas as thousands separators
}
