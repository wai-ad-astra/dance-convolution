import { combineReducers } from 'redux'
import counter from './counter'
import editor from './CodeEditor'

export default combineReducers({
  counter,
  editor
})
