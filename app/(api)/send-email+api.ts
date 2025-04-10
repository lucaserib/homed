import {
  sendEmail,
  getDoctorRegistrationEmailTemplate,
  getDoctorApprovalEmailTemplate,
  getDoctorRejectionEmailTemplate,
  getPatientWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
} from 'lib/email-service';

type EmailType =
  | 'doctor_registration'
  | 'doctor_approval'
  | 'doctor_rejection'
  | 'patient_welcome'
  | 'password_reset';

export async function POST(request: Request) {
  try {
    const { recipientEmail, recipientName, recipientId, recipientType, emailType, additionalData } =
      await request.json();

    if (!recipientEmail || !recipientName || !emailType) {
      return Response.json(
        { error: 'Email, nome do destinatário e tipo de email são obrigatórios' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    switch (emailType as EmailType) {
      case 'doctor_registration':
        subject = 'Bem-vindo ao MedDelivery - Verificação de Cadastro';
        htmlContent = getDoctorRegistrationEmailTemplate(recipientName, recipientEmail);
        break;

      case 'doctor_approval':
        subject = 'MedDelivery - Seu cadastro foi aprovado!';
        htmlContent = getDoctorApprovalEmailTemplate(recipientName);
        break;

      case 'doctor_rejection':
        subject = 'MedDelivery - Atualização sobre seu cadastro';
        htmlContent = getDoctorRejectionEmailTemplate(
          recipientName,
          additionalData?.rejectionReason || 'Documentação incompleta ou inválida.'
        );
        break;

      case 'patient_welcome':
        subject = 'Bem-vindo ao MedDelivery!';
        htmlContent = getPatientWelcomeEmailTemplate(recipientName);
        break;

      case 'password_reset':
        subject = 'MedDelivery - Redefinição de Senha';
        htmlContent = getPasswordResetEmailTemplate(
          recipientName,
          additionalData?.resetLink || '#'
        );
        break;

      default:
        return Response.json({ error: 'Tipo de email inválido' }, { status: 400 });
    }

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent,
      recipientId,
      recipientType,
    });

    return Response.json({
      success: true,
      message: 'Email enviado com sucesso',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return Response.json({ error: 'Erro interno ao enviar email' }, { status: 500 });
  }
}
