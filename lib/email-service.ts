import nodemailer from 'nodemailer';

import prisma from './prisma';

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Interface para os dados de email
interface EmailData {
  to: string;
  subject: string;
  html: string;
  recipientId?: string;
  recipientType?: 'user' | 'doctor' | 'admin';
}

/**
 * Envia um email e registra no banco de dados
 * @param emailData Dados do email a ser enviado
 * @returns Resultado do envio do email
 */
export async function sendEmail({ to, subject, html, recipientId, recipientType }: EmailData) {
  try {
    // Envio do email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Email enviado: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    if (recipientId && recipientType) {
      await prisma.emailLog.create({
        data: {
          recipientId,
          recipientType,
          subject,
          body: html,
          status: 'sent',
        },
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);

    if (recipientId && recipientType) {
      await prisma.emailLog.create({
        data: {
          recipientId,
          recipientType,
          subject,
          body: html,
          status: 'failed',
        },
      });
    }

    throw new Error('Falha ao enviar email');
  }
}

export function getDoctorRegistrationEmailTemplate(doctorName: string, email: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0286FF;">Bem-vindo ao MedDelivery</h1>
      </div>
      
      <p>Olá, Dr(a). <strong>${doctorName}</strong>,</p>
      
      <p>Agradecemos por se cadastrar no MedDelivery! Estamos muito felizes em tê-lo(a) em nossa plataforma.</p>
      
      <p>Seu cadastro foi recebido com sucesso e está em análise. Para finalizar o processo de ativação da sua conta, precisamos que você responda a este email com os seguintes documentos:</p>
      
      <ul style="margin-bottom: 20px;">
        <li>Cópia digitalizada do documento de identidade profissional (CRM)</li>
        <li>Comprovante de endereço atualizado</li>
        <li>Documentos comprobatórios de especialização (se aplicável)</li>
        <li>Comprovante de situação cadastral do CNPJ (se aplicável)</li>
      </ul>
      
      <p>Nossa equipe irá analisar sua documentação e, assim que aprovada, você receberá um email de confirmação com as instruções para acessar sua conta.</p>
      
      <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco respondendo a este email ou pelo nosso suporte.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
        <p>Atenciosamente,</p>
        <p><strong>Equipe MedDelivery</strong></p>
      </div>
    </div>
  `;
}

/**
 * Template de email para médicos aprovados
 * @param doctorName Nome do médico
 * @returns HTML formatado do email
 */
export function getDoctorApprovalEmailTemplate(doctorName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0286FF;">Cadastro Aprovado!</h1>
      </div>
      
      <p>Olá, Dr(a). <strong>${doctorName}</strong>,</p>
      
      <p>Temos o prazer de informar que sua conta no MedDelivery foi <strong style="color: #38A169;">aprovada</strong>!</p>
      
      <p>Agora você está pronto para começar a atender pacientes através da nossa plataforma. Acesse o aplicativo com seus dados de login para configurar sua disponibilidade e começar a receber solicitações de atendimento.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.APP_URL}" style="background-color: #0286FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar o MedDelivery</a>
      </div>
      
      <p>Lembre-se de manter suas informações sempre atualizadas e configurar sua disponibilidade corretamente para garantir a melhor experiência para você e seus pacientes.</p>
      
      <p>Se você tiver alguma dúvida, não hesite em entrar em contato com nosso suporte.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
        <p>Atenciosamente,</p>
        <p><strong>Equipe MedDelivery</strong></p>
      </div>
    </div>
  `;
}

/**
 * Template de email para médicos rejeitados
 * @param doctorName Nome do médico
 * @param rejectionReason Motivo da rejeição
 * @returns HTML formatado do email
 */
export function getDoctorRejectionEmailTemplate(doctorName: string, rejectionReason: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0286FF;">Atualização sobre seu cadastro</h1>
      </div>
      
      <p>Olá, Dr(a). <strong>${doctorName}</strong>,</p>
      
      <p>Analisamos sua solicitação de cadastro no MedDelivery e, infelizmente, não pudemos aprová-la neste momento.</p>
      
      <div style="background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Motivo:</strong> ${rejectionReason}</p>
      </div>
      
      <p>Você pode corrigir as informações e tentar novamente, ou entrar em contato com nosso suporte para mais esclarecimentos.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="mailto:${process.env.SUPPORT_EMAIL}" style="background-color: #718096; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Falar com o Suporte</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
        <p>Atenciosamente,</p>
        <p><strong>Equipe MedDelivery</strong></p>
      </div>
    </div>
  `;
}

/**
 * Template de email para recuperação de senha
 * @param name Nome do usuário
 * @param resetLink Link para redefinição de senha
 * @returns HTML formatado do email
 */
export function getPasswordResetEmailTemplate(name: string, resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0286FF;">Redefinição de Senha</h1>
      </div>
      
      <p>Olá, <strong>${name}</strong>,</p>
      
      <p>Recebemos uma solicitação para redefinir sua senha no MedDelivery. Se você não fez esta solicitação, você pode ignorar este email com segurança.</p>
      
      <p>Para redefinir sua senha, clique no botão abaixo:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #0286FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
      </div>
      
      <p>Se o botão acima não funcionar, você também pode copiar e colar o link a seguir em seu navegador:</p>
      
      <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${resetLink}</p>
      
      <p>Este link é válido por 24 horas.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
        <p>Atenciosamente,</p>
        <p><strong>Equipe MedDelivery</strong></p>
      </div>
    </div>
  `;
}

/**
 * Template de email de boas-vindas para pacientes
 * @param patientName Nome do paciente
 * @returns HTML formatado do email
 */
export function getPatientWelcomeEmailTemplate(patientName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0286FF;">Bem-vindo ao MedDelivery</h1>
      </div>
      
      <p>Olá, <strong>${patientName}</strong>,</p>
      
      <p>Seja bem-vindo ao MedDelivery! Estamos muito felizes em tê-lo(a) em nossa plataforma.</p>
      
      <p>Com o MedDelivery, você pode:</p>
      
      <ul style="margin-bottom: 20px;">
        <li>Solicitar atendimento médico a domicílio</li>
        <li>Acompanhar o deslocamento do médico em tempo real</li>
        <li>Comunicar-se diretamente com o profissional através do chat</li>
        <li>Acessar seu histórico de consultas e prontuários</li>
        <li>Avaliar o atendimento recebido</li>
      </ul>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.APP_URL}" style="background-color: #0286FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Começar a Usar</a>
      </div>
      
      <p>Se você tiver alguma dúvida, não hesite em entrar em contato com nosso suporte.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
        <p>Atenciosamente,</p>
        <p><strong>Equipe MedDelivery</strong></p>
      </div>
    </div>
  `;
}
