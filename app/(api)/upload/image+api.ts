import { uploadImage } from 'lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { image, folder, publicId } = await request.json();

    if (!image) {
      return Response.json({ error: 'Imagem não fornecida' }, { status: 400 });
    }

    const imageUrl = await uploadImage(image, folder, publicId);

    return Response.json({ success: true, imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return Response.json(
      { error: 'Erro interno ao processar o upload da imagem' },
      { status: 500 }
    );
  }
}
