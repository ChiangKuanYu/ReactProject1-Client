import React from "react";
// import './leftSection.css';

const Left_Section = () =>{
    <div class="left-section">
        <div class="logo">
            {/* <img src="assets/images/logo.png"> */}
            <a href="#">AsmrProg</a>
        </div>

        <div class="sidebar">
            <div class="item active">
                <i class="ri-home-4-line"></i>
                <h3>Map Project</h3>
            </div>
            <div class="item">
                <i class="ri-user-6-line"></i>
                <h3>Stock Project</h3>
            </div>
        </div>

        <div class="sign-out">
            <i class="ri-logout-box-r-line"></i>
            <h3>Sign Out</h3>
        </div>

    </div>
}

export default Left_Section;