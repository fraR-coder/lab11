/**
 * All the API calls
 */

import dayjs from "dayjs";

import { Film } from './films.js';

const URL = 'http://localhost:3001/api';

async function getAllFilms() {
  // call  /api/questions
  const response = await fetch(URL + '/films');
  const films = await response.json();
  if (response.ok) {
    return films.map((e) => (new Film(e.id, e.title, e.favorite, e.watchDate, e.rating)))
  } else {
    throw films;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getFilm(id) {
  // call  /api/questions/<id>
  const response = await fetch(URL + `/films/${id}`);
  const film = await response.json();
  if (response.ok) {
    const e = film;
    return { id: e.id, title: e.title, favorite: e.favorite, watchDate: dayjs(e.watchDate), rating: e.rating };
  } else {
    throw film;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getFilmsByFilter(filter) {

  const response = await fetch(URL + `/films/?filter=${filter}`,{credentials:'include'})
  const films = await response.json();
  if (response.ok) {
    return films.map((e) => (new Film(e.id, e.title, e.favorite, e.watchDate, e.rating)))
  } else {
    throw films;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }

}

function addFilm(film) {
  console.log("here api");
  // call  POST /api/answers
  return new Promise((resolve, reject) => {
    fetch(URL + `/films`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(film),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function deleteFilm(id) {
  // call  DELETE /api/answers/<id>
  return new Promise((resolve, reject) => {
    fetch(URL + `/films/${id}`, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function changeFavorite(film) {
  // call  PUT /api/answers/<id>/favorite
  return new Promise((resolve, reject) => {
    fetch(URL + `/films/${film.id}/favorite`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favorite: film.favorite ? false : true }),
    }).then((response) => {
      if (response.ok) {
        resolve(response)
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function updateRating(id, starIndex) {

  try {
    // Chiamata all'API getFilm per ottenere le informazioni del film
    const film = await getFilm(id);

    const response = await fetch(`${URL}/films/${id}/rating`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating: starIndex + 1 }),
    });


    if (response.ok) {
      return { message: 'Rating aggiornato con successo' };
    } else {
      throw respose;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
  } catch (error) {
    if (error.error === 'Film non trovato') {
      console.log('Film non trovato');
    } else {
      console.log('Errore nell\'aggiornamento del rating:', error);
    }
  }

}

async function editFilm(film) {


  const response = await fetch(`${URL}/films/${film.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(film),
  });


  if (response.ok) {
    return { message: 'film aggiornato con successo' };
  } else {
    throw response;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }



}

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}


const API = { getAllFilms, getFilm, getFilmsByFilter, addFilm, deleteFilm, changeFavorite, updateRating, editFilm,logIn, logOut, getUserInfo};
export default API;