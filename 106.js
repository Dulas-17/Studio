// This script assumes 'content' object (with content.series and content.movies)
// is globally available, loaded from 8611.js, which in turn loads data from
// series.js and movies.js.

// --- Local Storage Utilities ---
function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.scrollY);
}

function restoreScrollPosition() {
    const storedScrollY = localStorage.getItem('scrollPosition');
    if (storedScrollY) {
        window.scrollTo(0, parseInt(storedScrollY, 10));
    }
}

// Function to save the active section, optional detail index, active genre, and NEW: origin section
function saveState(sectionId, detailType = null, detailIndex = null, activeGenre = null, originSection = null) {
    localStorage.setItem('lastActiveSection', sectionId);
    if (detailType !== null && detailIndex !== null) {
        localStorage.setItem('lastDetailType', detailType);
        localStorage.setItem('lastDetailIndex', detailIndex);
    } else {
        localStorage.removeItem('lastDetailType');
        localStorage.removeItem('lastDetailIndex');
    }
    if (activeGenre !== null) {
        localStorage.setItem('activeGenre', activeGenre);
    } else {
        localStorage.removeItem('activeGenre');
    }
    // Store originSection if provided, otherwise remove it
    if (originSection !== null) {
        localStorage.setItem('originSection', originSection);
    } else {
        localStorage.removeItem('originSection');
    }
    saveScrollPosition(); // Save scroll position whenever state changes
}

// --- Section Management ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // When showing a section directly (not detail view), clear detail specific state
    // Ensure originSection is also cleared when navigating to a main section
    saveState(id, null, null, localStorage.getItem('activeGenre'), null); 

    // Always clear detail view displays when switching sections
    document.getElementById('seriesDetails').style.display = 'none';
    document.getElementById('movieDetails').style.display = 'none';

    // Ensure nav is visible
    document.querySelector('nav').style.display = 'flex';
    
    // Hide search/genre by default, then show for specific sections
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');


    if (id === 'series') {
        document.getElementById('seriesSearch').style.display = 'block'; // Show search for series
        document.getElementById('seriesGenreButtons').style.display = 'flex'; // Show genre for series
        renderGenreButtons('series');
        filterContentByGenre('series', localStorage.getItem('activeGenre') || 'All');
    } else if (id === 'movies') {
        document.getElementById('movieSearch').style.display = 'block'; // Show search for movies
        document.getElementById('movieGenreButtons').style.display = 'flex'; // Show genre for movies
        renderGenreButtons('movies');
        filterContentByGenre('movies', localStorage.getItem('activeGenre') || 'All');
    } else if (id === 'watchLater') {
        // No search or genre filter for watch later section
        showWatchLater(); // Call the function to display watch later content
    }
    // 'home' section doesn't need search/genre, already hidden above

    window.scrollTo(0, 0); // Scroll to top of new section
}

// --- Search Functionality ---
function searchContent(type) {
    const input = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value.toLowerCase();
    const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));

    localStorage.setItem('activeGenre', 'All'); // Reset genre filter on search
    renderGenreButtons(type);

    if (type === 'series') {
        showSeriesList(filtered);
    } else {
        showMovieList(filtered);
    }
    saveScrollPosition();
}

// --- Genre Filtering ---
function getUniqueGenres(type) {
    const allGenres = content[type].flatMap(item => item.genres || []);
    return ['All', ...new Set(allGenres)].sort();
}

function renderGenreButtons(type) {
    const containerId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const genres = getUniqueGenres(type);
    const activeGenre = localStorage.getItem('activeGenre') || 'All';

    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.onclick = () => filterContentByGenre(type, genre);
        if (genre === activeGenre) {
            button.classList.add('active-genre');
        }
        container.appendChild(button);
    });
}

function filterContentByGenre(type, genre) {
    const genreButtonsContainerId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const buttons = document.getElementById(genreButtonsContainerId).querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent === genre) {
            button.classList.add('active-genre');
        } else {
            button.classList.remove('active-genre');
        }
    });

    let filteredList;
    if (genre === 'All') {
        filteredList = content[type];
    } else {
        filteredList = content[type].filter(item => item.genres && item.genres.includes(genre));
    }

    if (type === 'series') {
        showSeriesList(filteredList);
    } else {
        showMovieList(filteredList);
    }
    // Ensure current section is saved, but not a detail view, and clear origin
    saveState(type, null, null, genre, null); 
    window.scrollTo(0, 0);
}

// --- Display List Functions (Modified for Watch Later Button) ---
function showSeriesList(list = null) {
    const currentList = list || content.series;
    const container = document.getElementById('seriesList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (list === null && activeGenre && activeGenre !== 'All')
        ? currentList.filter(s => s.genres && s.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((s) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        const originalIndex = content.series.indexOf(s);
        if (originalIndex === -1) return;

        div.innerHTML = `
          <img src="${s.image}" alt="${s.title}" />
          <h4>${s.title}</h4>
          <button onclick="showSeriesDetails(${originalIndex})" class="btn">Open</button>
          <button onclick="addToWatchLater('series', ${originalIndex})" class="watch-later-btn">Watch Later</button>
        `;
        container.appendChild(div);
    });
    if (list === null && localStorage.getItem('lastActiveSection') === 'series' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

function showMovieList(list = null) {
    const currentList = list || content.movies;
    const container = document.getElementById('movieList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (list === null && activeGenre && activeGenre !== 'All')
        ? currentList.filter(m => m.genres && m.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((m) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        const originalIndex = content.movies.indexOf(m);
        if (originalIndex === -1) return;

        div.innerHTML = `
          <img src="${m.image}" alt="${m.title}" />
          <h4>${m.title}</h4>
          <button onclick="showMovieDetails(${originalIndex})" class="btn">Watch</button>
          <button onclick="addToWatchLater('movie', ${originalIndex})" class="watch-later-btn">Watch Later</button>
        `;
        container.appendChild(div);
    });
    if (list === null && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// --- Detail View Functions (FIXED: Ensure parent section is active AND accepts originSection) ---
function showSeriesDetails(i, originSection = null) {
    const s = content.series[i];
    if (!s) { // Defensive check: if item not found, log error and go back
        console.error("Error: Series item not found at index:", i);
        alert("Could not load series details. Data might be missing or corrupted.");
        // Try to go back to the original section, or default to home/series
        if (originSection === 'watchLater') {
            showSection('watchLater');
        } else {
            showSection('series');
        }
        return;
    }
    const container = document.getElementById('seriesDetails');

    // Step 1: Deactivate all sections first
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    // Then, make the parent section of series details active
    document.getElementById('series').classList.add('active'); 

    // Step 2: Hide the list and ensure detail container is block
    document.getElementById('seriesList').innerHTML = ''; // Clear the list items
    document.getElementById('seriesDetails').style.display = 'block'; // Show the details container

    // Step 3: Populate details
    container.innerHTML = `
        <img src="${s.image}" alt="${s.title}" />
        <h2>${s.title}</h2>
        <p>${s.description}</p>
        <div class="episode-buttons">
          ${s.episodes.map(ep => `<button onclick="playEpisode('${ep.link}')">${ep.title}</button>`).join('')}
        </div>
        <button onclick="goBackToList('series')" class="back">Back</button>
      `;

    // Save state including the originSection for 'Go Back' navigation
    saveState('series', 'series', i, localStorage.getItem('activeGenre'), originSection); 
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

function showMovieDetails(i, originSection = null) {
    const m = content.movies[i];
    if (!m) { // Defensive check: if item not found, log error and go back
        console.error("Error: Movie item not found at index:", i);
        alert("Could not load movie details. Data might be missing or corrupted.");
        if (originSection === 'watchLater') {
            showSection('watchLater');
        } else {
            showSection('movies');
        }
        return;
    }
    const container = document.getElementById('movieDetails');

    // Step 1: Deactivate all sections first
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    // Then, make the parent section of movie details active
    document.getElementById('movies').classList.add('active'); 

    // Step 2: Hide the list and ensure detail container is block
    document.getElementById('movieList').innerHTML = ''; // Clear the list items
    document.getElementById('movieDetails').style.display = 'block'; // Show the details container

    // Step 3: Populate details
    container.innerHTML = `
        <img src="${m.image}" alt="${m.title}" />
        <h2>${m.title}</h2>
        <p>${m.description}</p>
        <div class="episode-buttons">
          <button onclick="playEpisode('${m.link}')">Watch Now</button>
        </div>
        <button onclick="goBackToList('movies')" class="back">Back</button>
      `;
    // Save state including the originSection for 'Go Back' navigation
    saveState('movies', 'movie', i, localStorage.getItem('activeGenre'), originSection); 
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

// --- Go Back to List Function (FIXED: Uses originSection to determine return path) ---
function goBackToList(type) {
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; 
    const originSection = localStorage.getItem('originSection'); // Retrieve origin section

    // Hide the current detail view
    if (type === 'series') {
        document.getElementById('seriesDetails').style.display = 'none';
    } else {
        document.getElementById('movieDetails').style.display = 'none';
    }

    // Determine where to go back to based on origin
    let targetSectionId;
    if (originSection === 'watchLater') {
        targetSectionId = 'watchLater';
    } else {
        targetSectionId = type; // 'series' or 'movies'
    }

    // Call showSection to handle the transition correctly
    showSection(targetSectionId); // This will clear detail state and origin via saveState inside showSection

    // Explicitly re-render the content if going back to series/movies list (showSection handles this too)
    // No need to explicitly call filterContentByGenre or showWatchLater here, as showSection does it.

    window.scrollTo(0, 0); // Scroll to top of the target list

    // Restore Navigation, Search Bar, and Genre Buttons (showSection already handles this)
    // This block is now fully redundant as showSection manages these elements.
    // document.querySelector('nav').style.display = 'flex';
    // if (targetSectionId === 'series') {
    //     document.getElementById('seriesSearch').style.display = 'block';
    //     document.getElementById('seriesGenreButtons').style.display = 'flex';
    // } else if (targetSectionId === 'movies') {
    //     document.getElementById('movieSearch').style.display = 'block';
    //     document.getElementById('movieGenreButtons').style.display = 'flex';
    // }
}

// --- Video Player Functions ---
function playEpisode(link) {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = link;
    player.style.display = 'flex';
}

function closeFullScreen() {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = '';
    player.style.display = 'none';
    restoreScrollPosition();
}

// --- Watch Later Functionality (FIXED: Pass originSection to detail view) ---
function getWatchLaterList() {
    const watchLaterJson = localStorage.getItem('watchLater');
    return watchLaterJson ? JSON.parse(watchLaterJson) : [];
}

function saveWatchLaterList(list) {
    localStorage.setItem('watchLater', JSON.stringify(list));
}

function addToWatchLater(type, index) {
    const item = type === 'series' ? content.series[index] : content.movies[index];
    const watchLaterList = getWatchLaterList();
    const itemId = `${type}-${index}`; // Unique ID for the item

    const isAlreadyAdded = watchLaterList.some(
        (wlItem) => wlItem.uniqueId === itemId
    );

    if (!isAlreadyAdded) {
        watchLaterList.push({ uniqueId: itemId, type: type, originalIndex: index, itemData: item });
        saveWatchLaterList(watchLaterList);
        alert(`${item.title} added to Watch Later!`);
    } else {
        alert(`${item.title} is already in your Watch Later list.`);
    }
}

function removeFromWatchLater(type, originalIndex) {
    let watchLaterList = getWatchLaterList();
    const initialLength = watchLaterList.length;
    const itemIdToRemove = `${type}-${originalIndex}`;
    watchLaterList = watchLaterList.filter(
        (wlItem) => wlItem.uniqueId !== itemIdToRemove
    );

    if (watchLaterList.length < initialLength) {
        saveWatchLaterList(watchLaterList);
        alert('Item removed from Watch Later!');
        showWatchLater(); // Refresh the Watch Later list to reflect removal
    }
}

function showWatchLater() {
    // Hide search, genre, and detail views when in Watch Later section
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
    document.getElementById('seriesDetails').style.display = 'none';
    document.getElementById('movieDetails').style.display = 'none';

    // Ensure the watchLater section is active
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('watchLater').classList.add('active');

    const container = document.getElementById('watchLaterList');
    container.innerHTML = ''; // Clear previous content

    const watchLaterItems = getWatchLaterList();

    if (watchLaterItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #aaa;">Your Watch Later list is empty. Add some series or movies!</p>';
    } else {
        watchLaterItems.forEach((wlItem) => {
            const item = wlItem.itemData; // Use the stored itemData
            const div = document.createElement('div');
            div.className = 'series-item'; // Re-use existing styling

            // Pass 'watchLater' as the origin section when calling detail views from here
            const detailFunctionCall = wlItem.type === 'series'
                ? `showSeriesDetails(${wlItem.originalIndex}, 'watchLater')`
                : `showMovieDetails(${wlItem.originalIndex}, 'watchLater')`;

            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}" />
                <h4>${item.title}</h4>
                <button onclick="${detailFunctionCall}" class="btn">View Details</button>
                <button onclick="removeFromWatchLater('${wlItem.type}', ${wlItem.originalIndex})" class="remove-watch-later-btn">Remove</button>
            `;
            container.appendChild(div);
        });
    }
    // Save the active section as 'watchLater' and clear detail-specific state
    saveState('watchLater', null, null, null, null); 
    window.scrollTo(0, 0); // Scroll to top of watch later list
}


// --- Initialize on DOM Content Loaded (Simplified and Robust) ---
document.addEventListener('DOMContentLoaded', function() {
    const lastActiveSection = localStorage.getItem('lastActiveSection');
    const lastDetailType = localStorage.getItem('lastDetailType');
    const lastDetailIndex = localStorage.getItem('lastDetailIndex');
    const activeGenre = localStorage.getItem('activeGenre'); // No default here, let filterContentByGenre handle it
    const originSection = localStorage.getItem('originSection'); // Get origin if exists

    // Render genre buttons initially for both series and movies
    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastActiveSection) {
        // If restoring to a detail view
        if (lastDetailType && lastDetailIndex !== null) {
            // Hide standard UI elements immediately
            document.querySelector('nav').style.display = 'none';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');

            // Call detail view functions, passing the origin if it was saved
            if (lastDetailType === 'series') {
                showSeriesDetails(parseInt(lastDetailIndex, 10), originSection);
            } else if (lastDetailType === 'movie') {
                showMovieDetails(parseInt(lastDetailIndex, 10), originSection);
            }
        } else {
            // If restoring to a regular section list, use showSection which handles everything
            showSection(lastActiveSection);
        }
        restoreScrollPosition(); // Restore scroll position after content is loaded
    } else {
        // If no state is remembered, default to 'home'
        showSection('home');
    }

    // Add a global scroll listener to save position periodically
    let scrollTimer;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            saveScrollPosition();
        }, 200);
    });

    // Save scroll position before the user leaves the page
    window.addEventListener('beforeunload', saveScrollPosition);
});
