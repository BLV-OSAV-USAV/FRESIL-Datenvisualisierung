from bs4 import BeautifulSoup
import pandas as pd
import plotly.express as px
from dash import html, dcc, dash_table

def html_parser(path):
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def public_data(file):
    return file[file['is_public']]


def prep_data(path):
    file = html_parser(path)

    if 'is_public' in file.columns:
        file = public_data(file)
