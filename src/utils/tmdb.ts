import axios from "axios";

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: process.env.TMDB_BEARER || "" },
});

export default tmdb;
