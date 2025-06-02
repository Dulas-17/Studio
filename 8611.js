const content = {
  series: seriesData, // seriesData is defined in series.js
  movies: movieData,   // movieData is defined in movies.js
};
// This script assumes 'content' object (with content.series and content.movies)
// is globally available, loaded from 8611.js, which in turn loads data from
// series.js and movies.js.

// Function to save the current scroll position of the document
function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.scrollY);
}

// Function to restore scroll position for the entire window
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

// Modified showSection to also save the section ID
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveState(id); // Save the active section and clear any specific genre details

    // Always clear detail view displays when switching sections
    document.getElementById('seriesDetails').style.display = 'none';
    document.getElementById('movieDetails').style.display = 'none';

    // Ensure nav, search, and genre buttons are visible when in a main section list view
    document.querySelector('nav').style.display = 'flex';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');

    if (id === 'series') {
        renderGenreButtons('series');
        // Apply the 'All' filter or the last remembered genre for the list view
        filterContentByGenre('series', localStorage.getItem('activeGenre') || 'All');
    } else if (id === 'movies') {
        renderGenreButtons('movies');
        // Apply the 'All' filter or the last remembered genre for the list view
        filterContentByGenre('movies', localStorage.getItem('activeGenre') || 'All');
    } else { // 'home' section
        document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
        document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
    }
    window.scrollTo(0, 0); // Scroll to top of new section
}

// Search content, clears active genre filter
function searchContent(type) {
    const input = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value.toLowerCase();
    const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));

    // Reset genre filter on search
    localStorage.setItem('activeGenre', 'All');
    renderGenreButtons(type); // Re-render genre buttons to set 'All' as active

    if (type === 'series') {
        showSeriesList(filtered); // Display search results
    } else {
        showMovieList(filtered); // Display search results
    }
    saveScrollPosition(); // Save scroll position after search
}


// --- Functions for Genre Filtering ---

// Helper to get unique genres for a given content type
function getUniqueGenres(type) {
    const allGenres = content[type].flatMap(item => item.genres || []);
    return ['All', ...new Set(allGenres)].sort(); // 'All' option first, then sorted unique genres
}

// Render genre buttons
function renderGenreButtons(type) {
    const containerId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Clear existing buttons

    const genres = getUniqueGenres(type);
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get active genre from state

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

// Filter content by genre and update display
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
    saveState(type, null, null, genre); // Save active section and active genre, clear detail state
    window.scrollTo(0, 0); // Scroll to top when applying filter
}

// showSeriesList: Displays series, applying current genre filter
function showSeriesList(list = null) {
    const currentList = list || content.series; // Use passed list or full content
    const container = document.getElementById('seriesList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    // If a list was NOT passed (meaning it's a fresh load or section switch),
    // and an active genre is set, filter the full list by that genre.
    // If a list WAS passed (meaning it's already filtered by search/genre), use it directly.
    const displayList = (list === null && activeGenre && activeGenre !== 'All')
        ? currentList.filter(s => s.genres && s.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((s) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        const originalIndex = content.series.indexOf(s); // Get original index
        if (originalIndex === -1) return;

        div.innerHTML = `
          <img src="${s.image}" alt="${s.title}" />
          <h4>${s.title}</h4>
          <button onclick="showSeriesDetails(${originalIndex})" class="btn">Open</button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list (which scrolled to top)
    if (list === null && localStorage.getItem('lastActiveSection') === 'series' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// showMovieList: Displays movies, applying current genre filter
function showMovieList(list = null) {
    const currentList = list || content.movies; // Use passed list or full content
    const container = document.getElementById('movieList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (list === null && activeGenre && activeGenre !== 'All')
        ? currentList.filter(m => m.genres && m.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((m) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        const originalIndex = content.movies.indexOf(m); // Get original index
        if (originalIndex === -1) return;

        div.innerHTML = `
          <img src="${m.image}" alt="${m.title}" />
          <h4>${m.title}</h4>
          <button onclick="showMovieDetails(${originalIndex})" class="btn">Watch </button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list (which scrolled to top)
    if (list === null && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// showSeriesDetails: Shows details for a series item and hides main UI elements
function showSeriesDetails(i) {
    const s = content.series[i];
    const container = document.getElementById('seriesDetails');
    container.innerHTML = `
        <img src="${s.image}" alt="${s.title}" />
        <h2>${s.title}</h2>
        <p>${s.description}</p>
        <div class="episode-buttons">
          ${s.episodes.map(ep => `<button onclick="playEpisode('${ep.link}')">${ep.title}</button>`).join('')}
        </div>
        <button onclick="goBackToList('series')" class="back">Back</button>
      `;
    document.getElementById('seriesList').innerHTML = ''; // Hide list
    document.getElementById('seriesDetails').style.display = 'block'; // Show detail
    saveState('series', 'series', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

// showMovieDetails: Shows details for a movie item and hides main UI elements
function showMovieDetails(i) {
    const m = content.movies[i];
    const container = document.getElementById('movieDetails');
    container.innerHTML = `
        <img src="${m.image}" alt="${m.title}" />
        <h2>${m.title}</h2>
        <p>${m.description}</p>
        <div class="episode-buttons">
          <button onclick="playEpisode('${m.link}')">Watch Now</button>
        </div>
        <button onclick="goBackToList('movies')" class="back">Back</button>
      `;
    document.getElementById('movieList').innerHTML = ''; // Hide list
    document.getElementById('movieDetails').style.display = 'block'; // Show detail
    saveState('movies', 'movie', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- Hide Navigation, Search Bar, and Genre Buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
}

// goBackToList: Returns to the list view from a detail view and restores UI elements
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
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
}

// playEpisode: Opens video in full screen
function playEpisode(link) {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = link;
    player.style.display = 'flex';
}

// closeFullScreen: Closes full screen video
function closeFullScreen() {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = '';
    player.style.display = 'none';
    restoreScrollPosition(); // Restore scroll position after closing video player
}

// --- Initialize on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', function() {
    const lastActiveSection = localStorage.getItem('lastActiveSection');
    const lastDetailType = localStorage.getItem('lastDetailType');
    const lastDetailIndex = localStorage.getItem('lastDetailIndex');
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get active genre on load

    // Render genre buttons initially for both sections
    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastActiveSection) {
        // First, set the active section based on remembered state
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(lastActiveSection).classList.add('active');

        // Check if we were in a detail view
        if (lastDetailType && lastDetailIndex !== null) {
            // If in detail view, hide standard UI elements
            document.querySelector('nav').style.display = 'none';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');

            // Show the specific detail
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
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');

            if (lastActiveSection === 'series') {
                filterContentByGenre('series', activeGenre); // Render series list with saved genre
                document.getElementById('seriesDetails').style.display = 'none'; // Ensure detail is hidden
            } else if (lastActiveSection === 'movies') {
                filterContentByGenre('movies', activeGenre); // Render movies list with saved genre
                document.getElementById('movieDetails').style.display = 'none'; // Ensure detail is hidden
            } else { // 'home' section
                document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
                document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
            }
        }
        restoreScrollPosition(); // Restore scroll position
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
