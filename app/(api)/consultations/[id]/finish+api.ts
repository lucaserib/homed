import prisma from 'lib/prisma';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { doctorId, endTime, diagnosis, treatment, notes } = await request.json();

    if (!doctorId || !endTime) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const existingConsultation = await prisma.consultation.findUnique({
      where: { consultationId: id },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!existingConsultation) {
      return Response.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    if (existingConsultation.status !== 'in_progress') {
      return Response.json({ error: 'Esta consulta não está em andamento' }, { status: 400 });
    }

    if (existingConsultation.doctorId !== doctorId) {
      return Response.json(
        { error: 'Você não tem permissão para finalizar esta consulta' },
        { status: 403 }
      );
    }

    const startTime = existingConsultation.startTime
      ? new Date(existingConsultation.startTime)
      : new Date();
    const finishTime = new Date(endTime);

    const durationMs = finishTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    if (!existingConsultation.doctor) {
      return new Response(JSON.stringify({ message: 'Médico não encontrado nesta consulta' }), {
        status: 404,
      });
    }

    const doctorRate = existingConsultation.doctor.hourlyRate
      ? Number(existingConsultation.doctor.hourlyRate)
      : 0;
    const hoursFraction = durationMinutes / 60;
    const totalPrice = Math.ceil(doctorRate * hoursFraction * 100) / 100; // Arredondar para 2 casas decimais

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        consultationId: id,
        patientId: existingConsultation.patientId,
        doctorId: doctorId,
        diagnosis: diagnosis || '',
        treatment: treatment || '',
        notes: notes || '',
      },
    });

    const platformFee = parseFloat((totalPrice * 0.15).toFixed(2));
    const doctorPayout = parseFloat((totalPrice - platformFee).toFixed(2));

    const consultation = await prisma.consultation.update({
      where: { consultationId: id },
      data: {
        status: 'completed',
        endTime: finishTime,
        duration: durationMinutes,
        totalPrice: totalPrice,
        paymentStatus: 'pending',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        consultationId: id,
        amount: totalPrice,
        platformFee: platformFee,
        doctorPayout: doctorPayout,
        status: 'pending',
      },
    });

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'brl',
        metadata: {
          consultationId: id,
          doctorId: doctorId,
          patientId: existingConsultation.patientId,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentId: paymentIntent.id,
        },
      });

      return Response.json({
        data: {
          consultation,
          medicalRecord,
          payment,
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (stripeError) {
      console.error('Erro ao processar pagamento:', stripeError);

      return Response.json({
        data: { consultation, medicalRecord, payment },
        warning:
          'Erro ao processar pagamento. O paciente será notificado para finalizar o pagamento.',
      });
    }
  } catch (error) {
    console.error('Erro ao finalizar consulta:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
