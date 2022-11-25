const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3008, () => {
      console.log("Server is running at http://localhost:3008");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializedbandserver();

/*API 1*/

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority = "", status = "" } = request.query;
  //   console.log(request.query);
  //   console.log(priority);
  //   console.log(status);
  let gettingtherequireedquery = "";
  let dbresponse1 = null;
  if (
    request.query.priority !== undefined &&
    request.query.status !== undefined
  ) {
    gettingtherequireedquery = `SELECT * FROM todo 
          WHERE todo LIKE '%${search_q}%' AND priority LIKE '${priority}' AND status LIKE '%${status}%';`;
  } else if (request.query.priority !== undefined) {
    gettingtherequireedquery = `SELECT * FROM todo 
              WHERE todo LIKE '%${search_q}%' AND priority LIKE '${priority}';`;
  } else if (request.query.status !== undefined) {
    gettingtherequireedquery = `SELECT * FROM todo 
              WHERE status LIKE '%${status}%';`;
  } else {
    gettingtherequireedquery = `SELECT * FROM todo 
            WHERE todo LIKE '%${search_q}%';`;
  }

  dbresponse1 = await db.all(gettingtherequireedquery);
  response.send(dbresponse1);
});

//API 2
//Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const gettingthequery = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(gettingthequery);
  response.send(dbResponse);
});

//API 3
//Create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  //   console.log(request.body);
  const gettingquery = `
    INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(gettingquery);
  response.send("Todo Successfully Added");
});

//API4
//Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let querydetail = request.body;
  const { id, todo = "", priority = "", status = "" } = querydetail;
  //   console.log(querydetail);
  let dbresponse = null;
  let queryResult = "";
  if (querydetail.status !== undefined) {
    queryResult = `UPDATE todo SET status='${querydetail.status}' WHERE id=${todoId};`;
    dbresponse = await db.run(queryResult);
    response.send("Status Updated");
  } else if (querydetail.priority !== undefined) {
    queryResult = `UPDATE todo SET priority='${querydetail.priority}' WHERE id=${todoId};`;
    dbresponse = await db.run(queryResult);
    response.send("Priority Updated");
  } else if (querydetail.todo !== undefined) {
    queryResult = `UPDATE todo SET todo='${querydetail.todo}' WHERE id=${todoId};`;
    dbresponse = await db.run(queryResult);
    response.send("Todo Updated");
  }
});

//API 5
//Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const resultquery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(resultquery);
  response.send("Todo Deleted");
});

module.exports = app;
