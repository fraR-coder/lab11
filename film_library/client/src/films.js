"use strict";
import dayjs from "dayjs";

function Film(id, title, isFavorite = false, watchDate, rating) {
    this.id = id;
    this.title = title;
    this.favorite = isFavorite;
    this.rating = rating;
    // saved as dayjs object
    this.watchDate = watchDate && dayjs(watchDate);

    this.toString = () => {
        return (
            `Id: ${this.id}, ` +
            `Title: ${this.title}, Favorite: ${this.favorite}, ` +
            `Watch date: ${this.formatWatchDate("MMMM D, YYYY")}, ` +
            `Score: ${this.formatRating()}`
        );
    };

    this.formatWatchDate = (format) => {
        return this.watchDate ? this.watchDate.format(format) : "<not defined>";
    };

    this.formatRating = () => {
        return this.rating ? this.rating : "<not assigned>";
    };
}


function FilmLibrary() {
    this.list = [];

    this.print = () => {
        console.log("***** List of films *****");
        this.list.forEach((item) => console.log(item.toString()));
    };

    this.addNewFilm = (film) => {
        if (!this.list.some((f) => f.id == film.id)) this.list.push(film);
        else throw new Error("Duplicate id");
    };

    this.deleteFilm = (id) => {
        const newList = this.list.filter(function (film, index, arr) {
            return film.id !== id;
        });
        this.list = newList;
    };

    this.resetWatchedFilms = () => {
        this.list.forEach((film) => delete film.watchDate);
    };

    this.getRated = () => {
        const newList = this.list;

        return newList.filter(f => f.rating > 0);
    };

    this.sortByDate = () => {
        const newArray = [...this.list];
        newArray.sort((d1, d2) => {
            if (!d1.watchDate) return 1; // null/empty watchDate is the lower value
            if (!d2.watchDate) return -1;
            return d1.watchDate.diff(d2.watchDate, "day");
        });
        return newArray;
    };

    this.getBest = () => {
        let newList = this.list;
        return newList.filter((f) => f.rating === 5);
    };

    this.getSeenInDays = (ndays) => {
        const now = dayjs();
        let newList = this.list;
        return newList.filter(
            (f) => f.watchDate && now.diff(f.watchDate, "days") <= ndays
        );
    };

    this.getUnseen = () => {
        let newList = this.list;
        return newList.filter(f => !dayjs.isDayjs(f.watchDate));
    }

    this.updateFavorite = (id) => {
        const film = library.list.find(film => film.id === id);
        // Update favorite attribute of Film object
        if (film) {
            film.favorite = !film.favorite;
        }
    }
}

function createLibrary() {
    // Creating some film entries
    const f1 = new Film(1, "Pulp Fiction", true, "2023-04-10", 5);
    const f2 = new Film(2, "21 Grams", true, "2023-03-17", 4);
    const f3 = new Film(3, "Star Wars", false);
    const f4 = new Film(4, "Matrix", false);
    const f5 = new Film(5, "Shrek", false, "2023-02-21", 3);

    // Adding the films to the FilmLibrary
    const library = new FilmLibrary();
    library.addNewFilm(f1);
    library.addNewFilm(f2);
    library.addNewFilm(f3);
    library.addNewFilm(f4);
    library.addNewFilm(f5);

    return library;
}

const LIST = createLibrary().list;


export { LIST, Film };

