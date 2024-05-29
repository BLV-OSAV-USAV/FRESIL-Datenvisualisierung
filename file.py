import csv
import base64

# Path to your CSV file
csv_file_path = './csv-files-filtered/filtered-ad_document-20231128.csv'

# Open the CSV file and read its contents
with open(csv_file_path, newline='') as csvfile:
    reader = csv.DictReader(csvfile, delimiter='#')
    
    for row in reader:
        print(row)  # Print the keys to check the headers
        doc_id = row['\ufeffid']
        name = row['name']
        mime_type = row['mime_type']
        extension = row['extension']
        base64_data = row['data']  # Assuming the data is base64 encoded
        
        if base64_data != 'System.Byte[]':
            # Decode the base64 data
            binary_data = base64.b64decode(base64_data)
            
            # Save the binary data to a file
            file_name = f"{name}.{extension}"
            with open(file_name, 'wb') as file:
                file.write(binary_data)
            
            print(f"Saved {file_name}")
        else:
            print(f"No binary data for {name}")

# If 'data' field contains actual binary data, this will decode and save it
