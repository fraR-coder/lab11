import { Table, Row, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import API from "../API";

function Header() {
    return (
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Favorite</th>
                <th>Watch Date</th>
                <th>Rating</th>
            </tr>
        </thead>
    );
}

function MyRow(props) {
    const film = props.film;

    return (
        <tr>
            <td>{film.id}</td>
            <td>{film.title}</td>
            <td>
                <Form>
                    <Form.Check
                        type="checkbox"
                        name="favorite"
                        inline
                        checked={film.favorite}
                        onChange={props.changeFavorite}
                    />
                    {film.favorite ? "yes" : "no"}
                </Form>
            </td>
            <td>{film.formatWatchDate("YYYY-MM-DD")}</td>

            <td>
                <Rating rating={film.rating} maxStars={5} filmId={film.id}
                    updateRating={props.updateRating} />
            </td>

            <td>
                <Button variant="danger" onClick={props.deleteFilm} className='mx-2'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-trash3"
                        viewBox="0 0 16 16"
                    >
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                    </svg>
                </Button>

                <Button variant="info" onClick={props.editFilm}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                    </svg>
                </Button>




            </td>
        </tr>
    );
}

function Rating(props) {
 let clickTimer = null; // Variabile per memorizzare il timer del click

  const handleClick = (starIndex) => {
    clearTimeout(clickTimer); // Resetta il timer del click

    clickTimer = setTimeout(() => {
      // Se il timer del click scade senza un doppio clic, esegue l'aggiornamento del rating
      props.updateRating(props.filmId, starIndex);
    }, 200); // Imposta un ritardo di 300 millisecondi (puoi modificare il valore a tuo piacimento)
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer); // Resetta il timer del click

    // Esegui l'aggiornamento del rating con il valore -1 per simulare il doppio clic
    props.updateRating(props.filmId, -1);
  };

  return [...Array(props.maxStars)].map((el, index) => (
    <i
      key={index}
      className={index < props.rating ? 'bi bi-star-fill' : 'bi bi-star'}
      onClick={() => handleClick(index)}
      onDoubleClick={handleDoubleClick}
    />
  ));
}


function ListOfFilms(props) {
    const navigate = useNavigate();

    let listVisualized = props.list;


    const updateRating = (id, starIndex) => {
        API.updateRating(id,starIndex)
            .then((message) =>{console.log(message); props.setUpdated(true);})
            .catch((err) => console.log(err))

    }

    const deleteRow = (id) => {

        API.deleteFilm(id)
            .then(() => props.setUpdated(true))
            .catch((err) => console.log(err));
    }

    const changeFavoriteChoice = (id) => {
        API.getFilm(id)
            .then((film) => {
                API.changeFavorite(film)
                    .then((response) => props.setUpdated(true))
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));

    }

    const editFilm = (id) => {

        API.getFilm(id)
        .then((film)=>{
            
            props.setEdit(film);
            navigate("/edit/" + id);
        })
        .catch((err) => console.log(err));
        
    }



    return (
        <Table className="table-striped">
            <Header />

            <tbody>
                {listVisualized.map((film, i) => (
                    <MyRow film={film} key={film.id} editFilm={() => editFilm(film.id)}
                        updateRating={updateRating}
                        deleteFilm={() => deleteRow(film.id)} changeFavorite={() => changeFavoriteChoice(film.id)} />
                ))}
            </tbody>

        </Table>
    );
}


export default ListOfFilms;
