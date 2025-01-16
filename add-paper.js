// Check if DOI exists in the current publications.json
async function checkDOI() {
    let doiInput = document.getElementById('doiInput').value.trim();

    // Step 1: Validate DOI format
    if (!doiInput.startsWith('https://doi.org/') && !doiInput.startsWith('doi.org/') && !doiInput.startsWith('10.')) {
        showErrorMessage('Invalid DOI format. Please enter a valid DOI starting with "https://doi.org/", "doi.org/", or "10."');
        return;
    }

    // Step 2: Normalize the user input
    if (doiInput.startsWith('https://doi.org/')) {
        doiInput = doiInput.replace('https://doi.org/', '');
    } else if (doiInput.startsWith('doi.org/')) {
        doiInput = doiInput.replace('doi.org/', '');
    }

    doiInput = 'https://doi.org/' + doiInput;

    try {
        // Fetch the current papers from the JSON file
        const response = await fetch('publications.json');
        const data = await response.json();

        // Step 4: Check if the DOI exists
        const existingPaper = data.find(paper => (paper.doi || '').toLowerCase().trim() === doiInput.toLowerCase().trim());

        if (existingPaper) {
            showErrorMessage('This paper already exists in the database.');
        } else {
            clearErrorMessage();
            await fetchPaperMetadata(doiInput);
        }
    } catch (error) {
        console.error('Error checking DOI:', error);
        showErrorMessage('Error checking DOI. Please try again later.');
    }
}

// Function to fetch paper metadata from CrossRef
async function fetchPaperMetadata(normalizedDOI) {
    try {
        const response = await fetch(`https://api.crossref.org/works/${normalizedDOI}`);
        if (!response.ok) throw new Error('Failed to fetch data from CrossRef');
        
        const data = await response.json();
        const message = data.message;

        // Extracting relevant fields
        const title = message.title ? message.title[0] : 'N/A';
        const authors = message.author
            ? message.author.map(author => `${author.given} ${author.family}`).join(', ')
            : 'N/A';
        const journal = message['container-title'] ? message['container-title'][0] : 'N/A';
        const volume = message.volume || 'N/A';
        const page = message.page || 'N/A';
        const year = message.created ? message.created['date-parts'][0][0] : 'N/A';

        // Pass all values including year, volume, and page to the display function
        displayEditableData(title, authors, journal, volume, page, normalizedDOI, year);

    } catch (error) {
        console.error('Error fetching metadata:', error);
        showErrorMessage('Unable to fetch paper metadata from CrossRef.');
    }
}




// Function to display editable data in the form
function displayEditableData(title, authors, journal, volume, page, doi, year) {
    const paperInfoSection = document.getElementById('paperInfoSection');
    paperInfoSection.style.display = 'block';  // Show the paper info section

    // Populate the fields with the fetched data
    document.getElementById('title').value = title;
    document.getElementById('authors').value = authors;
    document.getElementById('journal').value = journal;
    document.getElementById('doi').value = doi;  // Set the DOI value

    // Set volume, page, and year if fields exist in the HTML
    if (document.getElementById('volume')) {
        document.getElementById('volume').value = volume;  // Set volume
    }
    if (document.getElementById('page')) {
        document.getElementById('page').value = page;  // Set page
    }
    if (document.getElementById('year')) {
        document.getElementById('year').value = year;  // Set year
    }

    // Hide the DOI input section
    const doiSection = document.getElementById("doiSection");
    doiSection.style.display = 'none';  // Hide the DOI input section after submission
}



// Helper function to check if the URL is a valid Google Drive URL
function isValidGoogleDriveURL(url) {
    const googleDrivePattern = /https:\/\/drive\.google\.com\/.*(\?id=|\/file\/d\/)/;
    return googleDrivePattern.test(url);
}


// Function to display an error message
function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

// Function to clear the error message
function clearErrorMessage() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = '';
    errorMessageElement.style.display = 'none';
}



// Handle file upload
async function handleFileUpload() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/NP_PDF', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('File uploaded successfully:', jsonResponse);
                // Optionally, update the UI or store the URL to the uploaded file
            } else {
                console.error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}
