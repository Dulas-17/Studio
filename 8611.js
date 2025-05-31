Const content = {
      series: [
               {
title: "Bleach:TYBW P2",
image: "Images/cour2.jpeg",
description: "Prepare for the climactic conclusion of the Thousand-Year Blood War arc.",
episodes: [
                   { title: "Episode 1", link:"https://drive.google.com/file/d/10D0xtKf_CPz5ODJAiX2A5wfyCg57NcIg/preview" },
                   { title: "Episode 2",  link:"https://drive.google.com/file/d/1-K6_2qaz1ZCz7u54FSvNX-hPq3qbqmZf/preview" },
                   { title: "Episode 3",                  link:"https://drive.google.com/file/d/1-TQNzstys6szmuu-5iPmnxmZ6-oznFc2/preview" },
],
genres: ["Action", "Fantasy", "Anime", "Shonen"]
},
        {
          title: "Konosuba (s1)",
          image: "Images/Cover4.jpg",
          description: "A young man reincarnated into a fantasy world with a useless goddess, a magic-obsessed wizard, and an explosion-loving crusader.",
          episodes: [
            { title: "Episode 1", link: "https://drive.google.com/file/d/110UyhRjYnSOomo3-9Wh30BZonjVHr7Nu/preview" },
            { title: "Episode 2", link: "https://drive.google.com/file/d/1128cXGsLQ_wUcjls8hcZbfy-YbeRwChc/preview" },
            { title: "Episode 3", link: "https://drive.google.com/file/d/110VFc93Wq49TvnsWq9AclCCsyt5scLSC/preview" },
            { title: "Episode 4", link: "https://drive.google.com/file/d/119B_PFF3wtTyQMu3pu4-rBpN1rrfI7dR/preview" },
            { title: "Episode 5", link: "https://drive.google.com/file/d/116FV6qv7Hjdpkj4v7deuoactP-ee-T9A/preview" },
            { title: "Episode 6", link: "https://drive.google.com/file/d/11A96GHkRYHQ1uwRwa4eMiVBxbqM5YcmA/preview" },
            { title: "Episode 7", link: "https://drive.google.com/file/d/11TiSpcFJr2N8r7GPyIGgmgy2tHfnQTtL/preview" },
            { title: "Episode 8", link: "https://drive.google.com/file/d/11tAEoUZsUeQa4ja3-Nnt76nOKR2_w5wa/preview" },
            { title: "Episode 9", link: "https://drive.google.com/file/d/11V8IleXjjcnlUAparkf44XBFEUwxK8Ou/preview" },
            { title: "Episode 10", link: "https://drive.google.com/file/d/11uRZmLQxY52jeIsQKiw6vf2d1jTiCBlr/preview" },
          ],
          genres: ["Comedy", "Anime", "Fantasy", "Isekai"]
        },
      ],

      movies: [
        {
          title: "Your Name(sub)",
          image:"Images/Cover3.jpeg",
          description: "A beautiful romantic fantasy that transcends time and space.",
          link: "https://drive.google.com/file/d/10e007gPw7-zykD4XnHU_v_HV3mS7Y72Y/preview",
          genres: ["Romance", "Drama", "Anime", "Fantasy"]
        },
        {
          title: "The Life List",
          image:"Images/Cover1.jpeg",
          description: " After  her mother's passing Alex is forced to complete a list she compiled when she was 13 only so she could have some of her mother's inherentence ,but on her Journey she finds secrets about herself. ",
          link:"https://drive.google.com/file/d/12tRqoJ9sXycE7RODnlxu11HVR7wcZbtL/preview  ",
          genres: ["Drama", "Family", "Inspirational"]
        },
        {
          title: "Power Rangers",
          image:"Images/Cover2.jpeg",
          description: "A group of high school students are infused with unique superpowers and must harness those abilities to save the world.",
          link:"https://drive.google.com/file/d/17looZTle9cX9De1f6gN5QUcBhopDoKvx/preview",
          genres: ["Action", "Sci-Fi", "Kids"]
        },
      ]
    };

// --- New/Modified JavaScript for Remembering State ---

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

    // Function to save the active section and optional detail index
    function saveState(sectionId, detailType = null, detailIndex = null, activeGenre = null) { // Added activeGenre
        localStorage.setItem('lastActiveSection', sectionId);
        if (detailType !== null && detailIndex !== null) {
            localStorage.setItem('lastDetailType', detailType);
            localStorage.setItem('lastDetailIndex', detailIndex);
            localStorage.removeItem('lastActiveGenre'); // Clear genre if in detail view
        } else {
            localStorage.removeItem('lastDetailType');
            localStorage.removeItem('lastDetailIndex');
            if (activeGenre !== null) {
                localStorage.setItem('lastActiveGenre', activeGenre);
            } else {
                localStorage.removeItem('lastActiveGenre');
            }
        }
        saveScrollPosition(); // Save scroll position whenever state changes
    }

    // Modified showSection to also save the section ID
    function showSection(id) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      saveState(id); // Save the active section

      // Ensure nav and search are visible when switching sections normally
      document.querySelector('nav').style.display = 'flex'; // Assuming nav is flex or block
      document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block'); // Assuming search-box is block

      if (id === 'series') {
        renderGenreBar('series'); // Render genre bar
        showSeriesList();
        document.getElementById('seriesDetails').style.display = 'none';
      } else if (id === 'movies') {
        renderGenreBar('movies'); // Render genre bar
        showMovieList();
        document.getElementById('movieDetails').style.display = 'none';
      }
      window.scrollTo(0, 0); // Scroll to top of new section
    }

    // Original searchContent remains the same, but clears genre selection
    function searchContent(type) {
      const input = document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value.toLowerCase();
      
      // Clear active genre when searching
      const genreBar = document.getElementById(type === 'series' ? 'seriesGenreBar' : 'movieGenreBar');
      if (genreBar) {
          genreBar.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
      }
      saveState(type); // Reset genre state in localStorage

      const filtered = content[type].filter(item => item.title.toLowerCase().includes(input));
      if (type === 'series') showSeriesList(filtered);
      else showMovieList(filtered);
      saveScrollPosition(); // Save scroll position after search
    }

    // --- NEW: Genre Bar Logic ---
    function getUniqueGenres(type) {
        const genres = new Set();
        content[type].forEach(item => {
            if (item.genres && Array.isArray(item.genres)) {
                item.genres.forEach(genre => genres.add(genre));
            }
        });
        return ["All", ...Array.from(genres).sort()]; // "All" first, then sorted unique genres
    }

    function renderGenreBar(type) {
        const genreBarContainer = document.getElementById(type === 'series' ? 'seriesGenreBar' : 'movieGenreBar');
        genreBarContainer.innerHTML = ''; // Clear previous buttons

        const genres = getUniqueGenres(type);

        genres.forEach(genre => {
            const button = document.createElement('button');
            button.className = 'genre-btn';
            button.textContent = genre;
            button.onclick = () => filterContentByGenre(type, genre, button);
            genreBarContainer.appendChild(button);
        });

        // Set 'All' as active by default on render or restore previous active
        let lastActiveGenre = localStorage.getItem('lastActiveGenre');
        if (lastActiveGenre && document.getElementById(type === 'series' ? 'series' : 'movies').classList.contains('active')) {
            const activeBtn = Array.from(genreBarContainer.children).find(btn => btn.textContent === lastActiveGenre);
            if (activeBtn) {
                activeBtn.classList.add('active');
                filterContentByGenre(type, lastActiveGenre, activeBtn, false); // Filter without saving state again
            } else {
                // If remembered genre doesn't exist anymore, default to 'All'
                genreBarContainer.querySelector('.genre-btn').classList.add('active');
                if (type === 'series') showSeriesList();
                else showMovieList();
            }
        } else {
            genreBarContainer.querySelector('.genre-btn').classList.add('active'); // 'All' button is always first
        }
    }

    function filterContentByGenre(type, genre, clickedButton, saveToState = true) {
        // Clear search input when a genre is selected
        document.getElementById(type === 'series' ? 'seriesSearch' : 'movieSearch').value = '';

        // Update active class for genre buttons
        const genreBar = clickedButton.parentNode;
        genreBar.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');

        let filteredList;
        if (genre === "All") {
            filteredList = content[type];
        } else {
            filteredList = content[type].filter(item =>
                item.genres && item.genres.includes(genre)
            );
        }

        if (type === 'series') showSeriesList(filteredList);
        else showMovieList(filteredList);

        if (saveToState) {
            saveState(type, null, null, genre); // Save current section and active genre
        }
        saveScrollPosition();
    }
    // --- END NEW: Genre Bar Logic ---


    // Original showSeriesList remains the same, but we will call it during page load
    function showSeriesList(list = content.series) {
      const container = document.getElementById('seriesList');
      container.innerHTML = '';
      list.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        div.innerHTML = `
          <img src="${s.image}" alt="${s.title}" />
          <h4>${s.title}</h4>
          <button onclick="showSeriesDetails(${i})"class="btn">Open</button>
        `;
        container.appendChild(div);
      });
      // Restore scroll only if this is the initial load for the main list
      // We don't want to restore if a search filters the list
      if (list === content.series && localStorage.getItem('lastActiveSection') === 'series' && !localStorage.getItem('lastDetailType')) {
          restoreScrollPosition();
      }
    }

    // Original showMovieList remains the same, but we will call it during page load
    function showMovieList(list = content.movies) {
      const container = document.getElementById('movieList');
      container.innerHTML = '';
      list.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'series-item';
        div.innerHTML = `
          <img src="${m.image}" alt="${m.title}" />
          <h4>${m.title}</h4>
          <button onclick="showMovieDetails(${i})" class="btn">Watch </button>
        `;
        container.appendChild(div);
      });
      // Restore scroll only if this is the initial load for the main list
      if (list === content.movies && localStorage.getItem('lastActiveSection') === 'movies' && !localStorage.getItem('lastDetailType')) {
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
        <button onclick="goBackToList('series')"class="back">Back</button>
      `;
      document.getElementById('seriesList').innerHTML = ''; // Clear main list
      container.style.display = 'block';
      saveState('series', 'series', i); // Save active section, detail type, and index
      window.scrollTo(0, 0); // Scroll to top of details

      // --- ADDED LOGIC: Hide navigation, search bar, and genre bar ---
      document.querySelector('nav').style.display = 'none';
      document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
      document.getElementById('seriesGenreBar').style.display = 'none'; // Hide genre bar
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
        <button onclick="goBackToList('movies')"class="back">Back</button>
      `;
      document.getElementById('movieList').innerHTML = ''; // Clear main list
      container.style.display = 'block';
      saveState('movies', 'movie', i); // Save active section, detail type, and index
      window.scrollTo(0, 0); // Scroll to top of details

      // --- ADDED LOGIC: Hide navigation, search bar, and genre bar ---
      document.querySelector('nav').style.display = 'none';
      document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
      document.getElementById('movieGenreBar').style.display = 'none'; // Hide genre bar
      // --- END ADDED LOGIC ---
    }

    // Modified goBackToList to clear detail state and show genre bar
    function goBackToList(type) {
      if (type === 'series') {
        showSeriesList();
        document.getElementById('seriesDetails').style.display = 'none';
        saveState('series', null, null, localStorage.getItem('lastActiveGenre') || 'All'); // Preserve genre state or default to All
        renderGenreBar('series'); // Re-render to ensure active state is correct
      } else {
        showMovieList();
        document.getElementById('movieDetails').style.display = 'none';
        saveState('movies', null, null, localStorage.getItem('lastActiveGenre') || 'All'); // Preserve genre state or default to All
        renderGenreBar('movies'); // Re-render to ensure active state is correct
      }
      window.scrollTo(0, 0); // Scroll to top of list

      // --- ADDED LOGIC: Show navigation, search bar, and genre bar ---
      document.querySelector('nav').style.display = 'flex'; // Revert to original display for nav
      document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block'); // Revert to original display for search-box
      document.getElementById(type === 'series' ? 'seriesGenreBar' : 'movieGenreBar').style.display = 'flex'; // Show genre bar (assuming flex)
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
        const lastActiveGenre = localStorage.getItem('lastActiveGenre');

        if (lastActiveSection) {
            // First, load all lists and render genre bars (so content exists if details are to be shown)
            renderGenreBar('series'); // Render genre bar for series
            renderGenreBar('movies'); // Render genre bar for movies
            showSeriesList();
            showMovieList();

            // Then, activate the remembered section
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(lastActiveSection).classList.add('active');

            // If a specific detail was being viewed, show it
            if (lastDetailType && lastDetailIndex !== null) {
                if (lastDetailType === 'series') {
                    showSeriesDetails(parseInt(lastDetailIndex, 10));
                } else if (lastDetailType === 'movie') {
                    showMovieDetails(parseInt(lastDetailIndex, 10));
                }
                // --- ADDED: Ensure nav/search/genre bar are hidden if resuming into a detail view ---
                document.querySelector('nav').style.display = 'none';
                document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'none');
                document.getElementById('seriesGenreBar').style.display = 'none';
                document.getElementById('movieGenreBar').style.display = 'none';
                // --- END ADDED ---
            } else {
                // If only a section was remembered (not a specific detail view),
                // ensure the detail display is hidden and restore general scroll.
                if (lastActiveSection === 'series') {
                    document.getElementById('seriesDetails').style.display = 'none';
                    document.getElementById('movieDetails').style.display = 'none'; // Ensure other detail view is hidden
                    // Activate remembered genre
                    const seriesGenreBar = document.getElementById('seriesGenreBar');
                    seriesGenreBar.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
                    const activeBtn = Array.from(seriesGenreBar.children).find(btn => btn.textContent === lastActiveGenre);
                    if (activeBtn) {
                        activeBtn.classList.add('active');
                        filterContentByGenre('series', lastActiveGenre, activeBtn, false); // Filter without saving state again
                    } else {
                        // Default to 'All' if stored genre not found
                        seriesGenreBar.querySelector('.genre-btn').classList.add('active');
                        showSeriesList();
                    }
                } else if (lastActiveSection === 'movies') {
                    document.getElementById('seriesDetails').style.display = 'none'; // Ensure other detail view is hidden
                    document.getElementById('movieDetails').style.display = 'none';
                    // Activate remembered genre
                    const movieGenreBar = document.getElementById('movieGenreBar');
                    movieGenreBar.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
                    const activeBtn = Array.from(movieGenreBar.children).find(btn => btn.textContent === lastActiveGenre);
                    if (activeBtn) {
                        activeBtn.classList.add('active');
                        filterContentByGenre('movies', lastActiveGenre, activeBtn, false); // Filter without saving state again
                    } else {
                        // Default to 'All' if stored genre not found
                        movieGenreBar.querySelector('.genre-btn').classList.add('active');
                        showMovieList();
                    }
                }
                // --- ADDED: Ensure nav/search/genre bar are visible if resuming into a list view ---
                document.querySelector('nav').style.display = 'flex';
                document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
                document.getElementById('seriesGenreBar').style.display = (lastActiveSection === 'series') ? 'flex' : 'none';
                document.getElementById('movieGenreBar').style.display = (lastActiveSection === 'movies') ? 'flex' : 'none';
                // --- END ADDED ---
            }
            restoreScrollPosition(); // Restore scroll position after everything else is set up
        } else {
            // If no state is remembered, default to 'home' and show lists
            showSection('home'); // This will call renderGenreBar and show initial lists
            // --- ADDED: Ensure nav/search/genre bar are visible on first load ---
            document.querySelector('nav').style.display = 'flex';
            document.querySelectorAll('.search-box').forEach(sb => sb.style.display = 'block');
            document.getElementById('seriesGenreBar').style.display = 'flex'; // Default to series genre bar visible
            document.getElementById('movieGenreBar').style.display = 'none'; // Movies genre bar hidden initially
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

    // --- End of New/Modified JavaScript ---
