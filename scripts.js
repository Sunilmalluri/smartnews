async function loadComponent(url, targetElement, position = 'beforeend') {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
        const html = await response.text();
        const target = document.querySelector(targetElement);
        if (!target) throw new Error(`Target element '${targetElement}' not found`);
        target.insertAdjacentHTML(position, html);
        return true;
    } catch (error) {
        console.error('Error loading component:', error.message);
        return false;
    }
}

async function fetchNews(category = null, retries = 3, delay = 100) {
    for (let i = 0; i < retries; i++) {
        try {
            if (typeof window.newsData === 'undefined') {
                if (i === retries - 1) {
                    throw new Error('newsData is not defined after retries. Ensure news.js is loaded.');
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            console.log('Fetched news data:', window.newsData);
            return category ? window.newsData.filter(article => article.category === category) : window.newsData;
        } catch (error) {
            console.error('Error fetching news:', error.message);
            return [];
        }
    }
    return [];
}

async function renderNews(category = null) {
    const newsContainer = document.querySelector('.news-grid');
    if (!newsContainer) {
        console.error('News container (.news-grid) not found');
        return;
    }

    const articles = await fetchNews(category);
    console.log('Articles to render:', articles);
    if (articles.length === 0) {
        newsContainer.innerHTML = '<p>వార్తలు అందుబాటులో లేవు.</p>';
        return;
    }

    newsContainer.innerHTML = articles.map(article => `
        <article class="news-card" id="${article.id}">
            <img src="${article.image}" alt="${article.alt}" class="news-image">
            <div class="news-body">
                <h3 class="news-title">${article.title}</h3>
                <div class="news-meta">
                    <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                    <span><i class="far fa-clock"></i> ${article.time}</span>
                </div>
                <p class="news-excerpt">${article.excerpt}</p>
                <div class="full-text">
                    <p>${article.fullText}</p>
                </div>
                <a href="#" class="read-more" onclick="toggleReadMore('${article.id}')">మరిన్ని చదవండి <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');
}

async function loadCommonComponents() {
    try {
        const existingWrapper = document.querySelector('.top-wrapper');
        if (existingWrapper) existingWrapper.remove();

        document.body.insertAdjacentHTML('afterbegin', `<div class="top-wrapper"></div>`);

        const headerLoaded = await loadComponent('/includes/header.html', '.top-wrapper');
        if (!headerLoaded) throw new Error('Header failed to load');

        const navLoaded = await loadComponent('/includes/navigation.html', '.top-wrapper');
        if (!navLoaded) throw new Error('Navigation failed to load');

        const menuBtn = document.querySelector('.menu-btn');
        const navMenuToggle = document.querySelector('.nav-menu-toggle');
        if (menuBtn && navMenuToggle) {
            menuBtn.addEventListener('click', () => {
                const isActive = navMenuToggle.classList.toggle('active');
                menuBtn.setAttribute('aria-expanded', isActive);
                menuBtn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
                if (isActive) {
                    document.querySelectorAll('.nav-menu-horizontal .dropdown').forEach(dropdown => {
                        dropdown.classList.remove('open');
                    });
                }
            });

            if (window.innerWidth >= 769) {
                menuBtn.addEventListener('mouseenter', () => {
                    navMenuToggle.classList.add('active');
                    menuBtn.setAttribute('aria-expanded', 'true');
                    menuBtn.innerHTML = '<i class="fas fa-times"></i>';
                    document.querySelectorAll('.nav-menu-horizontal .dropdown').forEach(dropdown => {
                        dropdown.classList.remove('open');
                    });
                });

                menuBtn.addEventListener('mouseleave', () => {
                    if (!navMenuToggle.classList.contains('active')) {
                        navMenuToggle.classList.remove('active');
                        menuBtn.setAttribute('aria-expanded', 'false');
                        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });

                navMenuToggle.addEventListener('mouseleave', () => {
                    if (!menuBtn.matches(':hover')) {
                        navMenuToggle.classList.remove('active');
                        menuBtn.setAttribute('aria-expanded', 'false');
                        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                        document.querySelectorAll('.nav-menu-toggle .dropdown').forEach(dropdown => {
                            dropdown.classList.remove('open');
                        });
                    }
                });
            }
        }

        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const dropdown = toggle.closest('.dropdown');
                e.preventDefault();
                if (dropdown) {
                    document.querySelectorAll('.dropdown').forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('open');
                        }
                    });
                    dropdown.classList.toggle('open');
                    if (dropdown.closest('.nav-menu-horizontal') && dropdown.classList.contains('open')) {
                        navMenuToggle.classList.remove('active');
                        menuBtn.setAttribute('aria-expanded', 'false');
                        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        });

        if (window.innerWidth >= 769) {
            const horizontalDropdowns = document.querySelectorAll('.nav-menu-horizontal .dropdown');
            horizontalDropdowns.forEach(dropdown => {
                dropdown.addEventListener('mouseleave', () => {
                    dropdown.classList.remove('open');
                });
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('.menu-btn')) {
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
            }
        });

        // Render news based on page
        const pageCategory = document.body.dataset.category || null;
        renderNews(pageCategory);
    } catch (error) {
        console.error('Error in loadCommonComponents:', error);
    }
}

const style = document.createElement('style');
style.textContent = `
    .top-wrapper {
        width: 100%;
        position: relative;
        z-index: 1000;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    loadCommonComponents();
});
