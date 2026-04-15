import { LanguageProvider } from './context/LanguageContext';
import Header from './components/layout/Header';
import OpListPage from './components/op/OpListPage';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-brand-cream">
        <Header />
        <OpListPage />
      </div>
    </LanguageProvider>
  );
}

export default App;
