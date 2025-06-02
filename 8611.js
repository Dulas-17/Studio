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

// Function to save the active section and active genre
function saveState(sectionId, activeGenre = null) {
    localStorage.setItem('lastActiveSection', sectionId);
    if (activeGenre !== null) {
        localStorage.setItem('activeGenre', activeGenre);
    } else {
        localStorage.removeItem('activeGenre'); // Clear genre if not specified
    }
    saveScrollPosition(); // Save scroll position whenever state changes
}

// Modified showSection to also save the section ID and clear genre filter
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveState(id); // Save the active section and clear any specific genre filter from UI/state for a fresh start

    // Ensure search and genre buttons visibility based on section
    if (id === 'series' || id === 'movies') {
        document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
        document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
        
        // Always reset search bar when switching sections
        if (document.getElementById('seriesSearch')) document.getElementById('seriesSearch').value = '';
        if (document.getElementById('movieSearch')) document.getElementById('movieSearch').value = '';

        // Re-render genre buttons and display content based on default 'All' or remembered genre
        if (id === 'series') {
            renderGenreButtons('series'); // Renders buttons, sets 'All' or remembered genre active
            showSeriesList(); // Displays content based on the active genre
            document.getElementById('seriesDetails').style.display = 'none'; // Ensure detail view is hidden
        } else { // movies
            renderGenreButtons('movies'); // Renders buttons, sets 'All' or remembered genre active
            showMovieList(); // Displays content based on the active genre
            document.getElementById('movieDetails').style.display = 'none'; // Ensure detail view is hidden
        }
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

    // When searching, always reset genre filter to 'All' in the UI and state
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

// Render genre buttons (used for initial setup or section switch)
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
        // Call filterContentByGenre directly, passing the genre
        button.onclick = () => filterContentByGenre(type, genre);
        if (genre === activeGenre) {
            button.classList.add('active-genre');
        }
        container.appendChild(button);
    });
}

// Filter content by genre and update display
function filterContentByGenre(type, genre) {
    // 1. Update active class on buttons immediately
    const genreButtonsContainerId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const buttons = document.getElementById(genreButtonsContainerId).querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent === genre) {
            button.classList.add('active-genre');
        } else {
            button.classList.remove('active-genre');
        }
    });

    // 2. Update localStorage for persistent state
    localStorage.setItem('activeGenre', genre);
    
    // 3. Reset search input when a genre filter is applied
    if (type === 'series') {
        document.getElementById('seriesSearch').value = '';
    } else {
        document.getElementById('movieSearch').value = '';
    }

    // 4. Filter the content
    let filteredList;
    if (genre === 'All') {
        filteredList = content[type];
    } else {
        filteredList = content[type].filter(item => item.genres && item.genres.includes(genre));
    }

    // 5. Display the filtered content
    if (type === 'series') {
        showSeriesList(filteredList);
    } else {
        showMovieList(filteredList);
    }

    // 6. Save section and genre state
    saveState(type, genre);
    window.scrollTo(0, 0); // Scroll to top when applying filter
}

// showSeriesList: Displays series, applying passed list or current genre filter
function showSeriesList(list = null) {
    const currentList = list || content.series; // Use passed list or full content
    const container = document.getElementById('seriesList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre'); // Get current active genre

    // If a list was NOT explicitly passed (meaning it's a fresh load or genre change),
    // then apply the active genre filter to the full content.series.
    // If a list WAS passed (meaning it's already filtered by search/genre), use it directly.
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
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list
    // This check is now robust enough to restore scroll after initial load with genre.
    if (list === null && localStorage.getItem('lastActiveSection') === 'series') {
        restoreScrollPosition();
    }
}

// showMovieList: Displays movies, applying passed list or current genre filter
function showMovieList(list = null) {
    const currentList = list || content.movies; // Use passed list or full content
    const container = document.getElementById('movieList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre'); // Get current active genre

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
          <button onclick="showMovieDetails(${originalIndex})" class="btn">Watch </button>
        `;
        container.appendChild(div);
    });
    // Restore scroll only if this is for the main list and not a filtered list
    if (list === null && localStorage.getItem('lastActiveSection') === 'movies') {
        restoreScrollPosition();
    }
}

// showSeriesDetails: Shows details for a series item
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
    document.getElementById('seriesDetails').style.display = 'block';
    // State is saved when section changes or genre filter is applied, not for individual details
    window.scrollTo(0, 0); // Scroll to top of details
}

// showMovieDetails: Shows details for a movie item
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
    document.getElementById('movieDetails').style.display = 'block';
    // State is saved when section changes or genre filter is applied, not for individual details
    window.scrollTo(0, 0); // Scroll to top of details
}

// goBackToList: Returns to the list view from a detail view
function goBackToList(type) {
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get remembered genre
    if (type === 'series') {
        document.getElementById('seriesDetails').style.display = 'none';
        filterContentByGenre('series', activeGenre); // Re-apply genre to list
    } else {
        document.getElementById('movieDetails').style.display = 'none';
        filterContentByGenre('movies', activeGenre); // Re-apply genre to list
    }
    // No explicit saveState needed here, as filterContentByGenre does it
    window.scrollTo(0, 0); // Scroll to top of list
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
    const activeGenre = localStorage.getItem('activeGenre') || 'All'; // Get active genre on load

    // Render genre buttons for both sections on initial load
    // They will be displayed/hidden by showSection later
    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastActiveSection) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(lastActiveSection).classList.add('active');

        // Show/hide search and genre buttons based on the last active section
        if (lastActiveSection === 'series' || lastActiveSection === 'movies') {
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'flex');
        } else { // 'home'
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
            document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');
        }

        // Apply the remembered genre filter for the last active content section
        if (lastActiveSection === 'series') {
            filterContentByGenre('series', activeGenre); // This will also call showSeriesList and update UI
            document.getElementById('seriesDetails').style.display = 'none'; // Ensure detail is hidden on load
        } else if (lastActiveSection === 'movies') {
            filterContentByGenre('movies', activeGenre); // This will also call showMovieList and update UI
            document.getElementById('movieDetails').style.display = 'none'; // Ensure detail is hidden on load
        } else {
            // If home section, just show it
            showSection('home'); // This will also handle its own button/search visibility
        }

        restoreScrollPosition(); // Restore scroll position after everything else is set up
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
