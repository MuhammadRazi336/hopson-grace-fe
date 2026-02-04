import {json} from '@shopify/remix-oxygen';

// Action for step 2: Guest checkout
export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const paypalOrderId = formData.get('paypalOrderId')?.trim();
    
    if (!paypalOrderId) {
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
    
    // Step 2: Guest checkout (PayPal)
    const guestCheckoutPayload = {
      registryId: Number(registryId),
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lineItems: lineItems,
      message: message.trim(),
      paypalOrderId: paypalOrderId.trim()
    };
    
    // Additional validation
    if (!guestCheckoutPayload.registryId || guestCheckoutPayload.registryId <= 0) {
      throw new Error('Invalid registry ID');
    }
    
    if (!guestCheckoutPayload.email || !guestCheckoutPayload.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (!guestCheckoutPayload.paypalOrderId || guestCheckoutPayload.paypalOrderId.length < 10) {
      throw new Error('Invalid PayPal order ID');
    }
    
    console.log('Guest checkout payload:', guestCheckoutPayload);
    console.log('Payload validation:', {
      registryId: typeof guestCheckoutPayload.registryId,
      email: typeof guestCheckoutPayload.email,
      firstName: typeof guestCheckoutPayload.firstName,
      lastName: typeof guestCheckoutPayload.lastName,
      lineItemsLength: guestCheckoutPayload.lineItems?.length,
      message: typeof guestCheckoutPayload.message,
      paypalOrderId: typeof guestCheckoutPayload.paypalOrderId
    });
    
    // Log line items structure for debugging
    console.log('Line items details:', guestCheckoutPayload.lineItems.map((item, index) => ({
      index,
      id: item.id,
      productId: item.productId,
      price: item.price,
      quantity: item.quantity,
      title: item.title,
      isCashFund: item.isCashFund,
      amount: item.amount,
      registryProductId: item.registryProductId
    })));
    
    // Get API base URL from context
    const apiBaseUrl = 'https://dev-hopsongrace.codup.io';
    
    let guestCheckoutResponse;
    try {
      // Try using context.ClientPost first (like other transaction calls)
      console.log('Trying context.ClientPost method...');
      guestCheckoutResponse = await context.ClientPost(
        guestCheckoutPayload,
        'transactions/guest-checkout',
        context,
      );
      console.log('Guest checkout response (ClientPost):', guestCheckoutResponse);
    } catch (clientPostError) {
      console.error('ClientPost failed, trying direct fetch:', clientPostError);
      
      // Fallback to direct fetch
      try {
        const response = await fetch(`${apiBaseUrl}/api/transactions/guest-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(guestCheckoutPayload),
        });
        
        if (!response.ok) {
          // Try to get error details from the response
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch (e) {
            errorDetails = await response.text();
          }
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorDetails
          });
          throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
        }
        
        guestCheckoutResponse = await response.json();
        console.log('Guest checkout response (fetch):', guestCheckoutResponse);
      } catch (fetchError) {
        console.error('Both ClientPost and fetch failed:', {
          clientPostError: clientPostError.message,
          fetchError: fetchError.message
        });
        throw new Error(`API call failed: ${fetchError.message || 'Unknown API error'}`);
      }
    }
    
    if (guestCheckoutResponse?.data?.checkoutNumber) {
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
          paypalOrderId: guestCheckoutResponse.data.paypalOrderId,
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
