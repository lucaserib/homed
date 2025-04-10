import prisma from 'lib/prisma';

interface UserCreateInput {
  name: string;
  email: string;
  clerkId: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  cpf?: string;
  address?: string;
  profileImageUrl?: string | null;
}

export async function POST(request: Request) {
  try {
    const { name, email, clerkId, phone, dateOfBirth, gender, cpf, address, profileImageUrl } =
      (await request.json()) as UserCreateInput;

    if (!name || !email || !clerkId) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkid: clerkId },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Já existe um usuário registrado com este ID' },
        { status: 400 }
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return Response.json(
        { error: 'Já existe um usuário registrado com este email' },
        { status: 400 }
      );
    }

    if (cpf) {
      const existingUserByCpf = await prisma.user.findUnique({
        where: { cpf },
      });

      if (existingUserByCpf) {
        return Response.json(
          { error: 'Já existe um usuário registrado com este CPF' },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        clerkid: clerkId,
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        cpf,
        address,
        profileImageUrl,
      },
    });

    await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail: email,
        recipientName: name,
        recipientId: clerkId,
        recipientType: 'user',
        emailType: 'patient_welcome',
      }),
    });

    return Response.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      return Response.json({ data: user });
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
    });

    return Response.json({ data: users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
