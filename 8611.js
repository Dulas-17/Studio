const content = {
  series: seriesData,
  movies: movieData,
};

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

// Save the active section, detail index/type, genre, and origin section
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
    const seriesSearch = document.getElementById('seriesSearch');
    if (seriesSearch) seriesSearch.style.display = 'block';
    const seriesGenreButtons = document.getElementById('seriesGenreButtons');
    if (seriesGenreButtons) seriesGenreButtons.style.display = 'flex';
    renderGenreButtons('series');
    filterContentByGenre('series', localStorage.getItem('activeGenre') || 'All');
  } else if (id === 'movies') {
    const movieSearch = document.getElementById('movieSearch');
    if (movieSearch) movieSearch.style.display = 'block';
    const movieGenreButtons = document.getElementById('movieGenreButtons');
    if (movieGenreButtons) movieGenreButtons.style.display = 'flex';
    renderGenreButtons('movies');
    filterContentByGenre('movies', localStorage.getItem('activeGenre') || 'All');
  } else if (id === 'watchLater') {
    showWatchLater();
  }
  window.scrollTo(0, 0);
}

// --- Search Functionality ---
function searchContent(type) {
  const searchBox = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch');
  const input = searchBox ? searchBox.querySelector('input').value.toLowerCase() : '';
  const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));
  localStorage.setItem('activeGenre', 'All');
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

// --- Go Back to List Function ---
function goBackToList(type) {
  const originSection = localStorage);
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
  const watchLaterJson = localStorage.getItem('watchLater');
  return watchLaterJson ? JSON.parse(watchLaterJson) : [];
}

function saveWatchLaterList(list) {
  localStorage.setItem('watchLater', JSON.stringify(list));
}

function addToWatchLater(type, index) {
  const item = type === 'series' ? content.series[index] : content.movies[index];
  const watchLaterList = getWatchLaterList();
  const itemId = `${type}-${index}`;

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
  const itemIdToRemove = `${type}-${originalIndex}`;
  watchLaterList = watchLaterList.filter(
    (wlItem) => wlItem.uniqueId !== itemIdToRemove
  );

  saveWatchLaterList(watchLaterList);
  alert('Item removed from Watch Later!');
  showWatchLater();
}

function showWatchLater() {
  document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
  document.getElementById('seriesDetails').style.display = 'none';
  document.getElementById('movieDetails').style.display = 'none';

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('watchLater').classList.add('active');

  const container = document.getElementById('watchLaterList');
  container.innerHTML = '';

  const watchLaterItems = getWatchLaterList();

  if (watchLaterItems.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #aaa;">Your Watch Later list is empty. Add some series or movies!</p>';
  } else {
    watchLaterItems.forEach((wlItem) => {
      const item = wlItem.itemData;
      const detailFunctionCall = wlItem.type === 'series'
        ? `showSeriesDetails(${wlItem.originalIndex}, 'watchLater')`
        : `showMovieDetails(${wlItem.originalIndex}, 'watchLater')`;

      container.innerHTML += `
          <div class="series-item">
              <img src="${item.image}" alt="${item.title}" />
              <h4>${item.title}</h4>
              <button onclick="${detailFunctionCall}" class="btn">View Details</button>
              <button onclick="removeFromWatchLater('${wlItem.type}', ${wlItem.originalIndex})" class="remove-watch-later-btn">Remove</button>
          </div>
      `;
    });
  }
  saveState('watchLater', null, null, null, null);
  window.scrollTo(0, 0);
}

// --- Initialize on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', function() {
  const lastActiveSection = localStorage.getItem('lastActiveSection');
  const lastDetailType = localStorage.getItem('lastDetailType');
  const lastDetailIndex = localStorage.getItem('lastDetailIndex');
  const originSection = localStorage.getItem('originSection');

  renderGenreButtons('series');
  renderGenreButtons('movies');

  if (lastActiveSection) {
    if (lastDetailType && lastDetailIndex !== null) {
      document.querySelector('nav').style.display = 'none';
      document.querySelectorAll('.search-box, .genre-buttons').forEach(el => el.style.display = 'none');
      if (lastDetailType === 'series') {
        showSeriesDetails(parseInt(lastDetailIndex, 10), originSection);
      } else if (lastDetailType === 'movie') {
        showMovieDetails(parseInt(lastDetailIndex, 10), originSection);
      }
    } else {
      showSection(lastActiveSection);
    }
    restoreScrollPosition();
  } else {
    showSection('home');
  }

  let scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(saveScrollPosition, 200);
  });

  window.addEventListener('beforeunload', saveScrollPosition);
});
