#Extract data to create a piechart in visualize 


import pandas as pd

def count_gefahr():
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv',sep='#',quotechar='`')
    gefahr = pd.read_csv('./csv-files-filtered/filtered-ad_gefahr-20231128.csv',sep='#',quotechar='`')

    gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
    gefahr_counts.columns = ['id', 'count']
    gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de', 'erf_date']], on='id', how='left')
    gefahr_counts['Dates'] = pd.to_datetime(gefahr_counts['erf_date']).dt.date
    gefahr_counts['Time'] = pd.to_datetime(gefahr_counts['erf_date']).dt.time

    gefahr_counts.to_csv('./figure_data/gefahr_counts.csv', sep='#', quotechar='`', index=False)


def count_gefahr_pro_tag():
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv',sep='#',quotechar='`')
    meldung['erfDate'] = pd.to_datetime(meldung['erf_date']).dt.date
    meldung['mutDate'] = pd.to_datetime(meldung['mut_date']).dt.date
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv',sep='#',quotechar='`')
    gefahr = pd.read_csv('./csv-files-filtered/filtered-ad_gefahr-20231128.csv',sep='#',quotechar='`')

    meldungXgefahr = pd.merge(meldungXgefahr, meldung[['id', 'erfDate', 'mutDate']], left_on='meldung_id', right_on='id', how='left')
    meldungXgefahr = meldungXgefahr.dropna(subset=['id'])
    meldungXgefahr['erfDate'] = pd.to_datetime(meldungXgefahr['erfDate'])
    result = meldungXgefahr.groupby([meldungXgefahr['erfDate'].dt.to_period("M"), 'gefahr_id']).size().reset_index(name='count')
    result.to_csv('./figure_data/gefahr_pro_tag.csv', sep='#', quotechar='`', index=False)

    return None

def count_meldung_pro_tag():
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv',sep='#',quotechar='`')
    meldung['erfDate'] = pd.to_datetime(meldung['erf_date']).dt.date
    meldung['mutDate'] = pd.to_datetime(meldung['mut_date']).dt.date

    result = meldung.groupby('erfDate').size().reset_index(name='count')
    result.to_csv('./figure_data/meldung_pro_tag.csv', sep='#', quotechar='`', index=False)

    return None



#count_gefahr()
#count_gefahr_pro_tag()
count_meldung_pro_tag()