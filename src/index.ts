// import realtime from "./lib";
import socket from "socket.io";
import ffmpeg from "fluent-ffmpeg";
import express from "express";
import cors from "cors";
import path from "path";
import { createWriteStream, unlinkSync, readdir, mkdir } from "fs";
const port = Number(process.env.PORT);

const expressApp = express();

const server = expressApp.listen(port || 6005);

expressApp.use(cors());

expressApp.use(express.static(path.join(__dirname, "../views")));

expressApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

expressApp.get("/:filename", (req, res) => {
  res.download(`temp/${req.params.filename}`, (err) => {
    if (err) throw new Error("something wrong");
    unlinkSync(`temp/${req.params.filename}`);
  });
});
const app = socket.listen(server);
console.log("app is running");

app.on("connection", (socket) => {
  readdir("temp", (data) => {
    // ...
    if (data == null) {
      // ...
    } else {
      mkdir("temp", (err) => err && console.log(err));
    }
  });
  console.log("connected");

  socket.on("video/upload", (data) => {
    console.log(data);

    const { file, type, fileInfo } = data;
    const filename = fileInfo[0].name.split(".")[0];
    const stream = createWriteStream("./temp/" + fileInfo[0].name);
    stream.on("open", () => {
      stream.write(file, "utf16le");
      stream.end();
    });

    ffmpeg()
      .input(`temp/${fileInfo[0].name}`)
      .output(`temp/${filename}.${type}`)
      .format(`${type}`)
      .on("end", (data) => {
        // console.log(data);
        socket.emit("video/downloadable", { filename: `${filename}.${type}` });

        unlinkSync(`temp/${fileInfo[0].name}`);
      })
      .on("start", () => console.log("started"))
      .on("progress", (data) => {
        console.log(data);

        socket.emit("video/progress", { percent: data.percent });
      })
      .on("error", (err) => {
        console.log(err);
      })
      .run();
  });
});
