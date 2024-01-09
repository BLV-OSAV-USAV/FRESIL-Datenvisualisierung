from bs4 import BeautifulSoup
import pandas as pd
import os

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
    # Filter rows where 'autorisierung' column has a value of 10
    return file[file['autorisierung'] == 10]

def open_status(file):
    # Filter rows where 'status' column has values 20 or 70
    return file[file['status'].isin([20, 70])]

def prep_data(input_path, output_path):
    try:
        file = html_parser(input_path)

        # Define functions to filter data based on specific columns
        column_functions = {
            'is_public': public_data,
            'autorisierung': autorisierung_dok,
            'status': open_status
        }

        # Apply the specified filter function for each column
        for column, func in column_functions.items():
            if column in file.columns:
                file = func(file)

        # Save the filtered DataFrame to a new CSV file using '#' as the separator, " as quotation, and utf-8 encoding
        return file.to_csv(output_path, sep='#', quotechar='"', index=False, encoding='utf-8-sig')

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
