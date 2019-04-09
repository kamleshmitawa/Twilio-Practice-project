import React, { Component } from 'react';
import Main from '../Main';
import axios from 'axios';

class MessagePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            to: '',
            body: '',
            sending: false,
            msgid: ''
        }
    }

    componentDidMount() {
        localStorage.getItem('to')
        localStorage.getItem('body')
    }

    goBack = () => {
        return
    }


    onHandleChange = (e) => {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    sendMessage = (e) => {
        const { to, body, msgid } = this.state


        if (to && body) {
            axios.post('http://dccc359b.ngrok.io/message/token',{
                To: to,
                Body: body
            })
            .then(msgId => 
                this.setState({
                    msgid: msgId,
                    sending: true,
                    to: '',
                    body: ''
                }))
            .catch(err => console.log(err, 'err'))
        }
        e.preventDefault();
        return null 
    }

    afterSentMessage = () => {
        return (
            <div>
                <h3>Successfully Sent</h3>
            </div>
        )
    }

    render() {
        const { sending } = this.state

        return (
            <div>
                <form>
                    <div>
                        <label>To:</label>
                        <input
                            type="number"
                            name="to"
                            value={this.state.to}
                            onChange={this.onHandleChange} required
                        />
                    </div>
                    <div>
                        <label>Body:</label>
                        <textarea
                            name="body"
                            value={this.state.body}
                            onChange={this.onHandleChange} required
                        />
                    </div>
                    <button onClick={this.sendMessage}>Send message</button>
                </form>

                {sending ? this.afterSentMessage() : null}
            </div>
        )
    }
}

export default MessagePage