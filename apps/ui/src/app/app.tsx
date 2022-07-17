import styled from 'styled-components';
import NxWelcome from './nx-welcome';
import { useState, useEffect } from 'react'

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  const [response, setResponse] = useState({message: 'loading...'});

  useEffect(() => {
    fetch(`${process.env['NX_API_URL']}/`)
      .then(response => response.json())
      .then(setResponse);
  }, []);

  return (
    <StyledApp>
      <NxWelcome title={response.message || 'couldn\'t get the title from the API'} />
    </StyledApp>
  );
}

export default App;
