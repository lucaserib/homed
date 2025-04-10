import prisma from 'lib/prisma';

interface DoctorCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  specialty: string;
  licenseNumber: string;
  cpf?: string;
  cnpj?: string;
  companyName?: string;
  address?: string;
  hourlyRate: string | number;
  serviceRadius: string | number;
  profileImageUrl?: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  clerkId: string;
}

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      specialty,
      licenseNumber,
      cpf,
      cnpj,
      companyName,
      address,
      hourlyRate,
      serviceRadius,
      profileImageUrl,
      approvalStatus,
      clerkId,
    } = (await request.json()) as DoctorCreateInput;

    if (!firstName || !lastName || !specialty || !licenseNumber || !hourlyRate || !clerkId) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { clerkid: clerkId },
    });

    if (existingDoctor) {
      return Response.json(
        { error: 'Já existe um médico registrado com este ID' },
        { status: 400 }
      );
    }

    const existingDoctorByEmail = await prisma.doctor.findUnique({
      where: { email },
    });

    if (existingDoctorByEmail) {
      return Response.json(
        { error: 'Já existe um médico registrado com este email' },
        { status: 400 }
      );
    }

    if (cpf) {
      const existingDoctorByCpf = await prisma.doctor.findUnique({
        where: { cpf },
      });

      if (existingDoctorByCpf) {
        return Response.json(
          { error: 'Já existe um médico registrado com este CPF' },
          { status: 400 }
        );
      }
    }

    if (cnpj) {
      const existingDoctorByCnpj = await prisma.doctor.findUnique({
        where: { cnpj },
      });

      if (existingDoctorByCnpj) {
        return Response.json(
          { error: 'Já existe um médico registrado com este CNPJ' },
          { status: 400 }
        );
      }
    }

    const doctor = await prisma.doctor.create({
      data: {
        clerkid: clerkId,
        firstName,
        lastName,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        specialty,
        licenseNumber,
        cpf,
        cnpj,
        companyName,
        address,
        hourlyRate: parseFloat(hourlyRate as string),
        serviceRadius: parseInt(serviceRadius as string) || 10,
        profileImageUrl,
        approvalStatus: approvalStatus || 'pending',
        isAvailable: false,
        documentImageUrls: [],
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
        approvalStatus: 'approved',
      },
    });

    return Response.json({ data: doctors });
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
