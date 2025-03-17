const publicationsPage = {
    async loadPublications() {
        try {
            const response = await fetch('../publications.json');
            const data = await response.json(); // The data is now an array of paper entries
            this.publications = data; // Store for filtering later
            this.renderPublications(data);
        } catch (error) {
            console.error('Error loading publications:', error);
        }
    },

    filterPublications() {
        const searchTerm = document.getElementById("searchBar").value.toLowerCase();
    
        const filteredData = this.publications.filter(publication => {
            return publication.title.toLowerCase().includes(searchTerm) ||
                   publication.authors.toLowerCase().includes(searchTerm) ||
                   publication.doi.toLowerCase().includes(searchTerm) ||
                   publication.journal.toLowerCase().includes(searchTerm);
        });
    
        this.renderPublications(filteredData);
    },
    
    

    renderPublications(data) {
        // Sort by year (descending), then by ID (descending)
        data.sort((a, b) => {
            const yearA = a.journal.match(/\((\d{4})\)/) ? parseInt(a.journal.match(/\((\d{4})\)/)[1]) : 0;
            const yearB = b.journal.match(/\((\d{4})\)/) ? parseInt(b.journal.match(/\((\d{4})\)/)[1]) : 0;

            if (yearB !== yearA) {
                return yearB - yearA; // Sort by year descending
            }
            return b.id - a.id; // If same year, sort by ID descending
        });

        // Clear and render sorted publications
        const publishedList = document.getElementById("publishedList");
        const inPressList = document.getElementById("inPressList");

        // Clear both lists
        publishedList.innerHTML = "";
        inPressList.innerHTML = "";

        const publishedPapers = data.filter(pub => {
            const yearMatch = pub.journal.match(/\((\d{4})\)/); // Extract year in format (YYYY)
            return yearMatch ? true : false;  // If year exists, it's a published paper
        });
        const inPressPapers = data.filter(pub => {
            const yearMatch = pub.journal.match(/\((\d{4})\)/); // Try to match the year pattern
            return !yearMatch; // If no year, it's "In Press"
        });

        // Render Published Papers
        publishedPapers.forEach((publication, index) => {
            this.createPublicationListItem(publishedList, publication, index, publishedPapers.length, 'published');
        });

        // Render In Press Papers
        inPressPapers.forEach((publication, index) => {
            this.createPublicationListItem(inPressList, publication, index, inPressPapers.length, 'in-press');
        });

        // Initialize the "Show More" buttons
        this.initializeShowMore('publishedList', 'showMorePublished');
        this.initializeShowMore('inPressList', 'showMoreInPress');
    },

    renderList(data, listElement, showMoreBtnId) {
        data.forEach((publication, index) => {
            this.createPublicationListItem(listElement, publication, index, data.length);
        });

        // Initialize "Show More" for this list
        this.initializeShowMore(listElement.id, showMoreBtnId);
    },

    initializeShowMore(listId, buttonId) {
        const showMoreButton = document.getElementById(buttonId);
        if (!showMoreButton) {
            console.warn(`Button with id "${buttonId}" not found.`);
            return; // Exit if the button isn't found
        }
        const allItems = document.querySelectorAll(`#${listId} .publication-item`);
        allItems.forEach((item, index) => {
            if (index >= 5) item.style.display = 'none';
        });
        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = () => this.loadAllItems(listId, buttonId);
    },

    createPublicationListItem(list, publication, index, totalItems, category) {
        const reversedNumber = totalItems - index;
        const li = document.createElement("li");
        li.classList.add("publication-item");
    
        const authors = publication.authors.split(',').map(author => {
            if (author.includes("N. M. Pugno")) { // Highlight your name
                return `<b>${author.trim()}</b>`;
            }
            return author;
        }).join(', ');
    
        let publicationNumber = '';
        if (category !== 'in-press') {
            publicationNumber = `<span class="publication-number">${reversedNumber}.</span>`;
        } else {
            publicationNumber = `<span class="publication-bullet">•</span>`;
        }
    
        li.innerHTML = `
            ${publicationNumber} 
            <a href="#" class="publication-title">${publication.title}</a>
            
            <button class="details-btn" onclick="publicationsPage.toggleDetails(${index}, '${category}')">+</button>
            <div class="publication-details" id="publication-${category}-${index}">
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

        if (pdf && pdf.trim() !== "") {
            supplementaryHTML += `<p><a href="${pdf}" target="_blank">Original Paper</a></p>`;
        }

        if (supplementaryData.length > 0) {
            supplementaryHTML += `<p><strong>Supplementary Data:</strong></p>`;
            supplementaryData.forEach((item, index) => {
                const type = item.type || `Supplementary ${index + 1}`;
                const file = item.file || '#';
                supplementaryHTML += `<p><a href="${file}" target="_blank">${type}</a></p>`;
            });
        }

        return supplementaryHTML;
    },

    toggleDetails(index, category) {
        const detailsElement = document.getElementById(`publication-${category}-${index}`);
        const button = event.target;
    
        if (detailsElement.style.display === 'block') {
            detailsElement.style.display = 'none';
            button.textContent = '+';
        } else {
            detailsElement.style.display = 'block';
            button.textContent = '-';
        }
    },

    loadAllItems(listId, buttonId) {
        const allItems = document.querySelectorAll(`#${listId} .publication-item`);
        const showMoreButton = document.getElementById(buttonId);

        allItems.forEach(item => item.style.display = 'block');

        showMoreButton.textContent = 'Show Less';
        showMoreButton.onclick = () => this.showLess(listId, buttonId);
    },

    showLess(listId, buttonId) {
        const allItems = document.querySelectorAll(`#${listId} .publication-item`);
        const showMoreButton = document.getElementById(buttonId);

        allItems.forEach((item, index) => {
            if (index >= 5) item.style.display = 'none';
        });

        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = () => this.loadAllItems(listId, buttonId);
    }
};

// Password protection for adding a paper
const correctPassword = "6165";

document.getElementById("addPaperBtn").onclick = function () {
    document.getElementById("passwordSection").style.display = 'block';
};

function checkPassword() {
    const passwordInput = document.getElementById("passwordInput").value;
    const passwordError = document.getElementById("passwordError");

    if (passwordInput === correctPassword) {
        document.getElementById("passwordSection").style.display = 'none';
        window.location.href = "add_paper.html";
    } else {
        passwordError.style.display = 'block';
    }
}

document.getElementById('passwordInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});

// Initialize publications on page load
window.onload = () => publicationsPage.loadPublications();
