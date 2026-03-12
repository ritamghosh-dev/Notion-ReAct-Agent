import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#191919';
      document.body.style.color = '#D4D4D4';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#37352F';
    }
  }, [darkMode]);

  // Ensure light mode on initial load, regardless of OS preference
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#37352F';
  }, []);

  return (
    <div className={`flex h-screen w-full bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#D4D4D4]`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      <ChatInterface />
    </div>
  );
}

export default App;
