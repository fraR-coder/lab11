import { Container } from 'react-bootstrap';


import FilmForm from '../components/FilmForm.jsx'

import { useLocation } from 'react-router-dom';
import API from '../API.jsx';

function MyForm(props) {

  console.log("i am here");

  const location = useLocation();
  const { setUpdated } = location.state || {
    setUpdated: () => { },
  };



  const addFilm = (f) => { // oggetto con solo stringhe nei campi,senza id, watchdate può essere null

    console.log("i am usig add film whith state= " + location.state);


      API.addFilm(f)
      .then(() => setUpdated(true))
      .catch((err) => console.log(err));
    

  }

  const insertModifiedFilm =(f)=>{

    console.log(f);
    API.editFilm(f)
    .then(() => setUpdated(true))
    .catch((err) => console.log(err));

  }

  return (

    <Container className="below-nav">
      <FilmForm addFilm={addFilm} editObj={props.editObj} insertModifiedFilm={insertModifiedFilm} user={props.user}/>
    </Container>

  );

}

export default MyForm;