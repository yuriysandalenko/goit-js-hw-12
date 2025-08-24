import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import { getImagesByQuery } from "./js/pixabay-api.js";
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from "./js/render-functions.js";

const form = document.querySelector(".form");
const loadMoreBtn = document.querySelector(".load-more");

let query = "";
let page = 1;
let totalHits = 0;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  query = form.elements["search-text"].value.trim();
  form.reset();
  page = 1;
  clearGallery();
  hideLoadMoreButton();

  if (!query) {
    iziToast.warning({
      title: "Warning",
      message: "Please enter a search term",
      position: "topRight",
    });
    return;
  }

  await fetchImages();
});

loadMoreBtn.addEventListener("click", async () => {
  page += 1;
  await fetchImages(true);
});

async function fetchImages(isLoadMore = false) {
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        title: "No results",
        message: "Sorry, no images match your search. Please try again!",
        position: "topRight",
      });
      hideLoadMoreButton();
      return;
    }

    createGallery(data.hits);

    if (page === 1) {
      iziToast.success({
        title: "Success",
        message: `Found ${totalHits} images.`,
        position: "topRight",
      });
    }

    const maxPage = Math.ceil(totalHits / 15);
    if (page < maxPage) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        title: "Info",
        message: "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
    }

    if (isLoadMore) smoothScroll();
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Something went wrong. Try again later.",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const { height } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: "smooth",
  });
}