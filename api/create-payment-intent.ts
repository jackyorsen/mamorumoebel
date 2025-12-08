import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Fallback version ensuring compatibility
});

export default async function handler(req: any, res: any) {
  // Sicherstellen, dass nur POST-Anfragen akzeptiert werden
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
      amount,         // Beispiel: 4999 für €49.99
      currency,       // "eur" oder "chf"
      metadata: metadata || {}, // z.B. Produkt-ID, Warenkorb, E-Mail usw.
      automatic_payment_methods: {
        enabled: true, // ermöglicht TWINT, Karte, Apple Pay etc.
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