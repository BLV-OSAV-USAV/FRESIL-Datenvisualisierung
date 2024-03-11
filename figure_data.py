#Extract data to create different vizualisation


import pandas as pd
import numpy as np

def count_gefahr(timeFilter, bereichName):
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    gefahr = pd.read_csv('./csv-files-filtered/filtered-ad_gefahr-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')
    bereich = pd.read_csv('./csv-files-filtered/filtered-ad_bereich-20231128.csv', sep='#', quotechar='`')
    bereichXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv', sep='#', quotechar='`')

    if timeFilter != 'all':
        meldung['erfDate'] = pd.to_datetime(meldung['erf_date']).dt.date
        today = pd.to_datetime('2023-11-28') #pd.to_datetime('today').date()

        if timeFilter == 'week':
            start = (today - pd.DateOffset(weeks=1)).date()
        elif timeFilter == 'month':
            start = (today - pd.DateOffset(month=1)).date()
        elif timeFilter == 'year':
            start = (today - pd.DateOffset(years=1)).date()

        meldung = meldung[meldung['erfDate'] >= start]
        meldung_time_ids = meldung['id']
        meldungXgefahr = meldungXgefahr[meldungXgefahr['meldung_id'].isin(meldung_time_ids)]

    if bereichName != 'all':
        selected_bereich_id = bereich.loc[bereich['bezeichnung_de'] == bereichName, 'id'].values[0]
        meldung_bereich_ids = bereichXmeldung.loc[bereichXmeldung['bereich_id'] == selected_bereich_id, 'meldung_id'].values
        meldungXgefahr = meldungXgefahr[meldungXgefahr['meldung_id'].isin(meldung_bereich_ids)]


    # Compter le nombre de meldung par gefahr
    gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
    gefahr_counts.columns = ['id', 'count']
    
    # Calculer la moyenne des valeurs de 'sterne' par gefahr
    merged_df = pd.merge(meldungXgefahr, meldung[['id', 'sterne']], left_on='meldung_id', right_on='id', how='left')
    mean_sterne = merged_df.groupby('gefahr_id')['sterne'].mean().reset_index()
    mean_sterne.columns = ['id', 'mean_sterne']
    mean_sterne['mean_sterne'] = mean_sterne['mean_sterne'].round(2)

    # Fusionner les résultats avec le DataFrame existant
    gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de', 'bezeichnung_fr', 'bezeichnung_it', 'bezeichnung_en']], on='id', how='left')
    gefahr_counts = pd.merge(gefahr_counts, mean_sterne, on='id', how='left')


    # Enregistrer le résultat dans un fichier CSV
    if bereichName == 'Betrug / Täuschung':
        gefahr_counts.to_csv(f'./figure_data/base/gefahr_counts_{timeFilter}_BetrugTauschung.csv', index=False)
    else:
        gefahr_counts.to_csv(f'./figure_data/base/gefahr_counts_{timeFilter}_{bereichName}.csv', index=False)


def gefahr_treiber_count(lg):
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    treiber = pd.read_csv('./csv-files-filtered/filtered-ad_treiber-20231128.csv', sep='#', quotechar='`')
    treiberXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_treiber-20231128.csv', sep='#', quotechar='`')
    
    merged_df = pd.merge(meldungXgefahr, treiberXmeldung, on='meldung_id')
    result_df_gefahr = merged_df.groupby(['gefahr_id', 'treiber_id']).size().unstack(fill_value=0)
    result_df_gefahr = result_df_gefahr.reset_index()
    result_df_gefahr.columns.values[1:] = treiber[f'bezeichnung_{lg}']


    # Enregistrer le résultat dans un fichier CSV
    result_df_gefahr.to_csv(f'./figure_data/treiber/gefahr_treiber_counts_{lg}.csv', index=False)


def count_matrix(timeFilter, bereichName):
    # Charger les fichiers CSV
    meldungXmatrix = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv', sep='#', quotechar='`')
    matrix = pd.read_csv('./csv-files-filtered/filtered-ad_matrix-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')
    bereich = pd.read_csv('./csv-files-filtered/filtered-ad_bereich-20231128.csv', sep='#', quotechar='`')
    bereichXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv', sep='#', quotechar='`')

    if timeFilter != 'all':
        meldung['erfDate'] = pd.to_datetime(meldung['erf_date']).dt.date
        today = pd.to_datetime('2023-11-28') #pd.to_datetime('today').date()
        
        if timeFilter == 'week':
            start = (today - pd.DateOffset(weeks=1)).date()
        elif timeFilter == 'month':
            start = (today - pd.DateOffset(month=1)).date()
        elif timeFilter == 'year':
            start = (today - pd.DateOffset(years=1)).date()
        
        meldung = meldung[meldung['erfDate'] >= start]
        meldung_time_ids = meldung['id']
        meldungXmatrix = meldungXmatrix[meldungXmatrix['meldung_id'].isin(meldung_time_ids)]

    if bereichName != 'all':
        selected_bereich_id = bereich.loc[bereich['bezeichnung_de'] == bereichName, 'id'].values[0]
        meldung_bereich_ids = bereichXmeldung.loc[bereichXmeldung['bereich_id'] == selected_bereich_id, 'meldung_id'].values
        meldungXmatrix = meldungXmatrix[meldungXmatrix['meldung_id'].isin(meldung_bereich_ids)]

    # Compter le nombre de meldung par matrix
    matrix_counts = meldungXmatrix['matrix_id'].value_counts().reset_index()
    matrix_counts.columns = ['id', 'count']

    # Calculer la moyenne des valeurs de 'sterne' par matrix
    merged_df = pd.merge(meldungXmatrix, meldung[['id', 'sterne']], left_on='meldung_id', right_on='id', how='left')
    mean_sterne = merged_df.groupby('matrix_id')['sterne'].mean().reset_index()
    mean_sterne.columns = ['id', 'mean_sterne']
    mean_sterne['mean_sterne'] = mean_sterne['mean_sterne'].round(2)

    dc = {
        'Nicht spezifiziert': 'Diverse Lebensmittel',

        'Non spécifié': 'Aliments divers',

        'Non specificato': 'Alimenti vari',

        'Unclassified': 'Diverse foods'
    }

    # Fusionner les résultats avec le DataFrame existant
    matrix_counts = pd.merge(matrix_counts, matrix[['id', 'bezeichnung_de', 'bezeichnung_fr', 'bezeichnung_it', 'bezeichnung_en']], on='id', how='left')
    matrix_counts = pd.merge(matrix_counts, mean_sterne, on='id', how='left')
    matrix_counts.replace(dc, inplace = True)
    
    # Enregistrer le résultat dans un fichier CSV
    if bereichName == 'Betrug / Täuschung':
        matrix_counts.to_csv(f'./figure_data/base/matrix_counts_{timeFilter}_BetrugTauschung.csv', index=False)
    else:
        matrix_counts.to_csv(f'./figure_data/base/matrix_counts_{timeFilter}_{bereichName}.csv', index=False)


def matrix_treiber_count(lg):
    # Charger les fichiers CSV
    meldungXmatrix = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv', sep='#', quotechar='`')
    treiber = pd.read_csv('./csv-files-filtered/filtered-ad_treiber-20231128.csv', sep='#', quotechar='`')
    treiberXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_treiber-20231128.csv', sep='#', quotechar='`')
    
    merged_df = pd.merge(meldungXmatrix, treiberXmeldung, on='meldung_id')
    result_df_matrix = merged_df.groupby(['matrix_id', 'treiber_id']).size().unstack(fill_value=0)
    result_df_matrix = result_df_matrix.reset_index()
    result_df_matrix.columns.values[1:] = treiber[f'bezeichnung_{lg}']


    # Enregistrer le résultat dans un fichier CSV
    result_df_matrix.to_csv(f'./figure_data/treiber/matrix_treiber_counts_{lg}.csv', index=False)

    # Enregistrer le résultat dans un fichier CSV
    result_df_matrix.to_csv(f'./figure_data/bereich/matrix_bereich_counts_{lg}.csv', index=False)


def list_meldung_pro_Gefahr(id):
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')

    meldung_ids = list(meldungXgefahr.meldung_id[meldungXgefahr['gefahr_id'] == id])

    meldungs = meldung[meldung['id'].isin(meldung_ids)]
    print(meldungs)


for i in ['de','fr','it','en']:
    matrix_treiber_count(i)
    gefahr_treiber_count(i)

bereich_csv = pd.read_csv('./csv-files-filtered/filtered-ad_bereich-20231128.csv', sep='#', quotechar='`')
bereich_list = bereich_csv.bezeichnung_de.unique()
bereich_list = np.append(bereich_list, 'all')

for bereich in bereich_list:
    count_gefahr('year', bereich)
    count_gefahr('month', bereich)
    count_gefahr('week', bereich)
    count_gefahr('all', bereich)

    count_matrix('year', bereich)
    count_matrix('month', bereich)
    count_matrix('week', bereich)
    count_matrix('all', bereich) 


