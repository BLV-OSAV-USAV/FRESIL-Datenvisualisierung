import dash
from dash import html, dcc, dash_table
from dash.dependencies import Input, Output, State
import dash_bootstrap_components as dbc
import data_prep
from dash.exceptions import PreventUpdate
import pandas as pd

app = dash.Dash(__name__, suppress_callback_exceptions=True, external_stylesheets=[dbc.themes.BOOTSTRAP])

# Load data using data_prep functions
gefahr = data_prep.html_parser('../csv-files/ad_gefahr-20231128.csv')
meldung = data_prep.public_data(data_prep.html_parser('../csv-files/ad_meldung-20231128.csv'))
steckbrief = data_prep.public_data(data_prep.html_parser('../csv-files/ad_steckbrief-20231128.csv'))

steckbriefXmeldung = data_prep.html_parser('../csv-files/ad_meldung_ad_steckbrief-20231128.csv')
steckbriefXgefahr = data_prep.html_parser('../csv-files/ad_steckbrief_ad_gefahr-20231128.csv')
meldungXgefahr = data_prep.html_parser('../csv-files/ad_meldung_ad_gefahr-20231128.csv')

gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
gefahr_counts.columns = ['id', 'count']
gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de']], on='id', how='left')

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

meldung_table = dash_table.DataTable(data=data_prep.load_meldung_data(), columns=data_prep.meldung_columns(meldung))

date = html.Center(dcc.DatePickerRange(start_date_placeholder_text="Start Period",
                            end_date_placeholder_text="End Period", id='date_filter'))

app.layout = html.Div([
    html.H1('ADURA'),
    html.Div([
        dcc.Graph(id='treemap', figure=data_prep.create_treemap(gefahr_counts, 20)),
        date
    ]),
    html.Br(),
    html.Div([
        collapse
    ]),
    html.Div([
        meldung_table
    ], id='tbl')
])


@app.callback(
    Output("treemap", "figure"),
    Input("date_filter", "start_date"),
    Input("date_filter", "end_date"),
)
def filter_treemap(start_date, end_date):
    if not start_date or not end_date:
        raise PreventUpdate
    else:
        # Convert the 'erf_date' column to a consistent datetime format
        meldung['erf_date'] = pd.to_datetime(meldung['erf_date'], errors='coerce')

        # Filter based on the datetime format
        meldung_datum = meldung[(meldung['erf_date'] >= start_date) & (meldung['erf_date'] <= end_date)]

        # Continue with the rest of your code
        gefahr_datum = meldungXgefahr[meldungXgefahr['meldung_id'].isin(meldung_datum['id'])]
        gefahr_counts_filtered = gefahr_datum['gefahr_id'].value_counts().reset_index()
        gefahr_counts_filtered.columns = ['id', 'count']
        gefahr_counts_filtered = pd.merge(gefahr_counts_filtered, gefahr[['id', 'bezeichnung_de']], on='id', how='left')
        return data_prep.create_treemap(gefahr_counts_filtered, 20)

# Callback to capture clicked element information
@app.callback(
    [Output('tbl', 'children')],
    [Input('treemap', 'clickData')]
)
def display_selected_data(click_data):
    if click_data:
        # Extract information about the clicked element
        selected_element = click_data['points'][0]
        selected_id = selected_element['id']

        selected_gefahr_counts_row = gefahr_counts[gefahr_counts['bezeichnung_de'] == selected_id]
        filtered_data = meldungXgefahr[meldungXgefahr['gefahr_id'] == selected_gefahr_counts_row['id'].item()]
        selected_meldung_table = meldung[meldung['id'].isin(filtered_data['meldung_id'])]
        selected_meldung_table = selected_meldung_table[['titel', 'kurzinfo', 'sterne', 'erf_date']]

        selected_meldung_table = dash_table.DataTable(style_data={'whiteSpace': 'normal', 'height': 'auto'}, 
                                                                    data = selected_meldung_table.to_dict('records'), 
                                                                    columns = [{"name": i, "id": i} for i in selected_meldung_table.columns],
                                                                    filter_action="native",
                                                                    sort_action="native",
                                                                    sort_mode="multi",
                                                                    page_action="native",
                                                                    page_current= 0,
                                                                    page_size= 5,
                                                                    style_cell={'textAlign': 'left'})
        
        return [selected_meldung_table]
    else:
        return [None]

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
    app.run_server(debug=True,port=8050)
