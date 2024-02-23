#Extract data to create different vizualisation


import pandas as pd

def count_gefahr():
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    gefahr = pd.read_csv('./csv-files-filtered/filtered-ad_gefahr-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')

    # Compter le nombre de meldung par gefahr
    gefahr_counts = meldungXgefahr['gefahr_id'].value_counts().reset_index()
    gefahr_counts.columns = ['id', 'count']

    # Calculer la moyenne des valeurs de 'sterne' par gefahr
    merged_df = pd.merge(meldungXgefahr, meldung[['id', 'sterne']], left_on='meldung_id', right_on='id', how='left')
    mean_sterne = merged_df.groupby('gefahr_id')['sterne'].mean().reset_index()
    mean_sterne.columns = ['id', 'mean_sterne']
    mean_sterne['mean_sterne'] = mean_sterne['mean_sterne'].round(2)

    # Fusionner les résultats avec le DataFrame existant
    gefahr_counts = pd.merge(gefahr_counts, gefahr[['id', 'bezeichnung_de']], on='id', how='left')
    gefahr_counts = pd.merge(gefahr_counts, mean_sterne, on='id', how='left')

    # Enregistrer le résultat dans un fichier CSV
    gefahr_counts.to_csv('./figure_data/gefahr_counts.csv', index=False)


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
    result_df_gefahr.to_csv('./figure_data/gefahr_treiber_counts.csv', index=False)


def gefahr_bereich_count(lg):
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    bereich = pd.read_csv('./csv-files-filtered/filtered-ad_bereich-20231128.csv', sep='#', quotechar='`')
    bereichXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv', sep='#', quotechar='`')
    
    merged_df = pd.merge(meldungXgefahr, bereichXmeldung, on='meldung_id')
    result_df_gefahr = merged_df.groupby(['gefahr_id', 'bereich_id']).size().unstack(fill_value=0)
    result_df_gefahr = result_df_gefahr.reset_index()
    result_df_gefahr.columns.values[1:] = bereich[f'bezeichnung_{lg}']


    # Enregistrer le résultat dans un fichier CSV
    result_df_gefahr.to_csv('./figure_data/gefahr_bereich_counts.csv', index=False)


def count_matrix():
    # Charger les fichiers CSV
    meldungXmatrix = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv', sep='#', quotechar='`')
    matrix = pd.read_csv('./csv-files-filtered/filtered-ad_matrix-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')

    # Compter le nombre de meldung par matrix
    matrix_counts = meldungXmatrix['matrix_id'].value_counts().reset_index()
    matrix_counts.columns = ['id', 'count']

    # Calculer la moyenne des valeurs de 'sterne' par matrix
    merged_df = pd.merge(meldungXmatrix, meldung[['id', 'sterne']], left_on='meldung_id', right_on='id', how='left')
    mean_sterne = merged_df.groupby('matrix_id')['sterne'].mean().reset_index()
    mean_sterne.columns = ['id', 'mean_sterne']
    mean_sterne['mean_sterne'] = mean_sterne['mean_sterne'].round(2)

    # Fusionner les résultats avec le DataFrame existant
    matrix_counts = pd.merge(matrix_counts, matrix[['id', 'bezeichnung_de']], on='id', how='left')
    matrix_counts = pd.merge(matrix_counts, mean_sterne, on='id', how='left')

    # Enregistrer le résultat dans un fichier CSV
    matrix_counts.to_csv('./figure_data/matrix_counts.csv', index=False)


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
    result_df_matrix.to_csv('./figure_data/matrix_treiber_counts.csv', index=False)

def matrix_bereich_count(lg):
    # Charger les fichiers CSV
    meldungXmatrix = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv', sep='#', quotechar='`')
    bereich = pd.read_csv('./csv-files-filtered/filtered-ad_bereich-20231128.csv', sep='#', quotechar='`')
    bereichXmeldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv', sep='#', quotechar='`')
    
    merged_df = pd.merge(meldungXmatrix, bereichXmeldung, on='meldung_id')
    result_df_matrix = merged_df.groupby(['matrix_id', 'bereich_id']).size().unstack(fill_value=0)
    result_df_matrix = result_df_matrix.reset_index()
    result_df_matrix.columns.values[1:] = bereich[f'bezeichnung_{lg}']


    # Enregistrer le résultat dans un fichier CSV
    result_df_matrix.to_csv('./figure_data/matrix_bereich_counts.csv', index=False)





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


def list_meldung_pro_Gefahr(id):
    # Charger les fichiers CSV
    meldungXgefahr = pd.read_csv('./csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv', sep='#', quotechar='`')
    meldung = pd.read_csv('./csv-files-filtered/filtered-ad_meldung-20231128.csv', sep='#', quotechar='`')

    meldung_ids = list(meldungXgefahr.meldung_id[meldungXgefahr['gefahr_id'] == id])

    meldungs = meldung[meldung['id'].isin(meldung_ids)]
    print(meldungs)



#list_meldung_pro_Gefahr(188)
gefahr_bereich_count('de')
matrix_bereich_count('de')
#count_matrix()
#matrix_treiber_count('de')
#count_gefahr()
#gefahr_treiber_count('de')
#count_gefahr_pro_tag()
#count_meldung_pro_tag()