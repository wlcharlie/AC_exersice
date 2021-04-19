const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const sortIcon = document.querySelector('#sort-icon')
const sortStatus_Table = true
const sortStatus_List = false
let sortStatus = sortStatus_Table

let currentPage = 1

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList_Table(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

function renderMovieList_Table(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {

  const data = filteredMovies.length ? filteredMovies : movies
  page = filteredMovies.length ? 1 : page

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let page = 0; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">${page + 1}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function renderMovieList_List(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
      <div class="col-12 py-2 border-top border-bottom border-light">
        <div class="d-flex justify-content-between">
          <div>
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
            More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}


dataPanel.addEventListener('click', (event) => {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)

  if (sortStatus) {
    renderMovieList_Table(getMoviesByPage(1))
  } else if (!sortStatus) {
    renderMovieList_List(getMoviesByPage(1))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  if (sortStatus) {
    renderMovieList_Table(getMoviesByPage(page))
  } else if (!sortStatus) {
    renderMovieList_List(getMoviesByPage(page))
  }

  currentPage = page
})

sortIcon.addEventListener('click', function sortSwitch(event) {
  let target = event.target
  if (target.matches(".sort-list")) {
    renderMovieList_List(getMoviesByPage(currentPage))
    sortStatus = sortStatus_List
  } else if (target.matches('.sort-table')) {
    renderMovieList_Table(getMoviesByPage(currentPage))
    sortStatus = sortStatus_Table
  }
})