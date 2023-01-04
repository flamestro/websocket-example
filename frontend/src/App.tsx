import React, {useEffect, useState} from 'react';
import './App.css';
import SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {List, ListItem, ListItemText, Button, TextField, Grid, Divider, Typography, Snackbar} from "@mui/material";

function App() {
    const [stompClient, setStompClient] = useState<CompatClient | undefined>()
    const [messages, setMessages] = useState<string[]>([])
    const [disconnectMessages, setDisconnectMessages] = useState<string[]>([])

    function connect() {
        const socket = new SockJS('http://localhost:8080/definitely-not-whatsapp');
        const stompClient = Stomp.over(socket);
        stompClient.connect({}, (frame: any) => {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/chat', function (msg) {
                showGreeting(JSON.parse(msg.body).content);
            });
            stompClient.subscribe('/topic/chat/disconnect', function (msg) {
                setDisconnectMessages(x => [...x, JSON.parse(msg.body).content]);
            });
        });
        return stompClient;
    }

    function disconnect() {
        if (stompClient) {
            stompClient.send("/app/chat/disconnect", {}, JSON.stringify({'content': "disconnected"}));
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    function sendMessage(message: string) {
        if (stompClient) {
            stompClient.send("/app/chat/message", {}, JSON.stringify({'content': message}));
        }
    }

    function showGreeting(message: string) {
        console.log("called")
        setMessages(x => [...x, message])
    }

    function clearDisconnectMessage() {
        setDisconnectMessages([])
    }


    useEffect(() => {
        if (!stompClient) {
            setStompClient(connect())
        }
        return () => {
            disconnect()
        }
    }, [])

    return (
        <Grid container style={{display: "flex", justifyContent: "center"}}>
            <Typography variant="h3" component="h1">Definitely Not Whatsapp</Typography>
            <Grid xs={10}>
                <Grid xs={12} style={{display: "flex", justifyContent: "flex-end"}}>
                    <Button style={{margin: "15px"}} variant="outlined" onClick={disconnect}>Disconnect</Button>
                </Grid>
                <Divider/>
                <Grid xs={12} style={{display: "flex", justifyContent: "center", minHeight: "400px", maxHeight: "400px", overflow: "auto"}}>
                    <Grid xs={7}>
                        <List>
                            {messages.map((message, index) => <><ListItem key={index}><ListItemText primary={message}/></ListItem><Divider/></>)}
                        </List>
                    </Grid>
                </Grid>
                <Divider/>

                <Grid xs={12} style={{display: "flex", justifyContent: "center"}}>
                    <TextField style={{margin: "15px"}} label="Message" variant="outlined" id={"messageInput"}/>
                    <Button style={{margin: "15px"}} variant="contained" onClick={() => {
                        sendMessage((document.getElementById("messageInput") as HTMLInputElement).value)
                    }}>Submit</Button>
                </Grid>
            </Grid>
            <Snackbar
                open={disconnectMessages.length > 0}
                autoHideDuration={6000}
                onClose={clearDisconnectMessage}
                message="Participant Disconnected"
            />
        </Grid>
    );
}

export default App;
