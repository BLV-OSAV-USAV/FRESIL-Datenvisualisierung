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

def public_data(file):
    # Filter rows where 'is_public' column has True values
    return file[file['is_public']]

def autorisierung_dok(file):
    # Filter rows where 'autorisierung' column has a value of 10 (Public)
    return file[file['autorisierung'] == 10]

def open_status(file):
    # Filter rows where 'status' column has values 20 (Freigegeben) or 70 (Abgeschlossen)
    return file[file['status'].isin([20, 70])]

def convert_datetime_format(file):
    # change the format of dates to be compatible with cube creator
    for column in ['erf_date','mut_date']:
        file[column] = pd.to_datetime(file[column], format='%d.%m.%Y %H:%M:%S').dt.strftime('%Y-%m-%dT%H:%M:%S')
    return file

def format_single_line(entry):
    # get rid of new lines
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

def prep_data(input_path, output_path):
    try:
        file = html_parser(input_path)

        # Apply remove_stx_characters to each cell in the DataFrame
        file = file.map(remove_stx_characters)

        # Apply format_single_line to each cell in the DataFrame
        file = file.map(format_single_line)

        # Define functions to filter data based on specific columns
        column_functions = {
            'is_public': public_data,
            'autorisierung': autorisierung_dok,
            'status': open_status, 
            'erf_date': convert_datetime_format
        }

        # Apply the specified filter function for each column
        for column, func in column_functions.items():
            if column in file.columns:
                file = func(file)

        # Save the filtered DataFrame to a new CSV file using '#' as the separator, " as quotation, and utf-8 encoding
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
