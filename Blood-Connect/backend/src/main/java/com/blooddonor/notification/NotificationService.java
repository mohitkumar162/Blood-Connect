package com.blooddonor.notification;

import com.blooddonor.model.entity.User;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Async
    public void sendPushNotification(User donor, String title, String body) {
        if (donor.getFcmToken() == null || donor.getFcmToken().isBlank()) {
            log.debug("No FCM token for donor {}", donor.getId());
            return;
        }
        try {
            Message message = Message.builder()
                .setToken(donor.getFcmToken())
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putData("type", "BLOOD_REQUEST")
                .build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM sent: {}", response);
        } catch (Exception e) {
            log.warn("FCM failed for donor {}: {}", donor.getId(), e.getMessage());
        }
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@bloodconnect.app");
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.warn("Email failed to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendSms(String phoneNumber, String message) {
        log.info("SMS to {} (Twilio not configured): {}", phoneNumber, message);
    }
}
