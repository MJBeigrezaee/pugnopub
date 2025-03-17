from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS for enabling cross-origin requests
from ftplib import FTP_TLS
import json

app = Flask(__name__)




# Enable CORS for all routes
CORS(app)


def json_modification():
    # Get the JSON data from the request
    incoming_data = request.get_json()
    print(incoming_data)
    # Check if the 'json' key exists in the incoming data
    if 'json' not in incoming_data:
        return jsonify({'status': 'failure', 'message': 'No JSON data found'}), 400

    new_data = incoming_data['json']
    print("start")
    # Read the current JSON file
    with open('./new_pub/webpage/publications.json', 'r', encoding="UTF-8") as f:
        current_data = json.load(f)

    # Append the new entry to the current data
    current_data.append(new_data)
    print("1")

    # Write the updated data back to the JSON file
    with open('new_pub/webpage/publications.json', 'w', encoding="UTF-8") as f:
        json.dump(current_data, f, indent=4)


# FTP upload function
def upload_file():

    ftp = FTP_TLS('ftps-webhosting.unitn.it')  # Replace with your FTP server
    # Replace with your credentials
    ftp.login('pugnodicam', 'ihD2YjUf1ALZm3emSvf7.')
    ftp.prot_p()  # Switch to secure data connection (PROT P)
    print("\n\n ---------------- NEW SECTION ------------------")
    print("Connected to FTP server:", ftp.getwelcome())
    print("\n\n ---------------- END WELCOME MESSAGE ------------------\n\n")

    try:
        # Rename the existing publications.json to publications_backup.json
        ftp.rename('new_pub/webpage/publications.json', 'new_pub/webpage/publications_backup.json')
        print("Existing file renamed to publications_backup.json")
    except Exception as e:
        # If no file exists or error occurs, continue without renaming
        print("No existing file to rename or error occurred:", e)

    # Now upload the new publications.json
    with open('new_pub/webpage/publications.json', 'rb') as file:
        ftp.storbinary('STOR new_pub/webpage/publications.json', file)
        print("New publications.json file uploaded successfully.")

    # Close the FTP connection
    ftp.quit()


@app.route('/upload', methods=['POST'])
def upload():
    try:
        json_modification() # call modification function
        upload_file()  # Call the upload function
        return jsonify({'status': 'success', 'message': 'JSON uploaded successfully!'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error: {str(e)}'})


if __name__ == '__main__':
    app.run(debug=True)
