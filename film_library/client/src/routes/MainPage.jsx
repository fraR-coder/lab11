import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs";

import MySideBar from '../components/SideBar.jsx';
import ListOfFilms from '../components/ListOfFilms.jsx';
import Loading from '../components/Loading.jsx';
import { useEffect, useState } from "react";

import API from '../API.jsx';



const filters = {
    'filter-all': { label: 'All', id: 'filter-all', filterFunction: () => true },
    'filter-favorite': { label: 'Favorites', id: 'filter-favorite', filterFunction: film => film.favorite },
    'filter-best': { label: 'Best Rated', id: 'filter-best', filterFunction: film => film.rating >= 5 },
    'filter-lastmonth': { label: 'Seen Last Month', id: 'filter-lastmonth', filterFunction: film => isSeenLastMonth(film) },
    'filter-unseen': { label: 'Unseen', id: 'filter-unseen', filterFunction: film => film.watchDate ? false : true }
};

const isSeenLastMonth = (film) => {
    if ('watchDate' in film && film.watchDate) {  // Accessing watchDate only if defined
        const diff = film.watchDate.diff(dayjs(), 'month')
        const isLastMonth = diff <= 0 && diff > -1;      // last month
        return isLastMonth;
    }
}

function MainPage(props) {

    const [name, setName] = useState("filter-all");
    

    return (
        <Container fluid>
            <Container fluid className="row vheight-100" >
                <MySideBar items={filters} selected={name} setName={setName} setUpdated={props.setUpdated} />
                <MyMain filterName={name} setUpdated={props.setUpdated} updated={props.updated} setEdit={props.setEdit} user={props.user}/>
            </Container>

        </Container>

    );
}

function MyMain(props) {



    const navigate = useNavigate();

    const [filmsFiltered, setList] = useState([]);

   


    useEffect(() => {

        
        if (props.updated) {
            console.log("sto per ricaricare "+ props.filterName+" e updated vale "+props.updated+ " utente: "+props.user.id);
            setTimeout(() => {
                API.getFilmsByFilter(filters[props.filterName].id)
                .then((films) => { setList(films); props.setUpdated(false); })
                .catch((err) => console.log(err));
            }, 100);
        }


    }, [props.updated]);





    return (


        <main className="col-md-9 col-12 below-nav">
            <h1 className="mb-2" id="filter-title">{filters[props.filterName].label}</h1>

            <Container id="filmTable">
                {props.updated ? <Loading /> :
                    <ListOfFilms
                        list={filmsFiltered} setList={setList}
                        setEdit={props.setEdit} setUpdated={props.setUpdated}/>
                        
                }

            </Container>

            <Button type="button" className="btn btn-lg btn-primary fixed-right-bottom"
                onClick={() => navigate("/add", 
                { state: { updated: props.updated, setUpdated: props.setUpdated } })} >&#43;</Button>
        </main>



    );

}






export default MainPage;