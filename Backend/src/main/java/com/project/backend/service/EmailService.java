package com.project.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.password}")
    private String password;

    private JavaMailSenderImpl getMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(fromEmail);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth",              "true");
        props.put("mail.smtp.starttls.enable",   "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.transport.protocol",     "smtp");
        props.put("mail.debug",                  "true");

        return mailSender;
    }

    public void sendResultatEmail(String to, String name, String resultat) {
        try {
            JavaMailSenderImpl mailSender = getMailSender();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);

            if ("ACCEPTE".equals(resultat)) {
                helper.setSubject("🎉 Félicitations - Candidature acceptée");
                helper.setText(
                        "<html><body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                                "<div style='max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; padding: 32px;'>" +
                                "<h1 style='color: #059669;'>🎉 Félicitations !</h1>" +
                                "<p>Bonjour <strong>" + name + "</strong>,</p>" +
                                "<p>Nous avons le plaisir de vous informer que votre entretien a été concluant.</p>" +
                                "<div style='background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 8px; margin: 20px 0;'>" +
                                "<p style='color: #065f46; font-weight: bold; margin: 0;'>✅ Vous êtes sélectionné(e) pour le stage.</p>" +
                                "</div>" +
                                "<p>Nous vous contacterons prochainement avec les détails.</p>" +
                                "<br><p>Cordialement,<br><strong>L'équipe StageManager</strong></p>" +
                                "</div></body></html>",
                        true
                );
            } else {
                helper.setSubject("Résultat de votre entretien - StageManager");
                helper.setText(
                        "<html><body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                                "<div style='max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; padding: 32px;'>" +
                                "<h1 style='color: #374151;'>Résultat de votre entretien</h1>" +
                                "<p>Bonjour <strong>" + name + "</strong>,</p>" +
                                "<p>Nous vous remercions pour votre participation à l'entretien.</p>" +
                                "<div style='background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin: 20px 0;'>" +
                                "<p style='color: #991b1b; font-weight: bold; margin: 0;'>Après examen, nous ne pouvons pas donner suite à votre candidature.</p>" +
                                "</div>" +
                                "<p>Nous vous souhaitons bonne chance dans vos recherches.</p>" +
                                "<br><p>Cordialement,<br><strong>L'équipe StageManager</strong></p>" +
                                "</div></body></html>",
                        true
                );
            }

            mailSender.send(message);
            System.out.println("✅ Email envoyé à: " + to);

        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    public void sendVerificationEmail(String to, String name, String verifyUrl) {
        try {
            JavaMailSenderImpl mailSender = getMailSender();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("✅ Vérifiez votre email — StageManager");
            helper.setText(
                    "<html><body style='font-family:Arial,sans-serif;padding:20px;'>" +
                            "<div style='max-width:600px;margin:0 auto;background:#f9fafb;border-radius:12px;padding:32px;'>" +
                            "<h1 style='color:#3b5bdb;'>Bienvenue " + name + " !</h1>" +
                            "<p>Merci de votre inscription. Cliquez ci-dessous pour vérifier votre email :</p>" +
                            "<div style='text-align:center;margin:30px 0;'>" +
                            "<a href='" + verifyUrl + "' style='background:#3b5bdb;color:white;padding:14px 32px;" +
                            "border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;'>" +
                            "✅ Vérifier mon email</a></div>" +
                            "<p style='color:#9ca3af;font-size:13px;'>Ce lien expire dans 24 heures.</p>" +
                            "<p>Cordialement,<br><strong>L'équipe StageManager</strong></p>" +
                            "</div></body></html>",
                    true
            );

            mailSender.send(message);
            System.out.println("✅ Email vérification envoyé à: " + to);

        } catch (Exception e) {
            System.err.println("❌ Erreur: " + e.getMessage());
        }
    }
}