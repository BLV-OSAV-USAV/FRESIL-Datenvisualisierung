import dash
from dash import dcc, html
from dash.dependencies import Input, Output

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1('D3.js Graph in Dash App'),

    # Div to hold the D3.js graph
    html.Div(id='d3-container'),

    # Script to execute the D3.js code
    dcc.Interval(id='interval-component', interval=1*1000, n_intervals=0)
])

# D3.js script to be embedded
d3_script = """
// Your D3.js code here
const data = [10, 25, 30, 45, 50];

// D3.js code for creating a bar chart
const svg = d3.select("#d3-container")
    .append("svg")
    .attr("width", 400)
    .attr("height", 200);

svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (400 / data.length))
    .attr("y", d => 200 - d)
    .attr("width", 400 / data.length - 2)
    .attr("height", d => d)
    .attr("fill", "steelblue");
"""

@app.callback(
    Output('d3-container', 'children'),
    Input('interval-component', 'n_intervals')
)
def render_d3_graph(n_intervals):
    return [html.Div([html.Script(d3_script, type='text/javascript')])]

if __name__ == '__main__':
    app.run_server(debug=True)
