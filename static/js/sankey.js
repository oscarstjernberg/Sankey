const profit_color = "#72da72";
const expense_color = "#ff9999";

function drawSankey(data) {
    const container = d3.select("#chart");
    const width = container.node().getBoundingClientRect().width;
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

/* ############## Bar Chart #################### */

function drawBarChartPercent(data) {
    const margin = {top: 60, right: 30, bottom: 60, left: 50},
            width = 400 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const quarters = data.quarters.map(d => new Date(d));
    const netIncomePercentage = data.net_income_percentage;

    const x = d3.scaleBand()
        .domain(quarters)
        .range([0, width])
        .padding(0.1);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const y = d3.scaleLinear()
        .domain([0, d3.max(netIncomePercentage)])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("bars")
        .data(netIncomePercentage)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(quarters[i]))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth() - 20)
        .attr("height", d => height - y(d))
        .attr("fill", profit_color);

    svg.selectAll("labels")
        .data(netIncomePercentage)
        .enter()
        .append("text")
        .attr("x", (d, i) => x(quarters[i]) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 5)
        .attr("text-anchor", "middle")
        .text(d => formatValue(d));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("%");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 1.5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Net Income Percentage per Quarter");
}


function drawBarChartRevenue(data) {
    const margin = {top: 60, right: 30, bottom: 60, left: 50},
          width = 400 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const quarters = data.quarters.map(d => new Date(d));
    const totalRevenue = data.total_revenue;
    const netIncome = data.net_income;

    if (Math.max(...totalRevenue) > 1000000000) {
        for (let i = 0; i < totalRevenue.length; i++) {
            totalRevenue[i] = totalRevenue[i] / 1000000000;
            netIncome[i] = netIncome[i] / 1000000000;
        }
        y_label = "Billion $";
    } else {
        for (let i = 0; i < totalRevenue.length; i++) {
            totalRevenue[i] = totalRevenue[i] / 1000000;
            netIncome[i] = netIncome[i] / 1000000;
        }
        y_label = "Million $";
    }

    const x0 = d3.scaleBand()
        .domain(quarters)
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["Total Revenue", "Net Income"])
        .range([0, x0.bandwidth()])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...totalRevenue, ...netIncome])])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    const quarterGroups = svg.selectAll(".quarter")
        .data(quarters)
        .enter().append("g")
        .attr("class", "quarter")
        .attr("transform", d => `translate(${x0(d)},0)`);

    quarterGroups.selectAll("rect")
        .data(d => [
            {key: "Total Revenue", value: totalRevenue[quarters.indexOf(d)]},
            {key: "Net Income", value: netIncome[quarters.indexOf(d)]}
        ])
        .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.key === "Total Revenue" ? "#69b3a2" : profit_color);

    quarterGroups.selectAll("text")
        .data(d => [
            {key: "Total Revenue", value: totalRevenue[quarters.indexOf(d)]},
            {key: "Net Income", value: netIncome[quarters.indexOf(d)]}
        ])
        .enter().append("text")
        .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .text(d => formatValue(d.value));

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(y_label);

        svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 1.5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Total Revenue vs Net Income per Quarter");
}

function drawBarChartCost(data) {
    const margin = {top: 60, right: 30, bottom: 60, left: 50},
          width = 400 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const quarters = data.quarters.map(d => new Date(d));
    const totalRevenue = data.total_revenue;
    const costRevenue = data.cost_of_revenue;


    if (Math.max(...totalRevenue) > 1000000000) {
        for (let i = 0; i < totalRevenue.length; i++) {
            totalRevenue[i] = totalRevenue[i] / 1000000000;
            costRevenue[i] = costRevenue[i] / 1000000000;
        }
        y_label = "Billion $";
    } else {
        for (let i = 0; i < totalRevenue.length; i++) {
            totalRevenue[i] = totalRevenue[i] / 1000000;
            costRevenue[i] = costRevenue[i] / 1000000;
        }
        y_label = "Million $";
    }

    const x0 = d3.scaleBand()
        .domain(quarters)
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["Total Revenue", "Net Income"])
        .range([0, x0.bandwidth()])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...totalRevenue, ...costRevenue])])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    const quarterGroups = svg.selectAll(".quarter")
        .data(quarters)
        .enter().append("g")
        .attr("class", "quarter")
        .attr("transform", d => `translate(${x0(d)},0)`);

    quarterGroups.selectAll("rect")
        .data(d => [
            {key: "Total Revenue", value: totalRevenue[quarters.indexOf(d)]},
            {key: "Net Income", value: costRevenue[quarters.indexOf(d)]}
        ])
        .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.key === "Total Revenue" ? "#69b3a2" : expense_color);

    quarterGroups.selectAll("text")
        .data(d => [
            {key: "Total Revenue", value: totalRevenue[quarters.indexOf(d)]},
            {key: "Net Income", value: costRevenue[quarters.indexOf(d)]}
        ])
        .enter().append("text")
        .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .text(d => formatValue(d.value));

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(y_label);

        svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 1.5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Total Revenue vs Cost of Revenue per Quarter");
}
    