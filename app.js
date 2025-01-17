// Replace with your actual API key
const API_KEY = 'AIzaSyBEBNcSa1XdVuBMmPp1vVO3Pw-TStp57yY';

// Initialize the YouTube API client
function init() {
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(function() {
        console.log('YouTube API client initialized');
        // Load trending videos on page load
        loadTrendingVideos();
        
        // Add search button event listener after API is initialized
        document.getElementById('search-btn').addEventListener('click', searchVideos);
        
        // Add enter key event listener for search input
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchVideos();
            }
        });
    }).catch(function(error) {
        console.error('Error initializing YouTube API client:', error);
    });
}

// Function to load trending videos
function loadTrendingVideos() {
    gapi.client.youtube.videos.list({
        part: 'snippet',
        chart: 'mostPopular',
        maxResults: 12,
        regionCode: 'US' // You can change this to your preferred region
    }).then(response => {
        displayVideos(response.result.items);
    }).catch(err => {
        console.error('Error loading trending videos:', err);
        displayFallbackVideos(); // Display fallback content if API fails
    });
}

// Fallback content in case API fails
function displayFallbackVideos() {
    const fallbackVideos = [
        {
            snippet: {
                title: 'Sample Video 1',
                thumbnails: { medium: { url: 'https://via.placeholder.com/320x180' } },
                channelTitle: 'Channel 1'
            }
        },
        {
            snippet: {
                title: 'Sample Video 2',
                thumbnails: { medium: { url: 'https://via.placeholder.com/320x180' } },
                channelTitle: 'Channel 2'
            }
        },
        // Add more fallback videos as needed
    ];
    displayVideos(fallbackVideos);
}

// Update the displayVideos function
function displayVideos(videos) {
    const container = document.getElementById('video-container');
    container.innerHTML = '';

    videos.forEach((video, index) => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        
        const videoId = video.id?.videoId || video.id;
        
        videoElement.innerHTML = `
            <div class="thumbnail-wrapper">
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.snippet.title}</h3>
                <p class="channel-name">${video.snippet.channelTitle}</p>
            </div>
        `;
        
        videoElement.addEventListener('click', () => {
            playVideo(videoId);
        });
        
        container.appendChild(videoElement);

        // Animate each video item
        gsap.from(videoElement, {
            duration: 0.6,
            opacity: 0,
            y: 30,
            delay: index * 0.1,
            ease: 'power3.out'
        });
    });
}

// Video player functionality
function playVideo(videoId) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">×</button>
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.contains(modal)) {
            modal.remove();
        }
    });
}

// Update search function
function searchVideos() {
    const searchTerm = document.getElementById('search-input').value;
    if (!searchTerm.trim()) return;
    
    // Show loading state or spinner here if desired
    
    gapi.client.youtube.search.list({
        part: 'snippet',
        q: searchTerm,
        maxResults: 12,
        type: 'video'
    }).then(response => {
        console.log('Search results:', response.result.items); // Debug log
        displayVideos(response.result.items);
        // Scroll to results
        document.getElementById('video-container').scrollIntoView({ behavior: 'smooth' });
    }).catch(err => {
        console.error('Error searching videos:', err);
        alert('Error searching videos. Please try again.'); // User feedback
    });
}

// Update hero search functionality
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    
    // Add hero search functionality
    const heroSearchInput = document.querySelector('.hero-search input');
    const heroSearchButton = document.querySelector('.hero-search button');
    
    heroSearchButton.addEventListener('click', () => {
        const searchTerm = heroSearchInput.value;
        if (searchTerm.trim()) {
            document.getElementById('search-input').value = searchTerm;
            searchVideos();
        }
    });
    
    // Add enter key event listener for hero search
    heroSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = heroSearchInput.value;
            if (searchTerm.trim()) {
                document.getElementById('search-input').value = searchTerm;
                searchVideos();
            }
        }
    });
});

// Initialize GSAP animations
function initAnimations() {
    gsap.from('.hero-content', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.logo h1', {
        duration: 1,
        x: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.search-container', {
        duration: 1,
        x: 50,
        opacity: 0,
        ease: 'power3.out'
    });
}

// Load the API client
gapi.load('client', init);

// Add content categories and filters
const categories = {
    trending: {
        title: 'Trending',
        endpoint: 'videos',
        params: {
            chart: 'mostPopular',
            maxResults: 12
        }
    },
    music: {
        title: 'Music',
        endpoint: 'search',
        params: {
            q: 'music',
            videoCategoryId: '10',
            maxResults: 12
        }
    },
    gaming: {
        title: 'Gaming',
        endpoint: 'search',
        params: {
            q: 'gaming',
            videoCategoryId: '20',
            maxResults: 12
        }
    }
};

// Load category content
function loadCategoryContent(categoryId) {
    const category = categories[categoryId];
    if (!category) return;

    gapi.client.youtube[category.endpoint].list({
        part: 'snippet',
        ...category.params
    }).then(response => {
        displayVideos(response.result.items);
    }).catch(err => {
        console.error(`Error loading ${category.title}:`, err);
    });
}

// Mobile-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const searchBtn = document.querySelector('#search-btn');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('#search-input');
    let isMobile = window.innerWidth <= 768;

    // Toggle search on mobile
    function toggleSearch() {
        if (isMobile) {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        }
    }

    // Handle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    // Close sidebar when clicking outside
    function handleOutsideClick(e) {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleSidebar();
        }
    }

    // Window resize handler
    function handleResize() {
        isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            searchContainer.classList.remove('active');
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    // Event listeners
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    searchBtn.addEventListener('click', toggleSearch);
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('resize', handleResize);

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (sidebar.classList.contains('active')) {
                toggleSidebar();
            }
            if (searchContainer.classList.contains('active')) {
                toggleSearch();
            }
        }
    });

    // Handle scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        if (isMobile) {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down - hide header
                document.querySelector('header').style.transform = 'translateY(-100%)';
                searchContainer.classList.remove('active');
            } else {
                // Scrolling up - show header
                document.querySelector('header').style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        }
    });
});

// Add to your existing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const searchBtn = document.querySelector('#search-btn');
    const searchContainer = document.querySelector('.search-container');
    const categoryPills = document.querySelectorAll('.category-pill');

    // Mobile search toggle
    if (window.innerWidth <= 768) {
        searchBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
        });
    }

    // Category pills active state
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Hide header on scroll down, show on scroll up
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (currentScroll > lastScroll && currentScroll > 60) {
            header.style.transform = 'translateY(-100%)';
            if (searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
            }
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });
});

// Category filter functionality
document.addEventListener('DOMContentLoaded', () => {
    const categoryPills = document.querySelectorAll('.category-pill');
    
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills
            categoryPills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked pill
            pill.classList.add('active');
            
            const category = pill.textContent.toLowerCase();
            
            if (category === 'all') {
                loadTrendingVideos();
            } else {
                searchByCategory(category);
            }
        });
    });
});

// Function to search videos by category
function searchByCategory(category) {
    gapi.client.youtube.search.list({
        part: 'snippet',
        maxResults: 12,
        q: category,
        type: 'video',
        videoCategoryId: getCategoryId(category)
    }).then(response => {
        console.log('Category search results:', response);
        displayVideos(response.result.items);
    }).catch(err => {
        console.error('Error searching category:', err);
        displayFallbackVideos();
    });
}

// Helper function to get YouTube category IDs
function getCategoryId(category) {
    const categoryMap = {
        'music': '10',
        'gaming': '20',
        'sports': '17',
        'news': '25',
        'education': '27',
        'entertainment': '24',
        'technology': '28',
        'cooking': '26'
    };
    return categoryMap[category] || '';
}

// Enhanced responsive handling
function handleResponsive() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('main');
    const searchContainer = document.querySelector('.search-container');
    const categoryPills = document.querySelector('.category-pills');
    
    function updateLayout() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024;
        
        // Mobile layout adjustments
        if (isMobile) {
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
            
            mainContent.style.marginLeft = '0';
            categoryPills.style.left = '0';
            
            // Adjust video grid
            const videoContainer = document.getElementById('video-container');
            if (videoContainer) {
                videoContainer.style.gridTemplateColumns = '1fr';
            }
        } 
        // Tablet layout adjustments
        else if (isTablet) {
            mainContent.style.marginLeft = sidebar?.classList.contains('active') ? '240px' : '0';
            categoryPills.style.left = sidebar?.classList.contains('active') ? '240px' : '0';
            
            // Adjust video grid
            const videoContainer = document.getElementById('video-container');
            if (videoContainer) {
                videoContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
            }
        } 
        // Desktop layout
        else {
            mainContent.style.marginLeft = '240px';
            categoryPills.style.left = '240px';
            
            // Adjust video grid
            const videoContainer = document.getElementById('video-container');
            if (videoContainer) {
                videoContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            }
        }
    }

    // Initial layout setup
    updateLayout();

    // Update layout on resize
    window.addEventListener('resize', updateLayout);

    // Handle scroll for fixed elements
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (currentScroll > lastScroll && currentScroll > 60) {
            header.style.transform = 'translateY(-100%)';
            categoryPills.style.top = '0';
        } else {
            header.style.transform = 'translateY(0)';
            categoryPills.style.top = '60px';
        }
        lastScroll = currentScroll;
    });
}

// Initialize responsive handling
document.addEventListener('DOMContentLoaded', handleResponsive);

// Enhanced video player and navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeVideoPlayer();
});

function initializeNavigation() {
    const mainNav = document.querySelector('.main-nav');
    const subNav = document.querySelector('.sub-nav');
    let lastScroll = 0;

    // Handle navigation visibility on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 60) {
            mainNav.style.transform = 'translateY(-100%)';
            subNav.style.top = '0';
        } else {
            mainNav.style.transform = 'translateY(0)';
            subNav.style.top = '60px';
        }
        lastScroll = currentScroll;
    });
}

function initializeVideoPlayer() {
    const player = new YT.Player('player', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
}

// Ensure the subscribe button is functional
document.querySelectorAll('.subscribe-button').forEach(button => {
    button.addEventListener('click', (e) => {
        // Add functionality to subscribe/unsubscribe
        const channelId = e.target.dataset.channelId;
        toggleSubscription(channelId);
    });
});
