import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import { generateHotWord, checkIfvalid, formatGuess } from './util/wordle.js';
import {randomInt} from './util/wordle.js'

export function spawnHotWord(word) {
    const lowerSeconds = 30;
    const upperSeconds = 60;
    setTimeout(() => {
        // TODO: spawn hot word
    }, randomInt(lowerSeconds * 1000, upperSeconds * 1000))
}

const app = express();

app.use(cors());

app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ server: server, cors: { origin: "*" } });

let hotWord = generateHotWord();

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

let words = [];

app.get("/words", function (req, res, next) {
  // res.send(words);
  res.send(hotWord);
});

app.post("/words", function (req, res) {
  // use checkIfvalid to check if word is valid
  try {
    if (!words.includes(req.body.input)) {
      words.push(req.body.input);
    } else {
      res.send({ isValid: 0 });
      return;
    }
  } catch (err) {
    res.send(err);
  }

  res.send({ isValid: 1 });
});

wss.on("connection", (socket) => {
  console.log("connect");
  socket.on("message", (message) => {
    const messageEvent = JSON.parse(message.toString()); // Get the UTF-8 buffered data, turn to string, then turn to JS object with event and data attributes
    const data = messageEvent.data;
    const event = messageEvent.event;
    console.log(messageEvent);
    // Figure out what event was sent
    switch (event) {
      case 'guess':
        // the Godot player has killed a word, so play Wordle
        const bbEncoded = formatGuess(data, hotWord);

        // send the result back to Godot
        const payload = {
          event: "guessResult",
          data: bbEncoded
        }
        socket.send(JSON.stringify(payload));
      default:
        console.log("Unrecognized event: ", event)
    }
  });
});

server.listen(5000, () => {
  console.log("Listening on http://localhost:5000");
});
