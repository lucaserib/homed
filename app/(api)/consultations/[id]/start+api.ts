// app/(api)/consultation/[id]/start+api.ts
import prisma from 'lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { doctorId, startTime } = await request.json();

    if (!doctorId || !startTime) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // Verificar se a consulta existe e está aceita
    const existingConsultation = await prisma.consultation.findUnique({
      where: { consultationId: id },
      include: { doctor: true },
    });

    if (!existingConsultation) {
      return Response.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    if (existingConsultation.status !== 'accepted') {
      return Response.json({ error: 'Esta consulta não pode ser iniciada' }, { status: 400 });
    }

    if (existingConsultation.doctorId !== doctorId) {
      return Response.json(
        { error: 'Você não tem permissão para iniciar esta consulta' },
        { status: 403 }
      );
    }

    // Iniciar a consulta
    const consultation = await prisma.consultation.update({
      where: { consultationId: id },
      data: {
        status: 'in_progress',
        startTime: new Date(startTime),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            hourlyRate: true,
          },
        },
      },
    });

    return Response.json({ data: consultation });
  } catch (error) {
    console.error('Erro ao iniciar consulta:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
