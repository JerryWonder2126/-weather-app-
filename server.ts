/* eslint-disable node/no-unpublished-require */
import app from "./index";

const port = process.env["PORT"];

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
