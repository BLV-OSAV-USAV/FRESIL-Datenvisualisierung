#Extract data to create a piechart in visualize 


import pandas as pd

def count_gefahr():
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv',sep='#',quotechar='`')
    gefahr = pd.read_csv('./csv-files-filtered/filtered-ad_gefahr-20231128.csv',sep='#',quotechar='`')

    gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
    gefahr_counts.columns = ['id', 'count']
    gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de']], on='id', how='left')

    gefahr_counts.to_csv('gefahr_counts.csv', sep='#', quotechar='`', index=False)

    print(gefahr_counts)

count_gefahr()