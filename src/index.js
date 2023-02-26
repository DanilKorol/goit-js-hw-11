import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchPixImage } from './js/fetchPixImage';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'),
};

let page = 1;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: '250',
  captionType: 'alt',
  overlay: false,
});

refs.form.addEventListener('submit', onFormSubmit);
refs.loadBtn.addEventListener('click', onLoadBtnClick);

async function onFormSubmit(evt) {
  evt.preventDefault();
  cleanUpMarkup(refs.gallery);
  page = 1;

  const userSearch = evt.target.searchQuery.value.trim();
  localStorage.setItem('input', userSearch);

  if (!userSearch) {
    Notify.info("Search line can't be empty, try again");
    return;
  }
  const data = await fetchPixImage(userSearch, page);
  console.log(data);

  try {
    searchRequest(data);
  } catch (error) {
    onFetchError(error);
  }
}

function searchRequest(arr) {
  if (page === 1 && arr.hits.length > 1) {
    Notify.success(`Hooray! We found ${arr.totalHits} images.`);
  } else if (arr.hits.length === 0 && page === 1) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  createListMarkup(arr);
  refs.loadBtn.classList.remove('is-hidden');
  lightbox.refresh();
}

async function onLoadBtnClick() {
  page += 1;
  const input = localStorage.getItem('input');
  const data = await fetchPixImage(input, page);
  try {
    LoadMoreRequest(data);
  } catch (error) {
    onFetchError(error);
  }
}

function LoadMoreRequest(arr) {
  const totalPages = arr.totalHits / 40;

  if (page > totalPages) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadBtn.classList.add('is-hidden');
    return;
  }

  createListMarkup(arr);
  lightbox.refresh();
}

function createListMarkup(arr) {
  let markup = '';

  markup = arr.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
  <a class="gallery__link" href="${largeImageURL}">
  <div class="gallery-item">
    <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item"><b>Likes</b>${likes}</p>
      <p class="info-item"><b>Views</b>${views}</p>
      <p class="info-item"><b>Comments</b>${comments}</p>
      <p class="info-item"><b>Downloads</b>${downloads}</p>
    </div>
  </div>
</a>
`
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function onFetchError(err) {
  console.log(err.message);
}

function cleanUpMarkup(link) {
  link.innerHTML = '';
}
