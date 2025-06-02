const content = {
  series: seriesData, // seriesData is defined in series.js
  movies: movieData,   // movieData is defined in movies.js
};
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

// Function to save the active section, optional detail index, and active genre
function saveState(sectionId, detailType = null, detailIndex = null, activeGenre = null) {
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
    saveScrollPosition(); // Save scroll position whenever state changes
}

// --- Section Management ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveState(id); // Save the active section and clear any specific genre details

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
    saveState(type, null, null, genre);
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
        // IMPORTANT: originalIndex is the index in the original 'content.series' array
        const originalIndex = content.series.indexOf(s);
        if (originalIndex === -1) return; // Should not happen if 's' comes from content.series

        div.innerHTML = `
          <img src="${s.image}" alt="${s.title}" />
          <h4>${s.title}</h4>
          <button onclick="showSeriesDetails(${originalIndex})" class="btn">Open</button>
          <button onclick="addToWatchLater('series', ${originalIndex})" class="watch-later-btn">Watch Later</button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list (which scrolled to top)
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
        // IMPORTANT: originalIndex is the index in the original 'content.movies' array
        const originalIndex = content.movies.indexOf(m);
        if (originalIndex === -1) return; // Should not happen if 'm' comes from content.movies

        div.innerHTML = `
          <img src="${m.image}" alt="${m.title}" />
          <h4>${m.title}</h4>
          <button onclick="showMovieDetails(${originalIndex})" class="btn">Watch</button>
          <button onclick="addToWatchLater('movie', ${originalIndex})" class="watch-later-btn">Watch Later</button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list (which scrolled to top)
    if (list === null && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// --- Detail View Functions (FIXED: Ensure parent section is active) ---
function showSeriesDetails(i) {
    const s = content.series[i];
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

    saveState('series', 'series', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

function showMovieDetails(i) {
    const m = content.movies[i];
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
    saveState('movies', 'movie', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

function goBackToList(type) {
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get remembered genre
    if (type === 'series') {
        document.getElementById('seriesDetails').style.display = 'none';
        filterContentByGenre('series', activeGenre); // Re-apply genre to list
    } else {
        document.getElementById('movieDetails').style.display = 'none';
        filterContentByGenre('movies', activeGenre); // Re-apply genre to list
    }
    saveState(type, null, null, activeGenre); // Clear detail state, retain section and genre
    window.scrollTo(0, 0); // Scroll to top of list

    // --- Restore Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'flex';
    // Ensure search and genre boxes are properly displayed for list views
    // Check if the current section *is* one that should have them
    if (type === 'series') {
        document.getElementById('seriesSearch').style.display = 'block';
        document.getElementById('seriesGenreButtons').style.display = 'flex';
    } else if (type === 'movies') {
        document.getElementById('movieSearch').style.display = 'block';
        document.getElementById('movieGenreButtons').style.display = 'flex';
    }
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

// --- Watch Later Functionality ---
function getWatchLaterList() {
    const watchLaterJson = localStorage.getItem('watchLater');
    return watchLaterJson ? JSON.parse(watchLaterJson) : [];
}

function saveWatchLaterList(list) {
    localStorage.setItem('watchLater', JSON.stringify(list));
}

function addToWatchLater(type, index) {
    // Get the actual item data using the original index
    const item = type === 'series' ? content.series[index] : content.movies[index];
    const watchLaterList = getWatchLaterList();

    // Create a unique identifier for the item to prevent duplicates
    const itemId = `${type}-${index}`;

    // Check if item already exists to prevent duplicates
    const isAlreadyAdded = watchLaterList.some(
        (wlItem) => wlItem.uniqueId === itemId
    );

    if (!isAlreadyAdded) {
        // Store type, original index, and the full item data
        watchLaterList.push({ uniqueId: itemId, type: type, originalIndex: index, itemData: item });
        saveWatchLaterList(watchLaterList);
        alert(`${item.title} added to Watch Later!`); // User feedback
    } else {
        alert(`${item.title} is already in your Watch Later list.`);
    }
}

function removeFromWatchLater(type, originalIndex) {
    let watchLaterList = getWatchLaterList();
    const initialLength = watchLaterList.length;

    // Filter out the item based on its unique ID
    const itemIdToRemove = `${type}-${originalIndex}`;
    watchLaterList = watchLaterList.filter(
        (wlItem) => wlItem.uniqueId !== itemIdToRemove
    );

    if (watchLaterList.length < initialLength) {
        saveWatchLaterList(watchLaterList);
        alert('Item removed from Watch Later!'); // User feedback
        showWatchLater(); // Refresh the Watch Later list to reflect removal
    }
}

function showWatchLater() {
    // Hide unnecessary UI elements for Watch Later section
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
            
            // Determine the correct function to call for details based on item type
            const detailFunctionCall = wlItem.type === 'series'
                ? `showSeriesDetails(${wlItem.originalIndex})`
                : `showMovieDetails(${wlItem.originalIndex})`;

            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}" />
                <h4>${item.title}</h4>
                <button onclick="${detailFunctionCall}" class="btn">View Details</button>
                <button onclick="removeFromWatchLater('${wlItem.type}', ${wlItem.originalIndex})" class="remove-watch-later-btn">Remove</button>
            `;
            container.appendChild(div);
        });
    }
    saveState('watchLater'); // Save the active section as 'watchLater'
    window.scrollTo(0, 0); // Scroll to top of watch later list
}


// --- Initialize on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', function() {
    const lastActiveSection = localStorage.getItem('lastActiveSection');
    const lastDetailType = localStorage.getItem('lastDetailType');
    const lastDetailIndex = localStorage.getItem('lastDetailIndex');
    const activeGenre = localStorage.getItem('activeGenre') || 'All';

    // Render genre buttons initially for both series and movies
    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastActiveSection) {
        // Deactivate all sections first for a clean state
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        if (lastDetailType && lastDetailIndex !== null) {
            // If in detail view, hide standard UI elements
            document.querySelector('nav').style.display = 'none';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');

            // Show the specific detail (and its parent section will be activated by showSeriesDetails/showMovieDetails)
            if (lastDetailType === 'series') {
                document.getElementById('seriesList').innerHTML = ''; // Hide list for details
                showSeriesDetails(parseInt(lastDetailIndex, 10)); 
            } else if (lastDetailType === 'movie') {
                document.getElementById('movieList').innerHTML = ''; // Hide list for details
                showMovieDetails(parseInt(lastDetailIndex, 10));
            }
        } else {
            // If not in a detail view, ensure UI elements are visible and lists are rendered
            document.querySelector('nav').style.display = 'flex';
            
            // Activate the last active section
            document.getElementById(lastActiveSection).classList.add('active');

            if (lastActiveSection === 'series') {
                document.getElementById('seriesSearch').style.display = 'block';
                document.getElementById('seriesGenreButtons').style.display = 'flex';
                filterContentByGenre('series', activeGenre); // Render series list with saved genre
                document.getElementById('seriesDetails').style.display = 'none'; // Ensure detail is hidden
            } else if (lastActiveSection === 'movies') {
                document.getElementById('movieSearch').style.display = 'block';
                document.getElementById('movieGenreButtons').style.display = 'flex';
                filterContentByGenre('movies', activeGenre); // Render movies list with saved genre
                document.getElementById('movieDetails').style.display = 'none'; // Ensure detail is hidden
            } else if (lastActiveSection === 'watchLater') {
                showWatchLater(); // Load watch later list directly
            } else { // 'home' section
                document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
                document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
            }
        }
        restoreScrollPosition();
    } else {
        // If no state is remembered, default to 'home' and set up UI
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
