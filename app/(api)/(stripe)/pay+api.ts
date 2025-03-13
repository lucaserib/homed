import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { payment_method_id, payment_intent__id, customer_id } = body;

    if (!payment_method_id || !payment_intent__id || !customer_id) {
      return new Response(
        JSON.stringify({
          error: 'Informações obrigatórias de pagamento não recebidas.',
          status: 400,
        })
      );
    }
    const paymentMethod = await stripe.paymentMethods.attach(payment_intent__id, {
      customer: customer_id,
    });

    const result = await stripe.paymentIntents.confirm(payment_intent__id, {
      payment_method: paymentMethod.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        result: result,
      })
    );
  } catch (error) {
    console.log(error);

    return new Response(
      JSON.stringify({
        error: error,
        status: 500,
      })
    );
  }
}
