let sp500Tickers = [];

// Load S&P 500 tickers
fetch('/static/data/sp500_tickers.json')
    .then(response => response.json())
    .then(data => {
        sp500Tickers = data;
        populateDropdown(sp500Tickers);
        $('#ticker-dropdown').select2({
            dropdownAutoWidth: true,
            width: '100%',
            maximumSelectionLength: 1,
            dropdownCssClass: 'select2-dropdown',
            
        }); // Initialize Select2
    })
    .catch(error => {
        console.error('Error fetching S&P 500 tickers:', error);
    });

// Function to populate the dropdown with tickers
function populateDropdown(tickers) {
    const dropdown = document.getElementById('ticker-dropdown');
    tickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker;
        option.text = ticker;
        dropdown.appendChild(option);
    });
}

// Function to search for the ticker and update the diagram
function searchTicker() {
    const ticker = document.getElementById('ticker-dropdown').value;
    if (sp500Tickers.includes(ticker)) {
        fetchSankeyData(ticker);
        fetchBarChartPercent(ticker);
        fetchBarChartRevenue(ticker);
        fetchBarChartCost(ticker);
        fetchCompanyInformation(ticker);
        fetchFinancialReport(ticker);
    } else {
        alert('Ticker not found in S&P 500 index.');
    }
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', searchTicker);

function fetchSankeyData(ticker) {
    fetch(`/data/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#chart").html("");  // Clear existing chart
            drawSankey(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            d3.select("#chart").append("p").text("Failed to load financial data fffffff");
        });
}

function fetchBarChartPercent(ticker) {
    fetch(`/fetch_net_income_percentage_data/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#bar-chart1").html("");  // Clear existing chart
            drawBarChartPercent(data);
        })
        .catch(error => {
            console.error('Error fetching net income percentage data:', error);
            d3.select("#bar-chart1").append("p").text("Failed to load bar chart data");
        });
}

function fetchBarChartRevenue(ticker) {
    fetch(`/fetch_total_revenue_data/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#bar-chart2").html("");  // Clear existing chart
            drawBarChartRevenue(data);
        })
        .catch(error => {
            console.error('Error fetching total revenue data:', error);
            d3.select("#bar-chart2").append("p").text("Failed to load bar chart data");
        });
}

function fetchBarChartCost(ticker) {
    fetch(`/fetch_cost_data/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#bar-chart3").html("");  // Clear existing chart
            drawBarChartCost(data);
        })
        .catch(error => {
            console.error('Error fetching cost bar chart data:', error);
            d3.select("#bar-chart3").append("p").text("Failed to load bar chart data");
        });
}

function fetchFinancialReport(ticker) {
    fetch(`/fetch_financial_report/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#report-table").html("");
            drawFinancialReport(data);
        })
        .catch(error => {
            console.error('Error fetching financial report data:', error);
            d3.select("#report-table").append("p").text("Failed to load financial report data");
        });
}

function fetchCompanyInformation(ticker) {
    fetch(`/fetch_company_information/${ticker}`)
        .then(response => response.json())
        .then(data => {
            d3.select("#company-info").html(data.description);  // Add the company description
        })
        .catch(error => {
            console.error('Error fetching company information:', error);
            d3.select("#company-info").append("p").text("Failed to load company information");
        });
}

function drawFinancialReport(data) {
    
    let table = `<div class="report-section"><h2>Income Statement</h2><table>`;
    table += `<tr><th class="description"></th><th>2024-03-31</th><th>2023-12-31</th><th>2023-09-30</th><th>2023-06-30</th><th>2023-03-31</th><th>2022-12-31</th><th>2022-09-30</th></tr>`;
    for (const item in data['Income Statement']) {
        table += `<tr><td class="description">${item}</td><td>${data['Income Statement'][item][0]}</td><td>${data['Income Statement'][item][1]}</td><td>${data['Income Statement'][item][2]}</td><td>${data['Income Statement'][item][3]}</td><td>${data['Income Statement'][item][4]}</td><td>${data['Income Statement'][item][5]}</td><td>${data['Income Statement'][item][6]}</td></tr>`;
    }
    table += `</table></div>`;
    document.getElementById("report-table").innerHTML = table;
}

// Initial load for example ticker
fetchSankeyData('AAPL');
fetchBarChartPercent('AAPL');
fetchBarChartRevenue('AAPL');
fetchBarChartCost('AAPL');
fetchCompanyInformation('AAPL')
fetchFinancialReport('AAPL');