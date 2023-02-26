import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '33913082-ade5365176eff0ab7925d756c';

export async function fetchPixImage(userSearch, page) {
  const params = new URLSearchParams({
    per_page: 40,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
  });

  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${userSearch}&${params}`
    );
    const images = await response.data;
    return images;
  } catch (error) {
    console.log(error.message);
  }
}
