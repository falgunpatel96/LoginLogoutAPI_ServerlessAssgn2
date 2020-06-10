const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/api/login", require("./routes/api/login"));
app.use("/api/logout", require("./routes/api/logout"));

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});