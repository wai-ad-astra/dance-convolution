// import React from 'react'
// var ReactDOM = require('react-dom');
// var Codemirror = require('../../src/Codemirror');
// const createReactClass = require('create-react-class');

// require('codemirror/mode/javascript/javascript');
// require('codemirror/mode/xml/xml');
// require('codemirror/mode/markdown/markdown');

export const CHANGE_MODE = 'CHANGE_MODE'
export const UPDATE_CODE = 'UPDATE_CODE'
export const TOGGLE_READONLY = 'TOGGLE_READONLY'

const defaults = {
	markdown: '# Heading\n\nSome **bold** and _italic_ text\nBy [Jed Watson](https://github.com/JedWatson)',
	javascript: 'var component = {\n\tname: "react-codemirror",\n\tauthor: "Jed Watson",\n\trepo: "https://github.com/JedWatson/react-codemirror"\n};'
};

const languages = ['markdown', 'javascript', 'xml', 'Python']

const initialState = {
	code: "Hey! Type your code here!",
	readOnly: false,
	mode: 'markdown',
	languages: languages
}

export default (state = initialState, action) => {
	//alert("in reducer"+action.mode)
	switch(action.type) {
		case UPDATE_CODE:
			return {
				...state,
				code: action.code
			}
		case CHANGE_MODE:
			return {
				...state,
				mode: action.mode
			}
		case TOGGLE_READONLY:
			return {
				...state,
				readOnly: !state.readOnly
			}
		default:
			return state;
	}
}

export const updateCode = (code) => {
	return dispatch => {
		dispatch({
			type: UPDATE_CODE,
			code: code
		});
	}
}

export const changeMode = (mode) => {
	return dispatch => {
		dispatch({
			type: CHANGE_MODE,
		    mode
		})
	}
}

export const toggleReadOnly = () => {
	return dispatch => {
		dispatch({
			type: TOGGLE_READONLY
		});
	}
}

// var App = createReactClass({
// 	getInitialState () {
// 		return {
// 			code: defaults.markdown,
// 			readOnly: false,
// 			mode: 'markdown',
// 		};
// 	},
// 	updateCode (newCode) {
// 		this.setState({
// 			code: newCode
// 		});
// 	},
// 	changeMode (e) {
// 		var mode = e.target.value;
// 		this.setState({
// 			mode: mode,
// 			code: defaults[mode]
// 		});
// 	},
// 	toggleReadOnly () {
// 		this.setState({
// 			readOnly: !this.state.readOnly
// 		}, () => this.refs.editor.focus());
// 	},
// 	render () {
// 		var options = {
// 			lineNumbers: true,
// 			readOnly: this.state.readOnly,
// 			mode: this.state.mode
// 		};
// 		return (
// 			<div>
// 				<Codemirror ref="editor" value={this.state.code} onChange={this.updateCode} options={options} autoFocus={true} />
// 				<div style={{ marginTop: 10 }}>
// 					<select onChange={this.changeMode} value={this.state.mode}>
// 						<option value="markdown">Markdown</option>
// 						<option value="javascript">JavaScript</option>
// 					</select>
// 					<button onClick={this.toggleReadOnly}>Toggle read-only mode (currently {this.state.readOnly ? 'on' : 'off'})</button>
// 				</div>
// 			</div>
// 		);
// 	}
// });

// ReactDOM.render(<App />, document.getElementById('app'));