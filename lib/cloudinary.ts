import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  base64Image: string,
  folder: string = 'med-delivery',
  publicId?: string
) {
  try {
    const formattedImage = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      overwrite: true,
      format: 'webp',
      quality: 'auto:good',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${formattedImage}`,
      uploadOptions
    );

    return result.secure_url;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem para o Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

export async function uploadMultipleImages(
  base64Images: string[],
  folder: string = 'med-delivery'
) {
  try {
    const uploadPromises = base64Images.map((image) => uploadImage(image, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erro ao fazer upload de múltiplas imagens:', error);
    throw new Error('Falha ao fazer upload de múltiplas imagens');
  }
}

export async function deleteImage(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw new Error('Falha ao deletar imagem');
  }
}

export function getPublicIdFromUrl(url: string) {
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const publicId = fileName.split('.')[0];

  const folderIndex = urlParts.indexOf('upload') + 1;
  if (folderIndex < urlParts.length - 1) {
    const folder = urlParts.slice(folderIndex, urlParts.length - 1).join('/');
    return `${folder}/${publicId}`;
  }

  return publicId;
}
