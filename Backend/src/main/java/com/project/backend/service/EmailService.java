package com.project.backend.service;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Properties;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.password}")
    private String password;

    public void sendResultatEmail(String to, String name, String resultat) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));

            if ("ACCEPTE".equals(resultat)) {
                message.setSubject("🎉 Félicitations - Candidature acceptée");
                message.setText(
                        "Bonjour " + name + ",\n\n" +
                                "Nous avons le plaisir de vous informer que votre entretien a été concluant.\n" +
                                "Vous êtes sélectionné(e) pour passer le test technique.\n\n" +
                                "Nous vous contacterons prochainement avec les détails.\n\n" +
                                "Cordialement,\nL'équipe StageManager"
                );
            } else {
                message.setSubject("Résultat de votre entretien");
                message.setText(
                        "Bonjour " + name + ",\n\n" +
                                "Nous vous remercions pour votre participation à l'entretien.\n" +
                                "Après examen de votre candidature, nous ne pouvons pas donner suite.\n\n" +
                                "Nous vous souhaitons bonne chance dans vos recherches.\n\n" +
                                "Cordialement,\nL'équipe StageManager"
                );
            }

            Transport.send(message);
            System.out.println("✅ Email envoyé à: " + to);

        } catch (MessagingException e) {
            System.err.println("❌ Erreur envoi email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}