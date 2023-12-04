from bs4 import BeautifulSoup
import pandas as pd
import plotly.express as px


def html_parser(path):
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def public_data(doc):
    doc = doc[doc['is_public'] == True] 
    return doc


def create_treemap(gefahr_counts, initial_categories):
    return px.treemap(gefahr_counts.head(initial_categories),
                     path=['bezeichnung_de'],
                     values='count',
                     title=f'Top {initial_categories} Gefahr')