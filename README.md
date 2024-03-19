# Cinemaverse API

This API is used to maintain movies information

### To start local server

- Install node modules -> `npm install`
- To start server -> `npm start`
- To start development server -> `npm run dev`
- To run testcase -> `npm test`

---

### List of available APIs

**Endpoint** → _http://localhost:3000/cinemaverse/api/_

### Movie

| HTTP method | Route       | Description              |
| ----------- | ----------- | ------------------------ |
| get         | /movies     | get all movies           |
| get         | /movies/:id | get specific movie by id |
| post        | /movies     | add new movie            |
| patch       | /movies/:id | update movie by id       |
| delete      | /movies/:id | delete a movie by id     |

### Genre

| HTTP method | Route       | Description              |
| ----------- | ----------- | ------------------------ |
| get         | /genres     | get all genres           |
| get         | /genres/:id | get specific genre by id |
| post        | /genres     | add new genre            |
| patch       | /genres/:id | update genre by id       |
| delete      | /genres/:id | delete a genre by id     |
