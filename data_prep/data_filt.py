from bs4 import BeautifulSoup
import pandas as pd
import os
import re

def html_parser(path):
    # Read CSV file using pandas with '|' as the separator
    csv_file = pd.read_csv(path, sep='|')
    # Apply BeautifulSoup to each cell in the DataFrame to extract text from HTML
    csv_file = csv_file.applymap(lambda x: BeautifulSoup(x, 'html.parser').text if isinstance(x, str) else x)
    return csv_file

def format_single_line(entry):
    # get rid of line breaks
    if isinstance(entry, str):
        return re.sub(r'\s+', ' ', entry)
    else:
        return entry

def remove_stx_characters(entry):
    # Replace ASCII STX character (code 2) with an empty string
    if isinstance(entry, str):
        return entry.replace('\x02', '')
    else:
        return entry

def public_data(file, column):
    # Filter rows where 'is_public' column has True values
    return file[file[column]]

def autorisierung_dok(file, column):
    # Filter rows where 'autorisierung' column has a value of 10 (Public)
    return file[file[column] == 10]

def open_status(file, column):
    # Filter rows where 'status' column has values 20 (Freigegeben) or 70 (Abgeschlossen)
    return file[file[column].isin([20, 70])]

def convert_to_bool(file, column):
    #convert boolean value to be compatible to cube creator
    file['signal'] = file['signal'].map({True: 'true', False: 'false'})
    return file

def convert_to_int(file, column):
    #convert to int datatype
    file[column] = file[column].round().astype('Int64') 
    return file   

def convert_datetime_format(file, column):
    # change the format of dates to be compatible with cube creator
    for column in ['erf_date','mut_date']:
        file[column] = pd.to_datetime(file[column], format='%d.%m.%Y %H:%M:%S').dt.strftime('%Y-%m-%dT%H:%M:%S')
        file[f'Dates_{column}'] = pd.to_datetime(file[column]).dt.date
    return file

def change_Unspecified_matrix(file,column):
    dc = {
        'Nicht spezifiziert': 'Diverse Lebensmittel',

        'Non spécifié': 'Aliments divers',

        'Non specificato': 'Alimenti vari',

        'Unclassified': 'Diverse foods'
    }
    file.replace(dc, inplace = True)

    return file

def filter_unspecified_matrixXmeldung(file):
    meldung_ids = file[file['matrix_id'] == 1].meldung_id

    meldung_id_2 = file[(file['meldung_id'].isin(meldung_ids)) & (file['matrix_id'] != 1)].meldung_id

    # Create a boolean mask to identify rows to drop
    rows_to_drop = (file['meldung_id'].isin(meldung_id_2)) & (file['matrix_id'] == 1)

    # Drop the rows using the boolean mask
    file = file[~rows_to_drop]

    return file

def filter_nonOpen_meldung(file):
    meldung = pd.read_csv('./csv-files/ad_meldung-20231128.csv', sep='|')
    meldung_ids = meldung['id'] 

    file = file[file['meldung_id'].isin(meldung_ids)]
    return file


def prep_data(input_path, output_path):
    try:
        file = html_parser(input_path)

        # Apply remove_stx_characters to each cell in the DataFrame
        file = file.applymap(remove_stx_characters)

        # Apply format_single_line to each cell in the DataFrame
        file = file.applymap(format_single_line)

        if input_path == './csv-files/ad_meldung_ad_matrix-20231128.csv':
            file = filter_unspecified_matrixXmeldung(file)

        # Define functions to filter data based on specific columns
        column_functions = {
            'is_public': public_data,
            'autorisierung': autorisierung_dok,
            'status': open_status, 
            'erf_date': convert_datetime_format,
            'signal': convert_to_bool,
            'sterne': convert_to_int,
            'page_count': convert_to_int,
            'publikation_id': convert_to_int,
            'bezeichnung_de': change_Unspecified_matrix
        }

        # Apply the specified filter function for each column
        for column, func in column_functions.items():
            if column in file.columns:
                file = func(file, column)

        # Save the filtered DataFrame to a new CSV file using '#' as the separator, " as quotation, and utf-8 encoding
        if input_path == './csv-files/ad_publikation_detail-20231128.csv':
            return file.to_csv(output_path, sep='|', quotechar='"', index=False, encoding='utf-8-sig')
        else:
            return file.to_csv(output_path, sep='#', quotechar='`', index=False, encoding='utf-8-sig')

    except pd.errors.EmptyDataError:
        # Handle the case where the file is empty
        print(f"Warning: {input_path} is empty. Skipping.")

# Define input and output directories
input_directory = './csv-files'
output_directory = './csv-files-filtered'

# Loop through each file in the input directory
for file in os.listdir(input_directory):
    if file.endswith('.csv'):
        # Generate input and output paths
        input_path = os.path.join(input_directory, file)
        output_path = os.path.join(output_directory, f'filtered-{file}')

        # Run the prep_data function for each CSV file
        df = prep_data(input_path, output_path)


