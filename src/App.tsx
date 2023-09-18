import React from "react";

import "./App.css";
//import GroupTableDemo from "./components/GroupTableDemo";
import  { PeopleTableProvider } from "./tx/PeopleContext";
import { PersonGroupTable } from "./components/PersonGroupTable";
// import { CharacterProvider } from "./tx/CharacterContext";
// import { CharacterMoreTable } from "./components/CharacterMoreTable";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
      <div className="pt-4 min-h-screen bg-gray-900">
        <PeopleTableProvider count={5000}>
          <PersonGroupTable></PersonGroupTable>
        </PeopleTableProvider>
        {/* <CharacterProvider>
          <CharacterMoreTable></CharacterMoreTable>
        </CharacterProvider> */}
      </div>
    </div>
  );
}

export default App;
