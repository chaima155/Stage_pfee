package com.project.backend.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class SignalingController {

    // ✅ Offre WebRTC
    @MessageMapping("/signal/{roomId}/offer")
    @SendTo("/topic/signal/{roomId}/offer")
    public Map<String, Object> offer(
            @DestinationVariable String roomId,
            Map<String, Object> message) {
        return message;
    }

    // ✅ Réponse WebRTC
    @MessageMapping("/signal/{roomId}/answer")
    @SendTo("/topic/signal/{roomId}/answer")
    public Map<String, Object> answer(
            @DestinationVariable String roomId,
            Map<String, Object> message) {
        return message;
    }

    // ✅ ICE Candidates
    @MessageMapping("/signal/{roomId}/ice")
    @SendTo("/topic/signal/{roomId}/ice")
    public Map<String, Object> ice(
            @DestinationVariable String roomId,
            Map<String, Object> message) {
        return message;
    }

    // ✅ Actions candidat pour IA
    @MessageMapping("/signal/{roomId}/action")
    @SendTo("/topic/signal/{roomId}/action")
    public Map<String, Object> action(
            @DestinationVariable String roomId,
            Map<String, Object> message) {
        return message;
    }

    // ✅ Rejoindre room
    @MessageMapping("/signal/{roomId}/join")
    @SendTo("/topic/signal/{roomId}/join")
    public Map<String, Object> join(
            @DestinationVariable String roomId,
            Map<String, Object> message) {
        return message;
    }
}