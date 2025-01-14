// Fetch the JSON file and render the publications
async function loadPublications() {
    try {
        const response = await fetch('publications.json');
        const data = await response.json();

        renderPublications(data);
    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

// Function to render publications
function renderPublications(data) {
    const journalList = document.getElementById("journalList");
    const bookList = document.getElementById("bookList");
    const patentList = document.getElementById("patentList");

    // Render journal publications
    data.journalPublications.forEach((publication, index) => {
        createPublicationListItem(journalList, publication, 'journal', index, data.journalPublications.length);
    });

    // Render book publications
    data.bookPublications.forEach((publication, index) => {
        createPublicationListItem(bookList, publication, 'book', index, data.bookPublications.length);
    });

    // Render patent publications
    data.patentPublications.forEach((publication, index) => {
        createPublicationListItem(patentList, publication, 'patent', index, data.patentPublications.length);
    });

    // Initialize the "Show More" buttons
    initializeShowMore('journal');
    initializeShowMore('book');
    initializeShowMore('patent');
}

// Initialize Show More functionality for each section
function initializeShowMore(type) {
    const showMoreButton = document.getElementById(`showMore${capitalizeFirstLetter(type)}s`);
    const allItems = document.querySelectorAll(`#${type}List .publication-item`);

    // Initially hide all but the first 5 items
    allItems.forEach((item, index) => {
        if (index >= 5) {
            item.style.display = 'none';
        }
    });

    // Set the "Show More" functionality
    showMoreButton.textContent = 'Show More';
    showMoreButton.onclick = () => loadAllItems(type);
}

// Create individual publication list items
function createPublicationListItem(list, publication, type, index, totalItems) {
    const reversedNumber = totalItems - index;
    const li = document.createElement("li");
    li.classList.add("publication-item");
    // Check if the author list contains your name and make it bold
    const authors = publication.authors.split(',').map(author => {

        if (author.includes("N. M. Pugno")) { // Replace "N. M. Pugno" with your name
            return `<b>${author.trim()}</b>`; // Make your name bold, trim any excess spaces
        }
        return author;
    }).join(', ');

    
    li.innerHTML = `
    <span class="publication-number">${reversedNumber}.</span> 
    <a href="#" class="publication-title">${publication.title}</a>
    <button class="details-btn" onclick="toggleDetails('${type}', ${index})">+</button>
    <div class="publication-details" id="${type}-${index}">
        <p><strong>Authors:</strong> ${authors}</p>
        <p><strong>${type === 'journal' ? 'Journal' : 'Publisher'}:</strong> ${publication.journal}</p>
        <p><strong>DOI:</strong> <a href="${publication.doi}" target="_blank">${publication.doi}</a></p>
        ${renderSupplementaryData(publication.supplementary || [], publication.pdf || '')}
    </div>
`;

    list.appendChild(li);
}

// Function to render supplementary data and number them
// Function to render supplementary data and number them
function renderSupplementaryData(supplementaryData, pdf) {
    let supplementaryHTML = '';

    // Add the main paper PDF link if it exists
    if (pdf && pdf.trim() !== "") {
        supplementaryHTML += `<p><a href="${pdf}" target="_blank">Original Paper</a></p>`;
    }

    // Ensure supplementaryData is an array of objects
    if (supplementaryData && supplementaryData.length > 0) {
        supplementaryHTML += `<p><strong>Supplementary Data:</strong></p>`;
        supplementaryData.forEach((item, index) => {
            const type = item.type || `Supplementary ${index + 1}`;
            const file = item.file || '#';
            supplementaryHTML += `<p><a href="${file}" target="_blank">${type}</a></p>`;
        });
    }

    return supplementaryHTML;
}




// Toggle publication details
function toggleDetails(type, index) {
    const detailsElement = document.getElementById(`${type}-${index}`);
    const button = event.target;
    if (detailsElement.style.display === 'block') {
        detailsElement.style.display = 'none';
        button.textContent = '+';
    } else {
        detailsElement.style.display = 'block';
        button.textContent = '-';
    }
}

// Show More functionality for pagination
function loadAllItems(type) {
    const allItems = document.querySelectorAll(`#${type}List .publication-item`);
    const showMoreButton = document.getElementById(`showMore${capitalizeFirstLetter(type)}s`);

    // Show all items in the selected section
    allItems.forEach(item => item.style.display = 'block');

    showMoreButton.textContent = 'Show Less';
    showMoreButton.onclick = () => showLess(type);
}

// Show Less functionality
function showLess(type) {
    const allItems = document.querySelectorAll(`#${type}List .publication-item`);
    const showMoreButton = document.getElementById(`showMore${capitalizeFirstLetter(type)}s`);

    allItems.forEach((item, index) => {
        if (index >= 5) {
            item.style.display = 'none'; // Hide publications after the 5th one
        }
    });

    showMoreButton.textContent = 'Show More';
    showMoreButton.onclick = () => loadAllItems(type);
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Search filtering function
function filterPublications() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const allPublications = document.querySelectorAll(".publication-item");

    allPublications.forEach((publication) => {
        const title = publication.querySelector(".publication-title").textContent.toLowerCase();
        if (title.includes(searchInput)) {
            publication.style.display = 'block';
        } else {
            publication.style.display = 'none';
        }
    });
}

// Initialize publications on page load
window.onload = loadPublications;
