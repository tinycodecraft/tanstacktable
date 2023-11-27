import React, { useState } from 'react'

import './App.css'

import { PeopleTableProvider } from './tx/PeopleContext'
import { PersonGroupTable } from './components/PersonGroupTable'
import { Tabs, Text } from '@mantine/core'
import { IKnotProps } from './config/types'
import { ClockSlider } from './components/ClockSlider'
// import { CharacterProvider } from "./tx/CharacterContext";
// import { CharacterMoreTable } from "./components/CharacterMoreTable";

function App() {
  const [knots, setKnots] = useState<IKnotProps[]>([{ value: 0 }])
  return (
    <div className='App'>
      <header className='App-header'>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
          Learn React
        </a>
      </header>
      <div className='pt-4 min-h-screen bg-gray-900'>
        <Tabs color='teal' defaultValue='table'>
          <Tabs.List>
            <Tabs.Tab color='yellow' value='table'>
              <Text
                variant='gradient'
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                ta='center'
                fz='xl'
                fw={700}
              >
                TanSTack Table
              </Text>
            </Tabs.Tab>
            <Tabs.Tab value='slider'>
              <Text
                variant='gradient'
                gradient={{ from: 'indigo', to: 'red', deg: 45 }}
                sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                ta='center'
                fz='xl'
                fw={700}
              >
                Slider Experiment
              </Text>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='table'>
            <PeopleTableProvider count={5000}>
              <PersonGroupTable></PersonGroupTable>
            </PeopleTableProvider>
          </Tabs.Panel>
          <Tabs.Panel value='slider'>
            <Text color='red' >This is a good slider</Text>
            <ClockSlider 
              knots={knots}
              onChange={setKnots}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  )
}

export default App
