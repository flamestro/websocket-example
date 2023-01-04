package de.flamestro.WebSocketExmple.web;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import lombok.Data;

@Controller
public class MessagingController {
    @Data
    static class Envelope {
        String content;
    }

    @MessageMapping("/chat/message")
    @SendTo("/topic/chat")
    public Envelope greeting(Envelope message) throws Exception {
        // proccessing
        return message;
    }


    @MessageMapping("/chat/disconnect")
    @SendTo("/topic/chat/disconnect")
    public Envelope disconnect(Envelope message) throws Exception {
        return message;
    }
}
