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
  toggleReadOnly
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
        <Grid container>
          <Grid xs={12}>
            <h1>Home Page</h1>
          </Grid>

        <Grid xs={6}>
        <p>Count: {this.props.count}</p>
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

        <button>This is a test</button>

        </Grid>

        <Grid xs={6} style={containerStyle}>
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
              onChange={(editor, data, value) => {}} />
              
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
            </div>
          </div>
        </div>
        </Grid>
        </Grid>
        </div>
    )
  }
}

const selectStyle = (theme) => {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      text: 'white',
      primary: 'white'
    }
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
    languages: editor.languages
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
