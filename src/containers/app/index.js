/** Libraries  */
import React, { Component } from "react";
// newer version of react-router:
// todo: app idea: track deprecations => emails developper to update deprecated, or highlight it
// todo: camera how to display to both zoom & webapp
import { Route, Link, Switch } from "react-router-dom";
import axios from "axios";

/** Material UI */
// import Button from "@material-ui/core/Button";
import { Button, Input } from '@material-ui/core';

/** Components  */
import Home from "../home";
import About from "../about";
import Train from "../train";


// specify latest version, otherwise posetnet may use older, leading to: No Backends found error
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import estimateSinglePose from "@tensorflow-models/posenet";

const N_POSE_COMPONENTS = 17;

class App extends Component {
  state = {
    /** model */
    myPosenet: null,
    imageElement: null,
    imageScaleFactor: .5,
    flipHorizontal: false,
    outputStride: 16,

    /** training */
    myTimer: null,
    trainDelay: 500,
    trainInterval: 50,
    trainDuration: 5000,
    audioElem: null,
    BATCH_SIZE_TRAIN: 2,
    gestureName: '',

    /** media */
    video: null,
    canvas: null,
    captures: [],
    frames: [],
    train_samples: [],
    AUDIO_SRC: "https://assets.coderrocketfuel.com/pomodoro-times-up.mp3",
    audio: null,

    /** axios */
    BASE_URL: null
  };

  // (for functional: async inside of hook)
  async componentDidMount() {
    // axios.get(SERVER_URL + 'handshake').then(res => console.log(res, 'handshake'))
    const myPosenet = await posenet.load({
      architecture: "ResNet50",
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2
    });

    // todo: tutorial outdated! https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
    //// const pose = await myPosenet.estimateSinglePose(imageElement, scaleFactor, flipHorizontal, outputStride);
    // const pose = await myPosenet.estimateSinglePose(this.state.imageElement);
    // console.log(pose)

    // is async
    // todo: generally want to interact with virtual DOM: set a ref:
    //  attach to virtual dom node, helps optimization
    // todo: check musk's AR vid
    // todo: kids will prob be creative w gestures
    // todo: edge vs server ML training unviersal model vs personalized
    // todo: storage limits for local storage (if too big maybe server)
    // todo: react-router only for logic, for styling navbar: eg material UI (increases bundle size), reactbootstrap
    // todo: checkout snowpack bundler (ESM vs webpack), has dynamic update of modules (pckage.json)

    this.setState({
      myPosenet: myPosenet,
      imageElement: document.getElementById("video"),
      canvas: document.getElementById("canvas"),
      video: document.getElementById("video"),
      // audioElem: document.getElementsByClassName("audio-element")[0],
      BASE_URL: process.env.PORT || "http://localhost:5000",
      audio: new Audio(this.state.AUDIO_SRC)
    }, () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.state.video.srcObject = stream;
          this.state.video.play();
          // deprecated
          // this.video.src = window.URL.createObjectURL(stream);
        });
      }
    });

  }

  // take pic from cam every x ms => extract pose data => save to
  startCameraHandler = () => {
    this.setState({
      myTimer: setInterval(() => this.captureHandler(), 2000)
    });
  };

  captureHandler = () => {
    console.log("CaptureHandler");
    // setInterval: capture a pic at x FPS

    this.state.canvas.getContext("2d").drawImage(this.state.video, 0, 0, 500, 500);

    const pic = this.state.canvas.toDataURL("image/png");
    const coordinateSequence = this.addCoordinates();

    // react state mutate list with CONCAT: https://www.robinwieruch.de/react-state-array-add-update-remove
    this.setState({
      captures: this.state.captures.concat(pic),
      frames: this.state.frames.concat(coordinateSequence)
    });
  };

  pauseHandler = isTraining => {
    // if training, add to train_samples
    // without keeping a copy of coordinates, the async setStates clears coordinates before they can be added to samples
    // const coordinates_copy = [...this.state.frames];  // shallow copy (spread) works because we're reassigning in state, not clearing
    // alert(JSON.stringify(this.state.frames))
    const coordinates_copy = JSON.parse(JSON.stringify(this.state.frames));
    // alert(JSON.stringify(coordinates_copy))
    if (isTraining) {
      console.log("istraining" + isTraining);
      // alert(this.state.frames.length);
      clearInterval(this.state.myTimer);
      // sequences map to gestures
      // data format: (sequence#, frame#, bodypart#)
      const dimensions = [
        this.state.train_samples.length,
        this.state.train_samples.reduce((x, y) => Math.max(x, y.length), 0)
      ];
      console.log("dimensions of samples" + dimensions);
      this.setState({
        train_samples: [...this.state.train_samples, coordinates_copy.slice(2, -1)],  // cutting off frames of each sequence todo: find out why empty! {}
        // train_samples: [...this.state.train_samples, coordinates_copy.filter(frame => JSON.stringify(frame) !== '{}')],  // cutting off frames of each sequence todo: find out why empty! {}
        frames: [],
        captures: [],
        // audio: new Audio(this.state.AUDIO_SRC) // todo: consult mentor, really inefficient, but audio only plays once! :(
      }, () => {
        console.log("before trigger" + this.state.train_samples.length)
        console.log(this.state.train_samples.length < this.state.BATCH_SIZE_TRAIN);
        console.log(this.state.train_samples.length, this.state.BATCH_SIZE_TRAIN);

        if (this.state.train_samples.length < this.state.BATCH_SIZE_TRAIN) {
          console.log("trigger" + this.state.train_samples.length)
          this.trainHandler();
        }
      });
    } else {  // clear coordinates
      this.setState({
        frames: [],
        captures: []
      });
    }

  };

  /**
   * plays a sound to start recording
   * starts timer that captures frame every trainInterval ms
   * pause timer after training duration reached
   */
  trainHandler = () => {
    // alert(`train handler debug: ${JSON.stringify(this.state.train_samples)}`);
    setTimeout(() => {
      // resets position in audio file to start
      // todo: https://stackoverflow.com/questions/7005472/html-audio-element-how-to-replay
      // sol1: this.state.audioElem.currentTime=0;
      // sol2: this.state.audioElem.load();
      // sol3: this.state.audioElem.setAttribute('src', this.state.AUDIO_SRC);
      // sol4: this.state.audio.pause()
      // this.state.audioElem.play();
      this.state.audio.play();

      this.setState({
        myTimer: setInterval(() => this.captureHandler(), this.state.trainInterval)
      });
      setTimeout(() => this.pauseHandler(true), this.state.trainDuration);
    }, this.state.trainDelay);
  };

  async addCoordinates() {
    console.log("addCoordinates");
    console.log(this.state.canvas);
    console.log(this.state.myPosenet);
    // todo: if fliphorizontal true doesn't work set it to false
    const pose = await this.state.myPosenet.estimateSinglePose(
      // this.state.captures[this.state.captures.length-1],
      this.state.canvas,
      {
        flipHorizontal: true
      });

    console.log(pose);
    // 17 body parts from posenet: each point {x, y, name, score} / dont' need name bc it's in order
    // [[], []... []]
    // let coordinates = [...Array(N_POSE_COMPONENTS).fill().map(_ => [])];
    let coordinates = [];

    console.log("pose keypoints" + JSON.stringify(pose.keypoints));
    // console.log(pose.keypoints[0].position.x);
    // returns new list! doesn't mutate!
    // for of loops: [i, x] or x of ...
    for (const [i, keypoint] of pose.keypoints.entries()) {
      // watch out for concat vs push! check dimensions carefullllly
      if (i > 10){  // only upper body, excluding waist down
        break
      }
      coordinates.push([keypoint.position["x"], keypoint.position["y"]])  // [1, 2]
    }
    console.log('length is ' + coordinates.length);

    console.log(JSON.stringify(coordinates));
    // coordinates = pose.keypoints.map((keypoint, i) => {
    //   console.log(JSON.stringify(keypoint))
    //   console.log(JSON.stringify(keypoint.position))
    //   console.log(JSON.stringify(keypoint["position"]))
    //   coordinates[i].push([keypoint.position["x"], keypoint.position["y"]]);
    // });

    // sherlock homes: I think this should be push
    this.setState({
      frames: [...this.state.frames, coordinates],
    });

    console.log("addcoordinates " + JSON.stringify(coordinates));

    // todo: make post request

    return coordinates;
  }

  sendSample = async () => {
    try {
      console.log(`data sent to server!`);
      // todo: fancy https://github.com/axios/axios#axios-api
      console.log(JSON.stringify(this.state.train_samples));
      // don't! jsonify things like objects like JSON.stringy(this.state.train_samples)
      const res = await axios.post(`${this.state.BASE_URL}/post/data`, { samples: this.state.train_samples.slice(1), gesture: this.state.gestureName });
      // response structure:
      // config: {url: "http://localhost:5000/post/data", method: "post", data: "[]", headers: {…}, transformRequest: Array(1), …}
      // data: {msg: "data transferred!"}
      // headers: {content-length: "28", content-type: "application/json"}
      // request: XMLHttpRequest {readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, onreadystatechange: ƒ, …}
      // status: 200
      // statusText: "OK"
      // __proto__: Object
      console.log(res.data.msg);
    } catch (e) {
      console.error(e);
    }
  };

  gestureNameHandler = event => {
    this.setState({gestureName: event.target.value});
  }

  render() {
    const captures = this.state.captures.map((capture, i) =>
      <li key={i}><img src={capture} height="50" alt={`camera frame #${i}`}/></li>
    );

    const sendButton = this.state.train_samples.length >= this.state.BATCH_SIZE_TRAIN ?
      <Button id="sendData" variant="contained" color="primary"
              onClick={this.sendSample}>Send Samples!</Button>
      : <Button id="sendData" variant="contained" color="primary"
                onClick={this.sendSample} disabled>Send Samples!</Button>;

    return (
      <div>
        <header>
          <Link to="/">Home</Link>
          <Link to="/about-us">About</Link>
          <Link to="/train">Train</Link>
        </header>

        <main>
          {/*// exact: exact string, vs match prefixed, it alsolooks for first route, so need exact for root if not last
          put at bootom so ppl know where to look
          :param in root path, "use params" destructure into vars */}
          <Switch>
            <Route path="/about">
              <About/>
            </Route>
            <Route path="/train">
              <Train/>
            </Route>
            <Route path="/">
              <Home/>
            </Route>
          </Switch>
          {/*<Route exact path="/" component={Home}/>*/}
          {/*<Route exact path="/about-us" component={About}/>*/}
          {/*<Route exact path="/train" component={Train}/>*/}
          <p>helloooooo</p>
          {/*<div id="video" style={{height: 500, width: 500, border: '5px dotted'}}></div>*/}
          <div>
            {/*want similar ratio to posenet, bc image will be compressed!*/}
            <video id="video" width="771" height="600" autoPlay/>
          </div>
          <div>
            {/*// note: JSX comments are like this!*/}
            {/*<button id="snap" onClick={this.captureHandler}>Snap Photo</button>*/}
            <Button id="startCamera" variant="contained" color="primary"
                    onClick={this.startCameraHandler}>Start Streaming</Button>
            <Button id="pause" variant="contained" color="secondary"
                    onClick={() => this.pauseHandler(false)}>Pause</Button>
            <Button id="train" variant="contained" color="primary"
                    onClick={this.trainHandler}>Collect Training Samples!</Button>
            {sendButton}
          </div>
          <form>
            <label>
              Gesture Name:
              <input type="text" name="name" value={this.state.gestureName} onChange={this.gestureNameHandler} />
            </label>
            <input type="submit" value="Submit" />
          </form>
          {/*<audio className="audio-element">*/}
          {/*  <source src={this.state.AUDIO_SRC}/>*/}
          {/*</audio>*/}
          <canvas id="canvas" width="500" height="500"/>
          <ul>{captures}</ul>
        </main>
      </div>
    );
  }
}

export default App;
