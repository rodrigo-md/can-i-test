import styled from 'styled-components';
import NxWelcome from './nx-welcome';
// import { useState, useEffect } from 'react'

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  // const [response, setResponse] = useState({message: 'loading...'});

  // useEffect(() => {
  //   fetch('/api')
  //     .then(response => response.json())
  //     .then(setResponse);
  // }, []);

  return (
    <StyledApp>
      <NxWelcome title="Can I test?" />
      {/* <div>{response.message}</div> */}
    </StyledApp>
  );
}

export default App;
