from bs4 import BeautifulSoup
import pandas as pd
import os
import re

def html_parser(path):
    """
    Parse HTML content in CSV file cells using BeautifulSoup.

    Parameters:
    - path (str): Path to the CSV file.

    Returns:
    - DataFrame: Parsed DataFrame with HTML content replaced by text.
    """
    csv_file = pd.read_csv(path, sep='|')
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def format_single_line(entry):
    """
    Format text to remove line breaks.

    Parameters:
    - entry (str): Input text.

    Returns:
    - str: Text with line breaks removed.
    """
    if isinstance(entry, str):
        return re.sub(r'\s+', ' ', entry)
    else:
        return entry

def remove_stx_characters(entry):
    """
    Remove ASCII STX characters.

    Parameters:
    - entry (str): Input text.

    Returns:
    - str: Text with STX characters removed.
    """
    if isinstance(entry, str):
        return entry.replace('\x02', '')
    else:
        return entry

def public_data(file, column):
    """
    Filter rows with True values in a specific column.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Filtered DataFrame.
    """
    return file[file[column]]

def autorisierung_dok(file, column):
    """
    Filter rows with a specific value in a column.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Filtered DataFrame.
    """
    return file[file[column] == 10]

def open_status(file, column):
    """
    Filter rows with specific values in a column.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Filtered DataFrame.
    """
    return file[file[column].isin([20, 70])]

def convert_to_bool(file, column):
    """
    Convert boolean values to string representation.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    file[column] = file[column].map({True: 'true', False: 'false'})
    return file

def convert_to_int(file, column):
    """
    Convert column to integer datatype.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    file[column] = file[column].round().astype('Int64') 
    return file   

def convert_datetime_format(file, column):
    """
    Convert date format to be compatible with cube creator.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    for column in ['erf_date','mut_date']:
        file[column] = pd.to_datetime(file[column], format='%d.%m.%Y %H:%M:%S').dt.strftime('%Y-%m-%dT%H:%M:%S')
        file[f'Dates_{column}'] = pd.to_datetime(file[column]).dt.date
    return file

def change_Unspecified_matrix(file,column):
    """
    Change values in a specific column.

    Parameters:
    - file (DataFrame): Input DataFrame.
    - column (str): Column name.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    dc = {
        'Nicht spezifiziert': 'Diverse',
        'Non spécifié': 'Divers',
        'Non specificato': 'Alimenti vari',
        'Unclassified': 'Diverse foods'
    }
    file.replace(dc, inplace=True)
    return file

def filter_unspecified_matrixXmeldung(file):
    """
    Filter rows based on specific conditions.

    Parameters:
    - file (DataFrame): Input DataFrame.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    meldung_ids = file[file['matrix_id'] == 1].meldung_id
    meldung_id_2 = file[(file['meldung_id'].isin(meldung_ids)) & (file['matrix_id'] != 1)]
    rows_to_drop = (file['meldung_id'].isin(meldung_id_2)) & (file['matrix_id'] == 1)
    file = file[~rows_to_drop]
    return file

def filter_nonOpen_meldung(file):
    """
    Filter rows based on data from another file.

    Parameters:
    - file (DataFrame): Input DataFrame.

    Returns:
    - DataFrame: Updated DataFrame.
    """
    meldung = pd.read_csv('./csv-files/ad_meldung-20231128.csv', sep='|')
    meldung_ids = meldung['id'] 
    file = file[file['meldung_id'].isin(meldung_ids)]
    return file

def prep_data(input_path, output_path):
    """
    Prepare data by applying various transformations.

    Parameters:
    - input_path (str): Path to the input CSV file.
    - output_path (str): Path to save the output CSV file.

    Returns:
    - DataFrame: Processed DataFrame.
    """
    try:
        file = html_parser(input_path)
        file = file.apply(remove_stx_characters, axis=1)
        file = file.apply(format_single_line, axis=1)

        if input_path == './csv-files/ad_meldung_ad_matrix-20231128.csv':
            file = filter_unspecified_matrixXmeldung(file)

        column_functions = {
            'is_public': public_data,
            'autorisierung': autorisierung_dok,
            'status': open_status, 
            'erf_date': convert_datetime_format,
            'signal': convert_to_bool,
            'sterne': convert_to_int,
            'page_count': convert_to_int,
            'publikation_id': convert_to_int,
            #'bezeichnung_de': change_Unspecified_matrix
        }

        for column, func in column_functions.items():
            if column in file.columns:
                file = func(file, column)

        if input_path == './csv-files/ad_publikation_detail-20231128.csv':
            return file.to_csv(output_path, sep='|', quotechar='"', index=False, encoding='utf-8-sig')
        else:
            return file.to_csv(output_path, sep='#', quotechar='`', index=False, encoding='utf-8-sig')

    except pd.errors.EmptyDataError:
        print(f"Warning: {input_path} is empty. Skipping.")

# Define input and output directories
input_directory = './csv-files'
output_directory = './web-app/csv-files-filtered'

# Loop through each file in the input directory
for file in os.listdir(input_directory):
    if file.endswith('.csv'):
        # Generate input and output paths
        input_path = os.path.join(input_directory, file)
        output_path = os.path.join(output_directory, f'filtered-{file}')

        # Run the prep_data function for each CSV file
        df = prep_data(input_path, output_path)
