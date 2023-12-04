from bs4 import BeautifulSoup
import pandas as pd
import plotly.express as px

def html_parser(path):
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def public_data(doc):
    return doc[doc['is_public']]

def create_treemap(gefahr_counts, initial_categories):
    return px.treemap(gefahr_counts.head(initial_categories),
                     path=['bezeichnung_de'],
                     values='count',
                     title=f'Top {initial_categories} Gefahr')
                     
def load_meldung_data():
    # Load and preprocess meldung data
    meldung = public_data(html_parser('../csv-files/ad_meldung-20231128.csv'))
    return meldung.to_dict('records')

def meldung_columns(meldung):
    # Define columns for meldung_table
    return [{"name": i, "id": i} for i in meldung.columns]
