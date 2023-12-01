import dash
from dash import Dash, html, dcc, dash_table
from dash.dependencies import Input, Output, State
import pandas as pd
import plotly.express as px
import dash_bootstrap_components as dbc
from bs4 import BeautifulSoup

app = dash.Dash(__name__, suppress_callback_exceptions=True, external_stylesheets=[dbc.themes.BOOTSTRAP])


steckbrief = pd.read_csv('../csv-files/ad_steckbrief-20231128.csv', sep='|')
meldung = pd.read_csv('../csv-files/ad_meldung-20231128.csv', sep='|')
gefahr = pd.read_csv('../csv-files/ad_gefahr-20231128.csv', sep='|')

steckbriefXmeldung = pd.read_csv('../csv-files/ad_meldung_ad_steckbrief-20231128.csv', sep='|')
steckbriefXgefahr = pd.read_csv('../csv-files/ad_steckbrief_ad_gefahr-20231128.csv', sep='|')
meldungXgefahr = pd.read_csv('../csv-files/ad_meldung_ad_gefahr-20231128.csv', sep='|')


gefahr_counts = steckbriefXgefahr['gefahr_id'].value_counts().reset_index()
gefahr_counts.columns = ['id', 'count']
gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de']], on='id', how='left')

# Remove HTML tags from bezeichnung_de for all rows
gefahr_counts['bezeichnung_de'] = gefahr_counts['bezeichnung_de'].apply(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)


initial_categories = 20

treemap = px.treemap(gefahr_counts.head(initial_categories),
            path=['bezeichnung_de'],
            values='count',
            title=f'Top {initial_categories} Gefahr')

# Initialize the list directly in the layout
bezeichnung_list = [html.Li(bez) for bez in gefahr_counts['bezeichnung_de']]

collapse = html.Div(
    [
        dbc.Button("List all Gefahr", id="collapse-button", className="mb-3", color="primary", n_clicks=0),
        dbc.Collapse(
            dbc.Card(
                dbc.CardBody([
                    html.Ul(bezeichnung_list, id="bezeichnung-list"),
                ])
            ),
            id="collapse",
            is_open=False,
        ),
    ]
)

meldung_table = dash_table.DataTable(meldung.to_dict('records'), [{"name": i, "id": i} for i in meldung.columns])


app.layout = html.Div([
    html.H1('ADURA'),
    html.Div([
        dcc.Graph(id= 'treemap', figure=treemap),
        html.Div(id='selected-info')
        ]),
    html.Div([
        collapse
    ]),
    html.Div([
        meldung_table
    ], id='tbl')
])

# Callback to capture clicked element information
@app.callback(
    [Output('selected-info', 'children'),
    Output('tbl', 'children')],
    [Input('treemap', 'clickData')]
)
def display_selected_data(click_data):
    if click_data:
        # Extract information about the clicked element
        selected_element = click_data['points'][0]
        selected_id = selected_element['id']

        selected_gefahr_counts_row = gefahr_counts[gefahr_counts['bezeichnung_de'] == selected_id]
        print(selected_gefahr_counts_row['id'].item())
        filtered_data = meldung[meldung['id'] == selected_gefahr_counts_row['id'].item()]

        selected_meldung_table = dash_table.DataTable(filtered_data.to_dict('records'), [{"name": i, "id": i} for i in filtered_data.columns])
        
        return [f"Clicked Element: {selected_element['id']}", selected_meldung_table]
    else:
        return ["Click on a treemap element to see information.", None]

@app.callback(
    dash.dependencies.Output("collapse", "is_open"),
    [dash.dependencies.Input("collapse-button", "n_clicks")],
    [dash.dependencies.State("collapse", "is_open")],
)
def toggle_collapse(n, is_open):
    if n:
        return not is_open
    return is_open


if __name__ == '__main__':
    app.run_server(debug=True)
