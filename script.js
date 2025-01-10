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
        createPublicationListItem(journalList, publication, 'journal', index);
    });

    // Render book publications
    data.bookPublications.forEach((publication, index) => {
        createPublicationListItem(bookList, publication, 'book', index);
    });

    // Render patent publications
    data.patentPublications.forEach((publication, index) => {
        createPublicationListItem(patentList, publication, 'patent', index);
    });
}

// Create individual publication list items
function createPublicationListItem(list, publication, type, index) {
    const li = document.createElement("li");
    li.classList.add("publication-item");
    li.innerHTML = `
        <span class="publication-number">${index + 1}.</span> 
        <a href="#" class="publication-title">${publication.title}</a>
        <button class="details-btn" onclick="toggleDetails('${type}', ${index})">+</button>
        <div class="publication-details" id="${type}-${index}">
            <p><strong>Authors:</strong> ${publication.authors}</p>
            <p><strong>${type === 'journal' ? 'Journal' : 'Publisher'}:</strong> ${publication.journal}</p>
            <p><strong>DOI:</strong> <a href="https://doi.org/${publication.doi}" target="_blank">${publication.doi}</a></p>
            ${publication.supplementaryData ? `<p><strong>Supplementary Data:</strong> <a href="${publication.supplementaryData}" target="_blank">Download</a></p>` : ''}
        </div>
    `;
    list.appendChild(li);
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
function showMore(type) {
    const allItems = document.querySelectorAll(`#${type}List .publication-item`);
    const showMoreButton = document.getElementById(`showMore${capitalizeFirstLetter(type)}s`);
    
    let visibleCount = 0;
    allItems.forEach((item, index) => {
        if (index < 5) {
            item.style.display = 'block';  // Show first 5 publications
            visibleCount++;
        } else {
            item.style.display = 'none'; // Hide the rest
        }
    });
    
    // Toggle "Show More" / "Show Less" functionality
    if (visibleCount === 5) {
        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = () => loadAllItems(type);
    }
}

// Load all publications when clicking "Show More"
function loadAllItems(type) {
    const allItems = document.querySelectorAll(`#${type}List .publication-item`);
    const showMoreButton = document.getElementById(`showMore${capitalizeFirstLetter(type)}s`);
    
    allItems.forEach(item => item.style.display = 'block'); // Show all items
    showMoreButton.textContent = 'Show Less';
    showMoreButton.onclick = () => showLess(type);
}

// Show less functionality
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
