import express from "express";
import { createServer as createViteServer } from "vite";
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cashfree API endpoint
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { applicationId, serviceName, fee, phone, email, userId } = req.body;
      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const cfEnv = process.env.CASHFREE_ENV || 'SANDBOX';

      if (!appId || !secretKey) {
        // Mock Session
        console.warn("Cashfree keys are missing. Using mock payment flow.");
        return res.json({ 
          mockUrl: `/customer/applications?payment_success=true&application_id=${applicationId}` 
        });
      }

      const orderId = `order_${applicationId}_${Date.now()}`.substring(0, 40); // Max 50 chars for Cashfree

      const apiEndpoint = cfEnv === 'PRODUCTION' 
        ? 'https://api.cashfree.com/pg/orders' 
        : 'https://sandbox.cashfree.com/pg/orders';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01'
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: fee,
          order_currency: "INR",
          customer_details: {
            customer_id: userId || `cust_${Date.now()}`,
            customer_phone: phone || "9999999999",
            customer_email: email || "customer@example.com",
            customer_name: "Customer"
          },
          order_meta: {
            return_url: `${req.protocol}://${req.get('host')}/customer/applications?payment_success=true&application_id=${applicationId}&order_id={order_id}`
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed with Cashfree');
      }

      res.json({ 
        payment_session_id: data.payment_session_id,
        environment: cfEnv
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || 'Payment initiation failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // SPA fallback
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
