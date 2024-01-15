import dash
from dash import html, dcc, dash_table
from dash.dependencies import Input, Output, State
import dash_bootstrap_components as dbc
import data_prep
from dash.exceptions import PreventUpdate
import pandas as pd
from dash import callback_context
import dash_daq as daq

app = dash.Dash(__name__, suppress_callback_exceptions=True, external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME])

# Load data using data_prep functions
gefahr = pd.read_csv('../csv-files-filtered/filtered-ad_gefahr-20231128.csv', sep='#', quotechar='`')
meldung = pd.read_csv('../csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')
meldung['link'] = meldung['id'].apply(lambda x: f'[<i class="fa-solid fa-arrow-up-right-from-square"></i>](/meldung/{x})')
steckbrief = pd.read_csv('../csv-files-filtered/filtered-ad_steckbrief-20231128.csv', sep='#', quotechar='`')
steckbrief['link'] = steckbrief['id'].apply(lambda x: f'[<i class="fa-solid fa-arrow-up-right-from-square"></i>](/steckbrief/{x})')

steckbriefXmeldung = pd.read_csv('../csv-files-filtered/filtered-ad_meldung_ad_steckbrief-20231128.csv', sep='#', quotechar='`')
steckbriefXgefahr = pd.read_csv('../csv-files-filtered/filtered-ad_steckbrief_ad_gefahr-20231128.csv', sep='#', quotechar='`')
meldungXgefahr = pd.read_csv('../csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')

gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
gefahr_counts.columns = ['id', 'count']
gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de']], on='id', how='left')
max_gefahr = len(gefahr_counts)

# Initialize the list directly in the layout
bezeichnung_list = [html.Li(bez) for bez in gefahr_counts['bezeichnung_de']]


date = html.Center(dcc.DatePickerRange(start_date_placeholder_text="Start Period",
                            end_date_placeholder_text="End Period", id='date_filter', display_format='DD/MM/YYYY', updatemode = 'bothdates', clearable=True))

app.layout = html.Div([
    html.H1('Adura', style={'font-size':'40px', 'font-family': 'math', 'margin-left':'30px', 'margin-top':'30px'}),
    html.Div([
        dcc.Graph(id='treemap', figure=data_prep.create_treemap(gefahr_counts, 20)),
        html.Center(['Anzahl der Gefahr: ', daq.NumericInput(id='top_gefahr', value=20, max= max_gefahr, style={'width':'50px'}), date]),        
    ]),
    html.Br(),
    html.Div(id='tbl_meldung'),
    html.Br(),
    html.Div(id='tbl_steckbrief')
])


@app.callback(
    Output("treemap", "figure"),
    [Input("date_filter", "start_date"),
     Input("date_filter", "end_date"),
     Input("top_gefahr", "value")]
)
def update_treemap(start_date, end_date, top_gefahr_value):
    ctx = callback_context

    if not ctx.triggered_id:
        raise PreventUpdate

    trigger_id = ctx.triggered_id.split(".")[0]

    # Your existing code to filter based on date and create the treemap
    meldung['erf_date'] = pd.to_datetime(meldung['erf_date'], errors='coerce')
    
    if start_date and end_date:
        meldung_datum = meldung[(meldung['erf_date'] >= start_date) & (meldung['erf_date'] <= end_date)]
        gefahr_datum = meldungXgefahr[meldungXgefahr['meldung_id'].isin(meldung_datum['id'])]
    else:
        # Use the entire dataset if start_date or end_date is missing
        gefahr_datum = meldungXgefahr

    gefahr_counts_filtered = gefahr_datum['gefahr_id'].value_counts().reset_index()
    gefahr_counts_filtered.columns = ['id', 'count']
    gefahr_counts_filtered = pd.merge(gefahr_counts_filtered, gefahr[['id', 'bezeichnung_de']], on='id', how='left')

    if trigger_id == "date_filter":
        if not start_date or not end_date:
            raise PreventUpdate

    elif trigger_id == "top_gefahr":
        if top_gefahr_value is None:
            raise PreventUpdate

    # Your existing code to create the treemap based on gefahr_counts_filtered
    return data_prep.create_treemap(gefahr_counts_filtered, top_gefahr_value)




# Callback to capture clicked element information
@app.callback(
    [Output('tbl_meldung', 'children'),
    Output('tbl_steckbrief', 'children')],
    [Input('treemap', 'clickData')]
)
def display_selected_data(click_data):
    if click_data:
        # Extract information about the clicked element
        selected_element = click_data['points'][0]
        selected_id = selected_element['id']

        selected_gefahr_counts_row = gefahr_counts[gefahr_counts['bezeichnung_de'] == selected_id]

        selected_meldung_table = data_prep.filter_table('Meldung', meldung, selected_gefahr_counts_row, meldungXgefahr, ['titel', 'kurzinfo', 'sterne', 'erf_date', 'link'])                                                  
        selected_steckbrief_table = data_prep.filter_table('Steckbrief', steckbrief, selected_gefahr_counts_row, meldungXgefahr,['titel', 'kurzinfo', 'priority', 'erf_date','link'])

        return [selected_meldung_table, selected_steckbrief_table]
    else:
        return [None, None]

if __name__ == '__main__':
    app.run_server(debug=True,port=8051)
