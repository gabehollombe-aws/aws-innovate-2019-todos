import React, {useState, useEffect} from 'react';

// import Amplify, {API, graphqlOperation} from "aws-amplify";
import Amplify from '@aws-amplify/core';
import Analytics from '@aws-amplify/analytics';
import API, { graphqlOperation} from '@aws-amplify/api';
import awsmobile from './aws-exports';
import {withAuthenticator} from 'aws-amplify-react';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';

import './App.css'

Analytics.disable()
Amplify.configure(awsmobile);

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")
  const [loadingTodos, setLoadingTodos] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const result = await API.graphql(graphqlOperation(queries.listTodos, { filter: { completed: { ne: true}}}))
      setTodos(result.data.listTodos.items);
      setLoadingTodos(false)
    }
    fetchData();
  }, []);

  const addTodo = async() => {
    const input = { description: newTodo, completed: false }
    const result = await API.graphql(graphqlOperation(mutations.createTodo, {input}))
    setTodos([
      result.data.createTodo,
      ...todos
    ])
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await addTodo()
    setNewTodo('')
  }

  const completeTodo = async (todo) => {
    const input = { ...todo, completed: true }
    await API.graphql(graphqlOperation(mutations.updateTodo, {input}))
    setTodos(todos.filter(t => t.id !== todo.id))
  }

  return (
    <div className='App'>
      <h1>My TODOs</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add TODO"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}>
        </input>
      </form>

      { 
        loadingTodos ?
          <div data-test="todos-loading">Loading...</div>
          :
          <ul data-test="todos-list">
            {todos.map(t => <li key={t.id}>
              <span className='description'>{t.description}</span>
              <button data-test="complete-todo" onClick={completeTodo.bind(this, t)}>Done</button>
            </li>)}
          </ul>
      }

    </div>
  );
}

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"]
  },
  includeGreetings: true
});