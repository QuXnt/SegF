import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [dark, changeTheme] = useState(false);
  const container=document.getElementsByClassName("container")[0];
  const chatbody=document.getElementById("chat-body");
  const chatbox=document.getElementsByClassName("chat-container")[0]

  
  // Change body background color based on the theme
  useEffect(() => {
    container.className=dark?"container dark":"container white";
    document.body.style.transition = 'background-color 2s ease,color 2s ease';
    chatbody.className=dark?"chat-body dark blacktext whiteborder":"chat-body white blacktext blackborder";
    document.body.style.backgroundColor = dark ? 'black' : 'white';
    document.body.style.color = dark ? 'white' : 'black';
    // Cleanup function to reset the background color when the component unmounts
  }, [dark]);

  return (
    <>
      <div className="box">
      <img 
        src={dark ? '../sun.jpeg' : '../moon.svg'}
        alt={dark ? 'Moon' : 'Sun'}
        onClick={() => changeTheme(!dark)} 
        style={{ cursor: 'pointer', width: '30px', height: '30px' }} 
      />
      </div>
    </>
  );
}

export default App;
