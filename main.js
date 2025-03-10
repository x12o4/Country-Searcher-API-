
let allCountries = [];
let currentFilters = {
  region: null,
  search: ''
};


const fetchCountries = async () => {
  try {
    
    showLoading();
    
 
    const response = await fetch('https://restcountries.com/v3.1/all');
    
   
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    

    allCountries = await response.json();
    
   
    allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    
 
    applyFilters();
    

    hideLoading();
  } catch (error) {
    console.error('Error fetching countries:', error);
    showError('Failed to load countries. Please try again later.');
    hideLoading();
  }
};


const showLoading = () => {
  const container = document.querySelector('.multiple-country-container');
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading countries...</p>
    </div>
  `;
};


const hideLoading = () => {
  const loadingEl = document.querySelector('.loading-container');
  if (loadingEl) {
    loadingEl.remove();
  }
};


const showError = (message) => {
  const container = document.querySelector('.multiple-country-container');
  container.innerHTML = `
    <div class="error-message">
      <span class="material-symbols-outlined">error</span>
      <p>${message}</p>
      <button id="retry-button">Retry</button>
    </div>
  `;
  
  document.getElementById('retry-button').addEventListener('click', fetchCountries);
};


const applyFilters = () => {
  if (!allCountries.length) return;
  
  
  clearCountryTemplates();
  
  
  let filteredCountries = allCountries;
  

  if (currentFilters.region && currentFilters.region !== 'all') {
    filteredCountries = filteredCountries.filter(country => 
      country.region === currentFilters.region
    );
  }
  
 
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filteredCountries = filteredCountries.filter(country => 
      country.name.common.toLowerCase().includes(searchTerm) ||
      (country.capital && country.capital.some(cap => cap.toLowerCase().includes(searchTerm))) ||
      (country.cca3 && country.cca3.toLowerCase().includes(searchTerm))
    );
  }
  
 
  displayCountries(filteredCountries);
  

  updateCountriesCount(filteredCountries.length);
};


const updateCountriesCount = (count) => {
  const countElement = document.querySelector('.countries-count') || document.createElement('div');
  countElement.className = 'countries-count';
  countElement.textContent = `Showing ${count} countries`;
  
  const queryElement = document.querySelector('.query');
  if (!document.querySelector('.countries-count')) {
    queryElement.appendChild(countElement);
  }
};


const clearCountryTemplates = () => {
  const countryList = document.querySelector('.multiple-country-container');
  
  if (!countryList.querySelector('.loading-container') && 
      !countryList.querySelector('.error-message')) {
    countryList.innerHTML = '';
  }
};


const displayCountries = (countries) => {
  const countryList = document.querySelector('.multiple-country-container');
  
  
  if (countries.length === 0) {
    countryList.innerHTML = `
      <div class="no-results">
        <span class="material-symbols-outlined">search_off</span>
        <p>No countries found matching your criteria</p>
        <button id="clear-filters" class="clear-filters-btn">Clear Filters</button>
      </div>
    `;
    
    document.getElementById('clear-filters').addEventListener('click', () => {
   
      currentFilters.region = null;
      currentFilters.search = '';
      
      
      document.querySelector('.search-country').value = '';
      document.querySelector('.dropdown-header').textContent = 'Filter by Region';
      
    
      applyFilters();
    });
    
    return;
  }
  
  
  const fragment = document.createDocumentFragment();
  
 
  countries.forEach(country => {
    const countryDiv = document.createElement('div');
    countryDiv.classList.add('country-container');
    countryDiv.setAttribute('data-country', country.cca3);
    
   
    const flag = country.flags?.svg || country.flags?.png || 'default-flag.png';
    const name = country.name?.common || 'Unknown Country';
    const population = country.population ? formatNumber(country.population) : 'Unknown';
    const region = country.region || 'Unknown';
    const capital = country.capital ? country.capital.join(', ') : 'Unknown';
    
    countryDiv.innerHTML = `
    <div>
      <div class="flag-container">
        <img class="country-flag" src="${flag}" alt="${name} Flag" loading="lazy">
      </div>
      <div class="country-info">
        <h2 class="country-name">${name}</h2>
        <div class="country-details">
          <div class="country-population"><strong>Population:&nbsp </strong>${population}</div>
          <div class="country-region"><strong>Region:&nbsp </strong>${region}</div>
          <div class="country-capital"><strong>Capital:&nbsp </strong>${capital}</div>
        </div>
        <button class="view-details-btn">View Details</button>
      </div>
    </div>
  `
    
    
  const detailsButton = countryDiv.querySelector('.view-details-btn');
  detailsButton.addEventListener('click', function(e) {
    e.stopPropagation(); 
    showCountryDetails(country);
    console.log('View details clicked for', country.name.common); 
  });
    
   
    countryDiv.addEventListener('click', (e) => {
      
      if (!e.target.closest('.view-details-btn')) {
        showCountryDetails(country);
      }
    });
    
    
    fragment.appendChild(countryDiv);
  });
  
  
  countryList.innerHTML = '';
  countryList.appendChild(fragment);
  
  
  animateCountryContainers();
};


const animateCountryContainers = () => {
  const containers = document.querySelectorAll('.country-container');
  containers.forEach((container, index) => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
   
    setTimeout(() => {
      container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, index * 50); 
  });
};


const formatNumber = (num) => {
  return num.toLocaleString();
};


const showCountryDetails = (country) => {
  console.log('Starting showCountryDetails function');
  
  // Create modal container
  let modalContainer = document.querySelector('.modal-container');
  console.log('Existing modal container:', modalContainer);
  
  if (!modalContainer) {
    console.log('Creating new modal container');
    modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    document.body.appendChild(modalContainer);
    console.log('New modal container created');
  }

  
  
  let currencies = 'None';
  if (country.currencies) {
    currencies = Object.values(country.currencies)
      .map(currency => `${currency.name} (${currency.symbol || ''})`)
      .join(', ');
  }
  

  let borderCountries = '';
  if (country.borders && country.borders.length) {
    const borderButtons = country.borders.map(border => {
      const borderCountry = allCountries.find(c => c.cca3 === border);
      const name = borderCountry ? borderCountry.name.common : border;
      return `<button class="border-country" data-country="${border}">${name}</button>`;
    }).join('');
    
    borderCountries = `
      <div class="border-countries">
        <h3>Border Countries:</h3>
        <div class="border-buttons">
          ${borderButtons}
        </div>
      </div>
    `;
  } else {
    borderCountries = `
      <div class="border-countries">
        <h3>Border Countries:</h3>
        <p>No bordering countries</p>
      </div>
    `;
  }
  
  let languages = 'None';
  if (country.languages) {
    languages = Object.values(country.languages).join(', ');
  } 

  modalContainer.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <button class="back-button">
          <span class="material-symbols-outlined">arrow_back</span> Back
        </button>
        <button class="close-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="country-flag-large">
          <img src="${country.flags.svg || country.flags.png}" alt="${country.name.common} Flag">
        </div>
        
        <div class="country-details-large">
          <h1>${country.name.common}</h1>
          
          <div class="details-columns">
            <div class="details-column">
              <p><strong>Native Name:</strong> ${country.name.nativeName ? Object.values(country.name.nativeName)[0].common : country.name.common}</p>
              <p><strong>Population: </strong> ${formatNumber(country.population)}</p>
              <p><strong>Region: </strong> ${country.region}</p>
              <p><strong>Sub Region: </strong> ${country.subregion || 'None'}</p>
              <p><strong>Capital: </strong> ${country.capital ? country.capital.join(', ') : 'None'}</p>
            </div>
            
            <div class="details-column">
              <p><strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(', ') : 'None'}</p>
              <p><strong>Currencies:</strong> ${currencies}</p>
              <p><strong>Languages:</strong> ${languages} </p>
            </div>
          </div>
          
          ${borderCountries}
        </div>
      </div>
    </div>
  `;
  

  modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);
  
  
  modalContainer.querySelector('.back-button').addEventListener('click', closeModal);
  
 
  modalContainer.querySelectorAll('.border-country').forEach(button => {
    button.addEventListener('click', () => {
      const countryCode = button.getAttribute('data-country');
      const borderCountry = allCountries.find(c => c.cca3 === countryCode);
      if (borderCountry) {
      
        closeModal();
        setTimeout(() => {
          showCountryDetails(borderCountry);
        }, 300); 
      }
    });
  });
  

  document.body.style.overflow = 'hidden';
  

  setTimeout(() => {
    modalContainer.classList.add('visible');
  }, 10);
};

const closeModal = () => {
  const modalContainer = document.querySelector('.modal-container');
  if (modalContainer) {
    modalContainer.classList.remove('visible');
    
 
    setTimeout(() => {
      modalContainer.remove();
      document.body.style.overflow = '';
    }, 300);
  }
};


const setupSearch = () => {
  const searchInput = document.querySelector('.search-country');
  let debounceTimeout;
  
  searchInput.addEventListener('input', (e) => {
   
    clearTimeout(debounceTimeout);
    
    
    debounceTimeout = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      applyFilters();
    }, 300); 
  });
  
 
  const searchContainer = searchInput.parentElement;
  const clearButton = document.createElement('span');
  clearButton.className = 'material-symbols-outlined clear-search';
  clearButton.textContent = 'close';
  clearButton.style.display = 'none';
  searchContainer.appendChild(clearButton);
  

  searchInput.addEventListener('input', () => {
    clearButton.style.display = searchInput.value ? 'block' : 'none';
  });
  
 
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    currentFilters.search = '';
    clearButton.style.display = 'none';
    applyFilters();
  });
};


const setupRegionFilter = () => {
  const regionFilter = document.querySelector('.select');
  

  const dropdown = document.createElement('div');
  dropdown.className = 'region-dropdown';
  dropdown.innerHTML = `
    <div class="dropdown-header">Filter by Region</div>
    <div class="dropdown-content" style="display: none;">
      <div class="dropdown-item" data-region="all">All Regions</div>
      <div class="dropdown-item" data-region="Africa">Africa</div>
      <div class="dropdown-item" data-region="Americas">Americas</div>
      <div class="dropdown-item" data-region="Asia">Asia</div>
      <div class="dropdown-item" data-region="Europe">Europe</div>
      <div class="dropdown-item" data-region="Oceania">Oceania</div>
    </div>
  `;
  
 
  regionFilter.innerHTML = '';
  regionFilter.appendChild(dropdown);
  
  
  const dropdownHeader = document.querySelector('.dropdown-header');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  dropdownHeader.addEventListener('click', () => {
    const isDisplayed = dropdownContent.style.display === 'block';
    dropdownContent.style.display = isDisplayed ? 'none' : 'block';
    
    
    if (!isDisplayed) {
      dropdownContent.style.opacity = '0';
      dropdownContent.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        dropdownContent.style.opacity = '1';
        dropdownContent.style.transform = 'translateY(0)';
      }, 10);
    }
  });
  

  document.addEventListener('click', (e) => {
    if (!regionFilter.contains(e.target)) {
      dropdownContent.style.display = 'none';
    }
  });
  
 
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const region = item.getAttribute('data-region');
      dropdownHeader.textContent = item.textContent;
      dropdownContent.style.display = 'none';
      
    
      currentFilters.region = region === 'all' ? null : region;
      
      
      applyFilters();
    });
  });
};


const setupThemeToggle = () => {
  
  const themeContainer = document.querySelector('.light-mode-text');
  const themeButton = document.querySelector('.light-mode-button');
  
 
  const savedTheme = localStorage.getItem('theme');
  

  const updateThemeUI = (isLightTheme) => {
    if (isLightTheme) {
      
      themeContainer.innerHTML = 'Dark Mode';
      themeButton.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
    } else {
    
      themeContainer.innerHTML = 'Light Mode';
      themeButton.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
    }
  };
  
 
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeUI(true);
  } else {
    document.body.classList.remove('light-theme');
    updateThemeUI(false);
  }
  

  themeButton.addEventListener('click', () => {
 
    const isLightTheme = document.body.classList.toggle('light-theme');
    
  
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    
    
    updateThemeUI(isLightTheme);
    
  
    document.body.style.transition = 'background-color 0.7s ease, color 0.7s ease';
  });
  
  
  themeContainer.addEventListener('click', (e) => {
    
    if (!e.target.closest('.light-mode-button')) {
      themeButton.click(); 
    }
  });
};


const setupScrollToTop = () => {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
  document.body.appendChild(scrollBtn);
  
 
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
  
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};


const initApp = () => {
 
  addPortfolioInfo();
  
  
  fetchCountries();
  
 
  setupSearch();
  setupRegionFilter();
  setupThemeToggle();
  setupScrollToTop();
};


const addPortfolioInfo = () => {
  const footer = document.createElement('footer');
  footer.className = 'portfolio-footer';
  footer.innerHTML = `
    
  `;
  document.body.appendChild(footer);
};


document.addEventListener('DOMContentLoaded', initApp);


window.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.src = 'https://via.placeholder.com/320x160?text=Flag+Not+Available';
  }
});