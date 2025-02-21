// Function to get the new ID based on the current JSON
async function getNewID() {
    try {
        const response = await fetch('../publications.json');
        const data = await response.json();
        const maxID = data.reduce((max, paper) => Math.max(max, parseInt(paper.id)), 0);
        return maxID + 1;
    } catch (error) {
        console.error('Error fetching JSON file:', error);
        return 1;
    }
}

// Section 2: Display Editable Data in the Form

async function displayEditableData(title, authors, journal, volume, page, doi, year) {
    const paperInfoSection = document.getElementById('paperInfoSection');
    paperInfoSection.style.display = 'block';

    document.getElementById('title').value = title;
    document.getElementById('authors').value = authors;
    document.getElementById('journal').value = journal;
    document.getElementById('doi').value = doi;
    document.getElementById('volume').value = volume;
    document.getElementById('page').value = page;
    document.getElementById('year').value = year;

    // const doiSection = document.getElementById("doiSection");
    // doiSection.style.display = 'none';

    const newID = await getNewID();
    const newPaperJSON = {
        id: newID.toString(),
        authors: authors,
        title: title,
        pdf: "",
        journal: `${journal}, (${year}), ${volume}, ${page}`,
        doi: doi,
        supplementary: []
    };

    const jsonOutputSection = document.getElementById('jsonOutputSection');
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.value = JSON.stringify(newPaperJSON, null, 4) + ",";
    jsonOutputSection.style.display = 'block';
}

// Section 3: Validation, Metadata Fetching, and Error Handling

async function checkDOI() {
    let doiInput = document.getElementById('doiInput').value.trim();

    if (!doiInput.startsWith('https://doi.org/') && !doiInput.startsWith('doi.org/') && !doiInput.startsWith('10.')) {
        showErrorMessage('Invalid DOI format. Please enter a valid DOI starting with "https://doi.org/", "doi.org/", or "10."');
        return;
    }

    if (doiInput.startsWith('https://doi.org/')) {
        doiInput = doiInput.replace('https://doi.org/', '');
    } else if (doiInput.startsWith('doi.org/')) {
        doiInput = doiInput.replace('doi.org/', '');
    }
    doiInput = 'https://doi.org/' + doiInput;

    try {
        const response = await fetch('../publications.json');
        const data = await response.json();

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

async function fetchPaperMetadata(normalizedDOI) {
    try {
        const response = await fetch(`https://api.crossref.org/works/${normalizedDOI}`);
        if (!response.ok) throw new Error('Failed to fetch data from CrossRef');

        const data = await response.json();
        const message = data.message;

        const title = message.title ? message.title[0] : 'N/A';
        const authors = message.author
            ? message.author.map(author => `${author.given} ${author.family}`).join(', ')
            : 'N/A';
        const journal = message['container-title'] ? message['container-title'][0] : 'N/A';
        const volume = message.volume || 'N/A';
        const page = message.page || 'N/A';
        const year = message.created ? message.created['date-parts'][0][0] : 'N/A';

        displayEditableData(title, authors, journal, volume, page, normalizedDOI, year);

    } catch (error) {
        console.error('Error fetching metadata:', error);
        showErrorMessage('Unable to fetch paper metadata from CrossRef.');
    }
}

function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

function clearErrorMessage() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = '';
    errorMessageElement.style.display = 'none';
}

// Section 4: Submit and Copy Functions

function showTick(buttonID) {
    const tickElement = document.getElementById(buttonID + 'Tick');
    tickElement.textContent = '✔'; // Add checkmark
    tickElement.style.color = 'green'; // Style it green
    tickElement.style.marginLeft = '10px';

    // Remove the tick after 2 seconds
    setTimeout(() => {
        tickElement.textContent = '';
    }, 2000);
}

async function submitPaper() {
    // Get values from the form
    const title = document.getElementById('title').value.trim();
    const authors = document.getElementById('authors').value.trim();
    const journal = document.getElementById('journal').value.trim();
    const volume = document.getElementById('volume') ? document.getElementById('volume').value.trim() : 'N/A';
    const page = document.getElementById('page') ? document.getElementById('page').value.trim() : 'N/A';
    const year = document.getElementById('year') ? document.getElementById('year').value.trim() : 'N/A';
    const doi = document.getElementById('doi').value.trim();
    const pdf = document.getElementById('pdf').value.trim();

    // Get the new ID from the JSON
    const newID = await getNewID(); // Await the result of getNewID

    // Create a new JSON object for the paper
    const newPaperJSON = {
        id: newID.toString(), // Use the awaited ID
        authors: authors,
        title: title,
        pdf: pdf || "", // Default PDF placeholder
        journal: `${journal}, (${year}), ${volume}, ${page}`,
        doi: doi,
        supplementary: []
    };

    // Clear the JSON output
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.value = ""; // Clear previous content

    // Append the new JSON
    const updatedJSON = JSON.stringify(newPaperJSON, null, 4); // Generate new JSON
    jsonOutput.value = updatedJSON + ","; // Append with a trailing comma

    showTick('submit');
}


// Show success or failure icon with loading spinner for upload button
function showStatusIcon(buttonID, status) {
    const statusElement = document.getElementById(buttonID + 'Status');
    const loadingSpinner = document.getElementById(buttonID + 'Loading');

    // Hide loading spinner and remove any previous check or cross icon
    loadingSpinner.style.display = 'none';
    statusElement.textContent = '';

    // If status is 'loading', show the spinner
    if (status === 'loading') {
        loadingSpinner.style.display = 'inline-block';
        return; // Only display the loading spinner and exit function
    }

    // Show either the checkmark or crossmark depending on the status
    if (status === 'success') {
        statusElement.textContent = '✔ Secceed';
        statusElement.style.color = 'green';
    } else if (status === 'failure') {
        statusElement.textContent = '❌ Something Wrong';
        statusElement.style.color = 'red';
    }

    // Remove icon after 2 seconds
    setTimeout(() => {
        statusElement.textContent = '';
    }, 2000);
}

// Function to handle the upload button click
function uploadJSON() {
    const jsonOutput = document.getElementById('jsonOutput');
    const jsonText = jsonOutput.value.trim();

    if (jsonText === "") {
        alert("Please ensure the JSON is updated and not empty.");
        return;
    }

    // Show the modal asking for confirmation
    const modal = document.getElementById('uploadModal');
    modal.style.display = "block";
}

// Close the modal when the user clicks "No"
function cancelUpload() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = "none";  // Close the modal
    showStatusIcon('upload', 'failure'); // Show crossmark for failure
    showConfirmationMessage('Upload canceled.', 'failure'); // Show failure message
    console.log("Upload canceled.");
}

function showConfirmationMessage(message, status) {
    const confirmationElement = document.getElementById('confirmationMessage');
    confirmationElement.textContent = message;
    confirmationElement.style.display = 'block';
    confirmationElement.style.color = status === 'success' ? 'green' : 'red';

    // Hide the message after 3 seconds
    setTimeout(() => {
        confirmationElement.style.display = 'none';
    }, 3000);
}


// Proceed with the upload when the user clicks "Yes"
function confirmUpload() {
    const jsonOutput = document.getElementById('jsonOutput');
    const jsonText = jsonOutput.value.trim();

    const modal = document.getElementById('uploadModal');
    modal.style.display = "none";  // Close the modal

    // Show loading spinner
    showStatusIcon('upload', 'loading'); // Show loading icon

    // Proceed to upload JSON to the server
    sendJSONToBackend(jsonText);
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = "none";
}

// Function to send JSON to backend (Python server)
function sendJSONToBackend(jsonData) {
    // Remove the trailing comma if it exists
    jsonData = jsonData.trim();
    if (jsonData.endsWith(',')) {
        jsonData = jsonData.slice(0, -1);
    }

    // Parse the string into a JavaScript object
    try {
        const paperObject = JSON.parse(jsonData);
        
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ json: paperObject }) // Send the parsed object
        })
        .then(response => {
            console.log('Response received from server:', response);
            return response.json();
        })
        .then(data => {
            console.log('Server responded with JSON:', data);
            if (data.status === 'success') {
                showStatusIcon('upload', 'success');
                showConfirmationMessage('JSON uploaded successfully!', 'success');
            } else {
                showStatusIcon('upload', 'failure');
                showConfirmationMessage('Error uploading JSON.', 'failure');
            }
        })
        .catch(error => {
            console.error('Error uploading JSON:', error);
            showStatusIcon('upload', 'failure');
            showConfirmationMessage('Error uploading JSON.', 'failure');
        });
    } catch (error) {
        console.error('Error parsing JSON:', error);
        showStatusIcon('upload', 'failure');
        showConfirmationMessage('Invalid JSON format.', 'failure');
    }
}
