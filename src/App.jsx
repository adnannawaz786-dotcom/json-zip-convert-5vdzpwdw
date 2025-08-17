import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ConvertPage from './pages/ConvertPage.jsx'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ConvertPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App