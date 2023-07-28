/* ------------ APP ------------ */
const rickAndMortyAPP = (function() {

  /* ------- model ------- */
  function Model() {
    this.view = null;

    this.fetchSettings = {
      currentPage: 1,

      URLForFetch: "https://rickandmortyapi.com/api/character/?page=",
      isNowFetching: false,
      timerIDForAbort: null,

      URLForFetchCharacterInfo: "https://rickandmortyapi.com/api/character/",
      isCharacterNowFetching: false,
      timerIDForCharacterAbort: null,
    };

    this.settings = {};
  };

  Model.prototype.initialize = function(view) {
    this.view = view;
  };

  Model.prototype.renderPage = function() {
    this.view.renderPage();
  };

  Model.prototype.startFirstLoadOfData = async function() {

    this.view.startLoaderInCharactersSection();

    try {
      const data = await this.requestData();

      if (data.status === "ok") {
        this.view.renderCharactersCardsContainer();
        this.view.renderCharactersCards(data.response.results);
        return;
      } else {
        throw data.error;
      };

    } catch(error) {
      if (error.name === "AbortError") {
        console.warn(error);
        const errorMessage = "The wait time is over, maybe the server is overloaded. Try again later.";
        this.view.makeErrorMessageInCharactersSection(errorMessage);
      } else {
        console.warn(error);
        const errorMessage = "There was an error. Try again later.";
        this.view.makeErrorMessageInCharactersSection(errorMessage);
      };
    };   

  };

  Model.prototype.loadNextPartOfCharacters = async function() {

    if (this.fetchSettings.isNowFetching) return;

    this.fetchSettings.currentPage += 1;
    this.view.startLoaderInCharactersCardsContainer();

    try {
      const data = await this.requestData();

      if (data.status === "ok") {
        this.view.renderCharactersCards(data.response.results);
        return;
      } else {
        throw data.error;
      };

    } catch(error) {
      if (error.name === "AbortError") {
        console.warn(error);
        const errorMessage = "The wait time is over, maybe the server is overloaded. Try again later.";
        this.view.makeErrorMessageInCharactersSection(errorMessage);
      } else {
        console.warn(error);
        const errorMessage = "There was an error. Try again later.";
        this.view.makeErrorMessageInCharactersSection(errorMessage);
      };
    };  

  };

  Model.prototype.requestData = async function() {
  
    try {
      this.fetchSettings.isNowFetching = true;

      const controller = new AbortController();
      const signal = controller.signal;

      this.fetchSettings.timerIDForAbort = setTimeout(() => {
        controller.abort();
      }, 8000);

      const response = await fetch(`${this.fetchSettings.URLForFetch + this.fetchSettings.currentPage}`, {signal});
      const data = await response.json();

      clearTimeout(this.fetchSettings.timerIDForAbort);
      return {status: "ok", response: data};
    } catch(error) {
      return {status: "error", error};
    } finally {
      this.fetchSettings.isNowFetching = false;
    };

  };

  Model.prototype.scrollToTop = function() {
    this.view.scrollToTop();
  };

  Model.prototype.showBackToTopButton = function() {
    this.view.showBackToTopButton();
  };

  Model.prototype.hideBackToTopButton = function() {
    this.view.hideBackToTopButton();
  };

  Model.prototype.showCharacterModal = function(id) {
    this.view.openModalWindowWithLoader();

    if (this.fetchSettings.isCharacterNowFetching === true) {
      const message = "Please wait until the loading of the previous character card information will be completed.";
      this.view.showUserMessageInModal(message);
      return
    };

    this.getInformationAboutCharacter(id);
  };

  Model.prototype.getInformationAboutCharacter = async function(id) {

    try {

      this.fetchSettings.isCharacterNowFetching = true;

      const controller = new AbortController();
      const signal = controller.signal;

      this.fetchSettings.timerIDForCharacterAbort = setTimeout(() => {
        controller.abort();
      }, 8000);

      const response = await fetch(`${this.fetchSettings.URLForFetchCharacterInfo + id}`, {signal});
      const data = await response.json();

      clearTimeout(this.fetchSettings.timerIDForCharacterAbort);
      this.view.showInformationAboutCharacterInModal(data);

    } catch(error) {
      if (error.name === "AbortError") {
        console.warn(error);
        const errorMessage = "The wait time is over, maybe the server is overloaded. Try again later.";
        this.view.showUserMessageInModal(errorMessage);
      } else {
        console.warn(error);
        const errorMessage = "There was an error. Try again later.";
        this.view.showUserMessageInModal(errorMessage);
      };
    } finally {
      this.fetchSettings.isCharacterNowFetching = false;
    };

  };

  Model.prototype.closeModal = function() {
    this.view.closeModal();
  };
  /* --------------------- */

  /* ------- view -------- */
  function View() {
    this.HTMLElements = {
      wrapper: null,
      backToTopButton: null,
      charactersSection: null,
      characterCardsContainer: null,
      charactersLoadingSection: null,
      characterModalWindow: null,
    };

    this.timerIDs = {
      timerIDForBackToTopButton: null,
      timerIDForBackToTopButtonForDelete: null,
    };

    this.settings = {
      logoPATH: "images/logo/Rick_and_Morty.svg",
    };
  };

  View.prototype.initialize = function(className) {
    this.HTMLElements.wrapper = document.getElementsByClassName(className)[0];
  };

  View.prototype.renderPage = function() {

    const header = document.createElement("header");
    this.HTMLElements.wrapper.append(header);

    const logoHeader = document.createElement("img");
    logoHeader.setAttribute("src", this.settings.logoPATH);
    logoHeader.setAttribute("alt", "Rick and Morty logo");
    header.append(logoHeader);

    this.HTMLElements.charactersSection = document.createElement("section");
    this.HTMLElements.charactersSection.classList.add("characters");
    this.HTMLElements.wrapper.append(this.HTMLElements.charactersSection);

    const footer = document.createElement("footer");
    this.HTMLElements.wrapper.append(footer);

    const logoFooter = document.createElement("img");
    logoFooter.setAttribute("src", this.settings.logoPATH);
    logoFooter.setAttribute("alt", "Rick and Morty logo");
    footer.append(logoFooter);

  };

  View.prototype.startLoaderInCharactersSection = function() {

    const loaderSection = document.createElement("section");
    loaderSection.classList.add("characters__loader-section");
    this.HTMLElements.charactersSection.append(loaderSection);

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderSection.append(loader);

    for (let i = 0; i < 3; i++) {
      const loaderItem = document.createElement("div");
      loader.append(loaderItem);
    };

  };

  View.prototype.startLoaderInCharactersCardsContainer = function() {

    this.HTMLElements.charactersLoadingSection = document.createElement("section");
    this.HTMLElements.charactersLoadingSection.classList.add("loader-section");
    this.HTMLElements.charactersSection.after(this.HTMLElements.charactersLoadingSection);

    const loader = document.createElement("div");
    loader.classList.add("loader");
    this.HTMLElements.charactersLoadingSection.append(loader);

    for (let i = 0; i < 3; i++) {
      const loaderItem = document.createElement("div");
      loader.append(loaderItem);
    };

  };

  View.prototype.makeErrorMessageInCharactersSection = function(errorMessage) {

    this.HTMLElements.charactersSection.innerHTML = "";

    const charactersErrorSection = document.createElement("section");
    charactersErrorSection.classList.add("characters__error-section");
    this.HTMLElements.charactersSection.append(charactersErrorSection);

    const errorParagraph = document.createElement("p");
    errorParagraph.textContent = errorMessage;
    charactersErrorSection.append(errorParagraph);

  };

  View.prototype.renderCharactersCardsContainer = function() {
    this.HTMLElements.charactersSection.innerHTML = "";
    this.HTMLElements.characterCardsContainer = document.createElement("div");
    this.HTMLElements.characterCardsContainer.classList.add("characters__container");
    this.HTMLElements.charactersSection.append(this.HTMLElements.characterCardsContainer);
  };

  View.prototype.renderCharactersCards = function(data) {

    if (this.HTMLElements.charactersLoadingSection) {
      this.HTMLElements.charactersLoadingSection.remove();
      this.HTMLElements.charactersLoadingSection = null;
    };    

    data.forEach(character => {
      const characterCard = document.createElement("div");
      characterCard.setAttribute("data-characterid", character.id);
      characterCard.classList.add("characters__item");

      const characterImageContainer = document.createElement("div");
      characterCard.append(characterImageContainer);

      const characterImage = document.createElement("img");
      characterImage.setAttribute("src", character.image);
      characterImageContainer.append(characterImage);

      const characterName = document.createElement("h1");
      characterName.textContent = character.name;
      characterCard.append(characterName);

      this.HTMLElements.characterCardsContainer.append(characterCard);
    });

  };

  View.prototype.scrollToTop = function() {

    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({top: 0, behavior: "smooth"});
    } else {
       window.scrollTo(0, 0);
    };

  };

  View.prototype.showBackToTopButton = function() {

    this.HTMLElements.backToTopButton = document.createElement("div");
    this.HTMLElements.backToTopButton.classList.add("back-to-top__button");
    document.body.append(this.HTMLElements.backToTopButton);

    const backToTopButton = document.createElement("button");
    backToTopButton.classList.add("back-to-top-btn");
    backToTopButton.setAttribute("type", "button");
    backToTopButton.textContent = "Back To Top";
    this.HTMLElements.backToTopButton.append(backToTopButton);

    this.timerIDs.timerIDForBackToTopButton = setTimeout(() => {
      this.HTMLElements.backToTopButton.classList.add("bttb-active");
      clearTimeout(this.timerIDs.timerIDForBackToTopButton);
    }, 100);

  };

  View.prototype.hideBackToTopButton = function() {

    this.timerIDs.timerIDForBackToTopButton = setTimeout(() => {
      this.HTMLElements.backToTopButton.classList.remove("bttb-active");
      
      this.timerIDs.timerIDForBackToTopButtonForDelete = setTimeout(() => {
        this.HTMLElements.backToTopButton.remove();
        clearTimeout(this.timerIDs.timerIDForBackToTopButtonForDelete);
      }, 300);

      clearTimeout(this.timerIDs.timerIDForBackToTopButton);
    }, 100);

  };

  View.prototype.openModalWindowWithLoader = function() {

    const overflow = document.createElement("section");
    overflow.classList.add("overflow");
    document.body.prepend(overflow);

    const modalWindow = document.createElement("div");
    modalWindow.classList.add("character-modal");
    overflow.append(modalWindow);

    this.HTMLElements.characterModalWindow = document.createElement("div");
    this.HTMLElements.characterModalWindow.classList.add("character-modal__body");
    modalWindow.append(this.HTMLElements.characterModalWindow);

    const loaderContainer = document.createElement("div");
    loaderContainer.classList.add("character-modal__loader");
    this.HTMLElements.characterModalWindow.append(loaderContainer);

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderContainer.append(loader);

    for (let i = 0; i < 3; i++) {
      const loaderItem = document.createElement("div");
      loader.append(loaderItem);
    };

  };

  View.prototype.showUserMessageInModal = function(message) {
    this.HTMLElements.characterModalWindow.innerHTML = "";

    const waitMessageContainer = document.createElement("div");
    waitMessageContainer.classList.add("character-modal__message");
    this.HTMLElements.characterModalWindow.append(waitMessageContainer);

    const waitMessageParagraph = document.createElement("p");
    waitMessageParagraph.textContent = message;
    waitMessageContainer.append(waitMessageParagraph);
  };

  View.prototype.showInformationAboutCharacterInModal = function(data) {
    if (!document.querySelector(".character-modal__body")) {
      return;
    };

    const characterImageContainer = document.createElement("div");
    characterImageContainer.classList.add("character-modal__img");

    const characterImage = document.createElement("img");
    characterImage.setAttribute("src", data.image);
    characterImageContainer.append(characterImage);

    const characterImageOverflow = document.createElement("div");
    characterImageContainer.append(characterImageOverflow);

    const characterInfoContainer = document.createElement("div");
    characterInfoContainer.classList.add("character-modal__info");

    const characterNameContainer = document.createElement("div");
    characterInfoContainer.append(characterNameContainer);

    const nameTitle = document.createElement("h2");
    nameTitle.textContent = "Name:";
    characterNameContainer.append(nameTitle);

    const name = document.createElement("p");
    name.textContent = data.name;
    characterNameContainer.append(name);

    const characterOriginContainer = document.createElement("div");
    characterInfoContainer.append(characterOriginContainer);

    const originTitle = document.createElement("h2");
    originTitle.textContent = "Origin:";
    characterOriginContainer.append(originTitle);

    const origin = document.createElement("p");
    origin.textContent = data.origin.name;
    characterOriginContainer.append(origin);

    const characterStatusContainer = document.createElement("div");
    characterInfoContainer.append(characterStatusContainer);

    const statusTitle = document.createElement("h2");
    statusTitle.textContent = "Status:";
    characterStatusContainer.append(statusTitle);

    const status = document.createElement("p");
    status.textContent = data.status;
    characterStatusContainer.append(status);

    const characterLocationContainer = document.createElement("div");
    characterInfoContainer.append(characterLocationContainer);

    const locationTitle = document.createElement("h2");
    locationTitle.textContent = "Location:";
    characterLocationContainer.append(locationTitle);

    const location = document.createElement("p");
    location.textContent = data.location.name;
    characterLocationContainer.append(location);

    const characterSpeciesContainer = document.createElement("div");
    characterInfoContainer.append(characterSpeciesContainer);

    const speciesTitle = document.createElement("h2");
    speciesTitle.textContent = "Species:";
    characterSpeciesContainer.append(speciesTitle);

    const species = document.createElement("p");
    species.textContent = data.species;
    characterSpeciesContainer.append(species);

    const characterGenderContainer = document.createElement("div");
    characterInfoContainer.append(characterGenderContainer);

    const genderTitle = document.createElement("h2");
    genderTitle.textContent = "Gender:";
    characterGenderContainer.append(genderTitle);

    const gender = document.createElement("p");
    gender.textContent = data.gender;
    characterGenderContainer.append(gender);

    this.HTMLElements.characterModalWindow.innerHTML = "";
    this.HTMLElements.characterModalWindow.append(characterImageContainer);
    this.HTMLElements.characterModalWindow.append(characterInfoContainer);

  };

  View.prototype.closeModal = function() {
    if (document.querySelector(".overflow")) {
      document.querySelector(".overflow").remove();
    };
  };
  /* --------------------- */

  /* ------- controller -------- */
  function Controller() {
    this.model = null;

    this.flags = {
      isBackToTopButtonOnPage: false,
    };

    this.settings = {
      clickListener: null,
      scrollListener: null,
      timerIDForDebounce: null,
    };
  };

  Controller.prototype.initialize = function(model) {
    this.model = model;
  }

  Controller.prototype.startApp = function() {
    this.model.renderPage();
    this.model.startFirstLoadOfData();
    this.addEventListeners();
  };

  Controller.prototype.addEventListeners = function() {
    this.settings.clickListener = this.checkWhatWasClicked.bind(this);
    document.addEventListener("click", this.settings.clickListener);
  
    this.settings.scrollListener = this.debounce(this.checkScroll, 100).bind(this);
    window.addEventListener("scroll", this.settings.scrollListener);
  };

  Controller.prototype.debounce = function(func, delay) {
    return function (...args) {
      clearTimeout(this.settings.timerIDForDebounce);
      this.settings.timerIDForDebounce = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  Controller.prototype.checkScroll = function(e) {
    e.preventDefault();
  
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollFromTop = window.scrollY;
    const footerHeight = document.getElementsByTagName("footer")[0].offsetHeight;

    if (scrollFromTop > 300 && !this.flags.isBackToTopButtonOnPage) {
      this.flags.isBackToTopButtonOnPage = true;
      this.model.showBackToTopButton();
    };

    if (scrollFromTop < 300 && this.flags.isBackToTopButtonOnPage) {
      this.flags.isBackToTopButtonOnPage = false;
      this.model.hideBackToTopButton();
    };

    if (scrollFromTop + windowHeight + footerHeight/2 >= documentHeight) {
      this.model.loadNextPartOfCharacters();
    };
  
  };

  Controller.prototype.checkWhatWasClicked = function(e) {
    e.preventDefault();
    
    if (e.target.closest(".back-to-top__button")) {
      this.model.scrollToTop();
      return;
    };

    if (e.target.closest(".characters__item")) {
      const characterID = e.target.closest(".characters__item").getAttribute("data-characterid");
      this.model.showCharacterModal(characterID);      
      return;
    };

    if (e.target.classList.contains("overflow")) {
      this.model.closeModal();  
      return;
    };

  };
  /* --------------------- */

  return {
    initialize: function() {
      this.makeWrapper();

      // creating MVC
      const model = new Model();
      const view = new View();
      const controller = new Controller(); 

      // initialize MVC
      model.initialize(view);
      view.initialize("wrapper");
      controller.initialize(model);

      controller.startApp();
    },
    makeWrapper: function() {
      const body = document.querySelector("body");
      const wrapper = document.createElement("div");
      wrapper.classList.add("wrapper");
      body.prepend(wrapper);
    },
  };

}());

document.addEventListener("DOMContentLoaded", () => {
  rickAndMortyAPP.initialize();
});