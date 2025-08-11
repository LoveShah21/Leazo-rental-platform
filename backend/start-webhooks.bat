@echo off
echo Starting Stripe CLI webhook forwarding...
echo.
echo This will forward Stripe webhooks to your local server
echo Make sure your server is running on http://localhost:3000
echo.
echo Press Ctrl+C to stop webhook forwarding
echo.
C:\stripe-cli\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe
pause