import { app } from "./app";

const port = 3000;

app.listen(port, () => {
  console.log(`Competition app listening at http://localhost:${port}`);
});
