// --- Content Data Reference ---
const content = {
    series: seriesData, // From series.js
    movies: movieData   // From movies.js
};

// --- Local Storage Utilities ---
function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.scrollY);
}

function restoreScrollPosition() {
    const y = localStorage.getItem('scrollPosition');
    if (y) window.scrollTo(0, parseInt(y, 10));
}

// Save app state (section, detail, genre, history)
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

    if (originSection !== null) {
        localStorage.setItem('originSection', originSection);
    } else {
        localStorage.removeItem('originSection');
    }

    saveScrollPosition();
}

// --- Section Management ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    saveState(id, null, null, localStorage.getItem('activeGenre'), null);

    document.getElementById('seriesDetails').style.display = 'none';
    document.getElementById('movieDetails').style.display = 'none';
    document.querySelector('nav').style.display = 'flex';

    document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
    document.querySelectorAll('.genre-buttons').forEach(gb => gb.style.display = 'none');

    if (id === 'series') {
        document.getElementById('seriesSearch').style.display = 'block';
        document.getElementById('seriesGenreButtons').style.display = 'flex';
        renderGenreButtons('series');
        filterContentByGenre('series', localStorage.getItem('activeGenre') || 'All');
    } else if (id === 'movies') {
        document.getElementById('movieSearch').style.display = 'block';
        document.getElementById('movieGenreButtons').style.display = 'flex';
        renderGenreButtons('movies');
        filterContentByGenre('movies', localStorage.getItem('activeGenre') || 'All');
    } else if (id === 'watchLater') {
        showWatchLater();
    }

    window.scrollTo(0, 0);
}

// --- Search Functionality ---
function searchContent(type) {
    const input = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value.toLowerCase();
    const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));
    localStorage.setItem('activeGenre', 'All');
    renderGenreButtons(type);

    type === 'series' ? showSeriesList(filtered) : showMovieList(filtered);

    saveScrollPosition();
}

// --- Genre Filtering ---
function getUniqueGenres(type) {
    const all = content[type].flatMap(item => item.genres || []);
    return ['All', ...new Set(all)].sort();
}

function renderGenreButtons(type) {
    const id = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = '';
    const genres = getUniqueGenres(type);
    const activeGenre = localStorage.getItem('activeGenre') || 'All';

    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.textContent = genre;
        btn.onclick = () => filterContentByGenre(type, genre);
        if (genre === activeGenre) btn.classList.add('active-genre');
        container.appendChild(btn);
    });
}

function filterContentByGenre(type, genre) {
    const btnsId = type === 'series' ? 'seriesGenreButtons' : 'movieGenreButtons';
    document.getElementById(btnsId).querySelectorAll('button').forEach(btn =>
        btn.classList.toggle('active-genre', btn.textContent === genre)
    );

    let filtered = (genre === 'All')
        ? content[type]
        : content[type].filter(item => item.genres && item.genres.includes(genre));

    type === 'series' ? showSeriesList(filtered) : showMovieList(filtered);

    saveState(type, null, null, genre, null);
    window.scrollTo(0, 0);
}

// --- Display List Functions ---
function showSeriesList(list = null) {
    const container = document.getElementById('seriesList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (!list && activeGenre && activeGenre !== 'All')
        ? content.series.filter(s => s.genres && s.genres.includes(activeGenre))
        : (list || content.series);

    displayList.forEach(s => {
        const idx = content.series.indexOf(s);
        if (idx === -1) return;
        container.innerHTML += `
          <div class="series-item">
            <img src="${s.image}" alt="${s.title}" />
            <h4>${s.title}</h4>
            <button onclick="showSeriesDetails(${idx})" class="btn">Open</button>
            <button onclick="addToWatchLater('series', ${idx})" class="watch-later-btn">Watch Later</button>
          </div>
        `;
    });
    if (!list && localStorage.getItem('lastActiveSection') === 'series' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

function showMovieList(list = null) {
    const container = document.getElementById('movieList');
    container.innerHTML = '';

    const activeGenre = localStorage.getItem('activeGenre');
    const displayList = (!list && activeGenre && activeGenre !== 'All')
        ? content.movies.filter(m => m.genres && m.genres.includes(activeGenre))
        : (list || content.movies);

    displayList.forEach(m => {
        const idx = content.movies.indexOf(m);
        if (idx === -1) return;
        container.innerHTML += `
          <div class="series-item">
            <img src="${m.image}" alt="${m.title}" />
            <h4>${m.title}</h4>
            <button onclick="showMovieDetails(${idx})" class="btn">Watch</button>
            <button onclick="addToWatchLater('movie', ${idx})" class="watch-later-btn">Watch Later</button>
          </div>
        `;
    });
    if (!list && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
        restoreScrollPosition();
    }
}

// --- Detail View Functions ---
function showSeriesDetails(i, originSection = null) {
    const s = content.series[i];
    if (!s) {
        alert("Could not load series details.");
        (originSection === 'watchLater') ? showSection('watchLater') : showSection('series');
        return;
    }

    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('series').classList.add('active');
    document.getElementById('seriesList').innerHTML = '';
    document.getElementById('seriesDetails').style.display = 'block';

    document.getElementById('seriesDetails').innerHTML = `
        <img src="${s.image}" alt="${s.title}" />
        <h2>${s.title}</h2>
        <p>${s.description}</p>
        <div class="episode-buttons">
          ${s.episodes.map(ep => `<button onclick="playEpisode('${ep.link}')">${ep.title}</button>`).join('')}
        </div>
        <button onclick="goBackToList('series')" class="back">Back</button>
    `;

    saveState('series', 'series', i, localStorage.getItem('activeGenre'), originSection);
    window.scrollTo(0, 0);

    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
}

function showMovieDetails(i, originSection = null) {
    const m = content.movies[i];
    if (!m) {
        alert("Could not load movie details.");
        (originSection === 'watchLater') ? showSection('watchLater') : showSection('movies');
        return;
    }

    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('movies').classList.add('active');
    document.getElementById('movieList').innerHTML = '';
    document.getElementById('movieDetails').style.display = 'block';

    document.getElementById('movieDetails').innerHTML = `
        <img src="${m.image}" alt="${m.title}" />
        <h2>${m.title}</h2>
        <p>${m.description}</p>
        <div class="episode-buttons">
          <button onclick="playEpisode('${m.link}')">Watch Now</button>
        </div>
        <button onclick="goBackToList('movies')" class="back">Back</button>
    `;

    saveState('movies', 'movie', i, localStorage.getItem('activeGenre'), originSection);
    window.scrollTo(0, 0);

    document.querySelector('nav').style.display = 'none';
    document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
}

// --- Go Back to List ---
function goBackToList(type) {
    const originSection = localStorage.getItem('originSection');
    const targetId = (originSection === 'watchLater') ? 'watchLater' : type;
    showSection(targetId);
    window.scrollTo(0, 0);
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
    const json = localStorage.getItem('watchLater');
    return json ? JSON.parse(json) : [];
}

function saveWatchLaterList(list) {
    localStorage.setItem('watchLater', JSON.stringify(list));
}

function addToWatchLater(type, index) {
    const item = (type === 'series') ? content.series[index] : content.movies[index];
    const watchLaterList = getWatchLaterList();
    const itemId = `${type}-${index}`;
    const exists = watchLaterList.some(wl => wl.uniqueId === itemId);

    if (!exists) {
        watchLaterList.push({ uniqueId: itemId, type, originalIndex: index, itemData: item });
        saveWatchLaterList(watchLaterList);
        alert(`${item.title} added to Watch Later!`);
    } else {
        alert(`${item.title} is already in your Watch Later list.`);
    }
}

function removeFromWatchLater(type, originalIndex) {
    let watchLaterList = getWatchLaterList();
    const itemId = `${type}-${originalIndex}`;
    const newList = watchLaterList.filter(wl => wl.uniqueId !== itemId);

    if (newList.length < watchLaterList.length) {
        saveWatchLaterList(newList);
        alert('Item removed from Watch Later!');
        showWatchLater();
    }
}

function showWatchLater() {
    document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
    document.getElementById('seriesDetails').style.display = 'none';
    document.getElementById('movieDetails').style.display = 'none';

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('watchLater').classList.add('active');

    const container = document.getElementById('watchLaterList');
    container.innerHTML = '';

    const items = getWatchLaterList();
    if (!items.length) {
        container.innerHTML = '<p style="text-align: center; color: #aaa;">Your Watch Later list is empty. Add some series or movies!</p>';
    } else {
        items.forEach(wl => {
            const item = wl.itemData;
            const detailFn = wl.type === 'series'
                ? `showSeriesDetails(${wl.originalIndex}, 'watchLater')`
                : `showMovieDetails(${wl.originalIndex}, 'watchLater')`;

            container.innerHTML += `
                <div class="series-item">
                    <img src="${item.image}" alt="${item.title}" />
                    <h4>${item.title}</h4>
                    <button onclick="${detailFn}" class="btn">View Details</button>
                    <button onclick="removeFromWatchLater('${wl.type}', ${wl.originalIndex})" class="remove-watch-later-btn">Remove</button>
                </div>
            `;
        });
    }
    saveState('watchLater', null, null, null, null);
    window.scrollTo(0, 0);
}

// --- Initialize on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function() {
    const lastSection = localStorage.getItem('lastActiveSection');
    const detailType = localStorage.getItem('lastDetailType');
    const detailIndex = localStorage.getItem('lastDetailIndex');
    const originSection = localStorage.getItem('originSection');

    renderGenreButtons('series');
    renderGenreButtons('movies');

    if (lastSection) {
        if (detailType && detailIndex !== null) {
            document.querySelector('nav').style.display = 'none';
            document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
            if (detailType === 'series') showSeriesDetails(parseInt(detailIndex, 10), originSection);
            else if (detailType === 'movie') showMovieDetails(parseInt(detailIndex, 10), originSection);
        } else {
            showSection(lastSection);
        }
        restoreScrollPosition();
    } else {
        showSection('home');
    }

    // Save scroll position on scroll and before unload
    let timer;
    window.addEventListener('scroll', () => {
        clearTimeout(timer);
        timer = setTimeout(saveScrollPosition, 200);
    });
    window.addEventListener('beforeunload', saveScrollPosition);
});