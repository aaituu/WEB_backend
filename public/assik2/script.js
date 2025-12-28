class ProfileExplorer {
  constructor() {
    this.currentNewsIndex = 0;
    this.newsArticles = [];
    this.profileData = null;
    this.isLoading = false;
    
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.elements = {
      startButton: document.getElementById('startButton'),
      centerCircle: document.getElementById('centerCircle'),
      playIcon: document.getElementById('playIcon'),
      loadingRing: document.getElementById('loadingRing'),
      profilePic: document.getElementById('profilePic'),
      nameBadge: document.getElementById('nameBadge'),
      fullNameText: document.getElementById('fullNameText'),
      controlButtons: document.getElementById('controlButtons'),
      skipBtn: document.getElementById('skipBtn'),
      likeBtn: document.getElementById('likeBtn'),
      newsLeftBtn: document.getElementById('newsLeftBtn'),
      newsRightBtn: document.getElementById('newsRightBtn'),
      blockTopLeft: document.getElementById('blockTopLeft'),
      blockTopRight: document.getElementById('blockTopRight'),
      blockBottomLeft: document.getElementById('blockBottomLeft'),
      blockBottomRight: document.getElementById('blockBottomRight'),
      mainContent: document.getElementById('mainContent')
    };
  }

  bindEvents() {
    this.elements.startButton.addEventListener('click', () => this.scrollToMain());
    this.elements.centerCircle.addEventListener('click', () => this.handleCircleClick());
    this.elements.skipBtn.addEventListener('click', () => this.skipProfile());
    this.elements.likeBtn.addEventListener('click', () => this.likeProfile());
    this.elements.newsLeftBtn.addEventListener('click', () => this.navigateNews(-1));
    this.elements.newsRightBtn.addEventListener('click', () => this.navigateNews(1));
  }

  scrollToMain() {
    this.elements.mainContent.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  handleCircleClick() {
    if (!this.isLoading && !this.profileData) {
      this.loadProfile();
    }
  }

  async loadProfile() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingState();

    try {
      const response = await fetch('/api/random-profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.profileData = data;
      this.newsArticles = data.news || [];
      this.currentNewsIndex = 0;

      setTimeout(() => {
        this.displayProfile();
        this.isLoading = false;
      }, 1500);

    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile. Please try again.');
      this.resetToInitialState();
      this.isLoading = false;
    }
  }

  showLoadingState() {
    this.elements.playIcon.classList.add('hidden');
    this.elements.loadingRing.classList.remove('hidden');
  }

  displayProfile() {
    const { user, country, exchange, news } = this.profileData;

    // Скрыть загрузку, показать фото
    this.elements.loadingRing.classList.add('hidden');
    this.elements.profilePic.src = user.profileImage;
    this.elements.profilePic.classList.remove('hidden');

    // Заполнить данные
    this.populateUserInfo(user);
    this.populateCountryInfo(country);
    this.populateExchangeInfo(exchange);
    
    if (news && news.length > 0) {
      this.displayCurrentNews();
    } else {
      // Если нет новостей, скрыть кнопки навигации
      this.elements.newsLeftBtn.style.display = 'none';
      this.elements.newsRightBtn.style.display = 'none';
      document.getElementById('newsHeading').textContent = 'No news available';
      document.getElementById('newsText').textContent = 'Unable to fetch news for this country.';
      document.getElementById('newsUrl').style.display = 'none';
      document.getElementById('newsImg').style.display = 'none';
    }

    this.elements.fullNameText.textContent = `${user.firstName} ${user.lastName}`;

    // Показать блоки с задержкой и эффектом растяжения
    setTimeout(() => {
      this.showBlocks();
      this.elements.nameBadge.classList.remove('hidden');
      this.elements.controlButtons.classList.remove('hidden');
    }, 300);
  }

  showBlocks() {
    // Блоки выходят из центра по очереди с эффектом растяжения
    setTimeout(() => this.elements.blockTopLeft.classList.add('visible'), 100);
    setTimeout(() => this.elements.blockTopRight.classList.add('visible'), 250);
    setTimeout(() => this.elements.blockBottomLeft.classList.add('visible'), 400);
    setTimeout(() => this.elements.blockBottomRight.classList.add('visible'), 550);
  }

  hideBlocks() {
    // Блоки уходят в центр
    this.elements.blockTopLeft.classList.remove('visible');
    this.elements.blockTopLeft.classList.add('hiding');
    
    this.elements.blockTopRight.classList.remove('visible');
    this.elements.blockTopRight.classList.add('hiding');
    
    this.elements.blockBottomLeft.classList.remove('visible');
    this.elements.blockBottomLeft.classList.add('hiding');
    
    this.elements.blockBottomRight.classList.remove('visible');
    this.elements.blockBottomRight.classList.add('hiding');
  }

  populateUserInfo(user) {
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userGender').textContent = user.gender;
    document.getElementById('userAge').textContent = user.age;
    document.getElementById('userDob').textContent = user.dateOfBirth;
    document.getElementById('userCity').textContent = user.city;
    document.getElementById('userCountry').textContent = user.country;
    document.getElementById('userAddress').textContent = user.fullAddress;
  }

  populateCountryInfo(country) {
    if (country.flag) {
      document.getElementById('countryFlag').src = country.flag;
    }
    document.getElementById('countryName').textContent = country.name;
    document.getElementById('countryCapital').textContent = country.capital;
    document.getElementById('countryLanguages').textContent = country.languages;
    document.getElementById('countryCurrency').textContent = 
      `${country.currencyName} (${country.currencyCode})`;
  }

  populateExchangeInfo(exchange) {
    document.getElementById('rateUSD').textContent = 
      `1 ${exchange.base} = ${exchange.USD} USD`;
    document.getElementById('rateKZT').textContent = 
      `1 ${exchange.base} = ${exchange.KZT} KZT`;
  }

  displayCurrentNews() {
    if (this.newsArticles.length === 0) return;

    const article = this.newsArticles[this.currentNewsIndex];
    
    const newsImg = document.getElementById('newsImg');
    if (article.image) {
      newsImg.src = article.image;
      newsImg.style.display = 'block';
    } else {
      newsImg.style.display = 'none';
    }

    document.getElementById('newsHeading').textContent = article.title;
    document.getElementById('newsText').textContent = article.description;
    
    const newsUrl = document.getElementById('newsUrl');
    newsUrl.href = article.url;
    newsUrl.style.display = 'inline';
    
    // Показать кнопки навигации
    this.elements.newsLeftBtn.style.display = 'flex';
    this.elements.newsRightBtn.style.display = 'flex';
  }

  navigateNews(direction) {
    if (this.newsArticles.length === 0) return;

    this.currentNewsIndex += direction;

    if (this.currentNewsIndex < 0) {
      this.currentNewsIndex = this.newsArticles.length - 1;
    } else if (this.currentNewsIndex >= this.newsArticles.length) {
      this.currentNewsIndex = 0;
    }

    this.displayCurrentNews();
  }

  skipProfile() {
    this.hideAllElements();

    setTimeout(() => {
      this.resetToInitialState();
      this.loadProfile();
    }, 800);
  }

  likeProfile() {
    console.log('Profile liked:', this.profileData.user);
    alert(`You liked ${this.profileData.user.firstName} ${this.profileData.user.lastName}!`);
    this.skipProfile();
  }

  hideAllElements() {
    this.hideBlocks();
    this.elements.nameBadge.classList.add('hiding');
    this.elements.controlButtons.classList.add('hiding');

    setTimeout(() => {
      this.elements.profilePic.classList.add('hidden');
      this.elements.loadingRing.classList.remove('hidden');
    }, 600);
  }

  resetToInitialState() {
    // Скрыть все элементы
    this.elements.nameBadge.classList.add('hidden');
    this.elements.controlButtons.classList.add('hidden');
    this.elements.profilePic.classList.add('hidden');
    this.elements.loadingRing.classList.add('hidden');
    this.elements.playIcon.classList.remove('hidden');

    // Убрать классы hiding
    this.elements.blockTopLeft.classList.remove('hiding', 'visible');
    this.elements.blockTopRight.classList.remove('hiding', 'visible');
    this.elements.blockBottomLeft.classList.remove('hiding', 'visible');
    this.elements.blockBottomRight.classList.remove('hiding', 'visible');

    this.elements.nameBadge.classList.remove('hiding');
    this.elements.controlButtons.classList.remove('hiding');

    this.profileData = null;
    this.newsArticles = [];
    this.currentNewsIndex = 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProfileExplorer();
});



