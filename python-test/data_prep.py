from bs4 import BeautifulSoup
import pandas as pd
import plotly.express as px
from dash import html, dcc, dash_table

def html_parser(path):
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def public_data(doc):
    return doc[doc['is_public']]

def create_treemap(csv_file, initial_categories):
    fig = px.treemap(csv_file.head(initial_categories),
                     path=['bezeichnung_de'],
                     values='count')
    fig.update_layout(margin=dict(l=0, r=0, b=0, t=0))
    fig.update_traces(textfont=dict(size=20))
    fig.update_traces(hovertemplate='<b>%{label}<b> <br> Meldungenanzahl: %{value}')
    return fig

def create_table(title, file):
    return html.Div([html.H3(title), dash_table.DataTable(style_data={'whiteSpace': 'normal', 'height': 'auto'}, 
                                                                    data = file.to_dict('records'), 
                                                                    columns = [{"name": i, "id": i} for i in file.columns],
                                                                    filter_action="native",
                                                                    sort_action="native",
                                                                    sort_mode="multi",
                                                                    page_action="native",
                                                                    page_current= 0,
                                                                    page_size= 5,
                                                                    style_cell={'textAlign': 'left'},
                                                                    export_format='xlsx',
                                                                    export_headers='display')])
                     

def filter_table(title, file, gefahr_count_row, gefahr_id_file, columns):

    filtered_data = gefahr_id_file[gefahr_id_file['gefahr_id'] == gefahr_count_row['id'].item()]
    selected_table = file[file['id'].isin(filtered_data['meldung_id'])]
    selected_table = selected_table[columns]
    selected_table = create_table(title, selected_table)
    
    return selected_table