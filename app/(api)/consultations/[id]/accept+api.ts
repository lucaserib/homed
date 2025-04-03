// app/(api)/consultation/[id]/accept+api.ts
import prisma from 'lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { doctorId } = await request.json();

    if (!doctorId) {
      return Response.json({ error: 'ID do médico é obrigatório' }, { status: 400 });
    }

    // Verificar se a consulta existe e está pendente
    const existingConsultation = await prisma.consultation.findUnique({
      where: { consultationId: id },
    });

    if (!existingConsultation) {
      return Response.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }

    if (existingConsultation.status !== 'pending') {
      return Response.json({ error: 'Esta consulta não está mais disponível' }, { status: 400 });
    }

    // Aceitar a consulta
    const consultation = await prisma.consultation.update({
      where: { consultationId: id },
      data: {
        doctorId,
        status: 'accepted',
      },
    });

    return Response.json({ data: consultation });
  } catch (error) {
    console.error('Erro ao aceitar consulta:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
