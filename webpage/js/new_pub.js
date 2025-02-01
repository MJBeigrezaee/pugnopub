const publicationsPage = {
    async loadPublications() {
        try {
            const response = await fetch('../publications.json');
            const data = await response.json(); // The data is now an array of paper entries
            this.renderPublications(data);
        } catch (error) {
            console.error('Error loading publications:', error);
        }
    },

    renderPublications(data) {
        const journalList = document.getElementById("journalList");
    
        // Render each publication directly from the data array
        data.forEach((publication, index) => {
            this.createPublicationListItem(journalList, publication, index, data.length);
        });
    
        // Initialize the "Show More" buttons
        this.initializeShowMore();
    },
   
    initializeShowMore() {
        const showMoreButton = document.getElementById("showMoreJournals");
        const allItems = document.querySelectorAll("#journalList .publication-item");

        // Initially hide all but the first 5 items
        allItems.forEach((item, index) => {
            if (index >= 5) {
                item.style.display = 'none';
            }
        });

        // Set the "Show More" functionality
        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = () => this.loadAllItems();
    },

    createPublicationListItem(list, publication, index, totalItems) {
        const reversedNumber = totalItems - index;
        const li = document.createElement("li");
        li.classList.add("publication-item");
    
        const authors = publication.authors.split(',').map(author => {
            if (author.includes("N. M. Pugno")) { // Highlight your name
                return `<b>${author.trim()}</b>`;
            }
            return author;
        }).join(', ');

        li.innerHTML = `
            <span class="publication-number">${reversedNumber}.</span> 
            <a href="#" class="publication-title">${publication.title}</a>
            
            <button class="details-btn" onclick="publicationsPage.toggleDetails(${index})">+</button>
            <div class="publication-details" id="publication-${index}">
                <p><strong>Authors:</strong> ${authors}</p>
                <p><strong>Journal:</strong> ${publication.journal}</p>
                <p><strong>DOI:</strong> <a href="${publication.doi}" target="_blank">${publication.doi}</a></p>
                ${this.renderSupplementaryData(publication.supplementary || [], publication.pdf || '')}
            </div>
        `;
    
        list.appendChild(li);
    },

    renderSupplementaryData(supplementaryData, pdf) {
        let supplementaryHTML = '';

        // Add the main paper PDF link if it exists
        if (pdf && pdf.trim() !== "") {
            supplementaryHTML += `<p><a href="${pdf}" target="_blank">Original Paper</a></p>`;
        }

        // Display supplementary data
        if (supplementaryData && supplementaryData.length > 0) {
            supplementaryHTML += `<p><strong>Supplementary Data:</strong></p>`;
            supplementaryData.forEach((item, index) => {
                const type = item.type || `Supplementary ${index + 1}`;
                const file = item.file || '#';
                supplementaryHTML += `<p><a href="${file}" target="_blank">${type}</a></p>`;
            });
        }

        return supplementaryHTML;
    },

    toggleDetails(index) {
        const detailsElement = document.getElementById(`publication-${index}`);
        const button = event.target;
        if (detailsElement.style.display === 'block') {
            detailsElement.style.display = 'none';
            button.textContent = '+';
        } else {
            detailsElement.style.display = 'block';
            button.textContent = '-';
        }
    },

    loadAllItems() {
        const allItems = document.querySelectorAll("#journalList .publication-item");
        const showMoreButton = document.getElementById("showMoreJournals");

        // Show all items
        allItems.forEach(item => item.style.display = 'block');

        showMoreButton.textContent = 'Show Less';
        showMoreButton.onclick = () => this.showLess();
    },

    showLess() {
        const allItems = document.querySelectorAll("#journalList .publication-item");
        const showMoreButton = document.getElementById("showMoreJournals");

        allItems.forEach((item, index) => {
            if (index >= 5) {
                item.style.display = 'none'; // Hide publications after the 5th one
            }
        });

        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = () => this.loadAllItems();
    }
};

// Predefined password (set your password here)
const correctPassword = "6165";  // Replace with your actual password

// Function to show the password prompt
document.getElementById("addPaperBtn").onclick = function() {
    document.getElementById("passwordSection").style.display = 'block';
};

// Function to check the password and redirect to add paper page
function checkPassword() {
    const passwordInput = document.getElementById("passwordInput").value;
    const passwordError = document.getElementById("passwordError");

    if (passwordInput === correctPassword) {
        // Hide the password prompt
        document.getElementById("passwordSection").style.display = 'none';
        
        // Redirect to the "Add Paper" page (you can modify the URL if needed)
        window.location.href = "add_paper.html";  // Update this to the actual URL of the "Add Paper" page
    } else {
        // Show error message if password is incorrect
        passwordError.style.display = 'block';
    }
}



// Initialize publications on page load
window.onload = () => publicationsPage.loadPublications();
