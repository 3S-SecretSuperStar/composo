import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import app from './App'

/* ------------------------------- Componenets ------------------------------ */

// import Nav_Comp from './components/nav_comp'
import LandingComp from './components/landing'
// import Article_comp from './components/article_comp'
// import Carousel_Comp from './components/carousel_comp'
import FooterComp from './components/foot_comp'
// import leftData from  './components/leftSidebar'

/* --------------------------------- Styling -------------------------------- */

// import './css/fonts.css'
// import './css/styles.css'
// import './css/thecardstyle.css'
/*import './components/assets/buttons.scss'
import './components/assets/navbar.scss'*/
import './styles/button.css'

/*-----*/



/* -------------------------------------------------------------------------- */
/*                               Navigation Bar                               */
/* -------------------------------------------------------------------------- */


// ReactDOM.render(
//   <React.StrictMode>
//     <Nav_Comp/>
//   </React.StrictMode>,
//   document.getElementById('nav_comp')
// );


/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

ReactDOM.render(
  <React.StrictMode>
    <LandingComp/>
  </React.StrictMode>,
  document.getElementById('landing')
);

/* -------------------------------------------------------------------------- */
/*                                  Carousel                                  */
/* -------------------------------------------------------------------------- */

// ReactDOM.render(
//   <React.StrictMode>
//     <Carousel_Comp/>
//   </React.StrictMode>,
//   document.getElementById('carousel_comp')
// );








/* -------------------------------------------------------------------------- */
/*                                      Footer                                */
/* -------------------------------------------------------------------------- */

// ReactDOM.render(
//   <React.StrictMode>
//     <Article_comp/>
//   </React.StrictMode>,
//   document.getElementById('article_comp')
// );


ReactDOM.render(
  <React.StrictMode>
    <FooterComp/>
  </React.StrictMode>,
  document.getElementById('footer_comp')
);


/* ----------------------------------- end ---------------------------------- */


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();