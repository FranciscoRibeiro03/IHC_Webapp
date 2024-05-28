const getStoredTheme = () => localStorage.getItem('theme');

const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    setThemeIcon();
}

function setThemeIcon() {
    const themeSwitchers = document.querySelectorAll('.theme-switcher');
    if (!themeSwitchers) return;
    themeSwitchers.forEach(themeSwitcher => {
        if (document.documentElement.getAttribute('data-bs-theme') === 'dark') themeSwitcher.innerHTML = '<i class="bi bi-sun-fill"></i>';
        else themeSwitcher.innerHTML = '<i class="bi bi-moon-fill"></i>';
    });
}

function toggleTheme() {
    if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
        setTheme('light');
        localStorage.setItem('theme', 'light');
    } else {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
    }
}

function updateTheme() {
    setTheme(getPreferredTheme());
}

// Set theme on load
updateTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
window.addEventListener('load', setThemeIcon);