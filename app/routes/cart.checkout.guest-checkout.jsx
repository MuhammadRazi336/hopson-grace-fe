import {json} from '@shopify/remix-oxygen';
import {getPayPalAccessToken, capturePayPalOrder} from '~/lib/paypal';
import {syncRegistryBalancesByRegistryId} from '~/utils/shopify-customer-balances.server';

// Action for step 2: Guest checkout — capture PayPal on server, then forward to API for order persistence
export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const paypalOrderId = formData.get('paypalOrderId')?.trim();

    if (!paypalOrderId || paypalOrderId.length < 10) {
      return json(
        { error: 'PayPal order ID is required' },
        { status: 400 }
      );
    }

    // Get data from session
    const lineItems = JSON.parse(context.session.get('lineItems') || '[]');
    const message = context.session.get('message') || '';
    const firstName = context.session.get('firstName') || '';
    const lastName = context.session.get('lastName') || '';
    const email = context.session.get('email') || '';
    const registryId = context.session.get('registryId') || '';

    if (!lineItems.length || !firstName || !lastName || !email || !registryId) {
      return json(
        {
          error: 'Missing required checkout data',
          details: {
            lineItemsLength: lineItems.length,
            firstName: !!firstName,
            lastName: !!lastName,
            email: !!email,
            registryId: !!registryId
          }
        },
        { status: 400 }
      );
    }

    const clientId =
      context.env?.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    const clientSecret =
      context.env?.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json(
        {
          error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the server.'
        },
        { status: 500 }
      );
    }

    // Capture PayPal order on server (credentials never sent to browser)
    try {
      const accessToken = await getPayPalAccessToken({ clientId, clientSecret });
      await capturePayPalOrder(accessToken, paypalOrderId);
    } catch (paypalErr) {
      console.error('PayPal capture error:', paypalErr);
      return json(
        { error: paypalErr.message || 'PayPal capture failed' },
        { status: 502 }
      );
    }

    // Use the same per-registry message key used on the message step
    const messageKey = registryId ? `message_${registryId}` : 'message';
    const messageForRegistry = context.session.get(messageKey) || message || '';

    const guestCheckoutPayload = {
      registryId: Number(registryId),
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lineItems,
      message: messageForRegistry.trim(),
      paypalOrderId: paypalOrderId.trim()
    };

    // Forward to external API for order persistence (must accept paypalOrderId)
    let guestCheckoutResponse;
    try {
      const baseUrl = (context?.env?.API_BASE_URL || process.env.API_BASE_URL).replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/transactions/guest-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestCheckoutPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('External guest-checkout failed:', response.status, errText);
        return json(
          {
            error: 'Payment captured but order completion failed. Contact support with your PayPal order ID.',
            details: errText
          },
          { status: 502 }
        );
      }

      guestCheckoutResponse = await response.json();
    } catch (forwardErr) {
      console.error('Forward to external API error:', forwardErr);
      return json(
        {
          error: 'Payment captured but order completion failed. Contact support with your PayPal order ID.'
        },
        { status: 502 }
      );
    }

    if (guestCheckoutResponse?.data?.checkoutNumber) {
      try {
        await syncRegistryBalancesByRegistryId(context, {
          registryId: Number(registryId),
        });
      } catch (syncError) {
        console.warn('Shopify customer balance sync failed:', syncError?.message);
      }

      // Clear session data after successful checkout
      context.session.set('paypalOrderId', '');
      context.session.set('lineItems', '');
      context.session.set('message', '');
      context.session.set('firstName', '');
      context.session.set('lastName', '');
      context.session.set('email', '');
      context.session.set('registryId', '');
      context.session.set('couplesName', '');
      
      return json(
        {
          success: true,
          checkoutNumber: guestCheckoutResponse.data.checkoutNumber,
          paypalOrderId: guestCheckoutResponse.data.paypalOrderId || paypalOrderId,
          greetingDetails: guestCheckoutResponse.data.greetingDetails
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    } else {
      return json(
        {error: 'Guest checkout failed'},
        {status: 400}
      );
    }
  } catch (error) {
    console.error('Guest checkout error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return json(
      {
        error: error.message || 'An error occurred during guest checkout',
        details: error.response?.data || error.stack
      },
      {status: 500}
    );
  }
}
