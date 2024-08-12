import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import AuthCallback from './components/AuthCallback';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { createTheme, MantineProvider } from '@mantine/core';
import Employees from './components/pages/Employees';
import Schedule from './components/pages/Schedule';

const theme = createTheme({
  /** Put your mantine theme override here */
});

console.log("changes!")
const isDev = process.env.NODE_ENV === 'development';

const App: React.FC = () => {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Main />}>
            <Route path='/employees' element={<Employees />} />
            <Route path='/schedule' element={<Schedule />} />
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  )
}

if (isDev) {
  loadDevMessages();
  loadErrorMessages();
}

export default App;
