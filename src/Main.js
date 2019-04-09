import React, { Component } from 'react';
import MessagePage from './Components/MessagePage';
import ChatPage from './Components/ChatPage';
import VideoPage from './Components/VideoPage';
import VoicePage from './Components/VoicePage';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMesageButtonPressed: false,
            isChatButtonPressed: false,
            isVoiceButtonPressed: false,
            isVideoButtonPressed: false
        }
    }

    goForMessage = () => {
        this.setState({
            isMesageButtonPressed: true,
            isChatButtonPressed: false,
            isVoiceButtonPressed: false,
            isVideoButtonPressed: false
        })
    }
    goForChat = () => {
        this.setState({
            isChatButtonPressed: true,
            isVoiceButtonPressed: false,
            isVideoButtonPressed: false,
            isMesageButtonPressed: false
        })
    }
    goForVideo = () => {
        this.setState({
            isVideoButtonPressed: true,
            isChatButtonPressed: false,
            isVoiceButtonPressed: false,
            isMesageButtonPressed: false
        })
    }
    goForVoice = () => {
        this.setState({
            isVoiceButtonPressed: true,
            isVideoButtonPressed: false,
            isChatButtonPressed: false,
            isMesageButtonPressed: false
        })
    }

    render() {
        const { isMesageButtonPressed, isVoiceButtonPressed, isChatButtonPressed, isVideoButtonPressed } = this.state

        return (
            <div>
                {isMesageButtonPressed ? <MessagePage /> :
                    (!isVoiceButtonPressed && !isChatButtonPressed && !isVideoButtonPressed
                        ? <button onClick={this.goForMessage}>Message</button> : null)
                }
                 {isVoiceButtonPressed ? <VoicePage /> :
                    (!isChatButtonPressed && !isMesageButtonPressed && !isVideoButtonPressed
                        ? <button onClick={this.goForVoice}> Voice</button> : null)
                }
                {isChatButtonPressed ? <ChatPage /> :
                    (!isVoiceButtonPressed && !isMesageButtonPressed && !isVideoButtonPressed
                        ? <button onClick={this.goForChat} >Chat</button> : null)
                }
                {isVideoButtonPressed ? <VideoPage /> :
                    (!isVoiceButtonPressed && !isMesageButtonPressed && !isChatButtonPressed
                        ? <button onClick={this.goForVideo}>Video</button> : null)
                }
            </div>
        )
    }
}

export default Main