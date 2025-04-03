// app/(api)/consultation/create+api.ts
import prisma from 'lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, complaint, originAddress, originLatitude, originLongitude } = body;

    if (!patientId || !complaint || !originAddress || !originLatitude || !originLongitude) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        complaint,
        originAddress,
        originLatitude,
        originLongitude,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    return Response.json({ data: consultation }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
