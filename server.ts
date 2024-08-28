/* eslint-disable node/no-unpublished-require */
import app from "./index";

const port = process.env["PORT"];

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
