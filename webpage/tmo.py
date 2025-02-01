import json

# Path to the JSON file
file_path = "./webpage/publications.json"

# New entry to add
new_entry = {
    "id": "6700",
    "authors": "Marco Guerrieri, Nicola Pugno",
    "title": "ANTi-JAM solutions for smart roads: Ant-inspired traffic flow rules under CAVs environment",
    "pdf": "",
    "journal": "Transportation Research Interdisciplinary Perspectives, (2025), 29, 101331",
    "doi": "https://doi.org/10.1016/j.trip.2025.101331",
    "supplementary": []
}

# Read, modify, and save the JSON file
try:
    # Load the existing data
    with open(file_path, 'r') as file:
        data = json.load(file)

    # Debugging checks
    print("Type of data:", type(data))  # Should be a list
    print("Type of new_entry:", type(new_entry))  # Should be a dictionary

    if isinstance(data, list):
        assert isinstance(new_entry, dict), "new_entry must be a dictionary"
        data.append(new_entry)  # Append the dictionary directly
    else:
        raise ValueError("The JSON file does not contain a list. Cannot append directly.")

    # Save the updated data back to the file
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

    print("Entry added successfully!")
except FileNotFoundError:
    print(f"The file '{file_path}' does not exist.")
except json.JSONDecodeError:
    print("The file is not a valid JSON file.")
