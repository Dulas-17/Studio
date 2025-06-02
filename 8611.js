// Const content = { ... } // This content data should be in 8611.js

// Moved here for clarity, but this should be from 8611.js
// Assuming content data is loaded from 8611.js before this script executes.
// const content = { /* ... your data structure ... */ };

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

// Modified showSection to also save the section ID and clear genre filter
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveState(id); // Save the active section and clear any specific genre

    // Ensure nav and search are visible when switching sections normally
    document.querySelector('nav').style.display = 'flex';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex'); // Show genre buttons

    if (id === 'series') {
        renderGenreButtons('series'); // Render genre buttons for series
        showSeriesList();
        document.getElementById('seriesDetails').style.display = 'none';
    } else if (id === 'movies') {
        renderGenreButtons('movies'); // Render genre buttons for movies
        showMovieList();
        document.getElementById('movieDetails').style.display = 'none';
    }
    window.scrollTo(0, 0); // Scroll to top of new section
}

// Original searchContent remains the same, but clears genre filter
function searchContent(type) {
    const input = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value.toLowerCase();
    const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));

    // Clear active genre when searching
    if (type === 'series') {
        filterContentByGenre('series', 'All'); // Reset genre filter
        showSeriesList(filtered);
    } else {
        filterContentByGenre('movies', 'All'); // Reset genre filter
        showMovieList(filtered);
    }
    saveScrollPosition(); // Save scroll position after search
}


// --- New/Modified Functions for Genre Filtering ---

// Helper to get unique genres for a given content type
function getUniqueGenres(type) {
    const allGenres = content[type].flatMap(item => item.genres || []);
    return ['All', ...new Set(allGenres)].sort(); // 'All' option first, then sorted unique genres
}

// Render genre buttons
function renderGenreButtons(type) {
    const containerId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const container = document.getElementById(containerId);
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
    saveState(type, null, null, genre); // Save active section and active genre
    window.scrollTo(0, 0); // Scroll to top when applying filter
}

// Original showSeriesList modified to accept a list and check active genre
function showSeriesList(list = null) {
    const currentList = list || content.series;
    const container = document.getElementById('seriesList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (activeGenre && activeGenre !== 'All')
        ? currentList.filter(s => s.genres && s.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        div.innerHTML = `
          <img src="${s.image}" alt="${s.title}" />
          <h4>${s.title}</h4>
          <button onclick="showSeriesDetails(${content.series.indexOf(s)})" class="btn">Open</button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is the initial load for the main list and not a search/genre filter
    if (list === null && localStorage.getItem('lastActiveSection') === 'series' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// Original showMovieList modified to accept a list and check active genre
function showMovieList(list = null) {
    const currentList = list || content.movies;
    const container = document.getElementById('movieList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (activeGenre && activeGenre !== 'All')
        ? currentList.filter(m => m.genres && m.genres.includes(activeGenre))
        : currentList;

    displayList.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        div.innerHTML = `
          <img src="${m.image}" alt="${m.title}" />
          <h4>${m.title}</h4>
          <button onclick="showMovieDetails(${content.movies.indexOf(m)})" class="btn">Watch </button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is the initial load for the main list and not a search/genre filter
    if (list === null && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// Modified showSeriesDetails to save the series index
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
    document.getElementById('seriesList').innerHTML = '';
    document.getElementById('seriesDetails').style.display = 'block'; // Ensure correct display property
    saveState('series', 'series', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- ADDED LOGIC: Hide navigation, search bar, and genre buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
    // --- END ADDED LOGIC ---
}

// Modified showMovieDetails to save the movie index
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
    document.getElementById('movieList').innerHTML = '';
    document.getElementById('movieDetails').style.display = 'block'; // Ensure correct display property
    saveState('movies', 'movie', i, localStorage.getItem('activeGenre')); // Save active section, detail type, index, and current genre
    window.scrollTo(0, 0); // Scroll to top of details

    // --- ADDED LOGIC: Hide navigation, search bar, and genre buttons ---
    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
    // --- END ADDED LOGIC ---
}

// Modified goBackToList to clear detail state and restore genre buttons
function goBackToList(type) {
    // Restore the current active genre filter when going back
    const activeGenre = localStorage.getItem('activeGenre') || 'All';

    if (type === 'series') {
        filterContentByGenre('series', activeGenre); // Reapply the last active genre
        document.getElementById('seriesDetails').style.display = 'none';
        saveState('series', null, null, activeGenre); // Only save section, clear detail state, retain genre
    } else {
        filterContentByGenre('movies', activeGenre); // Reapply the last active genre
        document.getElementById('movieDetails').style.display = 'none';
        saveState('movies', null, null, activeGenre); // Only save section, clear detail state, retain genre
    }
    window.scrollTo(0, 0); // Scroll to top of list

    // --- ADDED LOGIC: Show navigation, search bar, and genre buttons ---
    document.querySelector('nav').style.display = 'flex';
    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
    // --- END ADDED LOGIC ---
}

// Original playEpisode and closeFullScreen remain the same
function playEpisode(link) {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = link;
    player.style.display = 'flex';
    // No need to save state here, as the video player is an overlay
}

function closeFullScreen() {
    const player = document.getElementById('videoFullScreen');
    player.querySelector('iframe').src = '';
    player.style.display = 'none';
    // Restore scroll position after closing video player
    restoreScrollPosition();
}

// --- Initialize on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', function() {
    const lastActiveSection = localStorage.getItem('lastActiveSection');
    const lastDetailType = localStorage.getItem('lastDetailType');
    const lastDetailIndex = localStorage.getItem('lastDetailIndex');
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get active genre on load

    // Always render genre buttons initially, they will be hidden if in detail view
    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastActiveSection) {
        // First, load all lists (so content exists if details are to be shown)
        showSeriesList();
        showMovieList();

        // Then, activate the remembered section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(lastActiveSection).classList.add('active');

        // Apply the remembered genre filter
        if (lastActiveSection === 'series') {
            filterContentByGenre('series', activeGenre);
        } else if (lastActiveSection === 'movies') {
            filterContentByGenre('movies', activeGenre);
        }

        // If a specific detail was being viewed, show it
        if (lastDetailType && lastDetailIndex !== null) {
            if (lastDetailType === 'series') {
                showSeriesDetails(parseInt(lastDetailIndex, 10));
            } else if (lastDetailType === 'movie') {
                showMovieDetails(parseInt(lastDetailIndex, 10));
            }
            // --- ADDED: Ensure nav/search/genres are hidden if resuming into a detail view ---
            document.querySelector('nav').style.display = 'none';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
            // --- END ADDED ---
        } else {
            // If only a section was remembered (not a specific detail view),
            // ensure the detail display is hidden and restore general scroll.
            if (lastActiveSection === 'series') {
                document.getElementById('seriesDetails').style.display = 'none';
            } else if (lastActiveSection === 'movies') {
                document.getElementById('movieDetails').style.display = 'none';
            }
            // --- ADDED: Ensure nav/search/genres are visible if resuming into a list view ---
            document.querySelector('nav').style.display = 'flex';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
            // --- END ADDED ---
        }
        restoreScrollPosition(); // Restore scroll position after everything else is set up
    } else {
        // If no state is remembered, default to 'home' and show lists
        showSection('home');
        showSeriesList(); // This will default to all series unless a genre is set
        showMovieList(); // This will default to all movies unless a genre is set
        // --- ADDED: Ensure nav/search/genres are visible on first load ---
        document.querySelector('nav').style.display = 'flex';
        document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
        document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
        // --- END ADDED ---
    }

    // Add a global scroll listener to save position periodically
    // This handles general scrolling within a section (e.g., long lists)
    let scrollTimer;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            saveScrollPosition();
        }, 200); // Save scroll position after 200ms of no scrolling
    });

    // Save scroll position before the user leaves the page
    window.addEventListener('beforeunload', saveScrollPosition);
});
