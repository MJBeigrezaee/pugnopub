import bibtexparser
import json

def read_bib_file(input_bib_file):
    with open(input_bib_file, 'r', encoding='utf-8') as f:
        try:
            bib_database = bibtexparser.load(f)
        except bibtexparser.bibdatabase.UndefinedString as e:
            print(f"Warning: Undefined string '{e}' encountered. Skipping entry.")
            bib_database = None
    return bib_database.entries if bib_database else []

def process_bib_file(input_bib_file, output_json_file):
    bib_entries = read_bib_file(input_bib_file)
    
    filtered_entries = []
    for entry in bib_entries:
        # Check for non-journal papers (conference, workshop, etc.)
        if 'journal' not in entry or 'none' in entry['journal'].lower():
            continue  # Skip non-journal papers

        # Check if "pugno" is an author
        if 'author' in entry and 'pugno' in entry['author'].lower():
            filtered_entries.append(entry)

    # Sort by year (descending order)
    filtered_entries.sort(key=lambda x: x.get('year', 0), reverse=True)

    # Prepare the JSON structure
    json_data = []
    for entry in filtered_entries:
        paper = {
            "title": entry.get('title', ''),
            "author": entry.get('author', ''),
            "journal": entry.get('journal', ''),
            "year": entry.get('year', ''),
            "volume": entry.get('volume', ''),
            "pages": entry.get('pages', ''),
            "doi": entry.get('doi', ''),
        }
        json_data.append(paper)

    # Write to output JSON file
    with open(output_json_file, 'w', encoding='utf-8') as json_file:
        json.dump(json_data, json_file, ensure_ascii=False, indent=4)

# File paths
input_bib_file = 'filtered_sorted.bib'
output_json_file = 'output_file.json'

# Process the BibTeX file and output the result in JSON format
process_bib_file(input_bib_file, output_json_file)
