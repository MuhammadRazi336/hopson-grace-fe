import {json} from '@shopify/remix-oxygen';

// Action for step 2: Guest checkout
export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const paymentIntentId = formData.get('paymentIntentId')?.trim();
    
    if (!paymentIntentId) {
      return json(
        { error: 'Payment intent ID is required' },
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
    
    console.log('Session data:', {
      lineItemsLength: lineItems.length,
      firstName,
      lastName,
      email,
      registryId,
      message
    });
    
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
    
    // Step 2: Guest checkout
    const guestCheckoutPayload = {
      registryId: Number(registryId),
      email: email,
      firstName: firstName,
      lastName: lastName,
      lineItems: lineItems,
      message: message,
      paymentIntentId: paymentIntentId
    };
    
    console.log('Guest checkout payload:', guestCheckoutPayload);
    
    // Get API base URL from context
    const apiBaseUrl = 'https://dev-hopsongrace.codup.io';
    
    let guestCheckoutResponse;
    try {
      const response = await fetch(`${apiBaseUrl}/api/transactions/guest-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestCheckoutPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      guestCheckoutResponse = await response.json();
      console.log('Guest checkout response:', guestCheckoutResponse);
    } catch (apiError) {
      console.error('API call error:', apiError);
      throw new Error(`API call failed: ${apiError.message || 'Unknown API error'}`);
    }
    
    if (guestCheckoutResponse?.data?.checkoutNumber) {
      // Clear session data after successful checkout
      context.session.set('paymentIntentId', '');
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
          paymentIntentId: guestCheckoutResponse.data.paymentIntentId,
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
