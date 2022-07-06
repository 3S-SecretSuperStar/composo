import React from 'react';
import Parser from 'html-react-parser';

var content = `
<footer class="footer bg-black small text-center text-white-50" id="about">
<h2 style="text-align: center; color: white;">Made by Team Cracked_Pepper.</h2>
        <div class="social d-flex justify-content-center">
            <a class="mx-2" href="https://github.com/Mohammad-Kheir/SENG3011_Cracked-Pepper"><i
                    class="fab fa-github"></i></a>
        </div>
        </div>
        <div class="container">Copyright &copy; Virchu 2021</div>
    </footer>
`;

function Footer_comp() {
    return (
        <div className="content">{Parser(content)}</div>
    );
}


export default Footer_comp;