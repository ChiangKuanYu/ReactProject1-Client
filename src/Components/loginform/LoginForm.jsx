import React,{useState,useEffect} from 'react'
import './LoginForm.css'
import { FaGoogle,FaFacebookF,FaGithub,FaLinkedin } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const LoginForm = (props) => {
  const [ login, setLogin ] = useState(false);
  const [isSignUp, setSignUp] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [rMe, setrMe] = useState(false);

  const [isSignIn, setSignIn] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const userToken = localStorage.getItem("localJWT")
  const checkAuth = async()=>{
    try {
      await fetch("http://localhost:5000", {
        method: "GET",
        headers: { "Content-Type": "application/json",
          "Authorization":`Bearer ${userToken}`
        },
      })
      .then((resData) => resData.json())
      .then((resData) => {
        if (resData) {
          navigate('/home');
        } else if ('Login timeout' === resData.message) {
          localStorage.removeItem("localJWT");
          navigate('/');
        }
      });
    } catch (err) {
      localStorage.removeItem("localJWT");
      console.error('Login timeout');
      navigate('/');
    }
  }
  
  if (userToken){checkAuth()}

  const onSubmitFormSignIn = async e => {
    e.preventDefault();
    if (rMe) {
      localStorage.setItem("rememberMe", true);
      localStorage.setItem("rememberEmail", isSignIn.email);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberEmail");
    }

    try {
      const body = isSignIn;
      await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      })
      .then((resData) => resData.json())
      .then((resData) => {
        localStorage.setItem("localJWT", resData.token);
        if (!resData.message) {
          navigate('/home');
        } else if ('Incorrect password.' === resData.message) {
          window.alert('Incorrect password.');
          navigate('/');
        } else if ('Incorrect username.' === resData.message){
          window.alert('User not found!');
          navigate('/');
        }
      });
    } catch (err) {
      console.error("err.message");
    }
  };

  useEffect(() => {
    const rmeStore = localStorage.getItem("rememberMe");
    const rmeEmail = localStorage.getItem("rememberEmail");
    if (rmeStore){
      setrMe(true);
      setSignIn((prevValue) => {
        return{
          ...prevValue,
          email:rmeEmail
        };
      });
    }
  }, []);

  function handleChangeSignIn (event){
    const { name , value } = event.target;
    setSignIn((prevValue) => {
      return{
        ...prevValue,
        [name]:value
      };
    });
  };

 const onSubmitSignUp = async e => {
    e.preventDefault();
    try {
      const body = isSignUp;
      await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      .then((r) => r.json())
      .then((r) => {
        if ('Success. Try logging in!' === r.message) {
          window.alert('Success. Try logging in!');
          navigate('/');
          handleLogin();
          setSignUp({name: "",email: "",password: ""});
        } else if ('Email already exists. Try logging in!' === r.message) {
          window.alert('Email already exists. Try logging in!');
          navigate('/');
          handleLogin();
          setSignUp({name: "",email: "",password: ""});
        }
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  function handleChangeSignUp (event){
    const { name , value } = event.target;
    setSignUp((prevValue) => {
        return{
            ...prevValue,
            [name]:value
        };
    });
  };

  const handleLogin = () => {
    setLogin(!login);
    console.log('t1');
    
    const container = document.getElementById("container")
    if (login === false){
      container.classList.add("active");
    }else if (login === true){
      container.classList.remove("active");
    }
  }
  
  return (
    <div className="container" id="container">
        <div className="form-container sign-up">
            <form onSubmit={onSubmitSignUp}>
                <h1>Create Account</h1>
                <div className="social-icons">
                    <a href="/auth/google" className='icon' role="button"><FaGoogle /></a>
                    <a href="#" className='icon'><FaFacebookF /></a>
                    <a href="#" className='icon'><FaGithub /></a>
                    <a href="#" className='icon'><FaLinkedin /></a>
                </div>
                <span>or use your email for registeration</span>
                <input 
                    type="text" 
                    placeholder='Name' 
                    required 
                    name="name" 
                    value={isSignUp.name} 
                    onChange={handleChangeSignUp}
                />
                <input 
                    type="email"
                    placeholder='Email' 
                    required 
                    name="email" 
                    value={isSignUp.email} 
                    onChange={handleChangeSignUp}
                />
                <input 
                    type="password" 
                    placeholder='Password' 
                    required 
                    name="password" 
                    value={isSignUp.password} 
                    onChange={handleChangeSignUp}
                />
                <button>Sign Up</button>
            </form>
        </div>
        <div className="form-container sign-in">
            <form onSubmit={onSubmitFormSignIn}>
                <h1>Sign In</h1>
                <div className="social-icons">
                    <a href="#" className='icon'><FaGoogle /></a>
                    <a href="#" className='icon'><FaFacebookF /></a>
                    <a href="#" className='icon'><FaGithub /></a>
                    <a href="#" className='icon'><FaLinkedin /></a>
                </div>
                <span>or use your email password</span>
                <input 
                    type="email" 
                    placeholder='Email' 
                    required
                    name="email"
                    value={isSignIn.email}
                    onChange={handleChangeSignIn} 
                />
                <input 
                    type="password" 
                    placeholder='Password' 
                    required
                    name="password"
                    value={isSignIn.password}
                    onChange={handleChangeSignIn}
                />
                <div className="forgot-remember">
                    <label>
                        <input type="checkbox" 
                            name="rememberMe"
                            checked={rMe}
                            onChange={() =>setrMe(!rMe)}
                        />
                        Rmember Me
                    </label>
                    <a href="#">Forget Your Password?</a>
                </div>
                
                <button>Sign In</button>
            </form>
        </div>
        <div className="toggle-container">
            <div className="toggle">
                <div className="toggle-panel toggle-left">
                    <h1>Welcome Back!</h1>
                    <p>Enter your personal details to use all of site features</p>
                    <button onClick={handleLogin} className="hidden" id="login">Sign In</button>
                </div>
                <div className="toggle-panel toggle-right">
                    <h1>Hello, Friden!</h1>
                    <p>Register with your personal details to use all of site features</p>
                    <button onClick={handleLogin} className="hidden" id="register">Sign Up</button>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default LoginForm