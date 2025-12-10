import Stripe from "stripe";

// Stripe initialisieren (ohne feste apiVersion → sicher & kompatibel)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: any, res: any) {
  // Nur POST erlauben
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency, metadata } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // PaymentIntent erzeugen
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
}
