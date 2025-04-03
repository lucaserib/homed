import prisma from 'lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: 'ID do usuário não informado' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        clerkid: id,
      },
    });

    if (!doctor) {
      return Response.json({ data: null, message: 'Usuário não é médico' }, { status: 200 });
    }

    return Response.json({ data: doctor, message: 'Usuário é médico' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar status de médico:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Exportação padrão vazia - necessária para o Expo Router
export default function DoctorCheckRoute() {
  // Esta função não será executada, serve apenas para satisfazer o Expo Router
}
