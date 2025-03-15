
// Part 2.1: Boxplot

d3.csv("socialMedia.csv").then(function(data) {
  // Step 1: Ensure Likes are correctly converted to numbers
  data.forEach(function(d) {
      d.Likes = +d.Likes;
  });

  console.log("Data loaded for Boxplot:", data); // Debugging step to check the data

  const margin = { top: 50, right: 50, bottom: 50, left: 70 }; // Increased left margin for y-axis label
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#boxplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Step 2: Set up x and y scales
  const xScale = d3.scaleBand()
      .domain([...new Set(data.map(d => d.Platform))])  // Ensure unique platforms
      .range([0, width])
      .padding(0.5);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Likes)])
      .range([height, 0]);

  console.log("xScale domain:", xScale.domain()); // Debugging to check the xScale domain
  console.log("yScale domain:", yScale.domain()); // Debugging to check the yScale domain

  // Step 3: Add axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

  svg.append("g")
      .call(d3.axisLeft(yScale));

  // Step 4: Function to calculate quartiles for boxplot
  const rollupFunction = function(groupData) {
      const values = groupData.map(d => d.Likes).sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const min = d3.min(values);
      const max = d3.max(values);
      return { min, q1, median, q3, max };
  };

  // Step 5: Group data by platform and calculate quartiles
  const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

  // Step 6: Debugging the grouped data
  console.log("Quartiles by Platform:", quartilesByPlatform);

  // Step 7: add the boxplot
  quartilesByPlatform.forEach((quartiles, Platform) => {
      const x = xScale(Platform);
      const boxWidth = xScale.bandwidth();

      // Create the min-max line
      svg.append("line")
          .attr("x1", x + boxWidth / 2)
          .attr("x2", x + boxWidth / 2)
          .attr("y1", yScale(quartiles.min))
          .attr("y2", yScale(quartiles.max))
          .attr("stroke", "black");

      // Create the box for Q1, median, and Q3
      svg.append("rect")
          .attr("x", x)
          .attr("y", yScale(quartiles.q3))
          .attr("width", boxWidth)
          .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
          .attr("stroke", "black")
          .attr("fill", "lightblue");

      // Create the median line
      svg.append("line")
          .attr("x1", x)
          .attr("x2", x + boxWidth)
          .attr("y1", yScale(quartiles.median))
          .attr("y2", yScale(quartiles.median))
          .attr("stroke", "red");
  });

  // Step 8: Add labels to axes
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("Platform");

  svg.append("text")
      .attr("transform", "rotate(-90)")  // Rotate the y-axis label
      .attr("y", 0 - margin.left + 20)  // Adjust label's position to avoid overlap
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Likes");
});

// Part 2.2: Barplot (with Y-axis labels)

d3.csv("socialMediaAvg.csv").then(function(data) {
  data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
  });

  const margin = { top: 50, right: 50, bottom: 50, left: 70 };  // Adjusted left margin
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#barplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.Platform))])
      .range([0, width])
      .padding(0.1);

  const x1 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.PostType))])
      .range([0, x0.bandwidth()])
      .padding(0.05);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .range([height, 0]);

  const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

  svg.append("g")
      .call(d3.axisLeft(y));

  const barGroups = svg.selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  barGroups.append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.AvgLikes))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.AvgLikes))
      .attr("fill", d => color(d.PostType));

  // Add labels to axes
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("Platform");

  svg.append("text")
      .attr("transform", "rotate(-90)")  // Rotate the y-axis label
      .attr("y", 0 - margin.left + 20)  // Adjust label's position to avoid overlap
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Average Likes");
});



// Part 2.3: Lineplot (with Y-axis labels)

d3.csv("SocialMediaTime.csv").then(function(data) {
  data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
  });

  // Parse dates from format "3/1/2024 (Friday)"
  const parseDate = d3.timeParse("%m/%d/%Y (%A)");
  data.forEach(d => {
      d.Date = parseDate(d.Date);
  });

  // Set margins and dimensions
  const margin = { top: 50, right: 50, bottom: 80, left: 70 };  // Adjusted left margin for axis labels
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG to lineplot div
  const svg = d3.select("#lineplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .range([height, 0]);

  // Add axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d (%a)")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-25)");

  svg.append("g")
      .call(d3.axisLeft(y));

  // Define line generator
  const line = d3.line()
      .x(d => x(d.Date))
      .y(d => y(d.AvgLikes))
      .curve(d3.curveNatural);

  // Draw line
  svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

  // Add data points
  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.Date))
      .attr("cy", d => y(d.AvgLikes))
      .attr("r", 4)
      .attr("fill", "orange");

  // Add labels to axes
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("text-anchor", "middle")
      .text("Date");

  svg.append("text")
      .attr("transform", "rotate(-90)")  // Rotate the y-axis label
      .attr("y", 0 - margin.left + 20)  // Adjust label's position to avoid overlap
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Average Likes");
});