import React, {Component} from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {UnControlled as CodeMirror} from 'react-codemirror2'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import './../../index.css'
//const Codemirror = require('')
import {
  increment,
  //incrementAsync,
  decrement,
  //decrementAsync
} from '../../modules/counter'
import {
  updateCode,
  changeMode,
  toggleReadOnly,
  updateOutput
} from '../../modules/CodeEditor'


//require('codemirror/mode/javascript/javascript');


class Home extends Component {

  handleChange = (e) => {
    alert("handleChange method: "+e.target.value)
    //{() => this.props.changeMode(e.target.value)}
    //this.props.decrement(e.target.value)
  }
  
  render() {
    //const languages = ['markdown', 'javascript', 'xml']
    const optionList = this.props.languages.map(x => {
      //require('codemirror/mode/'+x+'/'+x);
      return <MenuItem value={x}>{x}</MenuItem>
    })
    require('codemirror/mode/javascript/javascript')
    require('codemirror/mode/xml/xml')
    // const optionList = this.props.languages.map(function(x) {
    //   return <option value={x}>{x}</option>
    // })
    return (
      <div Container fluid>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" to="/">
            Home
          </Link>
          <Link color="inherit" target="_blank" to="https://github.com/wai-ad-astra/dance-convolution" >
            <a href="https://github.com/wai-ad-astra/dance-convolution">Github</a>
          </Link>
          <Link color="inherit" to="/train">Train</Link>
        </Breadcrumbs>
        <Grid container>
          <Grid xs={12}>
            <h1>Home Page</h1>
          </Grid>

        <Grid xs={6}>
        {/* <p>Count: {this.props.count}</p>
        <p>
          <button onClick={this.props.increment}>Increment</button>
          <button onClick={this.props.incrementAsync} disabled={this.props.isIncrementing}>
            Increment Async
          </button>
        </p>

        <p>
          <button onClick={this.props.decrement}>Decrement</button>
          <button onClick={this.props.decrementAsync} disabled={this.props.isDecrementing}>
            Decrement Async
          </button>
        </p>

        <p>
          <button onClick={() => this.props.changePage()}>
            Go to about page via redux
          </button>
        </p>
        
        <p>Code: {this.props.code}</p>

        <button>This is a test</button> */}
        <h2>Instructions</h2>
        {/* <ul>
              <li>
                This website can generate pseudocode based your gestures
              </li>
              <li>
                Go to train page to register your gesture and give them a special meaning
              </li>

        </ul> */}
        <p>This website can generate pseudocode based your gestures</p>
        <p>Go to train page to register your gestureto scan for your body parts</p>
        <p>Click Send samples and your image data will be processed using Machine Learning</p>
        <p>Then on the Home page turn on your camera to show gestures</p>
        <p>The gestures that you registed should convert to pseudocode for use</p>

        </Grid>

        <Grid xs={6} style={containerStyle}>
          <Grid container
          direction="column"
          justify="flex-end"
          alignItems="stretch">
        <div style={editorStyle}>
          <div>
            <CodeMirror
              value={this.props.code}
              options={{
                mode: this.props.mode,
                theme: 'material',
                lineNumbers: false,
                readOnly: this.props.readOnly
              }}
              onChange={(editor, data, value) => {
                this.props.updateCode(value)
              }} />
              
            <div style={{ marginTop: 10 }}>
              <Select theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
              ...theme.colors,
                text: 'blue',
                primary: 'white',
                },
              })} 
              onChange={(e) => this.props.changeMode(e.target.value) } value={this.props.mode}>
                { optionList }
              </Select>
              <Button variant="contained" color="primary" onClick={this.props.toggleReadOnly}>Toggle read-only mode (currently {this.props.readOnly ? 'on' : 'off'})</Button>
              <Button variant="contained" color="primary" onClick={() => this.props.updateOutput(this.props.code)}>Compile Code</Button>
            </div>
          </div>
        </div>
        <p></p>
        <CodeMirror
              value={this.props.output}
              options={{
                mode: 'markdown',
                theme: 'material',
                lineNumbers: false,
                readOnly: true
              }}
              onChange={(editor, data, value) => {
                value = eval(value)
              }} />
          </Grid>
        </Grid>
        </Grid>
        </div>
    )
  }
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const editorStyle = {
  flexShrink: '0',
  minWidth: '100%',
  minHeight: '100%'
}

const mapStateToProps = ({ counter, editor }) => {
  return {
    count: counter.count,
    isIncrementing: counter.isIncrementing,
    isDecrementing: counter.isDecrementing,
    code: editor.code,
    readOnly: editor.readOnly,
    mode: editor.mode,
    languages: editor.languages,
    output: editor.output
  }
}

// const mapToProps = ({ editor }) => ({
//   code: editor.code,
//   readOnly: editor.readOnly,
//   mode: editor.mode
// })

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateCode,
      changeMode,
      toggleReadOnly,
      updateOutput,
      increment,
      //incrementAsync,
      decrement,
      //decrementAsync,
      changePage: () => push('/about-us')
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
