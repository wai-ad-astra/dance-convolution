import React, { Component } from "react";
// newer version of react-router:
// todo: app idea: track deprecations => emails developper to update deprecated, or highlight it
// todo: camera how to display to both zoom & webapp
import { Route, Link, Switch} from "react-router-dom";
import Home from "../home";
import About from "../about";
import Train from "../train";

import Button from '@material-ui/core/Button';

// specify latest version, otherwise posetnet may use older, leading to: No Backends found error
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import estimateSinglePose from '@tensorflow-models/posenet';

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
    data:[],
    
  };

  // (for functional: async inside of hook)
  async componentDidMount() {
    // axios.get(SERVER_URL + 'handshake').then(res => console.log(res, 'handshake'))
    const myPosenet = await posenet.load({
      architecture: "ResNet50",
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2
    })

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
      net: myPosenet,
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

    var date1 = new Date();
    var date2 = new Date();
    var diff = date2 - date1; 

    //we'll capture images for the two seconds
    //collect the data together

    g = []
    while (diff < 2000) {
      this.state.canvas.getContext("2d").drawImage(this.state.video, 0, 0, 500, 500);

      let b = this.startVideo(this.state.canvas);

      // react state mutate list with CONCAT: https://www.robinwieruch.de/react-state-array-add-update-remove
      this.setState({
        captures: this.state.captures.concat(this.state.canvas.toDataURL("image/png")),
      });

      g.concat(b)

    }

    this.setState({
      data: this.state.data.concat(g), 
    });

    diff = 0  

  }

  async startVideo(imageElement) {
    
    const net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2
    });

    const pose = await net.estimateSinglePose(imageElement, {
      flipHorizontal: true
    });

    console.log(pose);
    let a = pose;
    let coordinates = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
  
    for (let z = 0; z < 17; z++) {

      let b = [a.keypoints[z].position["x"],a.keypoints[z].position["y"]];
      coordinates[z].push(b);
    }
  
    console.log(coordinates)
  
    return coordinates;
}

  render() {
    const captures = this.state.captures.map((capture, i) =>
      <li key={i}><img src={capture} height="50" alt={`camera frame #${i}`}/></li>
    );
    

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
              <About />
            </Route>
            <Route path="/train">
              <Train />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
          {/*<Route exact path="/" component={Home}/>*/}
          {/*<Route exact path="/about-us" component={About}/>*/}
          {/*<Route exact path="/train" component={Train}/>*/}
          <p>helloooooo</p>
          {/*<div id="video" style={{height: 500, width: 500, border: '5px dotted'}}></div>*/}
          <div>
            <video id="video" width="500" height="500" autoPlay/>
          </div>
          <div>
            {/*// note: JSX comments are like this!*/}
            {/*<button id="snap" onClick={this.captureHandler}>Snap Photo</button>*/}
            <Button id="snap" variant="contained" color="primary"
                    onClick={this.captureHandler}>Snap Photo</Button>
          </div>
          <canvas id="canvas" width="500" height="500"/>
          <ul>{captures}</ul>
        </main>
      </div>
    );
  }
}

export default App;
