import React, { Component } from 'react';
import Main from '../Main';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            isSubmitted: false
        }
    }

    componentDidMount() {
        const Username = localStorage.getItem('username')
        const Email = localStorage.getItem('email')
        const Password = localStorage.getItem('password')

        if (Username && Password && Email) {
            this.setState({
                isSubmitted: true
            })
        }
    }

    onChangeHandler = (e) => {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    onFormSubmit = (e) => {
        const { username, password, email} = this.state
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        localStorage.setItem('email', email)

        this.setState({
            isSubmitted: true
        })
    }

    render() {
        const { isSubmitted } = this.state

        return (
            <div>
                {isSubmitted ? <Main />
                    :
                    <form>
                        <label> Username:
                        <input name="username" type="text" value={this.state.username} onChange={this.onChangeHandler} placeholder="enter your username" />
                        </label> <br />
                        <label> Email:
                        <input name="email" type="text" value={this.state.email} onChange={this.onChangeHandler} placeholder="enter your email" />
                        </label> <br />
                        <label> Password:
                      <input name="password" type="password" value={this.state.password} onChange={this.onChangeHandler} placeholder="enter your password" />
                        </label> < br />
                        <label>
                            <button type="submit" onClick={this.onFormSubmit}>Login</button>
                        </label>
                    </form>}
            </div>
        );
    }
}

export default Login;


