from bs4 import BeautifulSoup
import pandas as pd
import plotly.express as px

def html_parser(path):
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def public_data(doc):
    return doc[doc['is_public']]

def create_treemap(csv_file, initial_categories):
    return px.treemap(csv_file.head(initial_categories),
                     path=['bezeichnung_de'],
                     values='count',
                     title=f'Top {initial_categories} Gefahr')
                     

