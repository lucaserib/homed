import prisma from 'lib/prisma';

interface DoctorCreateInput {
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  hourlyRate: string | number;
  serviceRadius: string | number;
  clerkId: string;
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, specialty, licenseNumber, hourlyRate, serviceRadius, clerkId } =
      (await request.json()) as DoctorCreateInput;

    if (!firstName || !lastName || !specialty || !licenseNumber || !hourlyRate || !clerkId) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const doctor = await prisma.doctor.create({
      data: {
        clerkid: clerkId,
        firstName,
        lastName,
        specialty,
        licenseNumber,
        hourlyRate: parseFloat(hourlyRate as string),
        serviceRadius: parseInt(serviceRadius as string) || 10,
        isAvailable: false,
      },
    });

    return Response.json({ data: doctor }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar médico:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        isAvailable: true,
      },
    });

    return Response.json({ data: doctors });
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
