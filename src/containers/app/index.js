import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Home from "../home";
import About from "../about";

// specify latest version, otherwise posetnet may use older, leading to: No Backends found error
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

class App extends Component {
  state = {
    net: null,
    imageElement: null,
    imageScaleFactor: .5,
    flipHorizontal: false,
    outputStride: 16,
    video: null,
    canvas: null,
    captures: [],
  };

  async componentDidMount() {
    // axios.get(SERVER_URL + 'handshake').then(res => console.log(res, 'handshake'))
    const net = await posenet.load({
      architecture: "ResNet50",
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2
    })

    // todo: tutorial outdated! https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
    //// const pose = await net.estimateSinglePose(imageElement, scaleFactor, flipHorizontal, outputStride);
    // const pose = await net.estimateSinglePose(this.state.imageElement);
    // console.log(pose)

    // is async
    this.setState({
      net,
      imageElement: document.getElementById('video'),
      canvas: document.getElementById('canvas'),
      video: document.getElementById('video'),
    }, () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
          this.state.video.srcObject=stream;
          this.state.video.play();
          // deprecated
          // this.video.src = window.URL.createObjectURL(stream);
        });
      }
    });
  }

  captureHandler = () => {
    this.state.canvas.getContext("2d").drawImage(this.state.video, 0, 0, 500, 500);

    // react state mutate list with CONCAT: https://www.robinwieruch.de/react-state-array-add-update-remove
    this.setState({
      captures: this.state.captures.concat(this.state.canvas.toDataURL("image/png"))
    });

  }

  // async startVideo() {
  // // load the posenet model
  //   const
  // }

  render() {
    const captures = this.state.captures.map((capture, i) =>
      <li key={i}><img src={capture} height="50" alt={`camera frame #${i}`}/></li>
    );

    return (
      <div>
        <header>
          <Link to="/">Home</Link>
          <Link to="/about-us">About</Link>
        </header>

        <main>
          <Route exact path="/" component={Home}/>
          <Route exact path="/about-us" component={About}/>
          <p>helloooooo</p>
          {/*<div id="video" style={{height: 500, width: 500, border: '5px dotted'}}></div>*/}
          <div>
            <video id="video" width="500" height="500" autoPlay/>
          </div>
          <div>
            <button id="snap" onClick={this.captureHandler}>Snap Photo</button>
          </div>
          <canvas id="canvas" width="500" height="500"/>
          <ul>{captures}</ul>
        </main>
      </div>
    );
  }
}

export default App;
