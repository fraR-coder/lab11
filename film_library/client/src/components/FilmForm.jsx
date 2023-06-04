import dayjs from "dayjs";
import { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

function FilmForm(props) {


    const [title, setTitle] = useState(props.editObj ? props.editObj.title : "");
    const [favorite, setFavorite] = useState(props.editObj ? props.editObj.favorite ? "yes" : "no" :"");
    const [rating, setRating] = useState(props.editObj ? props.editObj.rating : "");
    const [watchDate, setWatchDate] = useState(props.editObj ? props.editObj.watchDate.format('YYYY-MM-DD') : "");


    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    //const { filmId } = useParams();



    function handleSubmit(event) {

        event.preventDefault();
        // Form validation
        const today = dayjs();
        if (title === '')
            setErrorMsg('titolo non valido');
        else if (parseInt(rating) < 0 || parseInt(rating) > 5) {
            setErrorMsg('rating negativo non valido');
        }
        else if (dayjs(watchDate).isAfter(today)) {
            setErrorMsg('living in the future?');

        }


        else {
            console.log(props.user.id);
            const newFilm = {

                title: title,
                favorite: favorite === "yes",
                watchDate: watchDate ? watchDate : null,
                rating: rating ? rating : "0",
                
            }
            
            if (props.editObj) {
                
                newFilm.id = props.editObj.id;
                props.insertModifiedFilm(newFilm);

            }
            else {
                console.log(newFilm);
                props.addFilm(newFilm);
            }
            navigate('/');

        }


    }
    return (
        <>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" name="title" value={title} onChange={ev => setTitle(ev.target.value)} />
                </Form.Group>

                <Form.Group className='mb-3'>
                    <Form.Label>favorite</Form.Label>

                    <Form.Check key={"yes"} type="radio"
                        label={"yes"}
                        name="favorite" value={"yes"}
                        checked={favorite === "yes"} onChange={ev => setFavorite(ev.target.value)} />
                    <Form.Check key={"no"} type="radio"
                        label={"no"}
                        name="favorite" value={"no"}
                        checked={favorite === "no"} onChange={ev => setFavorite(ev.target.value)} />
                </Form.Group>

                <Form.Group className='mb-3'>
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" name="date" value={watchDate} onChange={ev => setWatchDate(ev.target.value)} />
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Rating</Form.Label>
                    <Form.Control type="text" name="rating" value={rating} onChange={ev => setRating(ev.target.value)} />
                </Form.Group>

                <Button type='submit' variant="primary">{"Add"}</Button>
                <Button className="mx-2" variant="danger" onClick={() => navigate("/")}>Cancel</Button>


            </Form>
        </>
    );




}
export default FilmForm;